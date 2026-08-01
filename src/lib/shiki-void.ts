import type { ThemeRegistration } from 'shiki';

import { palette } from './palette';

/**
 * Syntax highlighting inside the Void Terminal palette: three greys and the
 * accent. Anything brighter would break the design's two-colour discipline.
 *
 * Colours come from `global.css` via `palette`, so a token change reaches code
 * blocks too. Comments and punctuation deliberately use the *readable* greys —
 * `--color-dim` is 1.95:1 on the panel and would be unreadable at 12.5px.
 */
const fg = palette.fg;
const muted = palette.soft;
const faint = palette.subtle;

export const voidTerminal: ThemeRegistration = {
	name: 'void-terminal',
	type: 'dark',
	colors: {
		'editor.background': palette.panel,
		'editor.foreground': fg,
	},
	settings: [
		{ settings: { background: palette.panel, foreground: fg } },
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: { foreground: faint, fontStyle: 'italic' },
		},
		{ scope: ['punctuation', 'meta.brace', 'meta.delimiter'], settings: { foreground: faint } },
		{ scope: ['keyword.operator'], settings: { foreground: faint } },
		{
			scope: ['string', 'constant.other.symbol', 'meta.embedded'],
			settings: { foreground: muted },
		},
		{
			scope: ['constant.numeric', 'constant.language', 'constant.character'],
			settings: { foreground: muted },
		},
		{ scope: ['variable.parameter', 'variable.other.property'], settings: { foreground: muted } },
		{
			scope: ['keyword', 'storage', 'storage.type', 'keyword.operator.new'],
			settings: { foreground: palette.lime },
		},
		{
			scope: ['entity.name.function', 'support.function', 'meta.function-call'],
			settings: { foreground: fg },
		},
		{ scope: ['entity.name.type', 'support.type', 'support.class'], settings: { foreground: fg } },
		{
			scope: ['variable', 'meta.definition.variable', 'variable.other'],
			settings: { foreground: fg },
		},
		{ scope: ['invalid', 'invalid.illegal'], settings: { foreground: palette.red } },
	],
};
