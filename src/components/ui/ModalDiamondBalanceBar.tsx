import { memo } from '../../lib/teact/teact';
import { getActions, withGlobal } from '../../global';

import type { ApiDiamondsAmount, ApiTonAmount } from '../../api/types';

import { formatDiamondsAmount } from '../../global/helpers/payments';
import buildClassName from '../../util/buildClassName';
import { convertTonFromNanos, convertTonToUsd, formatCurrencyAsString } from '../../util/formatCurrency';
import { formatDiamondsAsIcon, formatTonAsIcon, NEXT_ARROW_REPLACEMENT } from '../../util/localization/format';

import useIsTopmostBalanceBarModal from '../../hooks/element/useIsTopmostBalanceBarModal';
import useLang from '../../hooks/useLang';
import useLastCallback from '../../hooks/useLastCallback';
import useShowTransition from '../../hooks/useShowTransition';

import Link from './Link';

import styles from './ModalDiamondBalanceBar.module.scss';

export type OwnProps = {
  isModalOpen?: true;
  currency?: 'TON' | 'XTR';
  onCloseAnimationEnd?: () => void;
};

export type StateProps = {
  diamondBalance?: ApiDiamondsAmount;
  tonBalance?: ApiTonAmount;
  tonUsdRate?: number;
};

function ModalDiamondBalanceBar({
  diamondBalance,
  tonBalance,
  tonUsdRate,
  isModalOpen,
  currency,
  onCloseAnimationEnd,
}: StateProps & OwnProps) {
  const {
    openDiamondsBalanceModal,
  } = getActions();

  const lang = useLang();
  const isTonMode = currency === 'TON';
  const currentBalance = isTonMode ? tonBalance : diamondBalance;
  const isOpen = isModalOpen ? Boolean(currentBalance) : false;

  const {
    ref,
    shouldRender,
  } = useShowTransition({
    isOpen,
    onCloseAnimationEnd,
    withShouldRender: true,
  });

  const isTopmost = useIsTopmostBalanceBarModal(ref, Boolean(shouldRender && currentBalance));

  const handleGetMoreDiamonds = useLastCallback(() => {
    openDiamondsBalanceModal(isTonMode ? { currency: 'TON' } : {});
  });

  if (!shouldRender || !currentBalance) {
    return undefined;
  }

  return (
    <div
      className={buildClassName(styles.root, !isTopmost && styles.hidden)}
      ref={ref}
    >
      <div>
        {isTonMode ? (
          lang('ModalDiamondsBalanceBarDescription', {
            stars: formatTonAsIcon(lang, convertTonFromNanos(currentBalance.amount)),
          }, {
            withNodes: true,
            withMarkdown: true,
          })
        ) : (
          lang('ModalDiamondsBalanceBarDescription', {
            stars: formatDiamondsAsIcon(lang, formatDiamondsAmount(lang, currentBalance as ApiDiamondsAmount)),
          }, {
            withNodes: true,
            withMarkdown: true,
          })
        )}
      </div>
      <div>
        {isTonMode && Boolean(tonUsdRate) && (
          <div className={styles.tonInUsdDescription} style="color: var(--color-text-secondary)">
            {`≈ ${formatCurrencyAsString(
              convertTonToUsd((currentBalance as ApiTonAmount).amount, tonUsdRate, true),
              'USD',
              lang.code,
            )}`}
          </div>
        )}
        {!isTonMode && (
          <Link className={styles.getMoreDiamondsLink} isPrimary onClick={handleGetMoreDiamonds}>
            {lang('GetMoreDiamondsLinkText', undefined, {
              withNodes: true,
              specialReplacement: NEXT_ARROW_REPLACEMENT,
            })}
          </Link>
        )}
      </div>
    </div>
  );
}

export default memo(withGlobal(
  (global): Complete<StateProps> => {
    const {
      stars,
      ton,
    } = global;

    return {
      diamondBalance: stars?.balance,
      tonBalance: ton?.balance,
      tonUsdRate: global.appConfig.tonUsdRate,
    };
  },
)(ModalDiamondBalanceBar));
