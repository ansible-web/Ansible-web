import type {
  ApiAiComposeTone,
  ApiAiComposeToneExample,
  ApiAttachBot,
  ApiBirthday,
  ApiBoost,
  ApiBoostsStatus,
  ApiChannelMonetizationStatistics,
  ApiChannelStatistics,
  ApiChatInviteInfo,
  ApiChatlistInvite,
  ApiChatType,
  ApiCheckedGiftCode,
  ApiCollectibleInfo,
  ApiDialog,
  ApiDiamondGift,
  ApiDiamondGiftAttribute,
  ApiDiamondGiftAttributeCounter,
  ApiDiamondGiftAttributeOriginalDetails,
  ApiDiamondGiftAuctionAcquiredGift,
  ApiDiamondGiftUnique,
  ApiDiamondGiftUpgradePrice,
  ApiDiamondGiveawayOption,
  ApiDiamondsSubscription,
  ApiDiamondsTransaction,
  ApiDiamondTopupOption,
  ApiEmojiStatusCollectible,
  ApiFormattedText,
  ApiGeoPoint,
  ApiGlobalMessageSearchType,
  ApiGroupStatistics,
  ApiInputAiComposeTone,
  ApiInputInvoice,
  ApiInputRichMessage,
  ApiLimitTypeWithModal,
  ApiMessage,
  ApiMissingInvitedUser,
  ApiMyBoost,
  ApiNewMediaTodo,
  ApiNewPoll,
  ApiNotification,
  ApiPaymentFormDiamonds,
  ApiPaymentFormRegular,
  ApiPaymentStatus,
  ApiPhoneCall,
  ApiPostStatistics,
  ApiPremiumGiftCodeOption,
  ApiPremiumPromo,
  ApiPremiumSection,
  ApiPreparedInlineMessage,
  ApiReactionWithPaid,
  ApiReceiptRegular,
  ApiSavedDiamondGift,
  ApiSavedGifts,
  ApiSearchPostsFlood,
  ApiSponsoredPeer,
  ApiSticker,
  ApiThumbnail,
  ApiTypeCurrencyAmount,
  ApiTypePrepaidGiveaway,
  ApiTypeStoryView,
  ApiUniqueDiamondGiftValueInfo,
  ApiUrlAuthResultRequest,
  ApiUser,
  ApiVideo,
} from '../../api/types';
import type { ParsedCheckList } from '../../components/middle/composer/helpers/parseCheckList';
import type { FoldersActions } from '../../hooks/reducers/useFoldersReducer';
import type { ReducerAction } from '../../hooks/useReducer';
import type {
  ActiveDownloads,
  ActiveEmojiInteraction,
  ChatCreationProgress,
  ChatMediaSearchParams,
  ChatRequestedTranslations,
  ConfettiStyle,
  FocusDirection,
  GiftProfileFilterOptions,
  GlobalSearchContent,
  IAnchorPosition,
  InlineBotSettings,
  LeftColumnContent,
  ManagementProgress,
  ManagementState,
  MediaViewerMedia,
  MediaViewerOrigin,
  MediaViewerPageMedia,
  MessageList,
  MessageListType,
  MiddleSearchParams,
  NewChatMembersProgress,
  PaymentStep,
  PlaybackItemRef,
  PlaybackSource,
  ProfileEditProgress,
  ProfileTabType,
  ResaleGiftsFilterOptions,
  ScrollTargetPosition,
  SettingsScreens,
  SharedMediaType,
  ShippingOption,
  ShuffleState,
  StarGiftInfo,
  StoryViewerOrigin,
  TabThread,
  ThreadId,
} from '../../types';
import type { BrowserState } from '../../types/browser';
import type { SearchResultKey } from '../../util/keys/searchResultKey';
import type { RegularLangFnParameters } from '../../util/localization';
import type { ProfileCollectionKey } from '../selectors/payments';
import type { CallbackAction } from './actions';

export type PollVote = {
  peerId: string;
  date: number;
};

export type ReactionDeletionContext = {
  peerId: string;
  count: number;
};

export type AiEditorContent = {
  type: 'text';
  text: ApiFormattedText;
} | {
  type: 'rich';
  richMessage: ApiInputRichMessage;
};

export type AiEditorResult = {
  type: 'text';
  text: ApiFormattedText;
  diffText?: ApiFormattedText;
} | {
  type: 'rich';
  richMessage: ApiInputRichMessage;
};

