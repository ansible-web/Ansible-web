export default function updateIcon(asUnread: boolean) {
  document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="alternate icon"]')
    .forEach((link) => {
      let href = link.href;
      if (asUnread) {
        if (!href.includes('favicon-unread')) {
          href = href.replace('favicon', 'favicon-unread');
        }
      } else {
        href = href.replace('favicon-unread', 'favicon');
      }

      // The title blinks once a second while notifications are pending, so this
      // runs that often on every icon link. Assigning an unchanged href still
      // refetches the image — `icon-192x192.png` carries no `favicon` segment and
      // would be re-requested on every blink for a byte-identical result.
      if (href !== link.href) {
        link.href = href;
      }
    });
}
