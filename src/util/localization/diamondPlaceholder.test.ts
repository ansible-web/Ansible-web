import { describe, expect, it } from 'vitest';

import { normalizeDiamondPlaceholder } from './utils';

describe('Diamond amounts in remote language packs', () => {
  it('normalizes cached balance and Premium price templates before rich-text rendering', () => {
    expect(normalizeDiamondPlaceholder('У Вас **{stars}**', { diamonds: 0 })).toBe('У Вас **{diamonds}**');
    expect(normalizeDiamondPlaceholder('or **{stars}**', { diamonds: 1500 })).toBe('or **{diamonds}**');
  });

  it('preserves current templates and explicit stars arguments', () => {
    expect(normalizeDiamondPlaceholder('или **{diamonds}**', { diamonds: 10 })).toBe('или **{diamonds}**');
    expect(normalizeDiamondPlaceholder('{stars} / {diamonds}', { stars: 1, diamonds: 2 })).toBe('{stars} / {diamonds}');
    expect(normalizeDiamondPlaceholder('{stars}')).toBe('{stars}');
  });
});
