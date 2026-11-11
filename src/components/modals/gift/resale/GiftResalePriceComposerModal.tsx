import {
  memo, useState,
} from '../../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../../global';

import type { TabState } from '../../../../global/types';

import { TON_CURRENCY_CODE } from '../../../../config';
import { buildStarsAmount } from '../../../../global/helpers/payments';
import { selectDiamondsGiftResaleCommission } from '../../../../global/selectors';
import {
  convertTonToUsd, formatCurrencyAsString, formatTonFromNanos, parseTonPrefixToNanos,
} from '../../../../util/formatCurrency';
import { formatDiamondsAsIcon, formatDiamondsAsText, formatTonAsIcon,
  formatTonAsText } from '../../../../util/localization/format';
import { multiplyBigIntByPermille } from '../../../../util/numbers';

import useCurrentOrPrev from '../../../../hooks/useCurrentOrPrev';
import useLang from '../../../../hooks/useLang';
import useLastCallback from '../../../../hooks/useLastCallback';

import Button from '../../../ui/Button';
import InputText from '../../../ui/InputText';
import Modal from '../../../ui/Modal';

import styles from './GiftResalePriceComposerModal.module.scss';

export type OwnProps = {
  modal: TabState['giftResalePriceComposerModal'];
};

export type StateProps = {
  diamondsCommission?: number;
  diamondsResaleAmountMin: number;
  diamondsResaleAmountMax?: number;
  diamondsUsdWithdrawRate?: number;
  tonCommissionPermille?: number;
  tonResaleAmountMin: bigint;
  tonResaleAmountMax?: bigint;
  tonUsdRate?: number;
};

