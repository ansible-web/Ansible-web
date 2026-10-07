import type { STARS_CURRENCY_CODE, TON_CURRENCY_CODE } from '../../config';
import type { ApiWebDocument } from './bots';
import type { ApiChat } from './chats';
import type { ApiFormattedText, ApiSticker, BoughtPaidMedia } from './messages';
import type { ApiUser } from './users';

export interface ApiDiamondGiftRegular {
  type: 'starGift';
  isLimited?: true;
  id: string;
  sticker: ApiSticker;
  stars: number;
  availabilityRemains?: number;
  availabilityTotal?: number;
  availabilityResale?: number;
  starsToConvert: number;
  isSoldOut?: true;
  firstSaleDate?: number;
  lastSaleDate?: number;
  isBirthday?: true;
  upgradeStars?: number;
  resellMinStars?: number;
  releasedByPeerId?: string;
  title?: string;
  requirePremium?: true;
  limitedPerUser?: true;
  perUserTotal?: number;
  perUserRemains?: number;
  lockedUntilDate?: number;
  isAuction?: true;
  auctionSlug?: string;
  giftsPerRound?: number;
  background?: ApiDiamondGiftBackground;
}

export interface ApiDiamondGiftBackground {
  centerColor: string;
  edgeColor: string;
  textColor: string;
}

export interface ApiDiamondGiftUnique {
  type: 'starGiftUnique';
  id: string;
  regularGiftId: string;
  title: string;
  number: number;
  ownerId?: string;
  ownerName?: string;
  ownerAddress?: string;
  issuedCount: number;
  totalCount: number;
  attributes: ApiDiamondGiftAttribute[];
  slug: string;
  giftAddress?: string;
  resellPrice?: ApiTypeCurrencyAmount[];
  releasedByPeerId?: string;
  requirePremium?: true;
  resaleTonOnly?: true;
  valueCurrency?: string;
  valueAmount?: number;
  valueUsdAmount?: number;
  offerMinStars?: number;
  isBurned?: true;
  isCrafted?: true;
  craftChancePermille?: number;
}

export type ApiDiamondGift = ApiDiamondGiftRegular | ApiDiamondGiftUnique;

