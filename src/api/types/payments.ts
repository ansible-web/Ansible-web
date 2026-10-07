import type { PREMIUM_FEATURE_SECTIONS, STARS_CURRENCY_CODE, TON_CURRENCY_CODE } from '../../config';
import type { ApiWebDocument } from './bots';
import type { ApiChat, ApiPeer } from './chats';
import type {
  ApiDiamondsGiveawayWinnerOption,
  ApiInputSavedDiamondGift, ApiRequestInputSavedDiamondGift } from './diamonds';
import type {
  ApiDocument,
  ApiFormattedText,
  ApiInvoice,
  ApiMessageEntity,
  ApiPaymentCredentials,
} from './messages';
import type { StatisticsOverviewPercentage } from './statistics';
import type { ApiUser } from './users';

export interface ApiShippingAddress {
  streetLine1: string;
  streetLine2: string;
  city: string;
  state: string;
  countryIso2: string;
  postCode: string;
}

export interface ApiPaymentSavedInfo {
  name?: string;
  phone?: string;
  email?: string;
  shippingAddress?: ApiShippingAddress;
}

export interface ApiPaymentFormRegular {
  type: 'regular';
  url: string;
  botId: string;
  canSaveCredentials?: boolean;
  isPasswordMissing?: boolean;
  formId: string;
  providerId: string;
  nativeProvider?: string;
  nativeParams: ApiPaymentFormNativeParams;
  savedInfo?: ApiPaymentSavedInfo;
  savedCredentials?: ApiPaymentCredentials[];
  invoice: ApiInvoice;
  title: string;
  description: string;
  photo?: ApiWebDocument;
}

export interface ApiPaymentFormDiamonds {
  type: 'stars';
  formId: string;
  botId: string;
  title: string;
  description: string;
  photo?: ApiWebDocument;
  invoice: ApiInvoice;
}

export interface ApiPaymentFormDiamondGift {
  type: 'stargift';
  formId: string;
  invoice: ApiInvoice;
}

export type ApiPaymentForm = ApiPaymentFormRegular | ApiPaymentFormDiamonds | ApiPaymentFormDiamondGift;

export interface ApiPaymentFormNativeParams {
  needCardholderName?: boolean;
  needCountry?: boolean;
  needZip?: boolean;
  publishableKey?: string;
  publicToken?: string;
  tokenizeUrl?: string;
}

export interface ApiLabeledPrice {
  label: string;
  amount: number;
}

export interface ApiReceiptDiamonds {
  type: 'stars';
  date: number;
  botId: string;
  title: string;
  description: string;
  invoice: ApiInvoice;
  photo?: ApiWebDocument;
  currency: string;
  totalAmount: number;
  transactionId: string;
}

export interface ApiReceiptRegular {
  type: 'regular';
  botId: string;
  providerId: string;
  description: string;
  title: string;
  invoice: ApiInvoice;
  photo?: ApiWebDocument;
  info?: {
    shippingAddress?: ApiShippingAddress;
    phone?: string;
    name?: string;
  };
  tipAmount: number;
  totalAmount: number;
  currency: string;
  date: number;
  credentialsTitle: string;
  shippingPrices?: ApiLabeledPrice[];
  shippingMethod?: string;
}

export type ApiReceipt = ApiReceiptRegular | ApiReceiptDiamonds;

export type ApiPremiumSection = typeof PREMIUM_FEATURE_SECTIONS[number];

// Video sections can include additional values like 'gifts' that are not premium features
export type ApiPromoVideoSection = ApiPremiumSection | 'gifts';

export interface ApiPremiumPromo {
  videoSections: ApiPromoVideoSection[];
  videos: ApiDocument[];
  statusText: string;
  statusEntities: ApiMessageEntity[];
  options: ApiPremiumSubscriptionOption[];
}

export interface ApiPremiumSubscriptionOption {
  isCurrent?: boolean;
  canPurchaseUpgrade?: boolean;
  months: number;
  currency: string;
  amount: number;
  botUrl: string;
}

export type ApiInputStorePaymentGiveaway = {
  type: 'giveaway';
  isOnlyForNewSubscribers?: boolean;
  areWinnersVisible?: boolean;
  chat: ApiChat;
  additionalChannels?: ApiChat[];
  countries?: string[];
  prizeDescription?: string;
  untilDate: number;
  currency: string;
  amount: number;
};

