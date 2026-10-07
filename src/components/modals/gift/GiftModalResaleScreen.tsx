import type { FC } from '../../../lib/teact/teact';
import {
  memo,
  useMemo,
  useRef } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type {
  ApiDiamondGift,
} from '../../../api/types';
import type { ResaleGiftsFilterOptions } from '../../../types';

import { selectTabState } from '../../../global/selectors';
import buildClassName from '../../../util/buildClassName';
import { RESALE_GIFTS_LIMIT } from '../../../limits';

import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import InfiniteScroll from '../../ui/InfiniteScroll';
import Transition from '../../ui/Transition';
import GiftItemDiamond from './GiftItemDiamond';
import ResaleGiftsNotFound from './ResaleGiftsNotFound';

import styles from './GiftModal.module.scss';

export type OwnProps = {
  onGiftClick: (gift: ApiDiamondGift) => void;
};

type StateProps = {
  gift?: ApiDiamondGift;
  resellGifts?: ApiDiamondGift[];
  filter: ResaleGiftsFilterOptions;
  areGiftsAllLoaded?: boolean;
  areGiftsLoading?: boolean;
  updateIteration: number;
};

const INTERSECTION_THROTTLE = 200;

const GiftModalResaleScreen: FC<OwnProps & StateProps> = ({
  resellGifts,
  gift,
  filter,
  areGiftsAllLoaded,
  areGiftsLoading,
  updateIteration,
  onGiftClick,
}) => {
  const {
    loadResaleGifts,
    updateResaleGiftsFilter,
  } = getActions();
  const scrollerRef = useRef<HTMLDivElement>();

  const lang = useLang();
  const resellGiftsIds = useMemo(() => {
    return resellGifts?.map((g) => g.id);
  }, [resellGifts]);

  const hasFilter = Boolean(filter?.modelAttributes?.length
    || filter?.patternAttributes?.length || filter?.backdropAttributes?.length || filter?.starsOnly);

  const handleLoadMoreResellGifts = useLastCallback(() => {
    if (gift) {
      const giftId = 'regularGiftId' in gift
        ? gift.regularGiftId
        : gift.id;
      loadResaleGifts({ giftId });
    }
  });

  const isGiftsEmpty = Boolean(!resellGifts || resellGifts.length === 0);

  const [viewportIds, onLoadMore] = useInfiniteScroll(
    handleLoadMoreResellGifts,
    resellGiftsIds,
    !gift,
    RESALE_GIFTS_LIMIT,
  );

  const { observe } = useIntersectionObserver({ rootRef: scrollerRef, throttleMs: INTERSECTION_THROTTLE });

  const handleResetGiftsFilter = useLastCallback(() => {
    updateResaleGiftsFilter({ filter: {
      ...filter,
      modelAttributes: [],
      backdropAttributes: [],
      patternAttributes: [],
      starsOnly: undefined,
    } });
  });

  return (
    <div ref={scrollerRef} className={buildClassName(styles.resaleScreenRoot, 'custom-scroll')}>
      <Transition
        name="zoomFade"
        activeKey={updateIteration}
      >
        {isGiftsEmpty && areGiftsAllLoaded && (
          <ResaleGiftsNotFound
            description={lang('ResellGiftsNoFound')}
            linkText={hasFilter ? lang('ResellGiftsClearFilters') : undefined}
            onLinkClick={hasFilter ? handleResetGiftsFilter : undefined}
          />
        )}
        <InfiniteScroll
          className={buildClassName(styles.resaleDiamondGiftsContainer)}
          items={viewportIds}
          onLoadMore={onLoadMore}
          itemSelector=".diamondGiftItem"
          noFastList
          preloadBackwards={RESALE_GIFTS_LIMIT}
          scrollContainerClosest={`.${styles.resaleScreenRoot}`}
        >
          {resellGifts?.map((g) => (
            <GiftItemDiamond
              key={g.id}
              gift={g}
              observeIntersection={observe}
              isResale
              onClick={onGiftClick}
            />
          ))}
        </InfiniteScroll>
      </Transition>
    </div>
  );
};

export default memo(withGlobal<OwnProps>((global): Complete<StateProps> => {
  const {
    starGifts,
  } = global;

  const { resaleGifts } = selectTabState(global);
  const gift = resaleGifts?.giftId ? starGifts?.byId[resaleGifts.giftId] : undefined;
  const filter = resaleGifts.filter;
  const areGiftsAllLoaded = resaleGifts.isAllLoaded;
  const areGiftsLoading = resaleGifts.isLoading;
  const updateIteration = resaleGifts.updateIteration;

  return {
    resellGifts: resaleGifts.gifts,
    gift,
    filter,
    areGiftsAllLoaded,
    areGiftsLoading,
    updateIteration,
  };
})(GiftModalResaleScreen));
