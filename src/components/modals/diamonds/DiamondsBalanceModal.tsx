import { memo, useEffect, useMemo, useRef, useState } from '@teact';
import { setExtraStyles, toggleExtraClass } from '@teact/teact-dom';
import { getActions, getGlobal, withGlobal } from '../../../global';

import type { ApiDiamondTopupOption } from '../../../api/types';
import type { GlobalState, TabState } from '../../../global/types';
import type { AnimationLevel } from '../../../types';
import type { RegularLangKey } from '../../../types/language';

import {
  PAID_MESSAGES_PURPOSE,
} from '../../../config';
import { requestMutation } from '../../../lib/fasterdom/fasterdom';
import { getChatTitle, getUserFullName } from '../../../global/helpers';
import { getPeerTitle } from '../../../global/helpers/peers';
import { selectChat, selectIsPremiumPurchaseBlocked, selectUser } from '../../../global/selectors';
import { selectSharedSettings } from '../../../global/selectors/sharedState.ts';
import buildClassName from '../../../util/buildClassName';
import { clamp } from '../../../util/math';
import { resolveTransitionName } from '../../../util/resolveTransitionName.ts';
import { REM } from '../../common/helpers/mediaDimensions';
import renderText from '../../common/helpers/renderText';

import useFlag from '../../../hooks/useFlag';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import Icon from '../../common/icons/Icon';
import SafeLink from '../../common/SafeLink';
import Button from '../../ui/Button';
import InfiniteScroll from '../../ui/InfiniteScroll';
import TabList, { type TabWithProperties } from '../../ui/TabList';
import Transition from '../../ui/Transition';
import ParticlesHeader from '../common/ParticlesHeader.tsx';
import BalanceBlock from './BalanceBlock';
import DiamondTopupOptionList from './DiamondTopupOptionList';
import DiamondsSubscriptionItem from './subscription/DiamondsSubscriptionItem';
import DiamondsTransactionItem from './transaction/DiamondsTransactionItem';
import Island, { IslandDescription, IslandTitle } from '@gili/layout/Island';
import Modal, { ModalCloseButton, ModalHeader, ModalHeaderAction, ModalTitle } from '@gili/modal/Modal';

import styles from './DiamondsBalanceModal.module.scss';

const HEADER_STRIP_FADE_DISTANCE = 1.5 * REM;
const TRANSACTION_TYPES = ['all', 'inbound', 'outbound'] as const;
const TRANSACTION_TABS_KEYS: RegularLangKey[] = [
  'DiamondsTransactionsAll',
  'DiamondsTransactionsIncoming',
  'DiamondsTransactionsOutgoing',
];
const TRANSACTION_ITEM_CLASS = 'DiamondsTransactionItem';
const SUBSCRIPTION_PURPOSE = 'subs';

export type OwnProps = {
  modal: TabState['diamondsBalanceModal'];
};

type StateProps = {
  diamondsBalanceState?: GlobalState['stars'];
  canBuyPremium?: boolean;
  animationLevel: AnimationLevel;
};

