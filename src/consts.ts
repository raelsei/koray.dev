/**
 * Site identity and terminal chrome.
 *
 * This is the one module that must resolve before the content layer boots
 * (`astro.config.mjs` imports it), so it holds configuration only. Every piece
 * of editorial content lives in `src/content/`.
 */
export const SITE = {
	url: 'https://koray.dev',
	title: 'koray.dev',
	tagline: 'void terminal',
	description:
		'Koray Güler — founder and product engineer. Fintech, applied AI, and small teams. Notes on money, models and shipping alone.',
	author: 'Koray Güler',
	email: 'id@koray.dev',
	locale: 'en',
	/** Open Graph wants language_TERRITORY, not the bare tag `lang` uses. */
	ogLocale: 'en_US',
	/** `@handle` for Twitter card attribution; `null` omits the tags. */
	twitter: '@raelsei',
	timeZone: 'Europe/Istanbul',
	/** Browser chrome colour. Mirrors `--color-void`; a <meta> cannot read a CSS variable. */
	themeColor: '#08090A',

	/** The status line rendered above the navigation. */
	terminal: {
		user: 'koray@dev',
		city: 'İstanbul',
		timeLabel: 'IST',
		coordinates: '41.01°N 28.98°E',
		/** Set to `null` to hide the availability indicator. */
		availability: '2 ADVISORY SLOTS',
	},
} as const;
