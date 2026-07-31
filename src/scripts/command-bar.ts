import { navigate } from 'astro:transitions/client';

import { clockNow } from '../lib/format';

interface Route {
	id: string;
	label: string;
	href: string;
	aliases: string[];
}

interface Doc {
	id: string;
	title: string;
	href: string;
}

interface Manifest {
	routes: Route[];
	docs: Doc[];
	email: string;
}

type Tone = 'info' | 'accent' | 'error' | 'echo';

const TONE: Record<Tone, string> = {
	info: 'text-soft',
	accent: 'text-lime',
	error: 'text-red',
	echo: 'text-subtle',
};

const MAX_LINES = 3;

let bound = false;

/**
 * The terminal at the bottom of every page. It resolves commands against the
 * real route table, so `cd work` performs the same navigation as clicking the
 * tab — there is no second, parallel notion of where you are.
 */
export function mountCommandBar(): void {
	const root = document.querySelector<HTMLElement>('[data-command-bar]');
	if (!root || bound) return;
	bound = true;

	const input = root.querySelector<HTMLInputElement>('input');
	const log = root.querySelector<HTMLElement>('[data-log]');
	const manifest: Manifest = JSON.parse(
		root.querySelector<HTMLScriptElement>('[data-manifest]')?.textContent ?? '{}',
	);
	if (!input || !log) return;

	const { routes, docs, email } = manifest;

	const print = (lines: Array<{ text: string; tone: Tone }>) => {
		log.replaceChildren(
			...lines.slice(-MAX_LINES).map(({ text, tone }) => {
				const el = document.createElement('span');
				el.className = `text-log leading-row ${TONE[tone]}`;
				el.textContent = text;
				return el;
			}),
		);
		log.hidden = lines.length === 0;
	};

	const resolve = (name: string): Route | undefined => {
		const key = name.replace(/^\.\//, '').replace(/\/$/, '').toLowerCase();
		return routes.find((r) => r.id === key || r.aliases.includes(key));
	};

	const resolveDoc = (name: string): Doc | undefined => {
		if (!name || name === 'post') return docs[0];
		const key = name.replace(/^(\.\/)?(writing\/)?/, '').replace(/\.md$/, '');
		return docs.find((d) => d.id === key) ?? docs.find((d) => d.id.startsWith(key));
	};

	const run = (raw: string) => {
		const line = raw.trim();
		if (!line) return;

		const echo = { text: `$ ${line}`, tone: 'echo' as Tone };
		const say = (text: string, tone: Tone = 'info') => print([echo, { text, tone }]);
		const goto = (href: string, text: string, tone: Tone = 'info') => {
			say(text, tone);
			if (href !== location.pathname) void navigate(href);
		};

		const [verb = '', arg = ''] = line.toLowerCase().split(/\s+/);

		switch (verb) {
			case 'help':
				return say(
					'commands: ls · cd <section> · cat <post> · whoami · time · mail · clear — or just type a section name',
					'accent',
				);
			case 'ls':
			case 'dir':
				return say([...routes.map((r) => r.id), 'post'].join('  '));
			case 'clear':
				return print([]);
			case 'time':
				return say(`İstanbul ${clockNow()} (GMT+03)`);
			case 'whoami':
				return goto('/', 'koray — founder & product engineer, fintech & applied AI');
			case 'mail':
			case 'contact':
				return goto('/about', `${email} — replies in 24h`, 'accent');
			case 'cat': {
				const doc = resolveDoc(arg);
				if (doc) return goto(doc.href, `opening ${doc.id}.md`);
				const route = resolve(arg);
				if (route) return goto(route.href, `opening ${route.id}`);
				return say(`cat: no such file: ${arg || '?'}`, 'error');
			}
			case 'cd':
			case 'open':
			case 'goto': {
				if (arg === '' || arg === '~' || arg === '..') return goto('/', '→ ~/index');
				const route = resolve(arg);
				if (route) return goto(route.href, `→ ~/${route.id}`);
				return say(`cd: no such section: ${arg}`, 'error');
			}
			default: {
				const route = resolve(verb);
				if (route) return goto(route.href, `→ ~/${route.id}`);
				return say(`command not found: ${verb} — type help`, 'error');
			}
		}
	};

	input.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			run(input.value);
			input.value = '';
		} else if (event.key === 'Escape') {
			input.value = '';
			print([]);
		}
	});

	// ⌥/ focuses the prompt from anywhere on the page.
	window.addEventListener('keydown', (event) => {
		if (event.altKey && (event.key === '/' || event.code === 'Slash')) {
			event.preventDefault();
			input.focus();
		}
	});
}