const DiamondsBalanceModal = ({
  modal, diamondsBalanceState, canBuyPremium, animationLevel,
}: OwnProps & StateProps) => {
  const {
    closeDiamondsBalanceModal, loadDiamondsTransactions, loadDiamondsSubscriptions,
    openDiamondsGiftingPickerModal, openInvoice,
  } = getActions();

  const { balance, history, subscriptions } = diamondsBalanceState || {};

  const lang = useLang();

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [areBuyOptionsShown, showBuyOptions, hideBuyOptions] = useFlag();

  const headerRef = useRef<HTMLDivElement>();
  const historyRef = useRef<HTMLDivElement>();

  const isOpen = Boolean(modal && diamondsBalanceState);

  const {
    originDiamondsPayment, originReaction, originGift, topup,
  } = modal || {};

  const shouldOpenOnBuy = originDiamondsPayment || originReaction || originGift || topup;

  const ongoingTransactionAmount = originDiamondsPayment?.form?.invoice?.totalAmount
    || originDiamondsPayment?.subscriptionInfo?.subscriptionPricing?.amount
    || originReaction?.amount
    || originGift?.gift.stars
    || topup?.balanceNeeded;
  const diamondsNeeded = ongoingTransactionAmount ? ongoingTransactionAmount - (balance?.amount || 0) : undefined;
  const diamondsNeededText = useMemo(() => {
    const global = getGlobal();

    if (originReaction) {
      const channel = selectChat(global, originReaction.chatId);
      if (!channel) return undefined;
      return lang('DiamondsNeededTextReactions', { chat: getChatTitle(lang, channel) });
    }

    if (originDiamondsPayment) {
      const bot = originDiamondsPayment.form?.botId ? selectUser(global, originDiamondsPayment.form.botId) : undefined;
      if (!bot) return undefined;
      return lang('DiamondsNeededText', { user: getUserFullName(bot) });
    }

    if (originGift) {
      const peer = selectUser(global, originGift.peerId);
      if (!peer) return undefined;
      return lang('DiamondsNeededTextGift', { peer: getPeerTitle(lang, peer) });
    }

    if (topup?.purpose === SUBSCRIPTION_PURPOSE) {
      return lang('DiamondsNeededTextLink');
    }

    if (topup?.purpose === PAID_MESSAGES_PURPOSE) {
      return lang('DiamondsNeededTextSendPaidMessages', undefined, {
        withMarkdown: true,
        withNodes: true,
      });
    }

    return undefined;
  }, [originReaction, originDiamondsPayment, originGift, topup?.purpose, lang]);

  const hasHistory = Boolean(history?.all?.transactions.length);
  const shouldShowItems = hasHistory && !shouldOpenOnBuy;
  const shouldSuggestGifting = !shouldOpenOnBuy;

  const transactionTabs: TabWithProperties[] = useMemo(() => {
    return TRANSACTION_TABS_KEYS.map((key) => ({
      title: lang(key),
    }));
  }, [lang]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTabIndex(0);
      hideBuyOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (shouldOpenOnBuy) {
      showBuyOptions();
      return;
    }

    hideBuyOptions();
  }, [shouldOpenOnBuy]);

  const tosText = useMemo(() => {
    if (!isOpen) return undefined;

    return lang('CreditsSummaryOptionsAbout', {
      link: <SafeLink url={lang('DiamondsTOSLink')} text={lang('CreditsSummaryOptionsAboutLink')} />,
    }, { withNodes: true });
  }, [isOpen, lang]);

  const renderDiamondsHeaderSection = () => {
    return (
      <>
        <ParticlesHeader
          model="speeding-diamond"
          color="blue"
          title={diamondsNeeded
            ? lang('DiamondsNeededTitle', { count: ongoingTransactionAmount }, {
              pluralValue: ongoingTransactionAmount!,
            })
            : lang('AnsibleDiamonds')}
          description={renderText(
            diamondsNeededText || lang('AnsibleDiamondsInfo'),
            ['simple_markdown', 'emoji'],
          )}
          isDisabled={!isOpen}
          className={styles.particlesHeader}
          titleClassName={styles.heroTitle}
        />
        {canBuyPremium && !areBuyOptionsShown && (
          <Button
            onClick={showBuyOptions}
            pill
          >
            {lang('DiamondListBuyMoreDiamonds')}
          </Button>
        )}
        {canBuyPremium && !areBuyOptionsShown && shouldSuggestGifting && (
          <Button
            isText
            noForcedUpperCase
            className={styles.giftButton}
            pill
            onClick={openDiamondsGiftingPickerModalHandler}
          >
            {lang('AnsibleDiamondsGift')}
          </Button>
        )}
        {areBuyOptionsShown && diamondsBalanceState?.topupOptions && (
          <Island>
            <DiamondTopupOptionList
              diamondsNeeded={diamondsNeeded}
              options={diamondsBalanceState.topupOptions}
              onClick={handleBuyDiamonds}
            />
          </Island>
        )}
        {areBuyOptionsShown && <IslandDescription>{tosText}</IslandDescription>}
      </>
    );
  };

  const handleScroll = useLastCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scroller = e.currentTarget;
    const { scrollTop } = scroller;
    const heroTitleElement = scroller.querySelector<HTMLElement>(`.${styles.heroTitle}`)!;
    const headerElement = headerRef.current!;
    const distance = getCenterY(heroTitleElement) - getCenterY(headerElement);
    const progress = clamp(scrollTop / (scrollTop + distance), 0, 1);
    const stripOpacity = clamp(-distance / HEADER_STRIP_FADE_DISTANCE, 0, 1);
    const isCollapsed = distance <= 0;

    requestMutation(() => {
      setExtraStyles(heroTitleElement, { '--hero-title-progress': String(progress) });
      setExtraStyles(headerElement, { '--header-strip-opacity': String(stripOpacity) });
      toggleExtraClass(heroTitleElement, styles.heroTitleHidden, isCollapsed);
      toggleExtraClass(headerElement, styles.headerCollapsed, isCollapsed);
    });
  });

  const handleSwitchTab = useLastCallback((index: number) => {
    setSelectedTabIndex(index);

    const historyElement = historyRef.current!;
    const offset = historyElement.getBoundingClientRect().top - headerRef.current!.getBoundingClientRect().bottom;
    if (offset >= 0) return;

    requestMutation(() => {
      historyElement.closest(`.${styles.main}`)!.scrollBy({ top: offset, behavior: 'smooth' });
    });
  });

  const handleLoadMoreTransactions = useLastCallback(() => {
    loadDiamondsTransactions({
      type: TRANSACTION_TYPES[selectedTabIndex],
    });
  });

  const handleLoadMoreSubscriptions = useLastCallback(() => {
    loadDiamondsSubscriptions();
  });

  const openDiamondsGiftingPickerModalHandler = useLastCallback(() => {
    openDiamondsGiftingPickerModal({});
  });

  const handleBuyDiamonds = useLastCallback((option: ApiDiamondTopupOption) => {
    const originPaymentInputInvoice = originDiamondsPayment?.inputInvoice;

    let spendPurposePeerId: string | undefined;

    switch (originPaymentInputInvoice?.type) {
      case 'message': {
        spendPurposePeerId = originPaymentInputInvoice.chatId;
        break;
      }

      case 'slug': {
        const form = originDiamondsPayment?.form;
        spendPurposePeerId = form?.botId;
        break;
      }
    }

    if (originReaction) {
      spendPurposePeerId = originReaction.chatId;
    }

    openInvoice({
      type: 'stars',
      stars: option.stars,
      currency: option.currency,
      amount: option.amount,
      spendPurposePeerId,
    });
  });

  const handleClose = useLastCallback(() => {
    closeDiamondsBalanceModal();
  });

  const header = (
    <ModalHeader ref={headerRef} className={styles.header} noMask>
      <ModalCloseButton />
      <ModalTitle>
        <span className={styles.headerTitle}>{lang('AnsibleDiamonds')}</span>
      </ModalTitle>
      <ModalHeaderAction>
        <BalanceBlock balance={balance} className={styles.headerBalance} />
      </ModalHeaderAction>
    </ModalHeader>
  );

  return (
    <Modal
      isOpen={isOpen}
      header={header}
      width="slim"
      height="auto"
      dialogClassName={styles.dialog}
      noContentInlinePadding
      noScrollable
      onClose={handleClose}
    >
      <div
        className={buildClassName(
          styles.main, 'custom-scroll', (hasHistory || areBuyOptionsShown) && styles.fixedHeight,
        )}
        onScroll={handleScroll}
      >
        <div className={styles.content}>
          <div className={styles.intro}>
            {renderDiamondsHeaderSection()}
          </div>
          {shouldShowItems && Boolean(subscriptions?.list.length) && (
            <div>
              <IslandTitle>{lang('DiamondMySubscriptions')}</IslandTitle>
              <Island>
                {subscriptions?.list.map((subscription) => (
                  <DiamondsSubscriptionItem
                    key={subscription.id}
                    subscription={subscription}
                  />
                ))}
                {subscriptions?.nextOffset && (
                  <Button
                    isText
                    disabled={subscriptions.isLoading}
                    size="smaller"
                    noForcedUpperCase
                    className={styles.loadMore}
                    onClick={handleLoadMoreSubscriptions}
                  >
                    <Icon name="down" className={styles.loadMoreIcon} />
                    {lang('ShowMore')}
                  </Button>
                )}
              </Island>
            </div>
          )}
          {shouldShowItems && (
            <div ref={historyRef} className={styles.history}>
              <TabList
                className={styles.tabList}
                fadeMaskClassName={styles.tabs}
                activeTab={selectedTabIndex}
                tabs={transactionTabs}
                stretched
                withFadeMask
                onSwitchTab={handleSwitchTab}
              />
              <Island className={styles.historyIsland}>
                <Transition
                  name={resolveTransitionName('slideOptimized', animationLevel, undefined, lang.isRtl)}
                  activeKey={selectedTabIndex}
                  renderCount={TRANSACTION_TABS_KEYS.length}
                  shouldRestoreHeight
                  className={styles.transition}
                >
                  <InfiniteScroll
                    onLoadMore={handleLoadMoreTransactions}
                    items={history?.[TRANSACTION_TYPES[selectedTabIndex]]?.transactions}
                    scrollContainerClosest={`.${styles.main}`}
                    itemSelector={`.${TRANSACTION_ITEM_CLASS}`}
                    className={styles.transactions}
                    noFastList
                    noScrollRestore
                  >
                    {history?.[TRANSACTION_TYPES[selectedTabIndex]]?.transactions.map((transaction) => (
                      <DiamondsTransactionItem
                        key={`${transaction.id}-${transaction.isRefund}`}
                        transaction={transaction}
                        className={buildClassName(TRANSACTION_ITEM_CLASS, styles.transactionItem)}
                      />
                    ))}
                  </InfiniteScroll>
                </Transition>
              </Island>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

function getCenterY(element: HTMLElement) {
  const { top, height } = element.getBoundingClientRect();

  return top + height / 2;
}

export default memo(withGlobal<OwnProps>(
  (global): Complete<StateProps> => {
    return {
      diamondsBalanceState: global.stars,
      canBuyPremium: !selectIsPremiumPurchaseBlocked(global),
      animationLevel: selectSharedSettings(global).animationLevel,
    };
  },
)(DiamondsBalanceModal));
