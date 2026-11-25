import { describe, expect, it } from 'vitest';

import { normalizeProfilePlaceholders } from './profilePlaceholders';

describe('profile placeholders in cached and remote language packs', () => {
  it('keeps the secondary usernames as one rich-text slot', () => {
    expect(normalizeProfilePlaceholders('UsernameAlso', 'а также %1$s')).toBe('а также {usernames}');
  });

  it('uses the collectible type to resolve an unnumbered title', () => {
    expect(normalizeProfilePlaceholders('FragmentPhoneTitle', '**%s**')).toBe('**{phone}**');
    expect(normalizeProfilePlaceholders('FragmentUsernameTitle', '**%s**')).toBe('**{username}**');
  });

  it('resolves repeated and reordered purchase fields before markdown rendering', () => {
    for (const key of ['FragmentPhoneMessage', 'FragmentUsernameMessage'] as const) {
      expect(normalizeProfilePlaceholders(key, '**%2$s** %1$s %3$s %2$s')).toBe(
        '**{amount}** {date} {details} {amount}',
      );
    }
  });

  it('preserves named placeholders and unrelated translations', () => {
    expect(normalizeProfilePlaceholders('UsernameAlso', 'also {usernames}')).toBe('also {usernames}');
    expect(normalizeProfilePlaceholders('Settings', '100%')).toBe('100%');
  });
});
