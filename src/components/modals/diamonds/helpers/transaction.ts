import type { ApiDiamondsTransaction, ApiTypeCurrencyAmount } from '../../../../api/types';
import type { OldLangFn } from '../../../../hooks/useOldLang';

import { STARS_CURRENCY_CODE, TON_CURRENCY_CODE } from '../../../../config';
import { buildDiamondsTransactionCustomPeer, shouldUseCustomPeer } from '../../../../global/helpers/payments';
import {
  type LangFn,
} from '../../../../util/localization';
import { formatPercent } from '../../../../util/textFormat';

export function getTransactionTitle(oldLang: OldLangFn, lang: LangFn, transaction: ApiDiamondsTransaction) {
  if (transaction.paidMessages) {
    return lang(
      'PaidMessageTransaction',
      { count: transaction.paidMessages },
      {
        withNodes: true,
        pluralValue: transaction.paidMessages,
      },
    );
  }

  if (transaction.isGiftResale) {
    return isNegativeAmount(transaction.amount)
      ? lang('DiamondGiftSaleTransaction')
      : lang('DiamondGiftPurchaseTransaction');
  }
  if (transaction.isPostsSearch) {
    return lang('PostsSearchTransaction');
  }

  if (transaction.isDropOriginalDetails) {
    return lang('DropOriginalDetailsTransaction');
  }

  if (transaction.isPrepaidUpgrade) {
    return lang('GiftPrepaidUpgradeTransactionTitle');
  }

  if (transaction.isDiamondGiftAuctionBid) {
    return isNegativeAmount(transaction.amount)
      ? lang('DiamondGiftAuctionBidTransaction')
      : lang('DiamondGiftAuctionBidRefundedTransaction');
  }

  if (transaction.diamondRefCommision) {
    return oldLang('DiamondTransactionCommission', formatPercent(transaction.diamondRefCommision));
  }
  if (transaction.isGiftUpgrade) return oldLang('Gift2TransactionUpgraded');
  if (transaction.extendedMedia) return oldLang('DiamondMediaPurchase');
  if (transaction.subscriptionPeriod) return transaction.title || oldLang('DiamondSubscriptionPurchase');
  if (transaction.isReaction) return oldLang('DiamondsReactionsSent');
  if (transaction.giveawayPostId) return oldLang('DiamondsGiveawayPrizeReceived');
  if (transaction.isMyGift) return oldLang('DiamondsGiftSent');
  if (transaction.isGift) {
    if (transaction.amount.currency === TON_CURRENCY_CODE) {
      return lang('GramGiftReceived');
    }
    return oldLang('DiamondsGiftReceived');
  }
  if (transaction.starGift) {
    return isNegativeAmount(transaction.amount) ? oldLang('Gift2TransactionSent') : oldLang('Gift2ConvertedTitle');
  }

  const customPeer = (transaction.peer && shouldUseCustomPeer(transaction)
    && buildDiamondsTransactionCustomPeer(transaction)) || undefined;

  if (customPeer) return customPeer.title || oldLang(customPeer.titleKey!);

  return transaction.title;
}

export function isNegativeAmount(currencyAmount: ApiTypeCurrencyAmount) {
  if (currencyAmount.currency === STARS_CURRENCY_CODE) {
    if (currencyAmount.amount) return currencyAmount.amount < 0;
    return currencyAmount.nanos < 0;
  }
  return currencyAmount.amount < 0;
}
