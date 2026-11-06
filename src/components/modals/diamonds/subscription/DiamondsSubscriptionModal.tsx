import { memo, useMemo, useRef } from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';

import type {
  ApiPeer,
} from '../../../../api/types';
import type { TabState } from '../../../../global/types';

import { STARS_ICON_PLACEHOLDER } from '../../../../config';
import { isApiPeerUser } from '../../../../global/helpers/peers';
import {
  selectPeer,
} from '../../../../global/selectors';
import buildClassName from '../../../../util/buildClassName';
import { formatDateTime, secondsToDate } from '../../../../util/localization/dateFormat';

import useLang from '../../../../hooks/useLang';
import useLastCallback from '../../../../hooks/useLastCallback';
import usePrevious from '../../../../hooks/usePrevious';

import Avatar from '../../../common/Avatar';
import DiamondIcon from '../../../common/icons/DiamondIcon';
import InteractiveSparkles from '../../../common/InteractiveSparkles';
import SafeLink from '../../../common/SafeLink';
import Button from '../../../ui/Button';
import TableInfoModal, { type TableData } from '../../common/TableInfoModal';

import styles from './DiamondsSubscriptionModal.module.scss';

export type OwnProps = {
  modal: TabState['diamondsSubscriptionModal'];
};

type StateProps = {
  peer?: ApiPeer;
};

const AVATAR_SPARKLES_CENTER_SHIFT = [0, -50] as const;

