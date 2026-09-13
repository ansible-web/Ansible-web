type IconHrefs = {
  read: string;
  unread: string;
};

const ICON_LINK_SELECTOR = 'link[rel="icon"], link[rel="alternate icon"]';

const hrefsByLink = new WeakMap<HTMLLinkElement, IconHrefs>();

export default function updateIcon(asUnread: boolean) {
  document.querySelectorAll<HTMLLinkElement>(ICON_LINK_SELECTOR).forEach((link) => {
    const hrefs = getIconHrefs(link);
    if (!hrefs) return;

    // The page title blinks once a second while notifications are pending, so this
    // runs that often for every icon. Assigning an unchanged `href` still refetches
    // the image, which is a request per icon per second for an identical result.
    const next = asUnread ? hrefs.unread : hrefs.read;
    if (next !== link.href) {
      link.href = next;
    }
  });
}

// Both forms are resolved against the document once and kept per element: `link.href`
// reads back absolute, so comparing it against a relative attribute would never match
// and every blink would reassign. Returns `undefined` for an icon that declares no
// unread variant.
function getIconHrefs(link: HTMLLinkElement): IconHrefs | undefined {
  const cached = hrefsByLink.get(link);
  if (cached) return cached;

  const declared = link.dataset.unreadHref;
  if (!declared) return undefined;

  const hrefs: IconHrefs = {
    read: link.href,
    unread: new URL(declared, document.baseURI).href,
  };
  hrefsByLink.set(link, hrefs);

  return hrefs;
}
