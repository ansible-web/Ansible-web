import { memo, type TeactNode, useMemo } from '../../../lib/teact/teact';
import { getActions } from '../../../global';

import type { ApiPaidMedia } from '../../../api/types';

import { STARS_ICON_PLACEHOLDER } from '../../../config';
import { formatDiamondsAsIcon } from '../../../util/localization/format';
import stopEvent from '../../../util/stopEvent';

import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import DiamondIcon from '../../common/icons/DiamondIcon';
import Button from '../../ui/Button';
import MediaBadge from './MediaBadge';

import styles from './PaidMediaOverlay.module.scss';

type OwnProps = {
  paidMedia: ApiPaidMedia;
  chatId: string;
  messageId: number;
  isOutgoing?: boolean;
  children?: TeactNode;
};

const PaidMediaOverlay = ({
  paidMedia,
  chatId,
  messageId,
  isOutgoing,
  children,
}: OwnProps) => {
  const { openInvoice } = getActions();

  const lang = useLang();

  const isClickable = !paidMedia.isBought;

  const buttonText = useMemo(() => lang('UnlockPaidContent', { count: paidMedia.starsAmount }, {
    pluralValue: paidMedia.starsAmount,
    withNodes: true,
    specialReplacement: {
      [STARS_ICON_PLACEHOLDER]: <DiamondIcon className={styles.diamond} type="gold" size="adaptive" />,
    },
  }), [lang, paidMedia]);

  const handleClick = useLastCallback((e: React.MouseEvent) => {
    openInvoice({
      type: 'message',
      chatId,
      messageId,
    });
    stopEvent(e);
  });

  return (
    <div
      className={styles.root}
      onClick={isClickable ? handleClick : undefined}
    >
      {children}
      {isClickable && (
        <Button
          className={styles.buyButton}
          color="dark"
          size="tiny"
          fluid
          pill
        >
          <span className={styles.buttonText}>{buttonText}</span>
        </Button>
      )}
      {paidMedia.isBought && (
        <MediaBadge className="message-paid-media-status" position="right">
          {isOutgoing
            ? formatDiamondsAsIcon(lang, paidMedia.starsAmount)
            : lang('ChatPaidMediaPurchased')}
        </MediaBadge>
      )}
    </div>
  );
};

export default memo(PaidMediaOverlay);
