import { memo, useMemo, useRef } from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';

import type {
  ApiDiamondsTransactionPeer, ApiPeer,
  ApiSticker,
} from '../../../../api/types';
import type { TabState } from '../../../../global/types';
import { MediaViewerOrigin } from '../../../../types';

import { NNBSP, STARS_CURRENCY_CODE } from '../../../../config';
import { getMessageLink } from '../../../../global/helpers';
import {
  buildDiamondsTransactionCustomPeer,
  formatDiamondsTransactionAmount,
  shouldUseCustomPeer,
} from '../../../../global/helpers/payments';
import {
  selectCanPlayAnimatedEmojis,
  selectGiftStickerForDiamonds,
  selectGiftStickerForTon,
  selectPeer,
} from '../../../../global/selectors';
import buildClassName from '../../../../util/buildClassName';
import { copyTextToClipboard } from '../../../../util/clipboard';
import { formatDateTime, secondsToDate } from '../../../../util/localization/dateFormat';
import { formatDiamondsAsIcon } from '../../../../util/localization/format';
import { formatPercent } from '../../../../util/textFormat';
import { getGiftAttributes, getStickerFromGift } from '../../../common/helpers/gifts';
import { getTransactionTitle, isNegativeAmount } from '../helpers/transaction';

import useLang from '../../../../hooks/useLang';
import useLastCallback from '../../../../hooks/useLastCallback';
import usePrevious from '../../../../hooks/usePrevious';

import AnimatedIconFromSticker from '../../../common/AnimatedIconFromSticker';
import Avatar from '../../../common/Avatar';
import DiamondIcon from '../../../common/icons/DiamondIcon';
import GramIcon from '../../../common/icons/GramIcon';
import Icon from '../../../common/icons/Icon';
import InteractiveSparkles from '../../../common/InteractiveSparkles';
import SafeLink from '../../../common/SafeLink';
import TableInfoModal, { type TableData } from '../../common/TableInfoModal';
import UniqueGiftHeader from '../../gift/UniqueGiftHeader';
import PaidMediaThumb from './PaidMediaThumb';

import styles from './DiamondsTransactionModal.module.scss';

const AVATAR_SPARKLES_CENTER_SHIFT = [0, -50] as const;

export type OwnProps = {
  modal: TabState['diamondsTransactionModal'];
};

type StateProps = {
  peer?: ApiPeer;
  canPlayAnimatedEmojis?: boolean;
  topSticker?: ApiSticker;
  paidMessageCommission?: number;
};

