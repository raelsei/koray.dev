let onScroll: (() => void) | undefined;

/** Drives the reading-progress rule under the navigation on article routes. */
export function mountProgress(): void {
	const bar = document.querySelector<HTMLElement>('[data-progress]');
	if (!bar) return;

	let frame = 0;
	const measure = () => {
		frame = 0;
		const span = document.documentElement.scrollHeight - window.innerHeight;
		const pct = span > 20 ? Math.min(100, Math.max(0, (window.scrollY / span) * 100)) : 0;
		bar.style.width = `${pct.toFixed(1)}%`;
	};

	onScroll = () => {
		if (frame === 0) frame = requestAnimationFrame(measure);
	};

	measure();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
}

export function unmountProgress(): void {
	if (!onScroll) return;
	window.removeEventListener('scroll', onScroll);
	window.removeEventListener('resize', onScroll);
	onScroll = undefined;
}
