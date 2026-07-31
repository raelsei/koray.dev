const RESET_MS = 1400;

/**
 * The async clipboard API is refused outside a secure context, and by some
 * permission policies even inside one. Fall back to selecting the block and
 * issuing the legacy copy command; only claim success when something worked.
 */
async function writeClipboard(text: string, pre: Element): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Fall through to the selection-based path.
	}

	// Leaving the block selected also lets the reader finish with ⌘C / Ctrl+C.
	const range = document.createRange();
	range.selectNodeContents(pre);
	const selection = window.getSelection();
	selection?.removeAllRanges();
	selection?.addRange(range);

	try {
		return document.execCommand('copy');
	} catch {
		return false;
	}
}

/**
 * One delegated listener for every copy button on the site. Each button copies
 * the `<pre>` inside its enclosing `[data-code-box]`, whether that markup came
 * from `CodeBox.astro` or from `rehypeCodeBox`.
 */
export function mountCopy(): void {
	document.addEventListener('click', async (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;

		const button = target.closest('[data-copy]');
		if (!(button instanceof HTMLButtonElement)) return;

		const pre = button.closest('[data-code-box]')?.querySelector('pre');
		const text = pre?.textContent ?? '';
		if (!pre || !text) return;

		const copied = await writeClipboard(text, pre);

		// The label never claims more than what happened.
		button.dataset.copied = '';
		button.textContent = copied ? 'copied' : 'press ⌘c';
		window.setTimeout(() => {
			delete button.dataset.copied;
			button.textContent = 'copy';
		}, RESET_MS);
	});
}
