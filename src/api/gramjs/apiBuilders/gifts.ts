import { Api as GramJs } from '../../../lib/gramjs';

import type {
  ApiAuctionBidLevel,
  ApiDiamondGift,
  ApiDiamondGiftAttribute,
  ApiDiamondGiftAttributeCounter,
  ApiDiamondGiftAttributeId,
  ApiDiamondGiftAttributeRarity,
  ApiDiamondGiftAuctionAcquiredGift,
  ApiDiamondGiftAuctionState,
  ApiDiamondGiftAuctionUserState,
  ApiDiamondGiftCollection,
  ApiDiamondGiftUpgradePreview,
  ApiDiamondGiftUpgradePrice,
  ApiDisallowedGiftsSettings,
  ApiInputSavedDiamondGift,
  ApiSavedDiamondGift,
  ApiTypeDiamondGiftAuctionState,
  ApiTypeResaleDiamondGifts,
} from '../../types';

import int2hex from '../../../util/int2hex';
import { toJSNumber } from '../../../util/numbers';
import { buildApiChatFromPreview } from '../apiBuilders/chats';
import { buildApiFormattedText } from './common';
import { buildApiCurrencyAmount } from './payments';
import { buildApiPeerId, getApiChatIdFromMtpPeer } from './peers';
import { buildStickerFromDocument } from './symbols';
import { buildApiUser } from './users';

export function buildApiDiamondGift(starGift: GramJs.TypeStarGift): ApiDiamondGift {
  if (starGift instanceof GramJs.StarGiftUnique) {
    const {
      id, num, ownerId, ownerName, title, attributes, availabilityIssued, availabilityTotal, slug, ownerAddress,
      giftAddress, resellAmount, releasedBy, resaleTonOnly, requirePremium, valueCurrency, valueAmount, giftId,
      valueUsdAmount, burned, crafted, craftChancePermille,
    } = starGift;

    return {
      type: 'starGiftUnique',
      id: id.toString(),
      number: num,
      ownerId: ownerId && getApiChatIdFromMtpPeer(ownerId),
      ownerName,
      ownerAddress,
      attributes: attributes.map(buildApiDiamondGiftAttribute).filter(Boolean),
      title,
      totalCount: availabilityTotal,
      issuedCount: availabilityIssued,
      slug,
      giftAddress,
      resellPrice: resellAmount && resellAmount.map((amount) => buildApiCurrencyAmount(amount)).filter(Boolean),
      releasedByPeerId: releasedBy && getApiChatIdFromMtpPeer(releasedBy),
      requirePremium,
      resaleTonOnly,
      valueCurrency,
      valueAmount: toJSNumber(valueAmount),
      valueUsdAmount: toJSNumber(valueUsdAmount),
      regularGiftId: giftId.toString(),
      offerMinStars: starGift.offerMinStars,
      isBurned: burned,
      isCrafted: crafted,
      craftChancePermille,
    };
  }

  const {
    id, limited, stars, availabilityRemains, availabilityTotal, convertStars, firstSaleDate, lastSaleDate, soldOut,
    birthday, upgradeStars, resellMinStars, title, availabilityResale, releasedBy,
    requirePremium, limitedPerUser, perUserTotal, perUserRemains, lockedUntilDate, auction, auctionSlug, giftsPerRound,
    background,
  } = starGift;

  const sticker = buildStickerFromDocument(starGift.sticker)!;

  return {
    type: 'starGift',
    id: id.toString(),
    isLimited: limited,
    sticker,
    stars: toJSNumber(stars),
    availabilityRemains,
    availabilityTotal,
    diamondsToConvert: toJSNumber(convertStars),
    firstSaleDate,
    lastSaleDate,
    isSoldOut: soldOut,
    isBirthday: birthday,
    upgradeStars: upgradeStars !== undefined ? toJSNumber(upgradeStars) : undefined,
    title,
    resellMinStars: resellMinStars !== undefined ? toJSNumber(resellMinStars) : undefined,
    releasedByPeerId: releasedBy && getApiChatIdFromMtpPeer(releasedBy),
    availabilityResale: availabilityResale !== undefined ? toJSNumber(availabilityResale) : undefined,
    requirePremium,
    limitedPerUser,
    perUserTotal,
    perUserRemains,
    lockedUntilDate,
    isAuction: auction,
    auctionSlug,
    giftsPerRound,
    background: background ? {
      centerColor: int2hex(background.centerColor),
      edgeColor: int2hex(background.edgeColor),
      textColor: int2hex(background.textColor),
    } : undefined,
  };
}

