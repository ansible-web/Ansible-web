import { Api as GramJs } from '../../../lib/gramjs';
import { RPCError } from '../../../lib/gramjs/errors';

import type { GiftProfileFilterOptions, ResaleGiftsFilterOptions } from '../../../types';
import type {
  ApiChat,
  ApiDiamondGiftAttributeId,
  ApiDiamondGiftRegular,
  ApiPeer,
  ApiRequestInputSavedDiamondGift,
  ApiTypeCurrencyAmount,
} from '../../types';

import { buildApiChatFromPreview } from '../apiBuilders/chats';
import {
  buildApiFormattedText,
} from '../apiBuilders/common';
import {
  buildApiDiamondGift,
  buildApiDiamondGiftAttribute,
  buildApiDiamondGiftAuctionAcquiredGift,
  buildApiDiamondGiftAuctionState,
  buildApiDiamondGiftCollection,
  buildApiDiamondGiftUpgradePreview,
  buildApiResaleGifts,
  buildApiSavedDiamondGift,
  buildInputResaleGiftsAttributes,
} from '../apiBuilders/gifts';
import {
  buildApiCurrencyAmount,
  buildApiDiamondsGiftOptions,
  buildApiDiamondsGiveawayOptions,
  buildApiDiamondsSubscription,
  buildApiDiamondsTransaction,
  buildApiDiamondTopupOption,
  buildApiUniqueDiamondGiftValueInfo,
} from '../apiBuilders/payments';
import { buildApiUser } from '../apiBuilders/users';
import {
  buildInputDiamondsAmount,
  buildInputPeer,
  buildInputSavedDiamondGift,
  buildInputUser,
  DEFAULT_PRIMITIVES } from '../gramjsBuilders';
import { checkErrorType, wrapError } from '../helpers/misc';
import { invokeRequest } from './client';
import { getPassword } from './twoFaSettings';

export async function fetchCheckCanSendGift({ giftId }: { giftId: string }) {
  const result = await invokeRequest(new GramJs.payments.CheckCanSendGift({
    giftId: BigInt(giftId),
  }));

  if (!result) {
    return undefined;
  }

  if (result instanceof GramJs.payments.CheckCanSendGiftResultOk) {
    return { canSend: true };
  }

  if (result instanceof GramJs.payments.CheckCanSendGiftResultFail) {
    return { canSend: false, reason: buildApiFormattedText(result.reason) };
  }

  return undefined;
}

export async function fetchDiamondsGiveawayOptions() {
  const result = await invokeRequest(new GramJs.payments.GetStarsGiveawayOptions());

  if (!result) {
    return undefined;
  }

  return result.map(buildApiDiamondsGiveawayOptions);
}

export async function fetchDiamondGifts() {
  const result = await invokeRequest(new GramJs.payments.GetStarGifts({
    hash: DEFAULT_PRIMITIVES.INT,
  }));

  if (!result || result instanceof GramJs.payments.StarGiftsNotModified) {
    return undefined;
  }

  const chats = result.chats?.map((chat) => buildApiChatFromPreview(chat)).filter(Boolean);
  const users = result.users?.map(buildApiUser).filter(Boolean);

  // Right now, only regular star gifts can be bought, but API are not specific
  const gifts
    = result.gifts.map(buildApiDiamondGift).filter((gift): gift is ApiDiamondGiftRegular => gift.type === 'starGift');

  return {
    gifts,
    chats,
    users,
  };
}

