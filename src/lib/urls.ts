/**
 * Canonical internal paths.
 *
 * Four things independently produce URLs for this site: the on-page link graph,
 * `@astrojs/sitemap`, the RSS feed, and `llms.txt`. They previously agreed only
 * by coincidence — three hardcoded a trailing slash and `nav.yaml` did not, so
 * every internal link pointed at a non-canonical URL.
 *
 * This module is the single source. `trailingSlash: 'always'` in
 * `astro.config.mjs` turns any path that skips it into a hard 404 in dev, so a
 * regression surfaces on the first click rather than in Search Console.
 */

export const HOME = '/';
export const WRITING = '/writing/';
export const LIBRARY = '/library/';

/** A post's canonical path. */
export const post = (slug: string) => `/writing/${slug}/`;

/** A shelf's path. The first shelf is served at `/library/`, not `/library/<id>/`. */
export const shelf = (id: string, isDefault: boolean) =>
	isDefault ? LIBRARY : `/library/${id}/`;

/**
 * Normalises an internal path to the canonical trailing-slash form. External
 * URLs, `mailto:` and fragments are returned untouched.
 *
 * Applied inside the link components, so a hand-written `href` cannot reopen
 * the mismatch this module exists to close.
 */
export function canonical(href: string): string {
	if (!href.startsWith('/')) return href;

	// Split first: appending to the whole string would produce `/about#contact/`.
	const cut = href.search(/[?#]/);
	const path = cut === -1 ? href : href.slice(0, cut);
	const rest = cut === -1 ? '' : href.slice(cut);

	// Leave asset-style paths (`/rss.xml`, `/og.png`) and already-canonical alone.
	if (path === '' || path.endsWith('/') || /\.[a-z0-9]+$/i.test(path)) return href;
	return `${path}/${rest}`;
}

/** Absolute URL for an internal path, normalised first. */
export const absolute = (href: string, site: URL) => new URL(canonical(href), site).href;