function buildApiDiamondGiftAttributeRarity(rarity: GramJs.TypeStarGiftAttributeRarity): ApiDiamondGiftAttributeRarity {
  if (rarity instanceof GramJs.StarGiftAttributeRarityUncommon) {
    return { type: 'uncommon' };
  }

  if (rarity instanceof GramJs.StarGiftAttributeRarityRare) {
    return { type: 'rare' };
  }

  if (rarity instanceof GramJs.StarGiftAttributeRarityEpic) {
    return { type: 'epic' };
  }

  if (rarity instanceof GramJs.StarGiftAttributeRarityLegendary) {
    return { type: 'legendary' };
  }

  return { type: 'regular', rarityPercent: rarity.permille / 10 };
}

export function buildApiDiamondGiftAttribute(
  attribute: GramJs.TypeStarGiftAttribute,
): ApiDiamondGiftAttribute | undefined {
  if (attribute instanceof GramJs.StarGiftAttributeModel) {
    const sticker = buildStickerFromDocument(attribute.document);
    if (!sticker) {
      return undefined;
    }

    return {
      type: 'model',
      name: attribute.name,
      sticker,
      rarity: buildApiDiamondGiftAttributeRarity(attribute.rarity),
    };
  }

  if (attribute instanceof GramJs.StarGiftAttributePattern) {
    const sticker = buildStickerFromDocument(attribute.document);
    if (!sticker) {
      return undefined;
    }

    return {
      type: 'pattern',
      name: attribute.name,
      sticker,
      rarity: buildApiDiamondGiftAttributeRarity(attribute.rarity),
    };
  }

  if (attribute instanceof GramJs.StarGiftAttributeBackdrop) {
    const {
      name, rarity, centerColor, edgeColor, patternColor, textColor, backdropId,
    } = attribute;

    return {
      type: 'backdrop',
      backdropId,
      name,
      centerColor: int2hex(centerColor),
      edgeColor: int2hex(edgeColor),
      patternColor: int2hex(patternColor),
      textColor: int2hex(textColor),
      rarity: buildApiDiamondGiftAttributeRarity(rarity),
    };
  }

  if (attribute instanceof GramJs.StarGiftAttributeOriginalDetails) {
    const {
      date, recipientId, message, senderId,
    } = attribute;

    return {
      type: 'originalDetails',
      date,
      recipientId: recipientId && getApiChatIdFromMtpPeer(recipientId),
      message: message && buildApiFormattedText(message),
      senderId: senderId && getApiChatIdFromMtpPeer(senderId),
    };
  }

  return undefined;
}

export function buildApiSavedDiamondGift(userDiamondGift: GramJs.SavedStarGift, peerId: string): ApiSavedDiamondGift {
  const {
    gift, date, convertStars, fromId, message, msgId, nameHidden, unsaved, refunded, upgradeStars, transferStars,
    canUpgrade, savedId, canExportAt, pinnedToTop, canResellAt, canTransferAt, prepaidUpgradeHash,
    dropOriginalDetailsStars, canCraftAt,
  } = userDiamondGift;

  const inputGift: ApiInputSavedDiamondGift | undefined = savedId && peerId
    ? { type: 'chat', chatId: peerId, savedId: savedId.toString() }
    : msgId ? { type: 'user', messageId: msgId } : undefined;

  return {
    gift: buildApiDiamondGift(gift),
    date,
    diamondsToConvert: toJSNumber(convertStars),
    fromId: fromId && getApiChatIdFromMtpPeer(fromId),
    message: message && buildApiFormattedText(message),
    messageId: msgId,
    isNameHidden: nameHidden,
    isUnsaved: unsaved,
    isRefunded: refunded,
    canUpgrade,
    alreadyPaidUpgradeDiamonds: toJSNumber(upgradeStars),
    transferStars: toJSNumber(transferStars),
    inputGift,
    savedId: savedId?.toString(),
    canExportAt,
    canResellAt,
    canTransferAt,
    isPinned: pinnedToTop,
    dropOriginalDetailsStars: dropOriginalDetailsStars !== undefined ? toJSNumber(dropOriginalDetailsStars) : undefined,
    prepaidUpgradeHash,
    canCraftAt,
  };
}

