import { clockNow } from '../lib/format';

import { createPageLifecycle } from './lifecycle';

const lifecycle = createPageLifecycle();

/** Keeps every `[data-clock]` in sync with the site's timezone, once a second. */
export function mountClock(): void {
	lifecycle.onPageLoad(() => {
		const nodes = document.querySelectorAll<HTMLElement>('[data-clock]');
		if (nodes.length === 0) return () => {};

		const tick = () => {
			const now = clockNow();
			for (const node of nodes) {
				if (node.textContent !== now) node.textContent = now;
			}
		};

		tick();
		const timer = window.setInterval(tick, 1000);
		return () => window.clearInterval(timer);
	});
}

export function unmountClock(): void {
	lifecycle.unmount();
}
