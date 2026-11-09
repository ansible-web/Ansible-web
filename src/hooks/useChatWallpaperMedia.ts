import { useEffect, useState } from '../lib/teact/teact';

import type { ApiWallpaper } from '../api/types';

import { fetchBlob } from '../util/files';
import { decodeWallpaperPatternBlob } from '../util/wallpaper';
import useMedia from './useMedia';

// Peer wallpapers use the media loader, never the user's selected-wallpaper storage.
export default function useChatWallpaperMedia(wallpaper?: ApiWallpaper) {
  const documentId = wallpaper?.document?.id;
  const mediaUrl = useMedia(documentId ? `wallpaper${documentId}` : undefined);
  const isPattern = wallpaper?.isPattern;
  const [decoded, setDecoded] = useState<{ source: string; url: string }>();

  useEffect(() => {
    if (!mediaUrl || !isPattern) return undefined;

    let isCancelled = false;
    let objectUrl: string | undefined;
    fetchBlob(mediaUrl).then(decodeWallpaperPatternBlob).then((blob) => {
      if (isCancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setDecoded({ source: mediaUrl, url: objectUrl });
    }).catch(() => {
      // A missing peer image must not reset the user's personal wallpaper.
      if (!isCancelled) setDecoded(undefined);
    });

    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaUrl, isPattern]);

  if (!documentId || !mediaUrl) return undefined;
  const url = isPattern ? (decoded?.source === mediaUrl ? decoded.url : undefined) : mediaUrl;
  return url ? `url(${url})` : undefined;
}
