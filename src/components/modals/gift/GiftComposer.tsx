import type { ChangeEvent } from 'react';
import {
  memo, useEffect, useMemo, useState,
} from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { GiftOption } from './GiftModal';
import {
  type ApiDiamondGiftAuctionState, type ApiDiamondsAmount, type ApiMessage, type ApiPeer, MAIN_THREAD_ID,
} from '../../../api/types';

import { getPeerTitle, isApiPeerUser } from '../../../global/helpers/peers';
import {
  selectPeer, selectPeerPaidMessagesDiamonds, selectTabState, selectUserFullInfo,
} from '../../../global/selectors';
import buildClassName from '../../../util/buildClassName';
import { formatCountdown } from '../../../util/dates/oldDateFormat';
import { HOUR } from '../../../util/dates/units';
import { formatCurrency } from '../../../util/formatCurrency';
import { formatDiamondsAsIcon, NEXT_ARROW_REPLACEMENT } from '../../../util/localization/format';
import { getServerTime } from '../../../util/serverTime';

import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import PremiumProgress from '../../common/PremiumProgress';
import Wallpaper from '../../common/Wallpaper';
import ActionMessage from '../../middle/message/ActionMessage';
import Button from '../../ui/Button';
import Link from '../../ui/Link';
import ListItem from '../../ui/ListItem';
import Switcher from '../../ui/Switcher';
import TextArea from '../../ui/TextArea';
import TextTimer from '../../ui/TextTimer';

import styles from './GiftComposer.module.scss';

export type OwnProps = {
  gift: GiftOption;
  giftByDiamonds?: GiftOption;
  peerId: string;
};

export type StateProps = {
  captionLimit?: number;
  peer?: ApiPeer;
  currentUserId?: string;
  isPaymentFormLoading?: boolean;
  starBalance?: ApiDiamondsAmount;
  paidMessagesDiamonds?: number;
  areUniqueDiamondGiftsDisallowed?: boolean;
  shouldDisallowLimitedDiamondGifts?: boolean;
  giftAuction?: ApiDiamondGiftAuctionState;
};

const LIMIT_DISPLAY_THRESHOLD = 50;
const TEXT_TIMER_THRESHOLD = 48 * HOUR;

