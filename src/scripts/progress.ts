let onScroll: (() => void) | undefined;
let pending = 0;

/** Drives the reading-progress rule under the navigation on article routes. */
export function mountProgress(): void {
	// See mountClock: a mount can arrive without a preceding unmount.
	unmountProgress();

	const bar = document.querySelector<HTMLElement>('[data-progress]');
	if (!bar) return;

	const measure = () => {
		pending = 0;
		const span = document.documentElement.scrollHeight - window.innerHeight;
		const pct = span > 20 ? Math.min(100, Math.max(0, (window.scrollY / span) * 100)) : 0;
		bar.style.width = `${pct.toFixed(1)}%`;
	};

	onScroll = () => {
		if (pending === 0) pending = requestAnimationFrame(measure);
	};

	measure();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
}

export function unmountProgress(): void {
	// A frame queued at swap time would otherwise write to a detached bar.
	if (pending !== 0) cancelAnimationFrame(pending);
	pending = 0;
	if (!onScroll) return;
	window.removeEventListener('scroll', onScroll);
	window.removeEventListener('resize', onScroll);
	onScroll = undefined;
}