export async function fetchResaleGifts({
  giftId,
  offset = DEFAULT_PRIMITIVES.STRING,
  limit = DEFAULT_PRIMITIVES.INT,
  attributesHash,
  filter,
  forCraft,
}: {
  giftId: string;
  offset?: string;
  limit?: number;
  attributesHash?: string;
  filter?: ResaleGiftsFilterOptions;
  forCraft?: boolean;
}) {
  type GetResaleStarGifts = ConstructorParameters<typeof GramJs.payments.GetResaleStarGifts>[0];

  const attributes: ApiDiamondGiftAttributeId[] = [
    ...(filter?.backdropAttributes ?? []),
    ...(filter?.modelAttributes ?? []),
    ...(filter?.patternAttributes ?? []),
  ];

  const params: GetResaleStarGifts = {
    giftId: BigInt(giftId),
    offset,
    limit,
    attributesHash: attributesHash ? BigInt(attributesHash) : DEFAULT_PRIMITIVES.BIGINT,
    attributes: buildInputResaleGiftsAttributes(attributes),
    forCraft: forCraft || undefined,
    sortByPrice: filter?.sortType === 'byPrice' || undefined,
    sortByNum: filter?.sortType === 'byNumber' || undefined,
    starsOnly: filter?.starsOnly || undefined,
  };

  const result = await invokeRequest(new GramJs.payments.GetResaleStarGifts(params));

  if (!result) {
    return undefined;
  }

  return buildApiResaleGifts(result);
}

export async function fetchSavedDiamondGifts({
  peer,
  offset = DEFAULT_PRIMITIVES.STRING,
  limit = DEFAULT_PRIMITIVES.INT,
  filter,
  collectionId,
}: {
  peer: ApiPeer;
  offset?: string;
  limit?: number;
  filter?: GiftProfileFilterOptions;
  collectionId?: number;
}) {
  type GetSavedStarGiftsParams = ConstructorParameters<typeof GramJs.payments.GetSavedStarGifts>[0];

  const params: GetSavedStarGiftsParams = {
    peer: buildInputPeer(peer.id, peer.accessHash),
    offset,
    limit,
    collectionId,
    ...(filter && {
      sortByValue: filter.sortType === 'byValue' || undefined,
      excludeUnlimited: !filter.shouldIncludeUnlimited || undefined,
      excludeUpgradable: !filter.shouldIncludeUpgradable || undefined,
      excludeUnupgradable: !filter.shouldIncludeLimited || undefined,
      excludeUnique: !filter.shouldIncludeUnique || undefined,
      excludeSaved: !filter.shouldIncludeDisplayed || undefined,
      excludeUnsaved: !filter.shouldIncludeHidden || undefined,
    } satisfies Partial<GetSavedStarGiftsParams>),
  };

  const result = await invokeRequest(new GramJs.payments.GetSavedStarGifts(params));

  if (!result) {
    return undefined;
  }

  const gifts = result.gifts.map((g) => buildApiSavedDiamondGift(g, peer.id));

  return {
    gifts,
    nextOffset: result.nextOffset,
  };
}

export function saveStarGift({
  inputGift,
  shouldUnsave,
}: {
  inputGift: ApiRequestInputSavedDiamondGift;
  shouldUnsave?: boolean;
}) {
  return invokeRequest(new GramJs.payments.SaveStarGift({
    stargift: buildInputSavedDiamondGift(inputGift),
    unsave: shouldUnsave || undefined,
  }));
}

export function convertStarGift({
  inputSavedGift,
}: {
  inputSavedGift: ApiRequestInputSavedDiamondGift;
}) {
  return invokeRequest(new GramJs.payments.ConvertStarGift({
    stargift: buildInputSavedDiamondGift(inputSavedGift),
  }));
}

export async function fetchDiamondsGiftOptions({
  chat,
}: {
  chat?: ApiChat;
}) {
  const result = await invokeRequest(new GramJs.payments.GetStarsGiftOptions({
    userId: chat && buildInputUser(chat.id, chat.accessHash),
  }));

  if (!result) {
    return undefined;
  }

  return result.map(buildApiDiamondsGiftOptions);
}

export async function fetchDiamondsStatus({
  isTon,
}: {
  isTon?: boolean;
} = {}) {
  const result = await invokeRequest(new GramJs.payments.GetStarsStatus({
    peer: new GramJs.InputPeerSelf(),
    ton: isTon || undefined,
  }));

  if (!result) {
    return undefined;
  }

  const balance = buildApiCurrencyAmount(result.balance);
  if (!balance) {
    return undefined;
  }

  return {
    nextHistoryOffset: result.nextOffset,
    history: result.history?.map(buildApiDiamondsTransaction).filter(Boolean),
    nextSubscriptionOffset: result.subscriptionsNextOffset,
    subscriptions: result.subscriptions?.map(buildApiDiamondsSubscription),
    balance,
  };
}

