import { describe, expect, it, vi } from 'vitest';

import type { ApiWallpaper } from '../api/types';

import { buildThemeSettingsFromWallpaper, buildWallpaperRenderModel, decodeWallpaperPatternBlob } from './wallpaper';

vi.mock('../config', () => ({ DARK_THEME_BG_COLOR: '#0f0f0f' }));
vi.mock('./files', () => ({ preloadImage: vi.fn() }));

describe('peer wallpaper rendering', () => {
  it('renders a server fill, including black, without inheriting a personal image', () => {
    for (const color of [0x227744, 0]) {
      const settings = buildThemeSettingsFromWallpaper({ slug: '0', settings: { backgroundColor: color } });
      const model = buildWallpaperRenderModel('dark', settings);
      expect(model.baseColor).toBe(color ? '#227744' : '#000000');
      expect(model.isImage).toBe(false);
      expect(model.isPattern).toBe(false);
    }
  });

  it('preserves gradient colors and rotation', () => {
    const model = buildWallpaperRenderModel('light', buildThemeSettingsFromWallpaper({
      slug: '0', settings: { backgroundColor: 0x227744, secondBackgroundColor: 0x112233, rotation: 45 },
    }));
    expect(model.colors).toEqual(['#227744', '#112233']);
    expect(model.backgroundRotation).toBe(45);
  });

  it('restores the same selected file and blur after an eligibility gap', () => {
    const selected = {
      slug: 'peer-image', document: { id: '42' }, settings: { isBlurred: true },
    } as ApiWallpaper;
    const personal = { background: 'personal-image', isBlurred: false };
    const render = (wallpaper?: ApiWallpaper) => buildWallpaperRenderModel(
      'dark', wallpaper ? buildThemeSettingsFromWallpaper(wallpaper) : personal,
    );
    expect(render(selected)).toMatchObject({ customBackground: 'peer-image', isImage: true, isBlurred: true });
    expect(render()).toMatchObject({ customBackground: 'personal-image', isBlurred: false });
    expect(render(selected)).toMatchObject({ customBackground: 'peer-image', isImage: true, isBlurred: true });
    expect(personal).toEqual({ background: 'personal-image', isBlurred: false });
  });

  it('preserves negative pattern intensity as a mask', () => {
    const model = buildWallpaperRenderModel('dark', buildThemeSettingsFromWallpaper({
      slug: 'pattern', document: { id: '43' }, isPattern: true,
      settings: { backgroundColor: 0x227744, intensity: -50 },
    } as ApiWallpaper));
    expect(model).toMatchObject({ isPattern: true, isMaskedPattern: true, isImage: false });
  });

  it('decodes compressed Telegram pattern documents', async () => {
    const { compressSync, strToU8 } = await import('fflate');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"/>';
    const blob = new Blob([compressSync(strToU8(svg))]);
    expect(await (await decodeWallpaperPatternBlob(blob)).text()).toBe(svg);
  });
});