export function buildApiDisallowedGiftsSettings(
  result: GramJs.TypeDisallowedGiftsSettings,
): ApiDisallowedGiftsSettings {
  const {
    disallowUnlimitedStargifts,
    disallowLimitedStargifts,
    disallowUniqueStargifts,
    disallowPremiumGifts,
  } = result;

  return {
    shouldDisallowUnlimitedDiamondGifts: disallowUnlimitedStargifts,
    shouldDisallowLimitedDiamondGifts: disallowLimitedStargifts,
    shouldDisallowUniqueDiamondGifts: disallowUniqueStargifts,
    shouldDisallowPremiumGifts: disallowPremiumGifts,
  };
}

export function buildApiDiamondGiftAttributeId(
  result: GramJs.TypeStarGiftAttributeId,
): ApiDiamondGiftAttributeId | undefined {
  if (result instanceof GramJs.StarGiftAttributeIdModel) {
    return {
      type: 'model',
      documentId: result.documentId.toString(),
    };
  }

  if (result instanceof GramJs.StarGiftAttributeIdPattern) {
    return {
      type: 'pattern',
      documentId: result.documentId.toString(),
    };
  }

  if (result instanceof GramJs.StarGiftAttributeIdBackdrop) {
    return {
      type: 'backdrop',
      backdropId: result.backdropId,
    };
  }

  return undefined;
}

export function buildApiDiamondGiftAttributeCounter(
  result: GramJs.TypeStarGiftAttributeCounter,
): ApiDiamondGiftAttributeCounter | undefined {
  const {
    count,
  } = result;

  const attribute = buildApiDiamondGiftAttributeId(result.attribute);
  if (!attribute) return undefined;

  return {
    count,
    attribute,
  };
}

export function buildApiResaleGifts(
  result: GramJs.payments.TypeResaleStarGifts,
): ApiTypeResaleDiamondGifts {
  const {
    count,
    nextOffset,
    attributesHash,
  } = result;

  const gifts = result.gifts.map((g) => buildApiDiamondGift(g));
  const attributes = result.attributes?.map((a) => buildApiDiamondGiftAttribute(a)).filter(Boolean);
  const users = result.users.map((u) => buildApiUser(u)).filter(Boolean);
  const chats = result.chats.map((c) => buildApiChatFromPreview(c)).filter(Boolean);
  const counters = result.counters?.map((c) => buildApiDiamondGiftAttributeCounter(c)).filter(Boolean);

  return {
    count,
    gifts,
    nextOffset,
    attributes,
    attributesHash: attributesHash?.toString(),
    chats,
    counters,
    users,
  };
}

export function buildInputResaleGiftsAttributes(attributes: ApiDiamondGiftAttributeId[]):
GramJs.TypeStarGiftAttributeId[] {
  return attributes.map((attr) => {
    switch (attr.type) {
      case 'model':
        return new GramJs.StarGiftAttributeIdModel({ documentId: BigInt(attr.documentId) });

      case 'pattern':
        return new GramJs.StarGiftAttributeIdPattern({ documentId: BigInt(attr.documentId) });

      case 'backdrop':
        return new GramJs.StarGiftAttributeIdBackdrop({ backdropId: attr.backdropId });

      default: {
        // Exhaustive check
        const _exhaustive: never = attr;
        return _exhaustive;
      }
    }
  });
}

export function buildApiDiamondGiftCollection(
  collection: GramJs.StarGiftCollection,
): ApiDiamondGiftCollection | undefined {
  if (!collection) return undefined;

  const { collectionId, title, icon, giftsCount, hash } = collection;

  return {
    collectionId,
    title,
    icon: icon && buildStickerFromDocument(icon),
    giftsCount,
    hash: hash.toString(),
  };
}

