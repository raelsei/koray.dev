import type { ThemeRegistration } from 'shiki';

/**
 * Syntax highlighting inside the Void Terminal palette: three greys and the
 * accent. Anything brighter would break the design's two-colour discipline.
 */
export const voidTerminal: ThemeRegistration = {
	name: 'void-terminal',
	type: 'dark',
	colors: {
		'editor.background': '#0E1211',
		'editor.foreground': '#D9DEDB',
	},
	settings: [
		{ settings: { background: '#0E1211', foreground: '#D9DEDB' } },
		{ scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#3F4644', fontStyle: 'italic' } },
		{ scope: ['punctuation', 'meta.brace', 'meta.delimiter'], settings: { foreground: '#5D6663' } },
		{ scope: ['string', 'constant.other.symbol', 'meta.embedded'], settings: { foreground: '#8E9793' } },
		{ scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: '#8E9793' } },
		{ scope: ['keyword', 'storage', 'storage.type', 'keyword.operator.new'], settings: { foreground: '#B6FF3D' } },
		{ scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#D9DEDB' } },
		{ scope: ['entity.name.type', 'support.type', 'support.class'], settings: { foreground: '#D9DEDB' } },
		{ scope: ['variable', 'meta.definition.variable', 'variable.other'], settings: { foreground: '#D9DEDB' } },
		{ scope: ['variable.parameter', 'variable.other.property'], settings: { foreground: '#8E9793' } },
		{ scope: ['keyword.operator'], settings: { foreground: '#5D6663' } },
		{ scope: ['invalid', 'invalid.illegal'], settings: { foreground: '#E2513B' } },
	],
};
