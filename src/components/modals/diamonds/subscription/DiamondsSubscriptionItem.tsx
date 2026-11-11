import { memo } from '../../../../lib/teact/teact';
import { getActions } from '../../../../global';

import type {
  ApiDiamondsSubscription,
} from '../../../../api/types';
import type { GlobalState } from '../../../../global/types';

import { NNBSP } from '../../../../config';
import { getPeerTitle } from '../../../../global/helpers/peers';
import { selectPeer } from '../../../../global/selectors';
import { formatDateTime, secondsToDate } from '../../../../util/localization/dateFormat';
import { getServerTime } from '../../../../util/serverTime';
import { formatInteger } from '../../../../util/textFormat';
import renderText from '../../../common/helpers/renderText';

import useSelector from '../../../../hooks/data/useSelector';
import useLang from '../../../../hooks/useLang';
import useLastCallback from '../../../../hooks/useLastCallback';

import Avatar from '../../../common/Avatar';
import DiamondIcon from '../../../common/icons/DiamondIcon';

import styles from './DiamondsSubscriptionItem.module.scss';

const AVATAR_SIZE = 42;

type OwnProps = {
  subscription: ApiDiamondsSubscription;
};

function selectProvidedPeer(peerId: string) {
  return (global: GlobalState) => (
    selectPeer(global, peerId)
  );
}

const DiamondsSubscriptionItem = ({ subscription }: OwnProps) => {
  const { openDiamondsSubscriptionModal } = getActions();
  const {
    peerId, pricing, until, isCancelled, title, photo,
  } = subscription;
  const lang = useLang();

  const peer = useSelector(selectProvidedPeer(peerId))!;

  const handleClick = useLastCallback(() => {
    openDiamondsSubscriptionModal({ subscription });
  });

  if (!peer) {
    return undefined;
  }

  const hasExpired = until < getServerTime();
  const formattedDate = formatDateTime(lang, secondsToDate(until), { date: 'long', includeYear: false });

  return (
    <div className={styles.root} onClick={handleClick}>
      <div className={styles.preview}>
        <Avatar size={AVATAR_SIZE} peer={peer} />
        <DiamondIcon className={styles.subscriptionDiamond} type="gold" size="small" />
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{renderText(getPeerTitle(lang, peer) || '')}</h3>
        {title && (
          <p className={styles.subtitle}>
            {photo && <Avatar webPhoto={photo} size="micro" />}
            {renderText(title)}
          </p>
        )}
        <p className={styles.description}>
          {lang(
            hasExpired
              ? 'DiamondsSubscriptionExpired'
              : isCancelled ? 'DiamondsSubscriptionExpires' : 'DiamondsSubscriptionRenews',
            { date: formattedDate },
          )}
        </p>
      </div>
      <div className={styles.status}>
        {(isCancelled || hasExpired) ? (
          <div className={styles.statusEnded}>
            {lang(hasExpired ? 'InviteLinkExpired' : 'DiamondsSubscriptionStatusCancelled')}
          </div>
        ) : (
          <>
            <div className={styles.statusPricing}>
              <DiamondIcon className={styles.diamond} type="gold" size="adaptive" />
              {NNBSP}
              <span className={styles.amount}>
                {formatInteger(pricing.amount)}
              </span>
            </div>
            <div className={styles.statusPeriod}>{lang('DiamondsParticipantSubscriptionPerMonth')}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default memo(DiamondsSubscriptionItem);