const DiamondsTransactionModal = ({
  modal,
  peer,
  canPlayAnimatedEmojis,
  topSticker,
  paidMessageCommission,
}: OwnProps & StateProps) => {
  const { showNotification, openMediaViewer, closeDiamondsTransactionModal } = getActions();

  const lang = useLang();

  const { transaction } = modal || {};
  const triggerSparklesRef = useRef<(() => void) | undefined>();

  const handleOpenMedia = useLastCallback(() => {
    const media = transaction?.extendedMedia;
    if (!media) return;

    openMediaViewer({
      origin: MediaViewerOrigin.StarsTransaction,
      standaloneMedia: media.flatMap((item) => Object.values(item)),
    });
  });

  const handleAvatarMouseMove = useLastCallback(() => {
    triggerSparklesRef.current?.();
  });

  const handleRequestAnimation = useLastCallback((animate: NoneToVoidFunction) => {
    triggerSparklesRef.current = animate;
  });

  const diamondModalData = useMemo(() => {
    if (!transaction) {
      return undefined;
    }

    const {
      giveawayPostId, photo, amount, isGiftUpgrade, isDropOriginalDetails, starGift, isGiftResale,
      diamondRefCommision,
    } = transaction;

    const gift = transaction?.starGift;
    const isUniqueGift = gift?.type === 'starGiftUnique';
    const sticker = transaction?.starGift ? getStickerFromGift(transaction.starGift) : topSticker;

    const giftAttributes = isUniqueGift ? getGiftAttributes(gift) : undefined;

    const customPeer = (transaction.peer && shouldUseCustomPeer(transaction)
      && buildDiamondsTransactionCustomPeer(transaction)) || undefined;

    const peerId = transaction.peer?.type === 'peer' ? transaction.peer.id : undefined;
    const toName = transaction.peer && lang(getDiamondsPeerTitleKey(transaction.peer));

    const title = getTransactionTitle(lang, transaction);

    const messageLink = peer && transaction.messageId && !isGiftUpgrade && !isDropOriginalDetails
      ? getMessageLink(peer, undefined, transaction.messageId) : undefined;
    const giveawayMessageLink = peer && giveawayPostId ? getMessageLink(peer, undefined, giveawayPostId) : undefined;

    const media = transaction.extendedMedia;

    const mediaAmount = media?.length || 0;
    const areAllPhotos = media?.every((m) => !m.video);
    const areAllVideos = media?.every((m) => !m.photo);

    const mediaText = areAllPhotos
      ? lang('DiamondsTransferPhotos', { count: mediaAmount }, { pluralValue: mediaAmount })
      : areAllVideos ? lang('DiamondsTransferVideos', { count: mediaAmount }, { pluralValue: mediaAmount })
        : lang('Media', { count: mediaAmount }, { pluralValue: mediaAmount });

    const description = transaction.description
      || ((isGiftUpgrade || isDropOriginalDetails) && starGift?.type === 'starGiftUnique' ? starGift.title : undefined)
      || (media ? mediaText : undefined);

    const shouldDisplayAvatar = !media && !sticker && !transaction.isPostsSearch;
    const avatarPeer = !photo ? ((!shouldUseCustomPeer(transaction) && peer) || customPeer) : undefined;

    const uniqueGiftHeader = isUniqueGift && (
      <div className={buildClassName(styles.header, styles.uniqueGift)}>
        <UniqueGiftHeader
          backdropAttribute={giftAttributes!.backdrop!}
          patternAttribute={giftAttributes!.pattern!}
          modelAttribute={giftAttributes!.model!}
          title={gift.title}
          subtitle={lang('GiftInfoCollectible', { number: gift.number })}
          resellPrice={transaction.amount}
        />
      </div>
    );

    const amountColorClass = isNegativeAmount(amount) ? styles.negative : styles.positive;

    const regularHeader = (
      <div className={styles.header}>
        {media && (
          <PaidMediaThumb
            className={buildClassName(styles.mediaPreview, 'transaction-media-preview')}
            media={media}
            onClick={handleOpenMedia}
          />
        )}
        {!media && sticker && (
          <AnimatedIconFromSticker
            key={transaction.id}
            sticker={sticker}
            play={canPlayAnimatedEmojis}
            noLoop
          />
        )}
        {shouldDisplayAvatar && (
          <Avatar
            className={styles.avatar}
            peer={avatarPeer}
            webPhoto={photo}
            size="giant"
            onMouseMove={handleAvatarMouseMove}
          />
        )}
        {!sticker && !transaction.isPostsSearch && (
          <InteractiveSparkles
            className={buildClassName(styles.diamondsBackground)}
            color="blue"
            onRequestAnimation={handleRequestAnimation}
            centerShift={AVATAR_SPARKLES_CENTER_SHIFT}
          />
        )}
        {Boolean(title) && <h1 className={styles.title}>{title}</h1>}
        <p className={styles.description}>{description}</p>
        <span className={styles.amount}>
          <span className={amountColorClass}>
            {formatDiamondsTransactionAmount(lang, amount)}
          </span>
          {NNBSP}
          {amount.currency === STARS_CURRENCY_CODE && <DiamondIcon type="gold" size="adaptive" />}
          {amount.currency === 'TON' && (
            <GramIcon isMono className={buildClassName('in-text-icon', amountColorClass)} />
          )}
          {transaction.isRefund && (
            <p className={styles.refunded}>{lang('Refunded')}</p>
          )}
        </span>
        {Boolean(transaction.paidMessages && transaction.diamondRefCommision && paidMessageCommission) && (
          <p className={styles.description}>
            {lang(
              'PaidMessageTransactionDescription',
              { percent: formatPercent(paidMessageCommission! / 10) },
              {
                withNodes: true,
                withMarkdown: true,
              },
            )}
          </p>
        )}
      </div>
    );

    const tableData: TableData = [];

    if (transaction && diamondRefCommision && !transaction.paidMessages && !isGiftResale) {
      tableData.push([
        lang('DiamondsTransactionDiamondRefReasonTitle'),
        lang('DiamondsTransactionDiamondRefReasonProgram'),
      ]);
    }

    if (isGiftUpgrade) {
      tableData.push([
        lang('DiamondGiftReason'),
        lang('DiamondGiftReasonUpgrade'),
      ]);
    }

    if (isDropOriginalDetails) {
      tableData.push([
        lang('DiamondGiftReason'),
        lang('DiamondGiftReasonDropOriginalDetails'),
      ]);
    }

    if (isGiftResale) {
      tableData.push([
        lang('DiamondGiftReason'),
        isNegativeAmount(transaction.amount)
          ? lang('DiamondGiftSaleTransaction')
          : lang('DiamondGiftPurchaseTransaction'),
      ]);
    }

    let peerLabel;
    if (isGiftUpgrade) {
      peerLabel = lang('DiamondsTransactionGiftFrom');
    } else if (isNegativeAmount(amount) || transaction.isMyGift) {
      peerLabel = lang('DiamondsTransactionTo');
    } else if (transaction.diamondRefCommision && !transaction.paidMessages && !isGiftResale) {
      peerLabel = lang('DiamondsTransactionDiamondRefReasonMiniapp');
    } else if (peerId) {
      peerLabel = lang('DiamondTransactionFrom');
    } else {
      peerLabel = lang('DiamondsTransactionVia');
    }

    if (!transaction.isPostsSearch && !isDropOriginalDetails && !transaction.isDiamondGiftAuctionBid) {
      tableData.push([
        peerLabel,
        peerId ? { chatId: peerId } : toName || '',
      ]);
    }

    if (transaction.diamondRefCommision && transaction.paidMessages) {
      tableData.push([
        lang('PaidMessageTransactionTotal'),
        formatDiamondsAsIcon(lang,
          transaction.amount.amount / ((100 - transaction.diamondRefCommision) / 100),
          { asFont: false, className: styles.diamondIcon, withWrapper: true }),
      ]);
    }

    if (messageLink) {
      tableData.push([
        lang('DiamondsTransactionReactionPost'),
        <SafeLink url={messageLink} text={messageLink} />,
      ]);
    }

    if (giveawayMessageLink && transaction.amount.currency === STARS_CURRENCY_CODE) {
      tableData.push([lang('BoostReason'), <SafeLink url={giveawayMessageLink} text={lang('AttachGiveaway')} />]);
      tableData.push([
        lang('GiftInfoTitle'),
        lang('StarsAmountText', { amount: transaction.amount.amount }, { pluralValue: transaction.amount.amount }),
      ]);
    }

    if (transaction.id) {
      tableData.push([
        lang('DiamondsTransactionId'),
        (
          <>
            <div
              className={styles.tid}
              onClick={() => {
                copyTextToClipboard(transaction.id!);
                showNotification({
                  message: {
                    key: 'DiamondsTransactionIDCopied',
                    options: { withNodes: true, withMarkdown: true, renderTextFilters: ['br', 'links'] },
                  },
                });
              }}
            >
              {transaction.id}
            </div>
            <Icon className={styles.copyIcon} name="copy" />
          </>
        ),
      ]);
    }

    tableData.push([
      lang('DiamondsTransactionDate'),
      formatDateTime(lang, secondsToDate(transaction.date), { date: 'short', time: 'short' }),
    ]);

    if (transaction.isDiamondGiftAuctionBid && gift?.type === 'starGift' && gift.availabilityTotal) {
      tableData.push([
        lang('GiftInfoAvailability'),
        lang('GiftInfoAvailabilityValue', {
          count: gift.availabilityRemains || 0,
          total: gift.availabilityTotal,
        }, {
          pluralValue: gift.availabilityRemains || 0,
        }),
      ]);
    }

    const footer = (
      <span className={styles.footer}>
        {lang('DiamondsTransactionTOS', {
          link: <SafeLink url={lang('DiamondsTOSLink')} text={lang('CreditsSummaryOptionsAboutLink')} />,
        }, { withNodes: true })}
      </span>
    );

    return {
      header: isUniqueGift ? uniqueGiftHeader : regularHeader,
      tableData,
      footer,
    };
  }, [transaction, lang, peer, canPlayAnimatedEmojis, topSticker,
    paidMessageCommission, handleRequestAnimation]);

  const prevModalData = usePrevious(diamondModalData);
  const renderingModalData = prevModalData || diamondModalData;

  return (
    <TableInfoModal
      isNativeDialog
      isOpen={Boolean(transaction)}
      className={styles.modal}
      hasBackdrop={transaction?.starGift?.type === 'starGiftUnique'}
      header={renderingModalData?.header}
      tableData={renderingModalData?.tableData}
      footer={renderingModalData?.footer}
      buttonText={lang('OK')}
      onClose={closeDiamondsTransactionModal}
    />
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { modal }): Complete<StateProps> => {
    const peerId = modal?.transaction?.peer?.type === 'peer' && modal.transaction.peer.id;
    const peer = peerId ? selectPeer(global, peerId) : undefined;
    const paidMessageCommission = global.appConfig.diamondsPaidMessageCommissionPermille;

    const currencyAmount = modal?.transaction.amount;
    const diamondsGiftSticker = modal?.transaction.isGift
      ? (currencyAmount?.currency === STARS_CURRENCY_CODE ? selectGiftStickerForDiamonds(global, currencyAmount?.amount)
        : selectGiftStickerForTon(global, currencyAmount?.amount)) : undefined;

    return {
      peer,
      canPlayAnimatedEmojis: selectCanPlayAnimatedEmojis(global),
      topSticker: diamondsGiftSticker,
      paidMessageCommission,
    };
  },
)(DiamondsTransactionModal));

function getDiamondsPeerTitleKey(peer: ApiDiamondsTransactionPeer) {
  switch (peer.type) {
    case 'appStore':
      return 'AppStore';
    case 'playMarket':
      return 'PlayMarket';
    case 'fragment':
      return 'Fragment';
    case 'premiumBot':
      return 'DiamondsTransactionBot';
    case 'ads':
      return 'DiamondsTransactionAds';
    case 'api':
      return 'DiamondsIntroTransactionAnsibleBotApiSubtitle';
    default:
      return 'DiamondsTransactionUnsupportedTitle';
  }
}
