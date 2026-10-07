import { memo, useMemo } from '../../../lib/teact/teact';
import { getActions } from '../../../global';

import type { TabState } from '../../../global/types';

import buildClassName from '../../../util/buildClassName';
import { formatDateTimeToString } from '../../../util/dates/oldDateFormat';
import { formatDiamondsAsIcon, formatDiamondsAsText } from '../../../util/localization/format';

import useCurrentOrPrev from '../../../hooks/useCurrentOrPrev';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import PremiumProgress from '../../common/PremiumProgress';
import Button from '../../ui/Button';
import TableInfoModal, { type TableData } from '../common/TableInfoModal';

import styles from './DiamondGiftPriceDecreaseInfoModal.module.scss';

export type OwnProps = {
  modal: TabState['diamondGiftPriceDecreaseInfoModal'];
};

const DiamondGiftPriceDecreaseInfoModal = ({ modal }: OwnProps) => {
  const { closeDiamondGiftPriceDecreaseInfoModal } = getActions();

  const lang = useLang();

  const isOpen = Boolean(modal);
  const renderingModal = useCurrentOrPrev(modal);

  const handleClose = useLastCallback(() => {
    closeDiamondGiftPriceDecreaseInfoModal();
  });

  const tableData = useMemo(() => {
    if (!renderingModal) return undefined;
    const { prices } = renderingModal;
    return prices.map((price): TableData[number] => [
      formatDateTimeToString(price.date * 1000, lang.code, true, undefined, true),
      formatDiamondsAsIcon(lang, price.upgradeStars, { containerClassName: styles.diamondIconContainer }),
    ]);
  }, [lang, renderingModal]);

  const footer = useMemo(() => {
    if (!isOpen) return undefined;
    return (
      <div className={styles.footer}>
        <p className={styles.footerText}>{lang('UpgradeCostDrops')}</p>
        <Button
          onClick={handleClose}
          iconName="understood"
          iconClassName={styles.understoodIcon}
        >
          {lang('ButtonUnderstood')}
        </Button>
      </div>
    );
  }, [lang, isOpen, handleClose]);

  if (!tableData || !renderingModal) return undefined;

  const { currentPrice, minPrice, maxPrice } = renderingModal;
  const progress = maxPrice !== minPrice ? (currentPrice - minPrice) / (maxPrice - minPrice) : 0;

  const header = (
    <div className={styles.header}>
      <PremiumProgress
        leftText={formatDiamondsAsText(lang, maxPrice)}
        rightText={formatDiamondsAsText(lang, minPrice)}
        floatingBadgeText={formatDiamondsAsText(lang, currentPrice)}
        floatingBadgeIcon="diamond"
        progress={progress}
        isInverted
        shouldSkipGradient
        className={styles.progress}
      />
      <p className={styles.headerTitle}>{lang('DiamondGiftUpgradeCostModalTitle')}</p>
      <p className={styles.headerHint}>{lang('DiamondGiftUpgradeCostHint')}</p>
    </div>
  );

  return (
    <TableInfoModal
      isOpen={isOpen}
      onClose={handleClose}
      header={header}
      tableData={tableData}
      tableClassName={buildClassName(styles.table, 'custom-scroll')}
      contentClassName={styles.content}
      footer={footer}
    />
  );
};

export default memo(DiamondGiftPriceDecreaseInfoModal);
