import { SITE } from '../consts';

const MONTHS = [
	'jan', 'feb', 'mar', 'apr', 'may', 'jun',
	'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
] as const;

/**
 * Dates are authored as plain `YYYY-MM-DD` and parsed as UTC midnight.
 * Every formatter reads UTC fields so output never shifts with the build host.
 */
const pad = (n: number) => String(n).padStart(2, '0');

/** `2026-06-12` — post headers, index previews, `datetime` attributes. */
export const iso = (d: Date) =>
	`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** `06-12` — archive rows, already grouped under a year heading. */
export const monthDay = (d: Date) => `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** `2026.07.14` — the note log. */
export const dotted = (d: Date) =>
	`${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}`;

/** `jul 2026` — section metadata. */
export const monthYear = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

export const year = (d: Date) => d.getUTCFullYear();

/** `01`, `02` … — ordinal labels derived from position, never hand-written. */
export const ordinal = (i: number) => String(i + 1).padStart(2, '0');

/** Host without `www.`, used as the visible label for an outbound link. */
export function host(href: string): string {
	try {
		return new URL(href).hostname.replace(/^www\./, '');
	} catch {
		return href;
	}
}

/**
 * Minutes to read, derived from the raw Markdown so it can never drift from the
 * text. Fences and inline formatting are stripped first; 220 wpm is the usual
 * prose reading rate.
 */
export function readingTime(markdown: string): number {
	const prose = markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/[#>*_\-\[\]()]/g, ' ');
	const words = prose.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 220));
}

/** Current wall-clock time in the site's timezone, as `HH:MM:SS`. */
export function clockNow(now: Date = new Date()): string {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: SITE.timeZone,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	}).format(now);
}