export type ApiInputStorePaymentGiftcode = {
  type: 'giftcode';
  users: ApiUser[];
  boostChannel?: ApiChat;
  currency: string;
  amount: number;
  message?: ApiFormattedText;
};

export type ApiInputStorePaymentDiamondsTopup = {
  type: 'stars';
  stars: number;
  currency: string;
  amount: number;
  spendPurposePeer?: ApiPeer;
};

export type ApiInputStorePaymentDiamondsGift = {
  type: 'starsgift';
  user: ApiUser;
  stars: number;
  currency: string;
  amount: number;
};

export type ApiInputStorePaymentDiamondsGiveaway = {
  type: 'starsgiveaway';
  isOnlyForNewSubscribers?: boolean;
  areWinnersVisible?: boolean;
  chat: ApiChat;
  additionalChannels?: ApiChat[];
  stars?: number;
  countries?: string[];
  prizeDescription?: string;
  untilDate: number;
  currency: string;
  amount: number;
  users: number;
};

export type ApiInputStorePaymentPurpose = ApiInputStorePaymentGiveaway | ApiInputStorePaymentGiftcode |
  ApiInputStorePaymentDiamondsTopup | ApiInputStorePaymentDiamondsGift | ApiInputStorePaymentDiamondsGiveaway;

export interface ApiPremiumGiftCodeOption {
  users: number;
  months: number;
  currency: string;
  amount: number;
}

export interface ApiPrepaidGiveaway {
  type: 'giveaway';
  id: string;
  months: number;
  quantity: number;
  date: number;
}

export type ApiPrepaidDiamondsGiveaway = {
  type: 'starsGiveaway';
  id: string;
  stars: number;
  quantity: number;
  boosts: number;
  date: number;
};

export type ApiTypePrepaidGiveaway = ApiPrepaidGiveaway | ApiPrepaidDiamondsGiveaway;

export type ApiBoostsStatus = {
  level: number;
  currentLevelBoosts: number;
  boosts: number;
  nextLevelBoosts?: number;
  hasMyBoost?: boolean;
  boostUrl: string;
  giftBoosts?: number;
  premiumSubscribers?: StatisticsOverviewPercentage;
  prepaidGiveaways?: ApiTypePrepaidGiveaway[];
};

export type ApiMyBoost = {
  slot: number;
  chatId?: string;
  date: number;
  expires: number;
  cooldownUntil?: number;
};

export type ApiBoost = {
  userId?: string;
  multiplier?: number;
  expires: number;
  isFromGiveaway?: boolean;
  isGift?: boolean;
  stars?: number;
};

export type ApiGiveawayInfoActive = {
  type: 'active';
  isParticipating?: true;
  isPreparingResults?: true;
  startDate: number;
  joinedTooEarlyDate?: number;
  adminDisallowedChatId?: string;
  disallowedCountry?: string;
};

export type ApiGiveawayInfoResults = {
  type: 'results';
  isWinner?: true;
  isRefunded?: true;
  startDate: number;
  starsPrize?: number;
  finishDate: number;
  giftCodeSlug?: string;
  winnersCount: number;
  activatedCount?: number;
};

export type ApiGiveawayInfo = ApiGiveawayInfoActive | ApiGiveawayInfoResults;

export type ApiCheckedGiftCode = {
  isFromGiveaway?: true;
  fromId?: string;
  giveawayMessageId?: number;
  toId?: string;
  date: number;
  days: number;
  usedAt?: number;
};

export interface ApiDiamondGiveawayOption {
  isExtended?: true;
  isDefault?: true;
  stars: number;
  yearlyBoosts: number;
  currency: string;
  amount: number;
  winners: ApiDiamondsGiveawayWinnerOption[];
}

export type ApiPaymentStatus = 'paid' | 'failed' | 'pending' | 'cancelled';

/* Used for Invoice UI */
export type ApiInputInvoiceMessage = {
  type: 'message';
  chatId: string;
  messageId: number;
  isExtendedMedia?: boolean;
};

