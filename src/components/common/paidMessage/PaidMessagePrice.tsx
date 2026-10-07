import {
  memo,
} from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import {
  DEFAULT_MAXIMUM_CHARGE_FOR_MESSAGES,
  MINIMUM_CHARGE_FOR_MESSAGES,
} from '../../../config';
import { formatCurrencyAsString } from '../../../util/formatCurrency';
import { formatPercent } from '../../../util/textFormat';

import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import Button from '../../ui/Button';
import Icon from '../icons/Icon';
import PaidMessageSlider from './PaidMessageSlider';

type OwnProps = {
  chargeForMessages: number;
  canChangeChargeForMessages?: boolean;
  isGroupChat?: boolean;
  onChange: (value: number) => void;
};

type StateProps = {
  diamondsUsdWithdrawRate: number;
  diamondsPaidMessageAmountMax: number;
  diamondsPaidMessageCommissionPermille: number;
};

function PaidMessagePrice({
  diamondsUsdWithdrawRate,
  diamondsPaidMessageAmountMax,
  diamondsPaidMessageCommissionPermille,
  canChangeChargeForMessages,
  isGroupChat,
  chargeForMessages,
  onChange,
}: OwnProps & StateProps) {
  const { openPremiumModal } = getActions();

  const lang = useLang();

  const handleChargeForMessagesChange = useLastCallback((value: number) => {
    onChange?.(value);
  });

  const handleUnlockWithPremium = useLastCallback(() => {
    openPremiumModal({ initialSection: 'message_privacy' });
  });

  return (
    <>
      <h4 className="settings-item-header" dir={lang.isRtl ? 'rtl' : undefined}>
        {lang('SectionTitleDiamondsForForMessages')}
      </h4>
      <PaidMessageSlider
        defaultValue={chargeForMessages}
        min={MINIMUM_CHARGE_FOR_MESSAGES}
        max={diamondsPaidMessageAmountMax}
        value={chargeForMessages}
        onChange={handleChargeForMessagesChange}
        canChangeChargeForMessages={canChangeChargeForMessages}
        readOnly={!canChangeChargeForMessages}
      />
      {!canChangeChargeForMessages && (
        <Button
          color="primary"
          fluid
          noForcedUpperCase
          className="settings-unlock-button"
          onClick={handleUnlockWithPremium}
        >
          <span className="settings-unlock-button-title">
            {lang('UnlockButtonTitle')}
            <Icon name="lock-filled" className="settings-unlock-button-icon" />
          </span>
        </Button>
      )}
      {canChangeChargeForMessages && (
        <p className="settings-item-description-larger" dir={lang.isRtl ? 'rtl' : undefined}>
          {lang(isGroupChat ? 'SetPriceGroupDescription' : 'SectionDescriptionDiamondsForForMessages', {
            percent: formatPercent(diamondsPaidMessageCommissionPermille * 100),
            amount: formatCurrencyAsString(
              chargeForMessages * diamondsUsdWithdrawRate * diamondsPaidMessageCommissionPermille,
              'USD',
              lang.code,
            ),
          }, {
            withNodes: true,
          })}
        </p>
      )}
    </>
  );
}

export default memo(withGlobal<OwnProps>(
  (global): Complete<StateProps> => {
    const diamondsUsdWithdrawRateX1000 = global.appConfig.diamondsUsdWithdrawRateX1000;
    const diamondsUsdWithdrawRate = diamondsUsdWithdrawRateX1000 ? diamondsUsdWithdrawRateX1000 / 1000 : 1;
    const configDiamondsPaidMessageCommissionPermille = global.appConfig.diamondsPaidMessageCommissionPermille;
    const diamondsPaidMessageCommissionPermille = configDiamondsPaidMessageCommissionPermille
      ? configDiamondsPaidMessageCommissionPermille / 1000 : 100;

    return {
      diamondsPaidMessageCommissionPermille,
      diamondsUsdWithdrawRate,
      diamondsPaidMessageAmountMax: global.appConfig.diamondsPaidMessageAmountMax
        || DEFAULT_MAXIMUM_CHARGE_FOR_MESSAGES,
    };
  },
)(PaidMessagePrice));
