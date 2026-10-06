import type { GlobalState } from '../types';

import { selectSharedSettings } from './sharedState';

export function selectNotifySettings<T extends GlobalState>(global: T) {
  return global.settings.byKey;
}

export function selectNotifyDefaults<T extends GlobalState>(global: T) {
  return global.settings.notifyDefaults;
}

export function selectNotifyException<T extends GlobalState>(global: T, chatId: string) {
  return global.chats.notifyExceptionById?.[chatId];
}

export function selectLanguageCode<T extends GlobalState>(global: T) {
  return selectSharedSettings(global).language.replace('-raw', '');
}

export function selectCanSetPasscode<T extends GlobalState>(global: T) {
  return Boolean(global.auth.rememberMe);
}

export function selectTranslationLanguage<T extends GlobalState>(global: T) {
  return global.settings.byKey.translationLanguage || selectLanguageCode(global);
}

export function selectNewNoncontactPeersRequirePremium<T extends GlobalState>(global: T) {
  return global.settings.byKey.shouldNewNonContactPeersRequirePremium;
}

export function selectNonContactPeersPaidDiamonds<T extends GlobalState>(global: T) {
  return global.settings.byKey.nonContactPeersPaidDiamonds;
}

export function selectShouldHideReadMarks<T extends GlobalState>(global: T) {
  return global.settings.byKey.shouldHideReadMarks;
}

export function selectSettingsKeys<T extends GlobalState>(global: T) {
  return global.settings.byKey;
}

export function selectTimezones<T extends GlobalState>(global: T) {
  return global.timezones?.byId;
}
