import type { ApiDiamondsTransaction, ApiTypeCurrencyAmount } from '../../../../api/types';
import type { LangFn } from '../../../../util/localization';

import { STARS_CURRENCY_CODE, TON_CURRENCY_CODE } from '../../../../config';
import { buildDiamondsTransactionCustomPeer, shouldUseCustomPeer } from '../../../../global/helpers/payments';
import { formatPercent } from '../../../../util/text/textFormat';

export function getTransactionTitle(lang: LangFn, transaction: ApiDiamondsTransaction) {
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
    return lang('DiamondTransactionCommission', { percent: formatPercent(transaction.diamondRefCommision) });
  }
  if (transaction.isGiftUpgrade) return lang('Gift2TransactionUpgraded');
  if (transaction.extendedMedia) return lang('DiamondMediaPurchase');
  if (transaction.subscriptionPeriod) return transaction.title || lang('DiamondSubscriptionPurchase');
  if (transaction.isReaction) return lang('DiamondsReactionsSent');
  if (transaction.giveawayPostId) return lang('DiamondsGiveawayPrizeReceived');
  if (transaction.isMyGift) return lang('SentGift');
  if (transaction.isGift) {
    if (transaction.amount.currency === TON_CURRENCY_CODE) {
      return lang('GramGiftReceived');
    }
    return lang('DiamondsGiftReceived');
  }
  if (transaction.starGift) {
    return isNegativeAmount(transaction.amount) ? lang('Gift2TransactionSent') : lang('Gift2ConvertedTitle');
  }

  const customPeer = (transaction.peer && shouldUseCustomPeer(transaction)
    && buildDiamondsTransactionCustomPeer(transaction)) || undefined;

  if (customPeer) return customPeer.title || lang(customPeer.titleKey!);

  return transaction.title;
}

export function isNegativeAmount(currencyAmount: ApiTypeCurrencyAmount) {
  if (currencyAmount.currency === STARS_CURRENCY_CODE) {
    if (currencyAmount.amount) return currencyAmount.amount < 0;
    return currencyAmount.nanos < 0;
  }
  return currencyAmount.amount < 0;
}