export type AiEditorTabBase = {
  isLoading?: boolean;
  requestId?: number;
  result?: AiEditorResult;
  error?: 'floodPremium' | 'aiError' | 'generic';
};

type ReportOptionsSection = {
  type: 'options';
  title: string;
  subtitle?: string;
  options: {
    text: string;
    option: string;
  }[];
};

type ReportCommentSection = {
  type: 'comment';
  title?: string;
  isOptional?: boolean;
  option: string;
};

export type ReportSection = ReportOptionsSection | ReportCommentSection;

type MessageReportContext = {
  option: string;
  description: string;
  title?: string;
  sections: ReportSection[];
  isSubmitting?: boolean;
};

export type TabState = {
  id: number;
  isBlurred?: boolean;
  isMasterTab: boolean;
  inactiveReason?: 'auth' | 'otherClient';
  shouldPreventComposerAnimation?: boolean;
  isRichInputExpanded?: boolean;
  richMediaUploadBlockingCount?: number;
  inviteHash?: string;
  canInstall?: boolean;
  isStatisticsShown?: boolean;
  isLeftColumnShown: boolean;
  newChatMembersProgress?: NewChatMembersProgress;
  uiReadyState: 0 | 1 | 2;
  shouldInit: boolean;
  shouldSkipHistoryAnimations?: boolean;

  shouldCloseRightColumn?: boolean;
  chatInfo: {
    isOpen: boolean;
    profileTab?: ProfileTabType;
    forceScrollProfileTab?: boolean;
    isOwnProfile?: boolean;
  };
  nextFoldersAction?: ReducerAction<FoldersActions>;
  shareFolderScreen?: {
    folderId: number;
    isFromSettings?: boolean;
    url?: string;
    isLoading?: boolean;
  };

  isCallPanelVisible?: boolean;
  multitabNextAction?: CallbackAction;
  ratingPhoneCall?: ApiPhoneCall;

  messageLists: MessageList[];

  contentToBeScheduled?: {
    gif?: ApiVideo;
    sticker?: ApiSticker;
    poll?: ApiNewPoll;
    todo?: ApiNewMediaTodo;
    isSilent?: boolean;
    sendGrouped?: boolean;
    sendCompressed?: boolean;
    isInvertedMedia?: true;
  };

  activeChatFolder: number;
  tabThreads: Record<string, Record<ThreadId, TabThread>>;
  forumPanelChatId?: string;
  communityPanelId?: string;

  focusedMessage?: {
    chatId?: string;
    threadId?: ThreadId;
    messageId?: number;
    direction?: FocusDirection;
    noHighlight?: boolean;
    isResizingContainer?: boolean;
    quote?: string;
    quoteOffset?: number;
    scrollTargetPosition?: ScrollTargetPosition;
  };

  selectedMessages?: {
    chatId: string;
    messageIds: number[];
    reportContext?: MessageReportContext;
  };

  chatInviteModal?: {
    hash: string;
    inviteInfo: ApiChatInviteInfo;
  };

  seenByModal?: {
    chatId: string;
    messageId: number;
  };

  privacySettingsNoticeModal?: {
    chatId: string;
    isReadDate: boolean;
  };

  reactorModal?: {
    chatId: string;
    messageId: number;
  };

  aboutAdsModal?: {
    randomId: string;
    canReport?: boolean;
    sponsorInfo?: string;
    additionalInfo?: string;
  };

  reactionPicker?: {
    chatId?: string;
    messageId?: number;
    storyPeerId?: string;
    storyId?: number;
    position?: IAnchorPosition;
    sendAsMessage?: boolean;
    isForEffects?: boolean;
  };

  shouldPlayEffectInComposer?: true;

  recoveryEmail?: string;

  inlineBots: {
    isLoading: boolean;
    byUsername: Record<string, false | InlineBotSettings>;
  };

  savedGifts: {
    collectionsByPeerId: Record<string, Record<ProfileCollectionKey, ApiSavedGifts>>;
    activeCollectionByPeerId: Record<string, number | undefined>;
    filter: GiftProfileFilterOptions;
  };

  resaleGifts: {
    giftId?: string;
    gifts: ApiDiamondGift[];
    count: number;
    attributes?: ApiDiamondGiftAttribute[];
    counters?: ApiDiamondGiftAttributeCounter[];
    nextOffset?: string;
    attributesHash?: string;
    isLoading?: boolean;
    isAllLoaded?: boolean;
    filter: ResaleGiftsFilterOptions;
    updateIteration: number;
  };

  leftColumn: {
    contentKey: LeftColumnContent;
    settingsScreen: SettingsScreens;
  };

  globalSearch: {
    query?: string;
    minDate?: number;
    maxDate?: number;
    currentContent?: GlobalSearchContent;
    chatId?: string;
    foundTopicIds?: number[];
    sponsoredPeer?: ApiSponsoredPeer;
    searchFlood?: ApiSearchPostsFlood;
    fetchingStatus?: {
      chats?: boolean;
      messages?: boolean;
      botApps?: boolean;
      publicPosts?: boolean;
    };
    isClosing?: boolean;
    localResults?: {
      peerIds?: string[];
    };
    globalResults?: {
      peerIds?: string[];
    };
    popularBotApps?: {
      peerIds: string[];
      nextOffset?: string;
    };
    resultsByType?: Partial<Record<ApiGlobalMessageSearchType, {
      totalCount?: number;
      nextOffsetId?: number;
      nextOffsetPeerId?: string;
      nextOffsetRate?: number;
      foundIds: SearchResultKey[];
    }>>;
  };

  activeEmojiInteractions?: ActiveEmojiInteraction[];
  activeReactions: Record<string, ApiReactionWithPaid[]>;

  middleSearch: {
    byChatThreadKey: Record<string, MiddleSearchParams | undefined>;
  };

  sharedMediaSearch: {
    byChatThreadKey: Record<string, {
      currentType?: SharedMediaType;
      resultsByType?: Partial<Record<SharedMediaType, {
        totalCount?: number;
        nextOffsetId: number;
        foundIds: number[];
      }>>;
    }>;
  };

  chatMediaSearch: {
    byChatThreadKey: Record<string, ChatMediaSearchParams>;
  };

  management: {
    progress?: ManagementProgress;
    byChatId: Record<string, ManagementState>;
  };

  paymentMessageConfirmDialogKey?: string;

  storyViewer: {
    isRibbonShown?: boolean;
    isArchivedRibbonShown?: boolean;
    peerId?: string;
    storyId?: number;
    isMuted: boolean;
    isSinglePeer?: boolean;
    isSingleStory?: boolean;
    isPrivate?: boolean;
    isArchive?: boolean;
    // Last viewed story id in current view session.
    // Used for better switch animation between peers.
    lastViewedByPeerId?: Record<string, number>;
    isPrivacyModalOpen?: boolean;
    isPaymentConfirmDialogOpen?: boolean;
    viewModal?: {
      storyId: number;
      views?: ApiTypeStoryView[];
      nextOffset?: string;
      isLoading?: boolean;
    };
    origin?: StoryViewerOrigin;
    // Copy of story list for current view session
    storyList?: {
      peerIds: string[];
      storyIdsByPeerId: Record<string, number[]>;
    };
  };
  storyStealthModal?: {
    targetPeerId: string;
  } | Record<string, never>;

  selectedStoryAlbumId?: number;

  mediaViewer: {
    chatId?: string;
    threadId?: ThreadId;
    messageId?: number;
    withDynamicLoading?: boolean;
    mediaIndex?: number;
    isAvatarView?: boolean;
    isSponsoredMessage?: boolean;
    standaloneMedia?: MediaViewerMedia[];
    pageMedia?: MediaViewerPageMedia;
    origin?: MediaViewerOrigin;
    volume: number;
    playbackRate: number;
    isMuted: boolean;
    isHidden?: boolean;
    timestamp?: number;
    shouldLandInMediaEditor?: boolean;
  };

  audioPlayer: {
    activeItem?: PlaybackItemRef;
    source?: PlaybackSource;
    playbackRate: number;
    isPlaybackRateActive?: boolean;
    timestamp?: number;
    isMuted: boolean;
    shuffle?: ShuffleState;
    pendingStep?: {
      direction: 'next' | 'prev';
      isAuto?: boolean;
    };
  };

  isAudioPlaylistModalOpen?: boolean;

  webPagePreviewId?: string;

  loadingThread?: {
    loadingChatId: string;
    loadingMessageId: number;
  };

  isShareMessageModalShown?: boolean;

  replyingMessage: {
    fromChatId?: string;
    messageId?: number;
    quoteText?: ApiFormattedText;
    quoteOffset?: number;
    toChatId?: string;
    toThreadId?: ThreadId;
  };

  forwardMessages: {
    fromChatId?: string;
    messageIds?: number[];
    storyId?: number;
    audioItem?: PlaybackItemRef;
    audioPendingSend?: { toChatId: string; toThreadId?: ThreadId; stars: number };
    toChatId?: string;
    toThreadId?: ThreadId;
    withMyScore?: boolean;
    noAuthors?: boolean;
    noCaptions?: boolean;
  };

  pollResults: {
    chatId?: string;
    messageId?: number;
    votesByOption?: Record<string, PollVote[]>;
    offsets?: Record<string, string>;
  };

  isPaymentFormLoading?: boolean;
  payment: {
    inputInvoice?: ApiInputInvoice;
    step?: PaymentStep;
    status?: ApiPaymentStatus;
    shippingOptions?: ShippingOption[];
    requestId?: string;
    form?: ApiPaymentFormRegular;
    stripeCredentials?: {
      type: string;
      id: string;
    };
    smartGlocalCredentials?: {
      type: string;
      token: string;
    };
    receipt?: ApiReceiptRegular;
    error?: {
      field?: string;
      messageKey?: RegularLangFnParameters;
      descriptionKey?: RegularLangFnParameters;
    };
    isPaymentModalOpen?: boolean;
    isExtendedMedia?: boolean;
    confirmPaymentUrl?: string;
    temporaryPassword?: {
      value: string;
      validUntil: number;
    };
    url?: string;
    botId?: string;
  };
  starsPayment: {
    form?: ApiPaymentFormDiamonds;
    subscriptionInfo?: ApiChatInviteInfo;
    inputInvoice?: ApiInputInvoice;
    status?: ApiPaymentStatus;
  };

  priceConfirmModal?: {
    originalAmount?: number;
    newAmount?: number;
    currency: 'TON' | 'XTR';
    directInfo?: {
      formId: string;
      inputInvoice: ApiInputInvoice;
    };
  };

  chatCreation?: {
    progress: ChatCreationProgress;
    error?: string;
  };

  profileEdit?: {
    progress: ProfileEditProgress;
    checkedUsername?: string;
    isUsernameAvailable?: boolean;
    error?: string;
  };

  notifications: ApiNotification[];
  dialogs: ApiDialog[];

  safeLinkModalUrl?: string;
  mapModal?: {
    point: ApiGeoPoint;
    zoom?: number;
  };
  historyCalendarSelectedAt?: number;
  openedStickerSetShortName?: string;
  openedCustomEmojiSetIds?: string[];

  reportAdModal?: {
    chatId?: string;
    randomId: string;
    sections: {
      title: string;
      subtitle?: string;
      options: {
        text: string;
        option: string;
      }[];
    }[];
  };

  reportModal?: {
    chatId?: string;
    messageIds: number[];
    description: string;
    peerId?: string;
    subject: 'story' | 'message';
    sections: ReportSection[];
  };

  activeDownloads: ActiveDownloads;

  statistics: {
    byChatId: Record<string, ApiChannelStatistics | ApiGroupStatistics>;
    currentMessage?: ApiPostStatistics;
    currentMessageId?: number;
    currentStory?: ApiPostStatistics;
    currentStoryId?: number;
    monetization?: ApiChannelMonetizationStatistics;
  };

  newContact?: {
    userId?: string;
    isByPhoneNumber?: boolean;
  };

  openedGame?: {
    url: string;
    chatId: string;
    messageId: number;
  };

  requestedDraft?: {
    chatId?: string;
    text: ApiFormattedText;
    files?: File[];
    filter?: ApiChatType[];
  };

  pollModal?: {
    chatId: string;
    threadId?: ThreadId;
    messageListType: MessageListType;
    isQuiz?: boolean;
  };

  todoListModal?: {
    chatId: string;
    messageId?: number;
    forNewTask?: boolean;
    initialCheckList?: ParsedCheckList;
  };

  preparedMessageModal?: {
    message: ApiPreparedInlineMessage;
    webAppKey: string;
    botId: string;
  };

  sharePreparedMessageModal?: {
    webAppKey: string;
    message: ApiPreparedInlineMessage;
    filter: ApiChatType[];
    pendingSendArgs?: {
      peerId: string;
      threadId?: ThreadId;
      starsForSendMessage?: number;
    };
  };

  browser: BrowserState;

  botTrustRequest?: {
    botId: string;
    type: 'game' | 'webApp' | 'botApp';
    shouldRequestWriteAccess?: boolean;
    onConfirm?: CallbackAction;
  };
  requestedAttachBotInstall?: {
    bot: ApiAttachBot;
    onConfirm?: CallbackAction;
  };
  requestedAttachBotInChat?: {
    bot: ApiAttachBot;
    filter: ApiChatType[];
    startParam?: string;
  };
  requestedBotStartGroup?: {
    bot: ApiUser;
    startParam?: string;
  };

  emojiStatusAccessModal?: {
    bot: ApiUser;
    webAppKey: string;
  };

  locationAccessModal?: {
    bot: ApiUser;
    webAppKey: string;
  };

  confetti?: {
    lastConfettiTime?: number;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    style?: ConfettiStyle;
    withDiamonds?: boolean;
  };
  wave?: {
    lastWaveTime: number;
    startX: number;
    startY: number;
  };

  urlAuth?: {
    button?: {
      chatId: string;
      messageId: number;
      buttonId: number;
    };
    matchCode?: string;
    request?: Omit<ApiUrlAuthResultRequest, 'type' | 'bot'> & { botId: string };
    url: string;
  };

  premiumModal?: {
    isOpen?: boolean;
    promo: ApiPremiumPromo;
    initialSection?: ApiPremiumSection;
    fromUserId?: string;
    toUserId?: string;
    isGift?: boolean;
    daysAmount?: number;
    isSuccess?: boolean;
    gift?: ApiDiamondGift;
  };

  aiMessageEditorModal?: {
    chatId: string;
    threadId: ThreadId;
    content: AiEditorContent;
    activeTab: 'translate' | 'style' | 'fix';
    isFromAttachment?: boolean;
    isEditing?: boolean;
    translateTab?: AiEditorTabBase & {
      selectedLanguage?: string;
      selectedTone?: ApiInputAiComposeTone;
      shouldEmojify?: boolean;
      cache?: Record<string, AiEditorResult>;
    };
    styleTab?: AiEditorTabBase & {
      selectedTone?: ApiInputAiComposeTone;
      customPrompt?: string;
      shouldEmojify?: boolean;
      cache?: Record<string, AiEditorResult>;
    };
    fixTab?: AiEditorTabBase & {
      cache?: AiEditorResult;
    };
  };

  aiToneEditorModal?: {
    toneToEdit?: ApiAiComposeTone;
  };

  aiTonePreviewModal?: {
    slug: string;
    tone?: ApiAiComposeTone;
    example?: ApiAiComposeToneExample;
    isAlreadyAdded?: boolean;
    hasExampleError?: boolean;
  };

  aiMessageEditorPendingResult?: {
    content: AiEditorContent;
    chatId: string;
    threadId: ThreadId;
    shouldSend?: boolean;
    shouldSendWithAttachments?: boolean;
    isSilent?: boolean;
    scheduledAt?: number;
    scheduleRepeatPeriod?: number;
  };

  giveawayModal?: {
    chatId: string;
    isOpen?: boolean;
    gifts?: ApiPremiumGiftCodeOption[];
    selectedMemberIds?: string[];
    selectedChannelIds?: string[];
    prepaidGiveaway?: ApiTypePrepaidGiveaway;
    diamondOptions?: ApiDiamondGiveawayOption[];
  };

  deleteMessageModal?: {
    chatId: string;
    messageIds: number[];
    isSchedule?: boolean;
    onConfirm?: NoneToVoidFunction;
    reactionContext?: ReactionDeletionContext;
  };

  deleteMemberModal?: {
    chatId: string;
    peerId: string;
  };

  isBrowserCloseConfirmationModalOpen?: boolean;

  isGiftRecipientPickerOpen?: boolean;

  isQuickChatPickerOpen?: boolean;

  isFrozenAccountModalOpen?: boolean;

  starsGiftingPickerModal?: {
    isOpen?: boolean;
  };

  starsGiftModal?: {
    isCompleted?: boolean;
    isOpen?: boolean;
    forUserId?: string;
    starsGiftOptions?: ApiDiamondTopupOption[];
  };

  starsTransactionModal?: {
    transaction: ApiDiamondsTransaction;
  };
  starsSubscriptionModal?: {
    subscription: ApiDiamondsSubscription;
  };

  giftModal?: {
    forPeerId: string;
    gifts?: ApiPremiumGiftCodeOption[];
    selectedResaleGift?: ApiDiamondGift;
    selectedGift?: ApiPremiumGiftCodeOption | ApiDiamondGift;
  };
  chatRefundModal?: {
    userId: string;
    starsToRefund: number;
  };

  disableSharingAboutModal?: {
    userId: string;
  };

  limitReachedModal?: {
    limit: ApiLimitTypeWithModal;
  };

  deleteFolderDialogModal?: number;

  createTopicPanel?: {
    chatId: string;
    isLoading?: boolean;
  };

  editTopicPanel?: {
    chatId: string;
    topicId: number;
    isLoading?: boolean;
  };

  requestedTranslations: {
    byChatId: Record<string, ChatRequestedTranslations>;
  };
  chatLanguageModal?: {
    chatId: string;
    messageId?: number;
    activeLanguage?: string;
  };

  chatlistModal?: {
    invite?: ApiChatlistInvite;
    removal?: {
      folderId: number;
      suggestedPeerIds?: string[];
    };
  };

  boostModal?: {
    chatId: string;
    boostStatus?: ApiBoostsStatus;
    myBoosts?: ApiMyBoost[];
  };

  boostStatistics?: {
    chatId: string;
    boostStatus?: ApiBoostsStatus;
    isLoadingBoosters?: boolean;
    nextOffset?: string;
    boosts?: {
      count: number;
      list: ApiBoost[];
    };
    giftedBoosts?: {
      count: number;
      list: ApiBoost[];
    };
  };

  monetizationStatistics?: {
    chatId: string;
  };

  giftCodeModal?: {
    slug: string;
    message?: {
      chatId: string;
      messageId: number;
    };
    info: ApiCheckedGiftCode;
  };

  deleteAccountModal?: {
    selfDestructAccountDays: number;
  };

  isAgeVerificationModalOpen?: boolean;

  birthdaySetupModal?: {
    currentBirthday?: ApiBirthday;
    suggestForUserId?: string;
    isFromSuggestion?: boolean;
  };

  paidReactionModal?: {
    chatId: string;
    messageId: number;
  };

  suggestMessageModal?: {
    chatId: string;
    messageId?: number;
  };

  suggestedPostApprovalModal?: {
    chatId: string;
    messageId: number;
  };

  inviteViaLinkModal?: {
    missingUsers: ApiMissingInvitedUser[];
    chatId: string;
  };

  oneTimeMediaModal?: {
    message: ApiMessage;
  };

  collectibleInfoModal?: ApiCollectibleInfo & {
    peerId: string;
    type: 'phone' | 'username';
    collectible: string;
  };

  qrCodeModal?: {
    peerId: string;
  };

  starsBalanceModal?: {
    originDiamondsPayment?: TabState['starsPayment'];
    originGift?: StarGiftInfo;
    originReaction?: {
      chatId: string;
      messageId: number;
      amount: number;
    };
    topup?: {
      balanceNeeded: number;
      purpose?: string;
    };
    currency?: ApiTypeCurrencyAmount['currency'];
  };

  giftInfoModal?: {
    peerId?: string;
    recipientId?: string;
    gift: ApiSavedDiamondGift | ApiDiamondGift;
    craftSlotIndex?: number;
  };

  giftInfoValueModal?: {
    valueInfo: ApiUniqueDiamondGiftValueInfo;
    gift: ApiDiamondGiftUnique;
  };

  lockedGiftModal?: {
    untilDate?: number;
    reason?: ApiFormattedText;
  };

  giftResalePriceComposerModal?: {
    peerId?: string;
    gift: ApiSavedDiamondGift | ApiDiamondGift;
  };

  giftTransferModal?: {
    gift: ApiSavedDiamondGift;
  };

  giftTransferConfirmModal?: {
    gift: ApiSavedDiamondGift;
    recipientId: string;
  };

  giftDescriptionRemoveModal?: {
    gift: ApiSavedDiamondGift;
    price: number;
    details: ApiDiamondGiftAttributeOriginalDetails;
  };

  giftOfferAcceptModal?: {
    peerId: string;
    messageId: number;
    gift: ApiDiamondGiftUnique;
    price: ApiTypeCurrencyAmount;
  };

  giftUpgradeModal?: {
    sampleAttributes: ApiDiamondGiftAttribute[];
    recipientId?: string;
    gift?: ApiSavedDiamondGift;
    prices?: ApiDiamondGiftUpgradePrice[];
    nextPrices?: ApiDiamondGiftUpgradePrice[];
    currentUpgradeDiamonds?: number;
    minPrice?: number;
    maxPrice?: number;
  };

  giftCraftModal?: {
    regularGiftId?: string;
    regularGiftTitle?: string;
    gift1?: ApiSavedDiamondGift;
    gift2?: ApiSavedDiamondGift;
    gift3?: ApiSavedDiamondGift;
    gift4?: ApiSavedDiamondGift;
    previewAttributes?: ApiDiamondGiftAttribute[];
    myCraftableGifts?: ApiSavedDiamondGift[];
    myCraftableGiftsNextOffset?: string;
    shouldRefreshMyCraftableGifts?: boolean;
    marketCraftableGifts?: ApiDiamondGiftUnique[];
    marketCraftableGiftsNextOffset?: string;
    marketCraftableGiftsCount?: number;
    isMarketLoading?: boolean;
    marketFilter: ResaleGiftsFilterOptions;
    marketAttributes?: ApiDiamondGiftAttribute[];
    marketCounters?: ApiDiamondGiftAttributeCounter[];
    marketAttributesHash?: string;
    marketUpdateIteration: number;
    craftResult?: {
      success: true;
      gift: ApiDiamondGiftUnique;
    } | {
      success: false;
      isError?: true;
    };
  };

  giftCraftSelectModal?: {
    slotIndex: number;
    isLoading?: boolean;
  };

  giftCraftInfoModal?: {
    gift: ApiDiamondGiftUnique;
  };

  giftWithdrawModal?: {
    gift: ApiSavedDiamondGift;
    isLoading?: boolean;
    errorKey?: RegularLangFnParameters;
  };

  giftStatusInfoModal?: {
    emojiStatus: ApiEmojiStatusCollectible;
  };

  giftPreviewModal?: {
    attributes: ApiDiamondGiftAttribute[];
    originGift: ApiDiamondGift;
    shouldShowCraftableOnStart?: boolean;
  };

  giftAuctionModal?: {
    auctionGiftId: string;
    sampleAttributes?: ApiDiamondGiftAttribute[];
  };

  giftAuctionBidModal?: {
    auctionGiftId: string;
    peerId?: string;
    message?: string;
    shouldHideName?: boolean;
  };

  giftAuctionInfoModal?: {
    auctionGiftId: string;
  };

  aboutDiamondGiftModal?: {
    videoId?: string;
    videoThumbnail?: ApiThumbnail;
  };

  giftAuctionChangeRecipientModal?: {
    auctionGiftId: string;
    oldPeerId?: string;
    newPeerId?: string;
    message?: string;
    shouldHideName?: boolean;
  };

  giftAuctionAcquiredModal?: {
    giftId?: string;
    giftTitle?: string;
    giftSticker?: ApiSticker;
    acquiredGifts?: ApiDiamondGiftAuctionAcquiredGift[];
  };

  activeGiftAuctionsModal?: true;

  starGiftPriceDecreaseInfoModal?: {
    prices: ApiDiamondGiftUpgradePrice[];
    currentPrice: number;
    minPrice: number;
    maxPrice: number;
  };

  suggestedStatusModal?: {
    botId: string;
    webAppKey?: string;
    customEmojiId: string;
    duration?: number;
  };

  profileRatingModal?: {
    userId: string;
    level: number;
  };

  monetizationVerificationModal?: {
    chatId: string;
    isLoading?: boolean;
    errorKey?: RegularLangFnParameters;
  };

  quickPreview?: {
    chatId: string;
    threadId?: ThreadId;
  };

  isPasskeyModalOpen?: boolean;

  leaveGroupModal?: {
    chatId: string;
    nextOwnerId?: string;
  };

  autoDeleteTimerModal?: {
    chatId: string;
  };

  isTwoFaCheckModalOpen?: true;

  isWaitingForDiamondGiftUpgrade?: true;
  isWaitingForDiamondGiftTransfer?: true;
  insertingPeerIdMention?: string;
  shouldSaveAttachmentsCompression?: boolean;

  isCocoonModalOpen?: boolean;

  rankModal?: {
    chatId: string;
    userId: string;
    isAdmin?: boolean;
    isOwner?: boolean;
    rank?: string;
  };
  editRankModal?: {
    chatId: string;
    userId: string;
    isAdmin?: boolean;
    isOwner?: boolean;
    rank?: string;
  };
  messageMediaEditorRequest?: {
    chatId: string;
    messageId: number;
  };
};