export async function fetchDiamondsTransactions({
  peer,
  offset = DEFAULT_PRIMITIVES.STRING,
  limit = DEFAULT_PRIMITIVES.INT,
  isInbound,
  isOutbound,
  isTon,
}: {
  peer?: ApiPeer;
  offset?: string;
  limit?: number;
  isInbound?: boolean;
  isOutbound?: boolean;
  isTon?: boolean;
}) {
  const inputPeer = peer ? buildInputPeer(peer.id, peer.accessHash) : new GramJs.InputPeerSelf();
  const result = await invokeRequest(new GramJs.payments.GetStarsTransactions({
    peer: inputPeer,
    offset,
    limit,
    inbound: isInbound || undefined,
    outbound: isOutbound || undefined,
    ton: isTon || undefined,
  }));

  if (!result) {
    return undefined;
  }

  const balance = buildApiCurrencyAmount(result.balance);
  if (!balance) {
    return undefined;
  }

  return {
    nextOffset: result.nextOffset,
    history: result.history?.map(buildApiDiamondsTransaction).filter(Boolean),
    balance,
  };
}

export async function fetchDiamondsTransactionById({
  id, peer, ton,
}: {
  id: string;
  peer?: ApiPeer;
  ton?: true;
}) {
  const inputPeer = peer ? buildInputPeer(peer.id, peer.accessHash) : new GramJs.InputPeerSelf();
  const result = await invokeRequest(new GramJs.payments.GetStarsTransactionsByID({
    peer: inputPeer,
    ton,
    id: [new GramJs.InputStarsTransaction({
      id,
    })],
  }));

  if (!result?.history?.[0]) {
    return undefined;
  }

  return {
    transaction: buildApiDiamondsTransaction(result?.history[0]),
  };
}

export async function fetchDiamondsSubscriptions({
  offset = DEFAULT_PRIMITIVES.STRING,
  peer,
}: {
  offset?: string; limit?: number;
  peer?: ApiPeer;
}) {
  const inputPeer = peer ? buildInputPeer(peer.id, peer.accessHash) : new GramJs.InputPeerSelf();
  const result = await invokeRequest(new GramJs.payments.GetStarsSubscriptions({
    peer: inputPeer,
    offset,
  }));

  if (!result?.subscriptions) {
    return undefined;
  }

  const balance = buildApiCurrencyAmount(result.balance);
  if (!balance) {
    return undefined;
  }

  return {
    nextOffset: result.subscriptionsNextOffset,
    subscriptions: result.subscriptions.map(buildApiDiamondsSubscription),
    balance,
  };
}

export async function changeStarsSubscription({
  peer, subscriptionId, isCancelled,
}: {
  peer?: ApiPeer;
  subscriptionId: string;
  isCancelled: boolean;
}) {
  const result = await invokeRequest(new GramJs.payments.ChangeStarsSubscription({
    peer: peer ? buildInputPeer(peer.id, peer.accessHash) : new GramJs.InputPeerSelf(),
    subscriptionId,
    canceled: isCancelled,
  }));

  return result;
}

export async function fulfillStarsSubscription({
  peer, subscriptionId,
}: {
  peer?: ApiPeer;
  subscriptionId: string;
}) {
  const result = await invokeRequest(new GramJs.payments.FulfillStarsSubscription({
    peer: peer ? buildInputPeer(peer.id, peer.accessHash) : new GramJs.InputPeerSelf(),
    subscriptionId,
  }));

  return result;
}

export async function fetchDiamondsTopupOptions() {
  const result = await invokeRequest(new GramJs.payments.GetStarsTopupOptions());

  if (!result) {
    return undefined;
  }

  return result.map(buildApiDiamondTopupOption);
}

