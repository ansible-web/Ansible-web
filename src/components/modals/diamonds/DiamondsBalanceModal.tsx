import { memo, useEffect, useMemo, useRef, useState } from '@teact';
import { getActions, getGlobal, withGlobal } from '../../../global';

import type { ApiDiamondTopupOption } from '../../../api/types';
import type { GlobalState, TabState } from '../../../global/types';
import type { AnimationLevel } from '../../../types';
import type { RegularLangKey } from '../../../types/language';

import {
  PAID_MESSAGES_PURPOSE,
  STARS_CURRENCY_CODE,
  TON_CURRENCY_CODE,
} from '../../../config';
import { getChatTitle, getUserFullName } from '../../../global/helpers';
import { getPeerTitle } from '../../../global/helpers/peers';
import { selectChat, selectIsPremiumPurchaseBlocked, selectUser } from '../../../global/selectors';
import { selectSharedSettings } from '../../../global/selectors/sharedState.ts';
import buildClassName from '../../../util/buildClassName';
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
import Modal from '../../ui/Modal';
import SquareTabList, { type TabWithProperties } from '../../ui/SquareTabList';
import Transition from '../../ui/Transition';
import ParticlesHeader from '../common/ParticlesHeader.tsx';
import BalanceBlock from './BalanceBlock';
import DiamondTopupOptionList from './DiamondTopupOptionList';
import DiamondsSubscriptionItem from './subscription/DiamondsSubscriptionItem';
import DiamondsTransactionItem from './transaction/DiamondsTransactionItem';

import styles from './DiamondsBalanceModal.module.scss';

const HEADER_HEIGHT = 3.5 * REM;
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
  tonBalanceState?: GlobalState['ton'];
  canBuyPremium?: boolean;
  shouldForceHeight?: boolean;
  animationLevel: AnimationLevel;
};

