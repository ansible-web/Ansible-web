import type { FC } from '../../../lib/teact/teact';
import { memo, useCallback } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { ApiDiamondsAmount } from '../../../api/types';
import type { TabState } from '../../../global/types';

import { getCurrentTabId } from '../../../util/establishMultitabRole';
import { convertTonFromNanos } from '../../../util/formatCurrency';
import { formatDiamondsAsText, formatTonAsText } from '../../../util/localization/format';

import useLang from '../../../hooks/useLang';

import ConfirmDialog from '../../ui/ConfirmDialog';

export type OwnProps = {
  modal: TabState['priceConfirmModal'];
};

type StateProps = {
  diamondBalance?: ApiDiamondsAmount;
  tonBalance?: number;
};

const PriceConfirmModal: FC<OwnProps & StateProps> = ({
  modal,
  diamondBalance,
  tonBalance,
}) => {
  const actions = getActions();

  const lang = useLang();

  const handleConfirm = useCallback(() => {
    if (!modal?.directInfo) {
      actions.closePriceConfirmModal();
      return;
    }

    const { currency, newAmount } = modal;
    const isTon = currency === 'TON';
    const currentBalance = isTon ? tonBalance : diamondBalance?.amount;

    if (currentBalance === undefined) {
      actions.closePriceConfirmModal();
      return;
    }

    if (currentBalance < newAmount!) {
      actions.openDiamondsBalanceModal({
        currency: isTon ? 'TON' : 'XTR',
        tabId: getCurrentTabId(),
      });
      actions.closePriceConfirmModal();
      return;
    }

    actions.sendDiamondPaymentForm({
      directInfo: modal.directInfo,
      tabId: getCurrentTabId(),
    });
    actions.closePriceConfirmModal();
  }, [modal, diamondBalance, tonBalance, actions]);

  const handleClose = useCallback(() => {
    actions.closePriceConfirmModal();
  }, [actions]);

  if (!modal) {
    return undefined;
  }

  const {
    originalAmount,
    newAmount,
    currency,
  } = modal;

  const isTon = currency === 'TON';

  let originalAmountText: string;
  let newAmountText: string;

  if (isTon) {
    originalAmountText = formatTonAsText(lang, convertTonFromNanos(originalAmount!));
    newAmountText = formatTonAsText(lang, convertTonFromNanos(newAmount!));
  } else {
    originalAmountText = formatDiamondsAsText(lang, originalAmount!);
    newAmountText = formatDiamondsAsText(lang, newAmount!);
  }

  return (
    <ConfirmDialog
      isOpen={Boolean(modal)}
      onClose={handleClose}
      title={lang('PriceChanged')}
      confirmHandler={handleConfirm}
      confirmLabel={lang('PayNewPrice')}
    >
      <p>
        {lang('PriceChangedText', {
          originalAmount: originalAmountText,
          newAmount: newAmountText,
        }, {
          withMarkdown: true,
          withNodes: true,
        })}
      </p>
    </ConfirmDialog>
  );
};

export default memo(withGlobal<OwnProps>((global): Complete<StateProps> => {
  const diamondBalance = global.stars?.balance;
  const tonBalance = global.ton?.balance?.amount;

  return {
    diamondBalance,
    tonBalance,
  };
},
)(PriceConfirmModal));
