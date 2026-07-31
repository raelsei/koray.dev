/** Join class values, dropping falsy ones. No dependency, no merge magic. */
export function cn(...parts: Array<string | false | null | undefined>): string {
	return parts.filter(Boolean).join(' ');
}