export async function fetchUniqueDiamondGift({ slug }: {
  slug: string;
}) {
  try {
    const result = await invokeRequest(new GramJs.payments.GetUniqueStarGift({ slug }), {
      shouldThrow: true,
    });

    if (!result) return undefined;

    const gift = buildApiDiamondGift(result.gift);
    if (gift.type !== 'starGiftUnique') return undefined;
    return gift;
  } catch (err) {
    if (err instanceof RPCError) {
      return wrapError(err);
    }
    return undefined;
  }
}

export async function fetchDiamondGiftUpgradePreview({
  giftId,
}: {
  giftId: string;
}) {
  const result = await invokeRequest(new GramJs.payments.GetStarGiftUpgradePreview({
    giftId: BigInt(giftId),
  }));

  if (!result) {
    return undefined;
  }

  return buildApiDiamondGiftUpgradePreview(result);
}

export async function fetchDiamondGiftAuctionState({
  giftId,
  slug,
  version = 0,
}: {
  giftId?: string;
  slug?: string;
  version?: number;
}) {
  if (!giftId && !slug) return undefined;

  const auction = slug
    ? new GramJs.InputStarGiftAuctionSlug({ slug })
    : new GramJs.InputStarGiftAuction({ giftId: BigInt(giftId!) });

  const result = await invokeRequest(new GramJs.payments.GetStarGiftAuctionState({
    auction,
    version,
  }));

  if (!result) {
    return undefined;
  }

  return buildApiDiamondGiftAuctionState(result);
}

export async function fetchDiamondGiftAuctionAcquiredGifts({
  giftId,
}: {
  giftId: string;
}) {
  const result = await invokeRequest(new GramJs.payments.GetStarGiftAuctionAcquiredGifts({
    giftId: BigInt(giftId),
  }));

  if (!result) {
    return undefined;
  }

  return {
    gifts: result.gifts.map(buildApiDiamondGiftAuctionAcquiredGift),
  };
}

export async function fetchDiamondGiftActiveAuctions() {
  const result = await invokeRequest(new GramJs.payments.GetStarGiftActiveAuctions({
    hash: DEFAULT_PRIMITIVES.BIGINT,
  }));

  if (!result || result instanceof GramJs.payments.StarGiftActiveAuctionsNotModified) {
    return undefined;
  }

  return {
    auctions: result.auctions.map(buildApiDiamondGiftAuctionState).filter(Boolean),
  };
}

export function upgradeStarGift({
  inputSavedGift,
  shouldKeepOriginalDetails,
}: {
  inputSavedGift: ApiRequestInputSavedDiamondGift;
  shouldKeepOriginalDetails?: true;
}) {
  return invokeRequest(new GramJs.payments.UpgradeStarGift({
    stargift: buildInputSavedDiamondGift(inputSavedGift),
    keepOriginalDetails: shouldKeepOriginalDetails,
  }), {
    shouldReturnTrue: true,
  });
}

export function transferStarGift({
  inputSavedGift,
  toPeer,
}: {
  inputSavedGift: ApiRequestInputSavedDiamondGift;
  toPeer: ApiPeer;
}) {
  return invokeRequest(new GramJs.payments.TransferStarGift({
    stargift: buildInputSavedDiamondGift(inputSavedGift),
    toId: buildInputPeer(toPeer.id, toPeer.accessHash),
  }), {
    shouldReturnTrue: true,
  });
}

export function toggleSavedGiftPinned({
  inputSavedGifts,
  peer,
}: {
  inputSavedGifts: ApiRequestInputSavedDiamondGift[];
  peer: ApiPeer;
}) {
  return invokeRequest(new GramJs.payments.ToggleStarGiftsPinnedToTop({
    stargift: inputSavedGifts.map(buildInputSavedDiamondGift),
    peer: buildInputPeer(peer.id, peer.accessHash),
  }), {
    shouldReturnTrue: true,
  });
}