interface ApiDiamondGiftAttributeRarityUncommon {
  type: 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface ApiDiamondGiftAttributeRarityRegular {
  type: 'regular';
  rarityPercent: number;
}

export type ApiDiamondGiftAttributeRarity =
  ApiDiamondGiftAttributeRarityRegular | ApiDiamondGiftAttributeRarityUncommon;

export interface ApiDiamondGiftAttributeModel {
  type: 'model';
  name: string;
  sticker: ApiSticker;
  rarity: ApiDiamondGiftAttributeRarity;
}

export interface ApiDiamondGiftAttributePattern {
  type: 'pattern';
  name: string;
  sticker: ApiSticker;
  rarity: ApiDiamondGiftAttributeRarity;
}

export interface ApiDiamondGiftAttributeBackdrop {
  type: 'backdrop';
  backdropId: number;
  name: string;
  centerColor: string;
  edgeColor: string;
  patternColor: string;
  textColor: string;
  rarity: ApiDiamondGiftAttributeRarity;
}

export interface ApiDiamondGiftAttributeOriginalDetails {
  type: 'originalDetails';
  senderId?: string;
  recipientId: string;
  date: number;
  message?: ApiFormattedText;
}

export type ApiDiamondGiftAttribute = ApiDiamondGiftAttributeModel | ApiDiamondGiftAttributePattern
  | ApiDiamondGiftAttributeBackdrop | ApiDiamondGiftAttributeOriginalDetails;

export interface ApiDiamondGiftUpgradePrice {
  date: number;
  upgradeStars: number;
}

export interface ApiDiamondGiftUpgradePreview {
  sampleAttributes: ApiDiamondGiftAttribute[];
  prices: ApiDiamondGiftUpgradePrice[];
  nextPrices: ApiDiamondGiftUpgradePrice[];
}

export interface ApiSavedDiamondGift {
  isNameHidden?: boolean;
  isUnsaved?: boolean;
  isRefunded?: boolean;
  fromId?: string;
  date: number;
  gift: ApiDiamondGift;
  inputGift?: ApiInputSavedDiamondGift;
  savedId?: string;
  message?: ApiFormattedText;
  messageId?: number;
  starsToConvert?: number;
  canUpgrade?: true;
  alreadyPaidUpgradeDiamonds?: number;
  transferStars?: number;
  canExportAt?: number;
  canTransferAt?: number;
  canResellAt?: number;
  isPinned?: boolean;
  prepaidUpgradeHash?: string;
  isConverted?: boolean; // Local field, used for Action Message
  upgradeMsgId?: number; // Local field, used for Action Message
  localTag?: number; // Local field, used for key in list
  dropOriginalDetailsStars?: number;
  canCraftAt?: number;
}

export type StarGiftAttributeIdModel = {
  type: 'model';
  documentId: string;
};
export type ApiDiamondGiftAttributeIdPattern = {
  type: 'pattern';
  documentId: string;
};
export type ApiDiamondGiftAttributeIdBackdrop = {
  type: 'backdrop';
  backdropId: number;
};
export type ApiDiamondGiftAttributeId = StarGiftAttributeIdModel |
  ApiDiamondGiftAttributeIdPattern | ApiDiamondGiftAttributeIdBackdrop;

export interface ApiDiamondGiftAttributeCounter<T extends ApiDiamondGiftAttributeId = ApiDiamondGiftAttributeId> {
  attribute: T;
  count: number;
}

export interface ApiTypeResaleDiamondGifts {
  count: number;
  gifts: ApiDiamondGift[];
  nextOffset?: string;
  attributes?: ApiDiamondGiftAttribute[];
  attributesHash?: string;
  chats: ApiChat[];
  counters?: ApiDiamondGiftAttributeCounter[];
  users: ApiUser[];
}

export interface ApiInputSavedDiamondGiftUser {
  type: 'user';
  messageId: number;
}

export interface ApiInputSavedDiamondGiftChat {
  type: 'chat';
  chatId: string;
  savedId: string;
}

export type ApiInputSavedDiamondGift = ApiInputSavedDiamondGiftUser | ApiInputSavedDiamondGiftChat;

export type ApiRequestInputSavedDiamondGiftUser = ApiInputSavedDiamondGiftUser;
export type ApiRequestInputSavedDiamondGiftChat = {
  type: 'chat';
  chat: ApiChat;
  savedId: string;
};
export type ApiRequestInputSavedDiamondGift = ApiRequestInputSavedDiamondGiftUser | ApiRequestInputSavedDiamondGiftChat;

export type ApiTypeCurrencyAmount = ApiDiamondsAmount | ApiTonAmount;

export interface ApiDiamondsAmount {
  currency: typeof STARS_CURRENCY_CODE;
  amount: number;
  nanos: number;
}

export interface ApiTonAmount {
  currency: typeof TON_CURRENCY_CODE;
  amount: number;
}

export interface ApiDiamondsTransactionPeerUnsupported {
  type: 'unsupported';
}

export interface ApiDiamondsTransactionPeerAppStore {
  type: 'appStore';
}

export interface ApiDiamondsTransactionPeerPlayMarket {
  type: 'playMarket';
}

export interface ApiDiamondsTransactionPeerPremiumBot {
  type: 'premiumBot';
}

export interface ApiDiamondsTransactionPeerFragment {
  type: 'fragment';
}

export interface ApiDiamondsTransactionPeerAds {
  type: 'ads';
}

export interface ApiDiamondsTransactionApi {
  type: 'api';
}

export interface ApiDiamondsTransactionPeerPeer {
  type: 'peer';
  id: string;
}

export type ApiDiamondsTransactionPeer =
  | ApiDiamondsTransactionPeerUnsupported
  | ApiDiamondsTransactionPeerAppStore
  | ApiDiamondsTransactionPeerPlayMarket
  | ApiDiamondsTransactionPeerPremiumBot
  | ApiDiamondsTransactionPeerFragment
  | ApiDiamondsTransactionPeerAds
  | ApiDiamondsTransactionApi
  | ApiDiamondsTransactionPeerPeer;

export interface ApiDiamondsTransaction {
  id?: string;
  peer: ApiDiamondsTransactionPeer;
  messageId?: number;
  amount: ApiTypeCurrencyAmount;
  isRefund?: true;
  isGift?: true;
  starGift?: ApiDiamondGift;
  giveawayPostId?: number;
  isMyGift?: true; // Used only for outgoing star gift messages
  isReaction?: true;
  hasFailed?: true;
  isPending?: true;
  date: number;
  title?: string;
  description?: string;
  photo?: ApiWebDocument;
  extendedMedia?: BoughtPaidMedia[];
  subscriptionPeriod?: number;
  diamondRefCommision?: number;
  isGiftUpgrade?: true;
  isGiftResale?: true;
  paidMessages?: number;
  isPostsSearch?: true;
  isDropOriginalDetails?: true;
  isPrepaidUpgrade?: true;
  isDiamondGiftAuctionBid?: true;
}

export interface ApiDiamondsSubscription {
  id: string;
  peerId: string;
  until: number;
  pricing: ApiDiamondsSubscriptionPricing;
  isCancelled?: true;
  canRefulfill?: true;
  hasMissingBalance?: true;
  chatInviteHash?: string;
  hasBotCancelled?: true;
  title?: string;
  photo?: ApiWebDocument;
  invoiceSlug?: string;
}

export type ApiDiamondsSubscriptionPricing = {
  period: number;
  amount: number;
};

export interface ApiDiamondTopupOption {
  isExtended?: true;
  stars: number;
  currency: string;
  amount: number;
}

export interface ApiDiamondsGiveawayWinnerOption {
  isDefault?: true;
  users: number;
  perUserStars: number;
}

export interface ApiDisallowedGiftsSettings {
  shouldDisallowUnlimitedDiamondGifts?: true;
  shouldDisallowLimitedDiamondGifts?: true;
  shouldDisallowUniqueDiamondGifts?: true;
  shouldDisallowPremiumGifts?: true;
}

export interface ApiDiamondGiftCollection {
  collectionId: number;
  title: string;
  icon?: ApiSticker;
  giftsCount: number;
  hash: string;
}

export interface ApiDiamondsRating {
  level: number;
  currentLevelStars: number;
  stars: number;
  nextLevelStars?: number;
}

export interface ApiAuctionBidLevel {
  pos: number;
  amount: number;
  date: number;
}

export interface ApiDiamondGiftAuctionStateActive {
  type: 'active';
  version: number;
  startDate: number;
  endDate: number;
  minBidAmount: number;
  bidLevels: ApiAuctionBidLevel[];
  topBidders: string[];
  nextRoundAt: number;
  lastGiftNum: number;
  giftsLeft: number;
  currentRound: number;
  totalRounds: number;
}

export interface ApiDiamondGiftAuctionStateFinished {
  type: 'finished';
  startDate: number;
  endDate: number;
  averagePrice: number;
  listedCount?: number;
  fragmentListedCount?: number;
  fragmentListedUrl?: string;
}

export interface ApiDiamondGiftAuctionUserState {
  isReturned?: true;
  bidAmount?: number;
  bidDate?: number;
  minBidAmount?: number;
  bidPeerId?: string;
  acquiredCount: number;
}

export type ApiTypeDiamondGiftAuctionState = ApiDiamondGiftAuctionStateActive | ApiDiamondGiftAuctionStateFinished;

export interface ApiDiamondGiftAuctionState {
  gift: ApiDiamondGiftRegular;
  state: ApiTypeDiamondGiftAuctionState;
  userState: ApiDiamondGiftAuctionUserState;
  timeout?: number;
}

export interface ApiDiamondGiftAuctionAcquiredGift {
  peerId: string;
  date: number;
  bidAmount: number;
  round: number;
  position: number;
  message?: ApiFormattedText;
  giftNumber?: number;
  isNameHidden?: true;
}
