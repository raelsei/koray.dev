import { mountClock, unmountClock } from './clock';
import { mountCommandBar } from './command-bar';
import { mountCopy } from './copy';
import { mountProgress, unmountProgress } from './progress';

// Delegated, so it survives every swap without rebinding.
mountCopy();

// The command bar is `transition:persist`ed; mounting is guarded internally.
document.addEventListener('astro:page-load', () => {
	mountCommandBar();
	mountClock();
	mountProgress();
});

document.addEventListener('astro:before-swap', () => {
	unmountClock();
	unmountProgress();
});