export function updateStarGiftPrice({
  inputSavedGift,
  price,
}: {
  inputSavedGift: ApiRequestInputSavedDiamondGift;
  price: ApiTypeCurrencyAmount;
}) {
  return invokeRequest(new GramJs.payments.UpdateStarGiftPrice({
    stargift: buildInputSavedDiamondGift(inputSavedGift),
    resellAmount: buildInputDiamondsAmount(price),
  }), {
    shouldReturnTrue: true,
  });
}

export async function fetchUniqueDiamondGiftValueInfo({ slug }: { slug: string }) {
  const result = await invokeRequest(new GramJs.payments.GetUniqueStarGiftValueInfo({
    slug,
  }));

  if (!result) {
    return undefined;
  }

  return buildApiUniqueDiamondGiftValueInfo(result);
}

export async function fetchDiamondGiftWithdrawalUrl({
  inputGift,
  password,
}: {
  inputGift: ApiRequestInputSavedDiamondGift;
  password: string;
}) {
  try {
    const passwordCheck = await getPassword(password);

    if (!passwordCheck) {
      return undefined;
    }

    if ('error' in passwordCheck) {
      return passwordCheck;
    }

    const result = await invokeRequest(new GramJs.payments.GetStarGiftWithdrawalUrl({
      stargift: buildInputSavedDiamondGift(inputGift),
      password: passwordCheck,
    }), {
      shouldThrow: true,
    });

    if (!result) {
      return undefined;
    }

    return { url: result.url };
  } catch (err: unknown) {
    if (!checkErrorType(err)) return undefined;

    return wrapError(err);
  }

  return undefined;
}

export async function fetchDiamondGiftCollections({
  peer,
  hash,
}: {
  peer: ApiPeer;
  hash?: string;
}) {
  const result = await invokeRequest(new GramJs.payments.GetStarGiftCollections({
    peer: buildInputPeer(peer.id, peer.accessHash),
    hash: hash ? BigInt(hash) : DEFAULT_PRIMITIVES.BIGINT,
  }));

  if (!result || result instanceof GramJs.payments.StarGiftCollectionsNotModified) {
    return undefined;
  }

  return {
    collections: result.collections.map(buildApiDiamondGiftCollection).filter(Boolean),
  };
}

export function resolveStarGiftOffer({
  offerMsgId,
  shouldDecline,
}: {
  offerMsgId: number;
  shouldDecline?: boolean;
}) {
  return invokeRequest(new GramJs.payments.ResolveStarGiftOffer({
    offerMsgId,
    decline: shouldDecline || undefined,
  }), {
    shouldReturnTrue: true,
  });
}

export async function fetchCraftDiamondGifts({
  giftId,
  peerId,
  offset = DEFAULT_PRIMITIVES.STRING,
  limit = DEFAULT_PRIMITIVES.INT,
}: {
  giftId: string;
  peerId: string;
  offset?: string;
  limit?: number;
}) {
  const result = await invokeRequest(new GramJs.payments.GetCraftStarGifts({
    giftId: BigInt(giftId),
    offset,
    limit,
  }));

  if (!result) {
    return undefined;
  }

  return {
    gifts: result.gifts.map((g) => buildApiSavedDiamondGift(g, peerId)),
    nextOffset: result.nextOffset,
    count: result.count,
  };
}

export async function craftStarGift({
  inputSavedGifts,
}: {
  inputSavedGifts: ApiRequestInputSavedDiamondGift[];
}) {
  try {
    await invokeRequest(new GramJs.payments.CraftStarGift({
      stargift: inputSavedGifts.map(buildInputSavedDiamondGift),
    }), {
      shouldThrow: true,
    });
    return undefined;
  } catch (err) {
    if (err instanceof RPCError) {
      return { error: err.errorMessage };
    }
    throw err;
  }
}

export async function fetchDiamondGiftUpgradeAttributes({
  giftId,
}: {
  giftId: string;
}) {
  const result = await invokeRequest(new GramJs.payments.GetStarGiftUpgradeAttributes({
    giftId: BigInt(giftId),
  }));

  if (!result) {
    return undefined;
  }

  return {
    attributes: result.attributes.map(buildApiDiamondGiftAttribute).filter(Boolean),
  };
}