export type ApiInputInvoiceSlug = {
  type: 'slug';
  slug: string;
};

export type ApiInputInvoiceGiveaway = {
  type: 'giveaway';
  chatId: string;
  additionalChannelIds?: string[];
  isOnlyForNewSubscribers?: boolean;
  areWinnersVisible?: boolean;
  prizeDescription?: string;
  countries?: string[];
  untilDate: number;
  currency: string;
  amount: number;
  option: ApiPremiumGiftCodeOption;
};

export type ApiInputInvoicePremiumGiftDiamonds = {
  type: 'premiumGiftStars';
  userId: string;
  months: number;
  message?: ApiFormattedText;
};

export type ApiInputInvoiceGiftCode = {
  type: 'giftcode';
  userIds: string[];
  boostChannelId?: string;
  currency: string;
  amount: number;
  option: ApiPremiumGiftCodeOption;
  message?: ApiFormattedText;
};

export type ApiInputInvoiceDiamonds = {
  type: 'stars';
  stars: number;
  currency: string;
  amount: number;
  spendPurposePeerId?: string;
};

export type ApiInputInvoiceDiamondsGift = {
  type: 'starsgift';
  userId: string;
  stars: number;
  currency: string;
  amount: number;
};

export type ApiInputInvoiceDiamondGift = {
  type: 'stargift';
  shouldHideName?: boolean;
  peerId: string;
  giftId: string;
  message?: ApiFormattedText;
  shouldUpgrade?: true;
};

export type ApiInputInvoiceDiamondGiftResale = {
  type: 'stargiftResale';
  slug: string;
  peerId: string;
  currency: typeof TON_CURRENCY_CODE | typeof STARS_CURRENCY_CODE;
  shouldShowName?: true;
  message?: ApiFormattedText;
};

export type ApiInputInvoiceDiamondsGiveaway = {
  type: 'starsgiveaway';
  chatId: string;
  additionalChannelIds?: string[];
  isOnlyForNewSubscribers?: boolean;
  areWinnersVisible?: boolean;
  prizeDescription?: string;
  countries?: string[];
  untilDate: number;
  currency: string;
  amount: number;
  stars: number;
  users: number;
};

export type ApiInputInvoiceChatInviteSubscription = {
  type: 'chatInviteSubscription';
  hash: string;
};

export type ApiInputInvoiceDiamondGiftUpgrade = {
  type: 'stargiftUpgrade';
  inputSavedGift: ApiInputSavedDiamondGift;
  shouldKeepOriginalDetails?: true;
};

export type ApiInputInvoiceDiamondGiftTransfer = {
  type: 'stargiftTransfer';
  inputSavedGift: ApiInputSavedDiamondGift;
  recipientId: string;
};

export type ApiInputInvoiceDiamondGiftDropOriginalDetails = {
  type: 'stargiftDropOriginalDetails';
  inputSavedGift: ApiInputSavedDiamondGift;
};

export type ApiInputInvoiceDiamondGiftPrepaidUpgrade = {
  type: 'stargiftPrepaidUpgrade';
  peerId: string;
  hash: string;
};

export type ApiInputInvoiceDiamondGiftAuctionBid = {
  type: 'stargiftAuctionBid';
  giftId: string;
  bidAmount: number;
  peerId?: string;
  message?: ApiFormattedText;
  shouldHideName?: boolean;
  isUpdateBid?: boolean;
};

export type ApiInputInvoice = ApiInputInvoiceMessage | ApiInputInvoiceSlug | ApiInputInvoiceGiveaway
  | ApiInputInvoiceGiftCode | ApiInputInvoicePremiumGiftDiamonds | ApiInputInvoiceDiamonds | ApiInputInvoiceDiamondsGift
  | ApiInputInvoiceDiamondsGiveaway | ApiInputInvoiceDiamondGift | ApiInputInvoiceChatInviteSubscription
  | ApiInputInvoiceDiamondGiftUpgrade | ApiInputInvoiceDiamondGiftTransfer | ApiInputInvoiceDiamondGiftResale
  | ApiInputInvoiceDiamondGiftDropOriginalDetails | ApiInputInvoiceDiamondGiftPrepaidUpgrade
  | ApiInputInvoiceDiamondGiftAuctionBid;