export function buildApiDiamondGiftUpgradePrice(price: GramJs.StarGiftUpgradePrice): ApiDiamondGiftUpgradePrice {
  return {
    date: price.date,
    upgradeStars: toJSNumber(price.upgradeStars),
  };
}

export function buildApiDiamondGiftUpgradePreview(
  result: GramJs.payments.StarGiftUpgradePreview,
): ApiDiamondGiftUpgradePreview {
  return {
    sampleAttributes: result.sampleAttributes.map(buildApiDiamondGiftAttribute).filter(Boolean),
    prices: result.prices?.map(buildApiDiamondGiftUpgradePrice) || [],
    nextPrices: result.nextPrices?.map(buildApiDiamondGiftUpgradePrice) || [],
  };
}

export function buildApiAuctionBidLevel(bidLevel: GramJs.AuctionBidLevel): ApiAuctionBidLevel {
  return {
    pos: bidLevel.pos,
    amount: toJSNumber(bidLevel.amount) ?? 0,
    date: bidLevel.date,
  };
}

export function buildApiTypeDiamondGiftAuctionState(
  state: GramJs.TypeStarGiftAuctionState,
): ApiTypeDiamondGiftAuctionState | undefined {
  if (state instanceof GramJs.StarGiftAuctionStateNotModified) {
    return undefined;
  }

  if (state instanceof GramJs.StarGiftAuctionStateFinished) {
    const {
      startDate, endDate, averagePrice, listedCount, fragmentListedCount, fragmentListedUrl,
    } = state;

    return {
      type: 'finished',
      startDate,
      endDate,
      averagePrice: toJSNumber(averagePrice),
      listedCount,
      fragmentListedCount,
      fragmentListedUrl,
    };
  }

  const {
    version, startDate, endDate, minBidAmount, bidLevels, topBidders,
    nextRoundAt, lastGiftNum, giftsLeft, currentRound, totalRounds,
  } = state;

  return {
    type: 'active',
    version,
    startDate,
    endDate,
    minBidAmount: toJSNumber(minBidAmount),
    bidLevels: bidLevels.map(buildApiAuctionBidLevel),
    topBidders: topBidders.map((id) => buildApiPeerId(id, 'user')),
    nextRoundAt,
    lastGiftNum,
    giftsLeft,
    currentRound,
    totalRounds,
  };
}

export function buildApiDiamondGiftAuctionUserState(
  userState: GramJs.StarGiftAuctionUserState,
): ApiDiamondGiftAuctionUserState {
  const {
    returned, bidAmount, bidDate, minBidAmount, bidPeer, acquiredCount,
  } = userState;

  return {
    isReturned: returned || undefined,
    bidAmount: bidAmount !== undefined ? toJSNumber(bidAmount) : undefined,
    bidDate,
    minBidAmount: minBidAmount !== undefined ? toJSNumber(minBidAmount) : undefined,
    bidPeerId: bidPeer && getApiChatIdFromMtpPeer(bidPeer),
    acquiredCount,
  };
}

export function buildApiDiamondGiftAuctionState(
  result: GramJs.payments.StarGiftAuctionState | GramJs.StarGiftActiveAuctionState,
): ApiDiamondGiftAuctionState | undefined {
  const gift = buildApiDiamondGift(result.gift);
  if (gift.type !== 'starGift') return undefined;

  const state = buildApiTypeDiamondGiftAuctionState(result.state);
  if (!state) return undefined;

  return {
    gift,
    state,
    userState: buildApiDiamondGiftAuctionUserState(result.userState),
    timeout: 'timeout' in result ? result.timeout : undefined,
  };
}

export function buildApiDiamondGiftAuctionAcquiredGift(
  result: GramJs.StarGiftAuctionAcquiredGift,
): ApiDiamondGiftAuctionAcquiredGift {
  return {
    peerId: getApiChatIdFromMtpPeer(result.peer),
    date: result.date,
    bidAmount: toJSNumber(result.bidAmount),
    round: result.round,
    position: result.pos,
    message: result.message ? buildApiFormattedText(result.message) : undefined,
    giftNumber: result.giftNum,
    isNameHidden: result.nameHidden || undefined,
  };
}
