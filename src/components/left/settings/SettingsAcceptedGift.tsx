import { memo } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { ApiDisallowedGiftsSettings } from '../../../api/types';

import { selectIsCurrentUserPremium } from '../../../global/selectors';

import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';

import Island, { IslandDescription, IslandTitle } from '../../gili/layout/Island';
import Switch from '../../gili/primitives/Switch';
import ListItem from '../../ui/ListItem';

type StateProps = {
  disallowedGifts?: ApiDisallowedGiftsSettings;
  isCurrentUserPremium: boolean;
};

const SettingsAcceptedGift = ({
  disallowedGifts, isCurrentUserPremium,
}: StateProps) => {
  const { showNotification, updateGlobalPrivacySettings } = getActions();

  const lang = useLang();

  const handleOpenAnsiblePremiumModal = useLastCallback(() => {
    showNotification({
      message: lang('PrivacySubscribeToAnsiblePremium'),
      action: {
        action: 'openPremiumModal',
        payload: {},
      },
      actionText: { key: 'Open' },
      icon: 'diamond',
    });
  });

  const handleLimitedEditionChange = useLastCallback(() => {
    if (!isCurrentUserPremium) {
      handleOpenAnsiblePremiumModal();
      return;
    }

    updateGlobalPrivacySettings({
      disallowedGifts: {
        ...disallowedGifts,
        shouldDisallowLimitedDiamondGifts: !disallowedGifts?.shouldDisallowLimitedDiamondGifts || undefined,
      },
    });
  });

  const handleUnlimitedEditionChange = useLastCallback(() => {
    if (!isCurrentUserPremium) {
      handleOpenAnsiblePremiumModal();
      return;
    }
    updateGlobalPrivacySettings({
      disallowedGifts: {
        ...disallowedGifts,
        shouldDisallowUnlimitedDiamondGifts: !disallowedGifts?.shouldDisallowUnlimitedDiamondGifts || undefined,
      },
    });
  });

  const handleUniqueChange = useLastCallback(() => {
    if (!isCurrentUserPremium) {
      handleOpenAnsiblePremiumModal();
      return;
    }
    updateGlobalPrivacySettings({
      disallowedGifts: {
        ...disallowedGifts,
        shouldDisallowUniqueDiamondGifts: !disallowedGifts?.shouldDisallowUniqueDiamondGifts || undefined,
      },
    });
  });

  const handlePremiumSubscriptionChange = useLastCallback(() => {
    if (!isCurrentUserPremium) {
      handleOpenAnsiblePremiumModal();
      return;
    }
    updateGlobalPrivacySettings({
      disallowedGifts: {
        ...disallowedGifts,
        shouldDisallowPremiumGifts: !disallowedGifts?.shouldDisallowPremiumGifts || undefined,
      },
    });
  });

  return (
    <>
      <IslandTitle dir={lang.isRtl ? 'rtl' : undefined}>
        {lang('PrivacyAcceptedGiftTitle')}
      </IslandTitle>
      <Island>
        <ListItem onClick={handleLimitedEditionChange}>
          <span>{lang('PrivacyGiftLimitedEdition')}</span>
          <Switch
            id="limited_edition"
            disabled={!isCurrentUserPremium}
            checked={!isCurrentUserPremium ? true : !disallowedGifts?.shouldDisallowLimitedDiamondGifts}
          />
        </ListItem>
        <ListItem onClick={handleUnlimitedEditionChange}>
          <span>{lang('PrivacyGiftUnlimited')}</span>
          <Switch
            id="unlimited"
            disabled={!isCurrentUserPremium}
            checked={!isCurrentUserPremium ? true : !disallowedGifts?.shouldDisallowUnlimitedDiamondGifts}
          />
        </ListItem>
        <ListItem onClick={handleUniqueChange}>
          <span>{lang('PrivacyGiftUnique')}</span>
          <Switch
            id="unique"
            disabled={!isCurrentUserPremium}
            checked={!isCurrentUserPremium ? true : !disallowedGifts?.shouldDisallowUniqueDiamondGifts}
          />
        </ListItem>
        <ListItem onClick={handlePremiumSubscriptionChange}>
          <span>{lang('PrivacyGiftPremiumSubscription')}</span>
          <Switch
            id="premium_subscription"
            disabled={!isCurrentUserPremium}
            checked={!isCurrentUserPremium ? true : !disallowedGifts?.shouldDisallowPremiumGifts}
          />
        </ListItem>
      </Island>
      <IslandDescription dir={lang.isRtl ? 'rtl' : undefined}>
        {lang('PrivacyAcceptedGiftInfo')}
      </IslandDescription>
    </>
  );
};

export default memo(withGlobal(
  (global): Complete<StateProps> => {
    const {
      settings: {
        byKey: {
          disallowedGifts,
        },
      },
    } = global;

    return {
      disallowedGifts,
      isCurrentUserPremium: selectIsCurrentUserPremium(global),
    };
  },
)(SettingsAcceptedGift));
