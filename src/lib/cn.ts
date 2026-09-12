/** Join class values, dropping falsy ones. No dependency, no merge magic. */
export function cn(...parts: Array<string | false | null | undefined>): string {
	return parts.filter(Boolean).join(' ');
}

/** Accent/muted tone shared by status cells, metrics and badges. */
export const TONES = ['accent', 'muted'] as const;
export type Tone = (typeof TONES)[number];

/** Client-hydrated live cells; `clock` ticks in the site's timezone. */
export const LIVE_MODES = ['clock'] as const;
export type LiveMode = (typeof LIVE_MODES)[number];
