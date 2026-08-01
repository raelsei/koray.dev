import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The palette, read out of `global.css` at build time.
 *
 * `global.css` says "every literal from the design lives here exactly once", and
 * this is what makes that true for JavaScript consumers: the Shiki theme derives
 * its colours from the same `@theme` block Tailwind compiles, so recolouring a
 * token cannot leave code blocks on the old value.
 *
 * Build-time only — this module reads from disk and must never reach the client.
 * The path is resolved from the working directory rather than `import.meta.url`
 * because this module is bundled into `dist/.prerender/`, where a relative
 * specifier no longer points at the source tree. Astro always builds from the
 * project root.
 */
const STYLESHEET = resolve(process.cwd(), 'src/styles/global.css');

const TOKENS = [
	'void',
	'scan',
	'panel',
	'hair',
	'edge',
	'edge-lime',
	'dim',
	'subtle',
	'soft',
	'fg',
	'lime',
	'red',
] as const;

type Token = (typeof TOKENS)[number];

function read(): Record<Token, string> {
	const css = readFileSync(STYLESHEET, 'utf8');
	const found = {} as Record<Token, string>;

	for (const token of TOKENS) {
		const match = new RegExp(`--color-${token}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`).exec(css);
		if (!match?.[1]) {
			throw new Error(
				`palette: --color-${token} is missing from global.css. Add it to @theme, or drop it from TOKENS.`,
			);
		}
		found[token] = match[1];
	}

	return found;
}

export const palette = read();