function GiftComposer({
  gift,
  giftByDiamonds,
  peerId,
  peer,
  captionLimit,
  currentUserId,
  isPaymentFormLoading,
  starBalance,
  paidMessagesDiamonds,
  areUniqueDiamondGiftsDisallowed,
  shouldDisallowLimitedDiamondGifts,
  giftAuction,
}: OwnProps & StateProps) {
  const {
    sendDiamondGift, sendPremiumGiftByDiamonds, openInvoice, openGiftUpgradeModal, openDiamondsBalanceModal,
    openGiftAuctionBidModal, openGiftAuctionInfoModal, openGiftAuctionChangeRecipientModal,
  } = getActions();

  const lang = useLang();

  const [giftMessage, setGiftMessage] = useState<string>('');
  const [shouldHideName, setShouldHideName] = useState<boolean>(false);
  const [shouldPayForUpgrade, setShouldPayForUpgrade] = useState<boolean>(false);
  const [shouldPayByDiamonds, setShouldPayByDiamonds] = useState<boolean>(false);

  useEffect(() => {
    if (shouldDisallowLimitedDiamondGifts) {
      setShouldPayForUpgrade(true);
    }
  }, [shouldDisallowLimitedDiamondGifts, shouldPayForUpgrade]);

  const isDiamondGift = 'id' in gift && gift.type === 'starGift';
  const isPremiumGift = 'months' in gift;
  const hasPremiumByDiamonds = giftByDiamonds && 'amount' in giftByDiamonds;
  const isPeerUser = peer && isApiPeerUser(peer);
  const isSelf = peerId === currentUserId;

  const localMessage = useMemo(() => {
    if (isPremiumGift) {
      const currentGift = shouldPayByDiamonds && hasPremiumByDiamonds ? giftByDiamonds : gift;
      return {
        id: -1,
        chatId: '0',
        isOutgoing: false,
        senderId: currentUserId,
        date: Math.floor(Date.now() / 1000),
        content: {
          action: {
            mediaType: 'action',
            type: 'giftPremium',
            amount: currentGift.amount,
            currency: currentGift.currency,
            days: gift.months * 30,
            message: giftMessage ? { text: giftMessage } : undefined,
          },
        },
      } satisfies ApiMessage;
    }

    if (isDiamondGift) {
      return {
        id: -1,
        chatId: '0',
        isOutgoing: false,
        senderId: currentUserId,
        date: Math.floor(Date.now() / 1000),
        content: {
          action: {
            mediaType: 'action',
            type: 'starGift',
            message: giftMessage?.length ? {
              text: giftMessage,
            } : undefined,
            isNameHidden: shouldHideName || undefined,
            starsToConvert: gift.starsToConvert,
            canUpgrade: shouldPayForUpgrade || undefined,
            alreadyPaidUpgradeDiamonds: shouldPayForUpgrade ? gift.upgradeStars : undefined,
            gift,
            peerId,
            fromId: currentUserId,
          },
        },
      } satisfies ApiMessage;
    }
    return undefined;
  }, [currentUserId, gift, giftMessage, isDiamondGift,
    shouldHideName, shouldPayForUpgrade, peerId,
    shouldPayByDiamonds, hasPremiumByDiamonds, giftByDiamonds, isPremiumGift]);

  const handleGiftMessageChange = useLastCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setGiftMessage(e.target.value);
  });

  const handleShouldHideNameChange = useLastCallback(() => {
    setShouldHideName(!shouldHideName);
  });

  const handleShouldPayForUpgradeChange = useLastCallback(() => {
    setShouldPayForUpgrade(!shouldPayForUpgrade);
  });

  const toggleShouldPayByDiamonds = useLastCallback(() => {
    if (hasPremiumByDiamonds) setShouldPayByDiamonds(!shouldPayByDiamonds);
  });

  const handleOpenUpgradePreview = useLastCallback(() => {
    if (!isDiamondGift) return;
    openGiftUpgradeModal({
      giftId: gift.id,
      peerId,
    });
  });

  const handleGetMoreDiamonds = useLastCallback(() => {
    openDiamondsBalanceModal({});
  });

  const handleLearnMoreClick = useLastCallback(() => {
    if (!giftAuction) return;
    openGiftAuctionInfoModal({ auctionGiftId: giftAuction.gift.id });
  });

  const handleMainButtonClick = useLastCallback(() => {
    if (giftAuction) {
      const existingBidPeerId = giftAuction.userState.bidPeerId;
      if (existingBidPeerId && existingBidPeerId !== peerId) {
        openGiftAuctionChangeRecipientModal({
          auctionGiftId: giftAuction.gift.id,
          oldPeerId: existingBidPeerId,
          newPeerId: peerId,
          message: giftMessage || undefined,
          shouldHideName: shouldHideName || undefined,
        });
        return;
      }

      openGiftAuctionBidModal({
        auctionGiftId: giftAuction.gift.id,
        peerId,
        message: giftMessage || undefined,
        shouldHideName: shouldHideName || undefined,
      });
      return;
    }

    if (isDiamondGift) {
      sendDiamondGift({
        peerId,
        shouldHideName,
        gift,
        message: giftMessage ? { text: giftMessage } : undefined,
        shouldUpgrade: shouldPayForUpgrade,
      });
      return;
    }

    if (shouldPayByDiamonds && hasPremiumByDiamonds) {
      sendPremiumGiftByDiamonds({
        userId: peerId,
        months: giftByDiamonds.months,
        amount: giftByDiamonds.amount,
        message: giftMessage ? { text: giftMessage } : undefined,
      });
      return;
    }

    if (isPremiumGift) {
      openInvoice({
        type: 'giftcode',
        userIds: [peerId],
        currency: gift.currency,
        amount: gift.amount,
        option: gift,
        message: giftMessage ? { text: giftMessage } : undefined,
      });
    }
  });

  const canUseDiamondsPayment = hasPremiumByDiamonds && starBalance && (starBalance.amount > giftByDiamonds.amount);
  function renderOptionsSection() {
    const symbolsLeft = captionLimit ? captionLimit - giftMessage.length : undefined;

    const title = getPeerTitle(lang, peer!)!;
    return (
      <div className={styles.optionsSection}>

        {!paidMessagesDiamonds && (
          <TextArea
            className={styles.messageInput}
            onChange={handleGiftMessageChange}
            value={giftMessage}
            label={lang('GiftMessagePlaceholder')}
            maxLength={captionLimit}
            maxLengthIndicator={
              symbolsLeft && symbolsLeft < LIMIT_DISPLAY_THRESHOLD ? symbolsLeft.toString() : undefined
            }
          />
        )}

        {canUseDiamondsPayment && (
          <ListItem className={styles.switcher} narrow ripple onClick={toggleShouldPayByDiamonds}>
            <span>
              {lang('GiftPremiumPayWithDiamonds', {
                stars: formatDiamondsAsIcon(lang, giftByDiamonds.amount, { className: styles.switcherDiamondIcon }),
              }, { withNodes: true })}
            </span>
            <Switcher
              checked={shouldPayByDiamonds}
              inactive
              label={lang('GiftPremiumPayWithDiamondsAcc')}
            />
          </ListItem>
        )}

        {hasPremiumByDiamonds && starBalance && (
          <div className={styles.description}>
            {lang('GiftPremiumDescriptionYourBalance', {
              stars: formatDiamondsAsIcon(lang, starBalance.amount, { className: styles.switcherDiamondIcon }),
              link: (
                <Link isPrimary onClick={handleGetMoreDiamonds}>
                  {lang('GetMoreDiamondsLinkText', undefined, {
                    withNodes: true,
                    specialReplacement: NEXT_ARROW_REPLACEMENT,
                  })}
                </Link>
              ),
            }, {
              withNodes: true,
              withMarkdown: true,
            })}
          </div>
        )}

        {isDiamondGift && Boolean(gift.upgradeStars) && !areUniqueDiamondGiftsDisallowed && (
          <ListItem
            className={styles.switcher}
            narrow
            ripple
            onClick={handleShouldPayForUpgradeChange}
            disabled={shouldDisallowLimitedDiamondGifts}
          >
            <span>
              {lang('GiftMakeUnique', {
                stars: formatDiamondsAsIcon(lang, gift.upgradeStars, { className: styles.switcherDiamondIcon }),
              }, { withNodes: true })}
            </span>
            <Switcher
              checked={shouldPayForUpgrade}
              inactive
              label={lang('GiftMakeUniqueAcc')}
            />
          </ListItem>
        )}
        {isDiamondGift && Boolean(gift.upgradeStars) && !areUniqueDiamondGiftsDisallowed && (
          <div className={styles.description}>
            {isPeerUser
              ? lang('GiftMakeUniqueDescription', {
                user: title,
                link: (
                  <Link isPrimary onClick={handleOpenUpgradePreview}>
                    {lang('GiftMakeUniqueLink', undefined, { withNodes: true,
                      specialReplacement: NEXT_ARROW_REPLACEMENT })}
                  </Link>
                ),
              }, {
                withNodes: true,
              })
              : lang('GiftMakeUniqueDescriptionChannel', {
                peer: title,
                link: (
                  <Link isPrimary onClick={handleOpenUpgradePreview}>
                    {lang('GiftMakeUniqueLink', undefined, {
                      withNodes: true,
                      specialReplacement: NEXT_ARROW_REPLACEMENT })}
                  </Link>
                ),
              }, {
                withNodes: true,
              })}
          </div>
        )}

        {isDiamondGift && (
          <ListItem className={styles.switcher} narrow ripple onClick={handleShouldHideNameChange}>
            <span>{lang('GiftHideMyName')}</span>
            <Switcher
              checked={shouldHideName}
              inactive
              label={lang('GiftHideMyName')}
            />
          </ListItem>
        )}
        {isDiamondGift && (
          <div className={styles.description}>
            {isSelf ? lang('GiftHideNameDescriptionSelf')
              : isPeerUser ? lang('GiftHideNameDescription', { receiver: title })
                : lang('GiftHideNameDescriptionChannel')}
          </div>
        )}
      </div>
    );
  }

  function renderFooter() {
    const amount = shouldPayByDiamonds && hasPremiumByDiamonds
      ? formatDiamondsAsIcon(lang, giftByDiamonds.amount)
      : isDiamondGift
        ? formatDiamondsAsIcon(lang, gift.stars + (shouldPayForUpgrade ? gift.upgradeStars! : 0))
        : isPremiumGift ? formatCurrency(lang, gift.amount, gift.currency) : undefined;

    const giftsPerRound = giftAuction?.gift.giftsPerRound;
    const auctionEndDate = giftAuction?.state.endDate;
    const auctionTimeLeft = auctionEndDate ? auctionEndDate - getServerTime() : undefined;
    const shouldUseTextTimer = auctionTimeLeft !== undefined && auctionTimeLeft > 0
      && auctionTimeLeft < TEXT_TIMER_THRESHOLD;

    return (
      <div className={styles.footer}>
        {isDiamondGift && Boolean(gift.availabilityRemains) && (
          <PremiumProgress
            isPrimary
            progress={gift.availabilityRemains / gift.availabilityTotal!}
            rightText={lang('GiftSoldCount', {
              count: gift.availabilityTotal! - gift.availabilityRemains,
            })}
            leftText={lang('GiftLeftCount', { count: gift.availabilityRemains })}
            className={styles.limited}
          />
        )}
        {giftAuction && Boolean(giftsPerRound) && (
          <div className={styles.bottomDescription}>
            {lang('GiftAuctionDescription', {
              count: giftsPerRound,
              link: <Link isPrimary onClick={handleLearnMoreClick}>{lang('GiftAuctionLearnMore')}</Link>,
            }, { pluralValue: giftsPerRound, withNodes: true })}
          </div>
        )}
        <Button
          size={auctionTimeLeft ? undefined : 'smaller'}
          onClick={handleMainButtonClick}
          isLoading={isPaymentFormLoading}
          inline
          noForcedUpperCase
        >
          {giftAuction ? (
            <div>
              <div>
                {lang('GiftAuctionPlaceBid')}
              </div>
              {auctionTimeLeft !== undefined && auctionTimeLeft > 0 && (
                <div className={styles.buttonSubtitle}>
                  {lang('GiftAuctionTimeLeft', {
                    time: shouldUseTextTimer
                      ? <TextTimer endsAt={auctionEndDate!} />
                      : formatCountdown(lang, auctionTimeLeft),
                  }, { withNodes: true })}
                </div>
              )}
            </div>
          ) : lang('GiftSend', {
            amount,
          }, {
            withNodes: true,
          })}
        </Button>
      </div>
    );
  }

  if ((!isDiamondGift && !isPremiumGift) || !localMessage) return;

  return (
    <div className={buildClassName(styles.root, 'custom-scroll')}>
      <Wallpaper className={buildClassName(styles.actionMessageView, 'MessageList')} inert isStatic>
        <ActionMessage
          key={isDiamondGift ? gift.id : isPremiumGift ? gift.months : undefined}
          message={localMessage}
          threadId={MAIN_THREAD_ID}
          appearanceOrder={0}
        />
      </Wallpaper>
      {renderOptionsSection()}
      <div className={styles.spacer} />
      {renderFooter()}
    </div>
  );
}

