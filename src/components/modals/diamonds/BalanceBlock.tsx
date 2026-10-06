import { memo } from '../../../lib/teact/teact';
import { getActions } from '../../../global';

import type { ApiTypeCurrencyAmount } from '../../../api/types';

import { NNBSP, STARS_CURRENCY_CODE, TON_CURRENCY_CODE } from '../../../config';
import { formatDiamondsAmount } from '../../../global/helpers/payments';
import buildClassName from '../../../util/buildClassName';
import { convertCurrencyFromBaseUnit } from '../../../util/formatCurrency';

import useLang from '../../../hooks/useLang';

import BadgeButton from '../../common/BadgeButton';
import DiamondIcon from '../../common/icons/DiamondIcon';
import GramIcon from '../../common/icons/GramIcon';
import Icon from '../../common/icons/Icon';

import styles from './DiamondsBalanceModal.module.scss';

type OwnProps = {
  balance?: ApiTypeCurrencyAmount;
  withAddButton?: boolean;
  className?: string;
};

const BalanceBlock = ({ balance, className, withAddButton }: OwnProps) => {
  const lang = useLang();

  const {
    openDiamondsBalanceModal,
  } = getActions();

  const renderDiamondsAmount = () => {
    return (
      <>
        <span>
          <DiamondIcon type="gold" size="adaptive" />
          {NNBSP}
          {balance !== undefined && balance.currency === STARS_CURRENCY_CODE
            ? formatDiamondsAmount(lang, balance) : '…'}
        </span>
        {withAddButton && (
          <BadgeButton
            className={styles.addDiamondsButton}
            onClick={() => openDiamondsBalanceModal({})}
          >
            <Icon
              className={styles.addDiamondsIcon}
              name="add"
            />
          </BadgeButton>
        )}
      </>
    );
  };

  const renderTonAmount = () => {
    return (
      <span>
        <GramIcon />
        {NNBSP}
        {balance !== undefined ? convertCurrencyFromBaseUnit(balance.amount, balance.currency) : '…'}
      </span>
    );
  };

  return (
    <div className={buildClassName(styles.balanceBlock, className)}>
      <div className={styles.balanceInfo}>
        <span className={styles.smallerText}>{lang('DiamondsBalance')}</span>
        <div className={styles.balanceBottom}>
          {balance?.currency === TON_CURRENCY_CODE ? renderTonAmount() : renderDiamondsAmount()}
        </div>
      </div>
    </div>
  );
};

export default memo(BalanceBlock);
