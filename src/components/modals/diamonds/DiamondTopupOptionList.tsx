import type { FC } from '../../../lib/teact/teact';
import {
  memo, useEffect, useMemo,
} from '../../../lib/teact/teact';

import type { ApiDiamondGiveawayOption, ApiDiamondTopupOption } from '../../../api/types';

import buildClassName from '../../../util/buildClassName';
import { formatCurrency } from '../../../util/formatCurrency';
import { formatInteger } from '../../../util/textFormat';
import renderText from '../../common/helpers/renderText';

import useFlag from '../../../hooks/useFlag';
import useLang from '../../../hooks/useLang';
import useOldLang from '../../../hooks/useOldLang';

import DiamondIcon from '../../common/icons/DiamondIcon';
import Icon from '../../common/icons/Icon';
import Button from '../../ui/Button';

import styles from './DiamondTopupOptionList.module.scss';

const MAX_STARS_COUNT = 6;

type OwnProps = {
  isActive?: boolean;
  options?: ApiDiamondTopupOption[] | ApiDiamondGiveawayOption[];
  selectedDiamondOption?: ApiDiamondTopupOption | ApiDiamondGiveawayOption;
  selectedDiamondCount?: number;
  diamondsNeeded?: number;
  className?: string;
  onClick: (option: ApiDiamondTopupOption | ApiDiamondGiveawayOption) => void;
};

const DiamondTopupOptionList: FC<OwnProps> = ({
  isActive,
  className,
  options,
  selectedDiamondOption,
  selectedDiamondCount,
  diamondsNeeded,
  onClick,
}) => {
  const oldLang = useOldLang();
  const lang = useLang();

  const [areOptionsExtended, markOptionsExtended, unmarkOptionsExtended] = useFlag();

  useEffect(() => {
    if (!isActive) {
      unmarkOptionsExtended();
    }
  }, [isActive]);

  const [renderingOptions, canExtend] = useMemo(() => {
    if (!options || !options.length) return [undefined, false];

    const maxOption = options.reduce((max, option) => (
      max.stars > option.stars ? max : option
    ));
    const forceShowAll = diamondsNeeded && maxOption.stars < diamondsNeeded;

    const result: {
      option: ApiDiamondTopupOption | ApiDiamondGiveawayOption; diamondsCount: number; isWide: boolean;
    }[] = [];
    let currentStackedDiamondsCount = 0;
    let canExtendOptions = false;
    options.forEach((option, index) => {
      if (!option.isExtended) currentStackedDiamondsCount++;

      if (diamondsNeeded && !forceShowAll && option.stars < diamondsNeeded) return;
      if (!areOptionsExtended && option.isExtended) {
        canExtendOptions = true;
        return;
      }
      result.push({
        option,
        diamondsCount: Math.min(currentStackedDiamondsCount, MAX_STARS_COUNT),
        isWide: index === options.length - 1,
      });
    });

    return [result, canExtendOptions];
  }, [areOptionsExtended, options, diamondsNeeded]);

  return (
    <div className={buildClassName(styles.options, className)}>
      {renderingOptions?.map(({ option, diamondsCount, isWide }) => {
        const length = renderingOptions?.length;
        const isOdd = length % 2 === 0;
        const isActiveOption = option === selectedDiamondOption;

        let perUserDiamondCount;
        if (option && 'winners' in option) {
          const winner = option.winners.find((opt) => opt.users === selectedDiamondCount)
            || option.winners.reduce((max, opt) => (opt.users > max.users ? opt : max), option.winners[0]);
          perUserDiamondCount = winner?.perUserStars;
        }

        return (
          <div
            className={buildClassName(
              styles.option, (!isOdd && isWide) && styles.wideOption, isActiveOption && styles.active,
            )}
            key={option.stars}
            onClick={() => onClick?.(option)}
          >
            <div className={styles.optionTop}>
              +
              {formatInteger(option.stars)}
              <div className={styles.stackedDiamonds} dir={lang.isRtl ? 'ltr' : 'rtl'}>
                {Array.from({ length: diamondsCount }).map(() => (
                  <DiamondIcon className={styles.stackedDiamond} type="gold" size="big" />
                ))}
              </div>
            </div>
            <div className={styles.optionBottom}>
              {formatCurrency(lang, option.amount, option.currency)}
            </div>
            {(isActiveOption || (selectedDiamondOption && 'winners' in selectedDiamondOption))
              && Boolean(perUserDiamondCount) && (
              <div className={styles.optionBottom}>
                <div className={styles.perUserStars}>
                  {renderText(oldLang('BoostGift.Diamonds.PerUser', formatInteger(perUserDiamondCount)))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {!areOptionsExtended && canExtend && (
        <Button className={styles.moreOptions} isText noForcedUpperCase onClick={markOptionsExtended}>
          {oldLang('Diamonds.Purchase.ShowMore')}
          <Icon className={styles.iconDown} name="down" />
        </Button>
      )}
    </div>
  );
};

export default memo(DiamondTopupOptionList);