const DiamondsBalanceModal = ({
  modal, diamondsBalanceState, tonBalanceState, canBuyPremium, shouldForceHeight,
  animationLevel,
}: OwnProps & StateProps) => {
  const {
    closeDiamondsBalanceModal, loadDiamondsTransactions, loadDiamondsSubscriptions,
    openDiamondsGiftingPickerModal, openInvoice,
  } = getActions();

  const currency = modal?.currency || STARS_CURRENCY_CODE;
  const currentState = currency === TON_CURRENCY_CODE ? tonBalanceState : diamondsBalanceState;
  const { balance, history } = currentState || {};
  const { subscriptions } = (currency === STARS_CURRENCY_CODE && diamondsBalanceState) || {};

  const lang = useLang();

  const [isHeaderHidden, setIsHeaderHidden] = useState(true);
  const [areTabsPinned, pinTabs, unpinTabs] = useFlag(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [areBuyOptionsShown, showBuyOptions, hideBuyOptions] = useFlag();

  const tabsRef = useRef<HTMLDivElement>();

  const isOpen = Boolean(modal && (diamondsBalanceState || tonBalanceState));

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

  const shouldShowItems = Boolean(history?.all?.transactions.length && !shouldOpenOnBuy);
  const shouldSuggestGifting = !shouldOpenOnBuy;

  const modalHeight = useMemo(() => {
    const transactionCount = history?.all?.transactions.length || 0;
    if (transactionCount === 1) {
      return '35.5rem';
    }
    if (transactionCount === 2) {
      return '39.25rem';
    }
    if (transactionCount === 3) {
      return '43rem';
    }
    return '45rem';
  }, [history?.all?.transactions.length]);

  const transactionTabs: TabWithProperties[] = useMemo(() => {
    return TRANSACTION_TABS_KEYS.map((key) => ({
      title: lang(key),
    }));
  }, [lang]);

  useEffect(() => {
    if (!isOpen) {
      setIsHeaderHidden(true);
      setSelectedTabIndex(0);
      hideBuyOptions();
      unpinTabs();
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
        />
        {canBuyPremium && !areBuyOptionsShown && (
          <Button
            className={styles.diamondButton}
            onClick={showBuyOptions}
            fluid
          >
            {lang('DiamondListBuyMoreDiamonds')}
          </Button>
        )}
        {canBuyPremium && !areBuyOptionsShown && shouldSuggestGifting && (
          <Button
            isText
            noForcedUpperCase
            className={styles.diamondButton}
            fluid
            onClick={openDiamondsGiftingPickerModalHandler}
          >
            {lang('AnsibleDiamondsGift')}
          </Button>
        )}
        {areBuyOptionsShown && diamondsBalanceState?.topupOptions && (
          <DiamondTopupOptionList
            diamondsNeeded={diamondsNeeded}
            options={diamondsBalanceState.topupOptions}
            onClick={handleBuyDiamonds}
          />
        )}
      </>
    );
  };

  /* Ansible: раздел второй валюты (Gram, в девичестве TON) убран вместе с
     кнопкой «Пополнить через Fragment» — ни валюты, ни стороннего маркета
     пополнения у нас нет. */

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop } = e.currentTarget;

    setIsHeaderHidden(scrollTop <= 150);

    if (tabsRef.current) {
      const { top: tabsTop } = tabsRef.current.getBoundingClientRect();
      const { top: scrollerTop } = e.currentTarget.getBoundingClientRect();
      const isPinned = tabsTop - scrollerTop <= HEADER_HEIGHT;
      if (isPinned) {
        pinTabs();
      } else {
        unpinTabs();
      }
    }
  }

  const handleLoadMoreTransactions = useLastCallback(() => {
    loadDiamondsTransactions({
      type: TRANSACTION_TYPES[selectedTabIndex],
      isTon: currency === TON_CURRENCY_CODE,
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

  return (
    <Modal
      className={buildClassName(styles.root, !shouldForceHeight && !areBuyOptionsShown && styles.minimal)}
      isOpen={isOpen}
      onClose={closeDiamondsBalanceModal}
      dialogStyle={`--modal-height: ${modalHeight}`}
      hasAbsoluteCloseButton
    >
      <div className={buildClassName(styles.main, 'custom-scroll')} onScroll={handleScroll}>
        {currency !== TON_CURRENCY_CODE && <BalanceBlock balance={balance} className={styles.modalBalance} />}
        <div
          className={buildClassName(
            styles.header, isHeaderHidden && styles.hiddenHeader, areTabsPinned && styles.noSeparator,
          )}
        >
          <h2 className={styles.diamondHeaderText}>
            {lang('AnsibleDiamonds')}
          </h2>
        </div>
        <div className={styles.section}>
          {renderDiamondsHeaderSection()}
        </div>
        {areBuyOptionsShown && (
          <div className={styles.tos}>
            {tosText}
          </div>
        )}
        {shouldShowItems && Boolean(subscriptions?.list.length) && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>{lang('DiamondMySubscriptions')}</h3>
            <div className={styles.subscriptions}>
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
            </div>
          </div>
        )}
        {shouldShowItems && (
          <div className={styles.container}>
            <div className={styles.lastSection}>
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
                  noScrollRestoreOnTop
                >
                  {history?.[TRANSACTION_TYPES[selectedTabIndex]]?.transactions.map((transaction) => (
                    <DiamondsTransactionItem
                      key={`${transaction.id}-${transaction.isRefund}`}
                      transaction={transaction}
                      className={TRANSACTION_ITEM_CLASS}
                    />
                  ))}
                </InfiniteScroll>
              </Transition>
            </div>
            <SquareTabList
              ref={tabsRef}
              className={buildClassName(styles.tabs, areTabsPinned && styles.pinned)}
              tabClassName={styles.tab}
              activeTab={selectedTabIndex}
              tabs={transactionTabs}
              onSwitchTab={setSelectedTabIndex}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { modal }): Complete<StateProps> => {
    const shouldForceHeight = modal?.currency === TON_CURRENCY_CODE
      ? Boolean(global.ton?.history?.all?.transactions.length)
      : Boolean(global.stars?.history?.all?.transactions.length);

    return {
      shouldForceHeight,
      diamondsBalanceState: global.stars,
      tonBalanceState: global.ton,
      canBuyPremium: !selectIsPremiumPurchaseBlocked(global),
      animationLevel: selectSharedSettings(global).animationLevel,
    };
  },
)(DiamondsBalanceModal));
