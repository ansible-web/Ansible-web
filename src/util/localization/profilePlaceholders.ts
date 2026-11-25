import type { LangKey } from '../../types/language';

// Older language packs use positional tokens for the profile's collectible fields.
const PROFILE_PLACEHOLDERS: Partial<Record<LangKey, string[]>> = {
  UsernameAlso: ['usernames'],
  FragmentPhoneTitle: ['phone'],
  FragmentUsernameTitle: ['username'],
  FragmentPhoneMessage: ['date', 'amount', 'details'],
  FragmentUsernameMessage: ['date', 'amount', 'details'],
};

export function normalizeProfilePlaceholders(langKey: LangKey, string: string) {
  const placeholders = PROFILE_PLACEHOLDERS[langKey];
  if (!placeholders || !string.includes('%')) return string;

  let implicitIndex = 0;
  return string.replace(/%%|%(?:(\d+)\$)?s/g, (token, position: string | undefined) => {
    if (token === '%%') return '%';
    const name = placeholders[position === undefined ? implicitIndex++ : Number(position) - 1];
    return name ? `{${name}}` : token;
  });
}
