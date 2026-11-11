import {
  memo, useMemo,
  useState,
} from '../../../lib/teact/teact';
import { getActions, getGlobal, withGlobal } from '../../../global';

import { SERVICE_NOTIFICATIONS_USER_ID } from '../../../config';
import {
  isDeletedUser, isUserBot,
} from '../../../global/helpers';
import { filterPeersByQuery } from '../../../global/helpers/peers';
import { unique } from '../../../util/iteratees';
import sortChatIds from '../../common/helpers/sortChatIds';

import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import PeerPicker from '../../common/pickers/PeerPicker';
import PickerModal from '../../common/pickers/PickerModal';

import styles from './DiamondsGiftingPickerModal.module.scss';

export type OwnProps = {
  isOpen?: boolean;
};

interface StateProps {
  currentUserId?: string;
  userIds?: string[];
  activeListIds?: string[];
  archivedListIds?: string[];
}

const DiamondsGiftingPickerModal = ({
  isOpen,
  currentUserId,
  activeListIds,
  archivedListIds,
  userIds,
}: OwnProps & StateProps) => {
  const { closeDiamondsGiftingPickerModal, openDiamondsGiftModal } = getActions();

  const lang = useLang();

  const [searchQuery, setSearchQuery] = useState<string>('');

  const displayedUserIds = useMemo(() => {
    const usersById = getGlobal().users.byId;
    const combinedIds = unique([
      ...(userIds || []),
      ...(activeListIds || []),
      ...(archivedListIds || []),
    ]);

    const filteredUserIds = filterPeersByQuery({
      ids: combinedIds, query: searchQuery, type: 'user',
    });

    return sortChatIds(filteredUserIds.filter((id) => {
      const user = usersById[id];

      if (!user) {
        return false;
      }

      return !user.isSupport
        && !isUserBot(user) && !isDeletedUser(user)
        && id !== currentUserId && id !== SERVICE_NOTIFICATIONS_USER_ID;
    }));
  }, [currentUserId, searchQuery, userIds, activeListIds, archivedListIds]);

  const handleSelectedUserIdsChange = useLastCallback((newSelectedId?: string) => {
    if (newSelectedId?.length) {
      openDiamondsGiftModal({ forUserId: newSelectedId });
      closeDiamondsGiftingPickerModal();
    }
  });

  return (
    <PickerModal
      isNativeDialog
      className={styles.root}
      isOpen={isOpen}
      onClose={closeDiamondsGiftingPickerModal}
      title={lang('GiftDiamondsTitle')}
      hasCloseButton
      withFixedHeight
      confirmButtonText={lang('Continue')}
      onEnter={closeDiamondsGiftingPickerModal}
    >
      <PeerPicker
        withIslands
        className={styles.picker}
        itemIds={displayedUserIds}
        filterValue={searchQuery}
        filterPlaceholder={lang('Search')}
        onFilterChange={setSearchQuery}
        isSearchable
        withDefaultPadding
        withStatus
        onSelectedIdChange={handleSelectedUserIdsChange}
      />
    </PickerModal>
  );
};

export default memo(withGlobal<OwnProps>((global): Complete<StateProps> => {
  const {
    chats: {
      listIds,
    },
    currentUserId,
  } = global;

  return {
    userIds: global.contactList?.userIds,
    activeListIds: listIds.active,
    archivedListIds: listIds.archived,
    currentUserId,
  };
})(DiamondsGiftingPickerModal));
