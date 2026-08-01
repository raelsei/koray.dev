const RESET_MS = 1400;

/**
 * The async clipboard API is refused outside a secure context, and by some
 * permission policies even inside one. Fall back to selecting the block and
 * issuing the legacy copy command; only claim success when something worked.
 */
async function writeClipboard(text: string, source: HTMLElement): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Fall through to the selection-based path.
	}

	// A hidden source element cannot be selected, so reveal it for the duration
	// of the command. Visible blocks stay selected afterwards, which lets the
	// reader finish the job with ⌘C / Ctrl+C.
	const wasHidden = source.hidden;
	source.hidden = false;

	const range = document.createRange();
	range.selectNodeContents(source);
	const selection = window.getSelection();
	selection?.removeAllRanges();
	selection?.addRange(range);

	try {
		return document.execCommand('copy');
	} catch {
		return false;
	} finally {
		if (wasHidden) {
			selection?.removeAllRanges();
			source.hidden = true;
		}
	}
}

/**
 * One delegated listener for every copy button on the site.
 *
 * The text comes from `[data-copy-source]` when a page renders Markdown as
 * prose and keeps the raw document alongside it, and otherwise from the
 * visible `<pre>` — whether that came from `CodeBox.astro` or `rehypeCodeBox`.
 */
export function mountCopy(): void {
	document.addEventListener('click', async (event) => {
		const target = event.target;
		if (!(target instanceof Element)) return;

		const button = target.closest('[data-copy]');
		if (!(button instanceof HTMLButtonElement)) return;

		// A page that renders Markdown as prose supplies the raw source separately;
		// everywhere else the visible <pre> is the source.
		const box = button.closest('[data-code-box]');
		const pre = box?.querySelector<HTMLElement>('[data-copy-source]') ?? box?.querySelector('pre');
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
