import { afterEach, describe, expect, it, vi } from 'vitest';

import readStrings from './readStrings';

afterEach(() => vi.restoreAllMocks());

describe('readStrings', () => {
  it('skips intentionally empty translations without malformed warnings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(readStrings('"OnlyAcceptTON" = "";\n"Visible" = "Text";')).toEqual({ Visible: 'Text' });
    expect(warn).not.toHaveBeenCalled();
  });

  it('still reports malformed entries and empty keys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(readStrings('"Broken";\n"" = "Text";')).toEqual({});
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('preserves escaped quotes, equals signs and duplicate warnings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(readStrings('"Label" = "a=b \\"quoted\\"";\n"Label" = "replacement";')).toEqual({ Label: 'replacement' });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('Duplicate key:', 'Label');
  });
});