/* Used for Invoice request */
export type ApiRequestInputInvoiceMessage = {
  type: 'message';
  chat: ApiChat;
  messageId: number;
};

export type ApiRequestInputInvoiceSlug = {
  type: 'slug';
  slug: string;
};

export type ApiRequestInputInvoiceGiveaway = {
  type: 'giveaway';
  purpose: ApiInputStorePaymentPurpose;
  option: ApiPremiumGiftCodeOption;
};

export type ApiRequestInputInvoiceDiamonds = {
  type: 'stars';
  purpose: ApiInputStorePaymentPurpose;
};

export type ApiRequestInputInvoicePremiumGiftDiamonds = {
  type: 'premiumGiftStars';
  user: ApiUser;
  months: number;
  message?: ApiFormattedText;
};

export type ApiRequestInputInvoiceDiamondsGiveaway = {
  type: 'starsgiveaway';
  purpose: ApiInputStorePaymentPurpose;
};

export type ApiRequestInputInvoiceDiamondGift = {
  type: 'stargift';
  shouldHideName?: boolean;
  peer: ApiPeer;
  giftId: string;
  message?: ApiFormattedText;
  shouldUpgrade?: true;
};

export type ApiRequestInputInvoiceDiamondGiftResale = {
  type: 'stargiftResale';
  slug: string;
  peer: ApiPeer;
  currency: typeof TON_CURRENCY_CODE | typeof STARS_CURRENCY_CODE;
  shouldShowName?: true;
  message?: ApiFormattedText;
};

export type ApiRequestInputInvoiceChatInviteSubscription = {
  type: 'chatInviteSubscription';
  hash: string;
};

export type ApiRequestInputInvoiceDiamondGiftUpgrade = {
  type: 'stargiftUpgrade';
  inputSavedGift: ApiRequestInputSavedDiamondGift;
  shouldKeepOriginalDetails?: true;
};

export type ApiRequestInputInvoiceDiamondGiftTransfer = {
  type: 'stargiftTransfer';
  inputSavedGift: ApiRequestInputSavedDiamondGift;
  recipient: ApiPeer;
};

export type ApiRequestInputInvoiceDiamondGiftDropOriginalDetails = {
  type: 'stargiftDropOriginalDetails';
  inputSavedGift: ApiRequestInputSavedDiamondGift;
};

export type ApiRequestInputInvoiceDiamondGiftPrepaidUpgrade = {
  type: 'stargiftPrepaidUpgrade';
  peer: ApiPeer;
  hash: string;
};

export type ApiRequestInputInvoiceDiamondGiftAuctionBid = {
  type: 'stargiftAuctionBid';
  giftId: string;
  bidAmount: number;
  peer?: ApiPeer;
  message?: ApiFormattedText;
  shouldHideName?: boolean;
  isUpdateBid?: boolean;
};

export type ApiRequestInputInvoice = ApiRequestInputInvoiceMessage | ApiRequestInputInvoiceSlug
  | ApiRequestInputInvoiceGiveaway | ApiRequestInputInvoiceDiamonds | ApiRequestInputInvoiceDiamondsGiveaway
  | ApiRequestInputInvoiceChatInviteSubscription | ApiRequestInputInvoiceDiamondGift
  | ApiRequestInputInvoiceDiamondGiftUpgrade | ApiRequestInputInvoiceDiamondGiftTransfer
  | ApiRequestInputInvoicePremiumGiftDiamonds | ApiRequestInputInvoiceDiamondGiftResale
  | ApiRequestInputInvoiceDiamondGiftDropOriginalDetails | ApiRequestInputInvoiceDiamondGiftPrepaidUpgrade
  | ApiRequestInputInvoiceDiamondGiftAuctionBid;

export interface ApiUniqueDiamondGiftValueInfo {
  isLastSaleOnFragment?: true;
  isValueAverage?: true;
  currency: string;
  value: number;
  initialSaleDate: number;
  initialSaleStars: number;
  initialSalePrice: number;
  lastSaleDate?: number;
  lastSalePrice?: number;
  floorPrice?: number;
  averagePrice?: number;
  listedCount?: number;
  fragmentListedCount?: number;
  fragmentListedUrl?: string;
}
