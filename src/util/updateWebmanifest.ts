// Original idea was found here
// https://medium.com/@alshakero/how-to-setup-your-web-app-manifest-dynamically-using-javascript-f7fbee899a61

import { IS_MAC_OS } from './browser/windowEnvironment';

export default function updateWebmanifest() {
  if (!IS_MAC_OS) {
    return;
  }

  const manifest = document.getElementById('the-manifest-placeholder');
  if (!manifest) {
    return;
  }

  const appleManifest = import.meta.env.TG_APP_ENV === 'production'
    ? 'site_apple.webmanifest'
    : 'site_apple_dev.webmanifest';
  manifest.setAttribute('href', appleManifest);
}