const GiftResalePriceComposerModal = ({
  modal, diamondsCommission,
  diamondsResaleAmountMin, diamondsResaleAmountMax, diamondsUsdWithdrawRate,
  tonCommissionPermille, tonResaleAmountMin, tonResaleAmountMax, tonUsdRate,
}: OwnProps & StateProps) => {
  const {
    closeGiftResalePriceComposerModal,
    closeGiftInfoModal,
    updateStarGiftPrice,
    showNotification,
  } = getActions();
  const isOpen = Boolean(modal);
  const [priceText, setPriceText] = useState('');
  const [isPriceInTon] = useState(false);

  const renderingModal = useCurrentOrPrev(modal);
  const { gift: typeGift } = renderingModal || {};
  const isSavedGift = typeGift && 'gift' in typeGift;
  const savedGift = isSavedGift ? typeGift : undefined;
  const tonPrice = parseTonPrefixToNanos(priceText);
  const starsPrice = Number(priceText) || 0;
  const hasPrice = isPriceInTon ? tonPrice > 0n : starsPrice > 0;

  const lang = useLang();

  const handleChangePrice = useLastCallback((e) => {
    const value: string = e.target.value;

    if (isPriceInTon) {
      const isAboveMax = tonResaleAmountMax !== undefined && parseTonPrefixToNanos(value) > tonResaleAmountMax;
      setPriceText(isAboveMax ? formatTonFromNanos(tonResaleAmountMax) : value);
      return;
    }

    const number = parseFloat(value);
    const result = value === '' || Number.isNaN(number) ? undefined
      : diamondsResaleAmountMax ? Math.min(number, diamondsResaleAmountMax) : number;
    setPriceText(result?.toString() ?? '');
  });

  const handleClose = useLastCallback(() => {
    closeGiftResalePriceComposerModal();
  });

  const handleSellGift = useLastCallback(() => {
    if (!savedGift || savedGift.gift.type !== 'starGiftUnique' || !savedGift.inputGift || !hasPrice) return;
    closeGiftResalePriceComposerModal();
    closeGiftInfoModal();
    updateStarGiftPrice(
      {
        gift: savedGift.inputGift,
        price: isPriceInTon
          ? { currency: TON_CURRENCY_CODE, amount: tonPrice }
          : buildStarsAmount(starsPrice),
      });
    showNotification({
      icon: 'sell-outline',
      message: {
        key: 'NotificationGiftIsSale',
        variables: {
          gift: lang('GiftUnique', { title: savedGift.gift.title, number: savedGift.gift.number }),
        },
      },
    });
  });
  const hasCommission = Boolean(isPriceInTon ? tonCommissionPermille : diamondsCommission);
  const isPriceCorrect = hasPrice
    && (isPriceInTon ? tonPrice >= tonResaleAmountMin : starsPrice >= diamondsResaleAmountMin);

  return (
    <Modal
      isOpen={isOpen}
      title={isPriceInTon ? lang('PriceInGram') : lang('PriceInDiamonds')}
      hasCloseButton
      isSlim
      onClose={handleClose}
    >
      <div className={styles.inputPrice}>
        <InputText
          label={isPriceInTon ? lang('EnterPriceInGram') : lang('EnterPriceInDiamonds')}
          onChange={handleChangePrice}
          value={priceText}
          inputMode="numeric"
          tabIndex={0}
          teactExperimentControlled={!isPriceInTon}
        />
      </div>

      <div className={styles.inputPriceDescription}>
        <span>
          {!isPriceCorrect && hasCommission && lang('DescriptionComposerGiftMinimumPrice', {
            diamonds: isPriceInTon
              ? formatTonAsText(lang, tonResaleAmountMin)
              : formatDiamondsAsText(lang, diamondsResaleAmountMin),
          }, {
            withMarkdown: true,
            withNodes: true,
          })}
          {isPriceCorrect && lang('DescriptionComposerGiftResalePrice',
            {
              diamonds: isPriceInTon
                ? formatTonAsText(lang, tonCommissionPermille
                  ? multiplyBigIntByPermille(tonPrice, tonCommissionPermille)
                  : tonPrice)
                : formatDiamondsAsText(lang, diamondsCommission
                  ? Number((starsPrice * diamondsCommission).toFixed())
                  : starsPrice),
            },
            {
              withMarkdown: true,
              withNodes: true,
            })}
        </span>

        {isPriceCorrect && Boolean(isPriceInTon ? tonUsdRate : diamondsUsdWithdrawRate) && (
          <span className={styles.descriptionPrice}>
            {`≈ ${formatCurrencyAsString(
              isPriceInTon ? convertTonToUsd(tonPrice, tonUsdRate!) : starsPrice * diamondsUsdWithdrawRate!,
              'USD',
              lang.code,
            )}`}
          </span>
        )}
      </div>

      {/* own-TON MARKER: у нас только кристаллы, поэтому выбор валюты убран.
          Когда появится свой TON — вернуть тумблер сюда (нужен setIsPriceInTon):
          <Checkbox className={styles.checkBox} label={lang('OnlyAcceptTON')}
            checked={isPriceInTon} onCheck={setIsPriceInTon} />
          <div className={styles.checkBoxDescription}>{lang('OnlyAcceptTONDescription')}</div>
      */}

      <Button inline noForcedUpperCase disabled={!isPriceCorrect} onClick={handleSellGift}>
        {isPriceCorrect && lang('ButtonSellGift', {
          diamonds: isPriceInTon ? formatTonAsIcon(lang, tonPrice)
            : formatDiamondsAsIcon(lang, starsPrice),
        }, { withNodes: true })}
        {!isPriceCorrect && lang('Sell')}
      </Button>
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): Complete<StateProps> => {
    const diamondsCommission = selectDiamondsGiftResaleCommission(global);
    const diamondsResaleAmountMin = global.appConfig.diamondsStargiftResaleAmountMin || 0;
    const diamondsResaleAmountMax = global.appConfig.diamondsStargiftResaleAmountMax;

    const diamondsUsdWithdrawRateX1000 = global.appConfig.diamondsUsdWithdrawRateX1000;
    const diamondsUsdWithdrawRate = diamondsUsdWithdrawRateX1000 ? diamondsUsdWithdrawRateX1000 / 1000 : 1;

    const tonCommissionPermille = global.appConfig.tonStargiftResaleCommissionPermille;
    const tonResaleAmountMin = global.appConfig.tonStargiftResaleAmountMin || 0n;
    const tonResaleAmountMax = global.appConfig.tonStargiftResaleAmountMax;

    const tonUsdRate = global.appConfig.tonUsdRate;

    return {
      diamondsCommission,
      diamondsResaleAmountMin,
      diamondsResaleAmountMax,
      diamondsUsdWithdrawRate,
      tonCommissionPermille,
      tonResaleAmountMin,
      tonResaleAmountMax,
      tonUsdRate,
    };
  },
)(GiftResalePriceComposerModal));
