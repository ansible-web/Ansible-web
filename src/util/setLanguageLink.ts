import { getActions } from '../global';

/**
 * Ссылка смены языка: `as://setlanguage?lang=<код>` и `https://asme.su/setlanguage/<код>`.
 * Код — язык из общего списка (`ru`, `pt-br`) либо слаг кастомного пака (`pirate`).
 *
 * 🚨 Язык НЕ переключается молча. Ссылка приходит от постороннего, и переключение по
 * одному клику превратило бы её в розыгрыш: человек остался бы в интерфейсе на
 * незнакомом языке. Поэтому — уведомление с кнопкой, а не действие.
 *
 * Форма кода проверяется тут же, до любого запроса: это та же форма, что принимает
 * сервер, и мусор из адреса не должен доезжать до настроек.
 */
const LANG_CODE_RE = /^[a-z][a-z0-9]{1,15}(-[a-z0-9]{2,8}){0,3}$/;

export function handleSetLanguageLink(rawCode: string | undefined, tabId?: number): boolean {
  const langCode = (rawCode || '').trim().toLowerCase();
  if (!LANG_CODE_RE.test(langCode)) return false;

  getActions().showNotification({
    message: `Switch the interface language to “${langCode}”?`,
    actionText: 'OK',
    action: {
      action: 'setSharedSettingOption',
      payload: { language: langCode },
    },
    ...(tabId !== undefined && { tabId }),
  });
  return true;
}
