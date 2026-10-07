import type { ElementRef } from '../../../lib/teact/teact';
import {
  memo, useRef, useState,
} from '../../../lib/teact/teact';
import { withGlobal } from '../../../global';

import type { DiamondGiftCategory } from '../../../types';

import buildClassName from '../../../util/buildClassName';

import useHorizontalScroll from '../../../hooks/useHorizontalScroll';
import useLang from '../../../hooks/useLang';

import styles from './DiamondGiftCategoryList.module.scss';

type OwnProps = {
  ref?: ElementRef<HTMLDivElement>;
  areUniqueDiamondGiftsDisallowed?: boolean;
  areLimitedDiamondGiftsDisallowed?: boolean;
  isSelf?: boolean;
  hasMyUnique?: boolean;
  isPinned?: boolean;
  onCategoryChanged: (category: DiamondGiftCategory) => void;
};

type StateProps = {
  idsByCategory?: Record<DiamondGiftCategory, string[]>;
};

const DiamondGiftCategoryList = ({
  ref: externalRef,
  idsByCategory,
  onCategoryChanged,
  areUniqueDiamondGiftsDisallowed,
  areLimitedDiamondGiftsDisallowed,
  isSelf,
  hasMyUnique,
  isPinned,
}: StateProps & OwnProps) => {
  let ref = useRef<HTMLDivElement>();
  if (externalRef) {
    ref = externalRef;
  }

  const lang = useLang();

  const hasCollectible = Boolean(idsByCategory?.collectible?.length);

  const [selectedCategory, setSelectedCategory] = useState<DiamondGiftCategory>('all');

  function handleItemClick(category: DiamondGiftCategory) {
    setSelectedCategory(category);
    onCategoryChanged(category);
  }

  function renderCategoryName(category: DiamondGiftCategory) {
    if (category === 'all') return lang('AllGiftsCategory');
    if (category === 'myUnique') return lang('GiftCategoryMyGifts');
    if (category === 'collectible') return lang('GiftCategoryCollectibles');
    return category;
  }

  function renderCategoryItem(category: DiamondGiftCategory) {
    return (
      <div
        className={buildClassName(
          styles.item,
          selectedCategory === category && styles.selectedItem,
        )}
        onClick={() => handleItemClick(category)}
      >
        {renderCategoryName(category)}
      </div>
    );
  }

  useHorizontalScroll(ref, undefined, true);

  return (
    <div ref={ref} className={buildClassName(styles.list, isPinned && styles.pinned, 'no-scrollbar')}>
      {renderCategoryItem('all')}
      {!areUniqueDiamondGiftsDisallowed && !isSelf && hasMyUnique && renderCategoryItem('myUnique')}
      {(!areUniqueDiamondGiftsDisallowed || !areLimitedDiamondGiftsDisallowed)
        && hasCollectible && renderCategoryItem('collectible')}
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): Complete<StateProps> => {
    const { starGifts } = global;

    return {
      idsByCategory: starGifts?.idsByCategory,
    };
  },
)(DiamondGiftCategoryList));