const DiamondsSubscriptionModal = ({
  modal, peer,
}: OwnProps & StateProps) => {
  const {
    closeDiamondsSubscriptionModal,
    fulfillStarsSubscription,
    changeStarsSubscription,
    checkChatInvite,
    loadDiamondStatus,
    openInvoice,
  } = getActions();

  const lang = useLang();
  const { subscription } = modal || {};
  const triggerSparklesRef = useRef<(() => void) | undefined>();

  const handleAvatarMouseMove = useLastCallback(() => {
    triggerSparklesRef.current?.();
  });

  const handleRequestAnimation = useLastCallback((animate: NoneToVoidFunction) => {
    triggerSparklesRef.current = animate;
  });

  const buttonState = useMemo(() => {
    if (!subscription) {
      return 'hidden';
    }

    if (subscription.canRefulfill) {
      return 'refulfill';
    }

    const isActive = subscription.until > Date.now() / 1000;
    if (isActive && !subscription.isCancelled) {
      return 'cancel';
    }

    if (isActive && subscription.isCancelled) {
      return 'renew';
    }

    const canRestart = subscription.chatInviteHash || subscription.invoiceSlug;
    if (!isActive && canRestart) {
      return 'restart';
    }

    return 'ok';
  }, [subscription]);

  const handleButtonClick = useLastCallback(() => {
    if (!subscription) {
      return;
    }

    switch (buttonState) {
      case 'refulfill': {
        fulfillStarsSubscription({ id: subscription.id });
        break;
      }
      case 'restart': {
        if (subscription.chatInviteHash) {
          checkChatInvite({ hash: subscription.chatInviteHash });
        } else if (subscription.invoiceSlug) {
          openInvoice({
            type: 'slug',
            slug: subscription.invoiceSlug,
          });
        }
        loadDiamondStatus();
        break;
      }
      case 'renew': {
        changeStarsSubscription({ id: subscription.id, isCancelled: false });
        break;
      }
      case 'cancel': {
        changeStarsSubscription({ id: subscription.id, isCancelled: true });
        break;
      }
    }
    closeDiamondsSubscriptionModal();
  });

  const diamondModalData = useMemo(() => {
    if (!subscription || !peer) {
      return undefined;
    }

    const {
      pricing, until, isCancelled, canRefulfill, photo, title, hasBotCancelled,
    } = subscription;

    const isBotSubscription = isApiPeerUser(peer);

    const header = (
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          <Avatar
            peer={!photo ? peer : undefined}
            webPhoto={photo}
            size="giant"
            onMouseMove={handleAvatarMouseMove}
          />
          <DiamondIcon className={styles.subscriptionDiamond} type="gold" size="adaptive" />
        </div>
        <InteractiveSparkles
          className={buildClassName(styles.diamondsBackground)}
          color="blue"
          onRequestAnimation={handleRequestAnimation}
          centerShift={AVATAR_SPARKLES_CENTER_SHIFT}
        />
        <h1 className={styles.title}>{title || lang('DiamondsSubscriptionTitle')}</h1>
        <span className={styles.amount}>
          {lang('DiamondsPerMonth', {
            amount: pricing.amount,
          }, {
            withNodes: true,
            specialReplacement: {
              [STARS_ICON_PLACEHOLDER]: <DiamondIcon size="adaptive" type="gold" />,
            },
          })}
        </span>
      </div>
    );

    const tableData: TableData = [];

    tableData.push([
      lang(isBotSubscription ? 'Bot' : 'DiamondsSubscriptionChannel'),
      { chatId: peer.id },
    ]);

    if (title) {
      tableData.push([
        lang('DiamondsSubscriptionBotProduct'),
        title,
      ]);
    }

    const hasExpired = until < Date.now() / 1000;
    tableData.push([
      lang(hasExpired ? 'InviteLinkExpired'
        : isCancelled ? 'DiamondsSubscriptionUntilExpires' : 'DiamondsSubscriptionUntilRenews'),
      formatDateTime(lang, secondsToDate(until), { date: 'short', time: 'short' }),
    ]);

    const footerTos = lang('DiamondsTransactionTOS', {
      link: <SafeLink url={lang('DiamondsTransactionTOSLink')} text={lang('DiamondsTransactionTOSLinkText')} />,
    }, {
      withNodes: true,
    });

    const footer = (
      <span className={styles.footer}>
        <p className={styles.secondary}>{footerTos}</p>
        {isCancelled && (
          <p className={styles.danger}>
            {lang(hasBotCancelled ? 'DiamondsSubscriptionBotCancelledText' : 'DiamondsSubscriptionCancelledText')}
          </p>
        )}
        {canRefulfill && (
          <p className={styles.secondary}>
            {lang('DiamondsSubscriptionRefulfillInfo', {
              date: formatDateTime(lang, secondsToDate(until), { date: 'short', time: 'short' }),
            })}
          </p>
        )}
        {!isCancelled && !canRefulfill && hasExpired && (
          <p className={styles.secondary}>
            {lang('DiamondsSubscriptionExpiredInfo', {
              date: formatDateTime(lang, secondsToDate(until), { date: 'short', time: 'short' }),
            })}
          </p>
        )}
        {!isCancelled && !canRefulfill && !hasExpired && (
          <p className={styles.secondary}>
            {lang('DiamondsSubscriptionCancelInfo', {
              date: formatDateTime(lang, secondsToDate(until), { date: 'short', time: 'short' }),
            })}
          </p>
        )}
        {buttonState !== 'hidden' && (
          <Button
            color={buttonState === 'cancel' ? 'danger' : 'primary'}
            isText={buttonState === 'cancel'}
            onClick={handleButtonClick}
          >
            {lang(
              buttonState === 'cancel' ? 'DiamondsSubscriptionCancel'
                : buttonState === 'refulfill' ? 'ProfileJoinChannel'
                  : buttonState === 'restart' ? 'DiamondsSubscriptionAgain'
                    : buttonState === 'renew' ? 'DiamondsSubscriptionRenew' : 'OK',
            )}
          </Button>
        )}
      </span>
    );

    return {
      header,
      tableData,
      footer,
    };
  }, [buttonState, lang, peer, subscription]);

  const prevModalData = usePrevious(diamondModalData);
  const renderingModalData = prevModalData || diamondModalData;

  return (
    <TableInfoModal
      isNativeDialog
      isOpen={Boolean(subscription)}
      className={styles.modal}
      header={renderingModalData?.header}
      tableData={renderingModalData?.tableData}
      footer={renderingModalData?.footer}
      onClose={closeDiamondsSubscriptionModal}
    />
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { modal }): Complete<StateProps> => {
    const peerId = modal?.subscription.peerId;
    const peer = peerId ? selectPeer(global, peerId) : undefined;

    return {
      peer,
    };
  },
)(DiamondsSubscriptionModal));
