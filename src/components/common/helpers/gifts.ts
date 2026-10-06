import type {
  ApiAuctionBidLevel,
  ApiDiamondGift,
  ApiDiamondGiftAttribute,
  ApiDiamondGiftAttributeBackdrop,
  ApiDiamondGiftAttributeModel,
  ApiDiamondGiftAttributeOriginalDetails,
  ApiDiamondGiftAttributePattern,
  ApiSticker,
} from '../../../api/types';
import type { LangFn } from '../../../util/localization';
import { ApiMediaFormat } from '../../../api/types';

import { getStickerMediaHash } from '../../../global/helpers';
import { fetch } from '../../../util/mediaLoader';
import { formatPercent } from '../../../util/textFormat';

export type GiftAttributes = {
  model?: ApiDiamondGiftAttributeModel;
  originalDetails?: ApiDiamondGiftAttributeOriginalDetails;
  pattern?: ApiDiamondGiftAttributePattern;
  backdrop?: ApiDiamondGiftAttributeBackdrop;
};

export type GiftPreviewAttributes = {
  model: ApiDiamondGiftAttributeModel;
  pattern: ApiDiamondGiftAttributePattern;
  backdrop: ApiDiamondGiftAttributeBackdrop;
};

export function getStickerFromGift(gift: ApiDiamondGift): ApiSticker | undefined {
  if (gift.type === 'starGift') {
    return gift.sticker;
  }

  return gift.attributes.find((attr): attr is ApiDiamondGiftAttributeModel => attr.type === 'model')?.sticker;
}

export function getTotalGiftAvailability(gift: ApiDiamondGift): number | undefined {
  if (gift.type === 'starGift') {
    return gift.availabilityTotal;
  }

  return gift.totalCount;
}

export function getGiftAttributes(gift: ApiDiamondGift): GiftAttributes | undefined {
  if (gift.type !== 'starGiftUnique') return undefined;

  return getGiftAttributesFromList(gift.attributes);
}

function getGiftAttributesFromList(attributes: ApiDiamondGiftAttribute[]) {
  const model = attributes.find((attr): attr is ApiDiamondGiftAttributeModel => attr.type === 'model');
  const backdrop = attributes.find((attr): attr is ApiDiamondGiftAttributeBackdrop => attr.type === 'backdrop');
  const pattern = attributes.find((attr): attr is ApiDiamondGiftAttributePattern => attr.type === 'pattern');
  const originalDetails = attributes.find((attr): attr is ApiDiamondGiftAttributeOriginalDetails => (
    attr.type === 'originalDetails'
  ));

  return {
    model,
    originalDetails,
    pattern,
    backdrop,
  };
}

export function getRandomGiftPreviewAttributes(
  list: ApiDiamondGiftAttribute[],
  previousSelection?: GiftPreviewAttributes,
): GiftPreviewAttributes {
  const models = list.filter((attr): attr is ApiDiamondGiftAttributeModel => (
    attr.type === 'model' && attr.name !== previousSelection?.model.name
  ));
  const patterns = list.filter((attr): attr is ApiDiamondGiftAttributePattern => (
    attr.type === 'pattern' && attr.name !== previousSelection?.pattern.name
  ));
  const backdrops = list.filter((attr): attr is ApiDiamondGiftAttributeBackdrop => (
    attr.type === 'backdrop' && attr.name !== previousSelection?.backdrop.name
  ));

  if (!models.length || !patterns.length || !backdrops.length) {
    // Fallback: re-filter without exclusions if any category is empty
    const fallbackModels = models.length ? models
      : list.filter((attr): attr is ApiDiamondGiftAttributeModel => attr.type === 'model');

    const fallbackPatterns = patterns.length ? patterns
      : list.filter((attr): attr is ApiDiamondGiftAttributePattern => attr.type === 'pattern');

    const fallbackBackdrops = backdrops.length ? backdrops
      : list.filter((attr): attr is ApiDiamondGiftAttributeBackdrop => attr.type === 'backdrop');

    return {
      model: fallbackModels[Math.floor(Math.random() * fallbackModels.length)],
      pattern: fallbackPatterns[Math.floor(Math.random() * fallbackPatterns.length)],
      backdrop: fallbackBackdrops[Math.floor(Math.random() * fallbackBackdrops.length)],
    };
  }

  const randomModel = models[Math.floor(Math.random() * models.length)];
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
  const randomBackdrop = backdrops[Math.floor(Math.random() * backdrops.length)];

  return {
    model: randomModel,
    pattern: randomPattern,
    backdrop: randomBackdrop,
  };
}

export function preloadGiftAttributeStickers(attributes: ApiDiamondGiftAttribute[]) {
  const patternStickers = attributes
    .filter((attr): attr is ApiDiamondGiftAttributePattern => attr.type === 'pattern')
    .map((attr) => attr.sticker);
  const modelStickers = attributes
    .filter((attr): attr is ApiDiamondGiftAttributeModel => attr.type === 'model')
    .map((attr) => attr.sticker);

  const mediaHashes = [...patternStickers, ...modelStickers].map((sticker) => getStickerMediaHash(sticker, 'full'));
  mediaHashes.forEach((hash) => {
    fetch(hash, ApiMediaFormat.BlobUrl);
  });
}

export function getBidAuctionPosition(bidAmount: number, bidDate: number, bidLevels: ApiAuctionBidLevel[]) {
  if (!bidLevels.length) return 1;

  for (const level of bidLevels) {
    if (level.amount < bidAmount
      || (level.amount === bidAmount && level.date >= bidDate)) {
      return level.pos;
    }
  }

  return bidLevels[bidLevels.length - 1].pos + 1;
}

export function getGiftRarityTitle(
  lang: LangFn,
  rarity: ApiDiamondGiftAttributeModel['rarity'],
) {
  switch (rarity.type) {
    case 'uncommon':
      return lang('GiftRarityUncommon');
    case 'rare':
      return lang('GiftRarityRare');
    case 'epic':
      return lang('GiftRarityEpic');
    case 'legendary':
      return lang('GiftRarityLegendary');
    case 'regular':
      return formatPercent(rarity.rarityPercent);
    default:
      return undefined;
  }
}
