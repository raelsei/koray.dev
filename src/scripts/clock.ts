import { clockNow } from '../lib/format';

let timer: number | undefined;

/** Keeps every `[data-clock]` in sync with the site's timezone, once a second. */
export function mountClock(): void {
	const nodes = document.querySelectorAll<HTMLElement>('[data-clock]');
	if (nodes.length === 0) return;

	const tick = () => {
		const now = clockNow();
		for (const node of nodes) {
			if (node.textContent !== now) node.textContent = now;
		}
	};

	tick();
	timer = window.setInterval(tick, 1000);
}

export function unmountClock(): void {
	if (timer !== undefined) window.clearInterval(timer);
	timer = undefined;
}
