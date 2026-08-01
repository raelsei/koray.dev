/**
 * The one definition of the code-box chrome.
 *
 * Two emitters produce this markup — `CodeBox.astro` for YAML-sourced code and
 * `rehypeCodeBox` for Markdown fences — and the promise in both is that they are
 * indistinguishable. Re-typing the class strings in each would quietly break
 * that on the first edit, so they live here.
 */
export const codeBox = {
	figure: 'flex flex-col gap-3',
	caption: 'flex items-baseline justify-between gap-[18px]',
	/** Subordinate caption: a filename above a block, not a titled entry. */
	filename: 'text-meta tracking-wide text-soft uppercase',
	button:
		'border-dim text-soft hover:border-lime hover:text-lime text-mini tracking-wide ' +
		'cursor-pointer border px-[11px] py-1.5 uppercase transition-colors ' +
		'data-[copied]:border-lime data-[copied]:text-lime',
} as const;