export default memo(withGlobal<OwnProps>(
  (global, { peerId, gift }): Complete<StateProps> => {
    const {
      stars,
    } = global;
    const peer = selectPeer(global, peerId);
    const paidMessagesDiamonds = selectPeerPaidMessagesDiamonds(global, peerId);
    const userFullInfo = selectUserFullInfo(global, peerId);
    const currentUserId = global.currentUserId;
    const isGiftForSelf = currentUserId === peerId;
    const areUniqueDiamondGiftsDisallowed = !isGiftForSelf
      && userFullInfo?.disallowedGifts?.shouldDisallowUniqueDiamondGifts;
    const shouldDisallowLimitedDiamondGifts = !isGiftForSelf
      && userFullInfo?.disallowedGifts?.shouldDisallowLimitedDiamondGifts;

    const tabState = selectTabState(global);
    const auctionGiftId = 'id' in gift && gift.type === 'starGift' && gift.isAuction ? gift.id : undefined;
    const giftAuction = auctionGiftId
      ? global.giftAuctionByGiftId?.[auctionGiftId] : undefined;

    return {
      starBalance: stars?.balance,
      peer,
      captionLimit: global.appConfig.starGiftMaxMessageLength,
      currentUserId: global.currentUserId,
      isPaymentFormLoading: tabState.isPaymentFormLoading,
      paidMessagesDiamonds,
      areUniqueDiamondGiftsDisallowed,
      shouldDisallowLimitedDiamondGifts,
      giftAuction,
    };
  },
)(GiftComposer));
