import { createPageLifecycle } from './lifecycle';

const lifecycle = createPageLifecycle();

/** Drives the reading-progress rule under the navigation on article routes. */
export function mountProgress(): void {
	lifecycle.onPageLoad(() => {
		const bar = document.querySelector<HTMLElement>('[data-progress]');
		if (!bar) return () => {};

		let pending = 0;
		const measure = () => {
			pending = 0;
			const span = document.documentElement.scrollHeight - window.innerHeight;
			const pct = span > 20 ? Math.min(100, Math.max(0, (window.scrollY / span) * 100)) : 0;
			bar.style.width = `${pct.toFixed(1)}%`;
		};

		const onScroll = () => {
			if (pending === 0) pending = requestAnimationFrame(measure);
		};

		measure();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });

		// A frame queued at swap time would otherwise write to a detached bar.
		return () => {
			if (pending !== 0) cancelAnimationFrame(pending);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});
}

export function unmountProgress(): void {
	lifecycle.unmount();
}
