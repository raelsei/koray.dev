import type { Element, Root } from 'hast';
import type { ShikiTransformer } from 'shiki';
import { SKIP, visit } from 'unist-util-visit';

import { codeBox } from './code-box';

/**
 * Reads the fence's meta string and stamps it onto the `<pre>`:
 *
 * ```ts file="money.ts" accent
 * ```
 *
 * Shiki is the only place the meta string is reachable, so it is captured here
 * and consumed by `rehypeCodeBox` further down the pipeline.
 */
export const shikiCodeMeta: ShikiTransformer = {
	name: 'void-terminal:code-meta',
	pre(node) {
		const raw = this.options.meta?.__raw ?? '';
		const file = /(?:file|title)="([^"]+)"/.exec(raw)?.[1];
		if (file) node.properties['data-file'] = file;
		if (/(?:^|\s)accent(?:\s|$)/.test(raw)) node.properties['data-accent'] = '';
	},
};

const el = (tagName: string, properties: Element['properties'], children: Element['children']) =>
	({ type: 'element', tagName, properties, children }) satisfies Element;

const text = (value: string) => ({ type: 'text', value }) as const;

/**
 * Wraps a titled code fence in the same `[data-code-box]` chrome that
 * `CodeBox.astro` renders, so Markdown and component call sites are typeset and
 * behave identically — one stylesheet, one copy-button contract.
 */
export function rehypeCodeBox() {
	return (tree: Root) => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'pre' || !parent || index === undefined) return;

			const file = node.properties['data-file'];
			if (typeof file !== 'string') return;

			const accent = 'data-accent' in node.properties;
			delete node.properties['data-file'];
			delete node.properties['data-accent'];

			parent.children[index] = el(
				'figure',
				{
					'data-code-box': '',
					...(accent ? { 'data-accent': '' } : {}),
					class: codeBox.figure,
				},
				[
					el('figcaption', { class: codeBox.caption }, [
						el('span', { class: codeBox.filename }, [text(file)]),
						el(
							'button',
							{
								type: 'button',
								'data-copy': '',
								'aria-label': `Copy ${file}`,
								class: codeBox.button,
							},
							[text('copy')],
						),
					]),
					node,
				],
			);

			return SKIP;
		});
	};
}
