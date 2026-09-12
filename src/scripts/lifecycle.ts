/**
 * Page-scoped effect lifecycle for the client scripts.
 *
 * `astro:page-load` has two producers — the swap pipeline and ClientRouter's
 * own window-load listener — so a mount can arrive without a preceding
 * unmount. Each lifecycle owns a single active effect: `onPageLoad` runs the
 * previous mount's teardown before starting the next, and `unmount` tears the
 * effect down early on `astro:before-swap`, so a queued frame or interval
 * never writes to a detached DOM.
 */
export interface PageLifecycle {
	onPageLoad(mount: () => () => void): void;
	unmount(): void;
}

export function createPageLifecycle(): PageLifecycle {
	let active: (() => void) | undefined;
	return {
		onPageLoad(mount) {
			active?.();
			active = mount();
		},
		unmount() {
			active?.();
			active = undefined;
		},
	};
}
