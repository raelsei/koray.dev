import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

import { SITE } from '../consts';
import { list } from './collections';
import { iso } from './format';
import { getPosts, type Post } from './writing';

/** One entry of a `/library` shelf, discriminated by `kind`. */
type ShelfGroup = CollectionEntry<'shelves'>['data']['groups'][number];

/** One `- [title](url): summary` line, the llmstxt.org link format. */
interface Link {
	title: string;
	href: string;
	summary: string;
}

interface Outline {
	posts: Post[];
	routes: Link[];
}

/**
 * The route and post inventory both `llms.txt` and `llms-full.txt` are built
 * from, so the index can never list something the full text omits.
 */
export async function outline(site: URL): Promise<Outline> {
	const [nav, posts] = await Promise.all([list('nav'), getPosts()]);

	const routes = await Promise.all(
		nav.map(async ({ id, data }) => {
			// Every nav target is backed by a page entry of the same name; `/` is `index`.
			const page = await getEntry('pages', id);
			return {
				title: page?.data.head.title ?? data.label,
				href: new URL(data.href, site).href,
				summary: page?.data.description ?? '',
			};
		}),
	);

	return { posts, routes };
}

const links = (items: Link[]) =>
	items.map(({ title, href, summary }) => `- [${title}](${href}): ${summary}`).join('\n');

/**
 * `/llms.txt` — the index: what this site is, and where the substance lives.
 * Format per https://llmstxt.org: H1, blockquote summary, then link sections.
 */
export function llmsIndex({ posts, routes }: Outline, site: URL): string {
	return [
		`# ${SITE.title}`,
		'',
		`> ${SITE.description}`,
		'',
		`Written and maintained by ${SITE.author} in ${SITE.terminal.city}. Contact: ${SITE.email}.`,
		'The whole site is static and public; nothing here is behind a login.',
		'',
		'## Writing',
		'',
		links(
			posts.map((post) => ({
				title: post.data.title,
				href: new URL(`/writing/${post.id}/`, site).href,
				summary: `${iso(post.data.pubDate)}, ${post.minutes} min. ${post.data.description}`,
			})),
		),
		'',
		'## Pages',
		'',
		links(routes),
		'',
		'## Optional',
		'',
		links([
			{
				title: 'Full text',
				href: new URL('/llms-full.txt', site).href,
				summary: 'Every page and post inlined as Markdown, in one file.',
			},
			{
				title: 'RSS',
				href: new URL('/rss.xml', site).href,
				summary: 'Writing feed.',
			},
		]),
		'',
	].join('\n');
}

/**
 * The structured collections behind each route, rendered as Markdown.
 *
 * Without this, `llms-full.txt` would ship `/work`, `/stack` and `/library` as
 * bare headings — the pages whose entire substance lives in YAML rather than in
 * a Markdown body. A "full text" that omits them is a false claim.
 */
async function routeData(id: string): Promise<string[]> {
	switch (id) {
		case 'index': {
			const [status, now] = await Promise.all([list('status'), list('now')]);
			return [
				'## Status',
				'',
				...status.map(
					({ data }) =>
						`- ${data.label}: ${data.value ?? '(live clock)'} — ${data.note}`,
				),
				'',
				'## Now',
				'',
				...now.map(({ data }) => `- ${data.label}: ${data.body}`),
			];
		}

		case 'work': {
			const [ventures, oss] = await Promise.all([list('ventures'), list('oss')]);
			return [
				'## Ventures',
				...ventures.flatMap(({ data }) => [
					'',
					`### ${data.name}${data.badge ? ` (${data.badge})` : ''}`,
					'',
					[data.status, data.period, data.href].filter(Boolean).join(' · '),
					'',
					data.description,
					...(data.metrics.length > 0
						? ['', data.metrics.map((m) => `${m.value} ${m.label}`).join(' · ')]
						: []),
				]),
				'',
				'## Open source',
				'',
				...oss.map(
					({ data }) =>
						`- [${data.name}](${data.href}) — ${data.description} (${data.lang}, ${data.stars} stars)`,
				),
			];
		}

		case 'writing': {
			const notes = await list('notes');
			return [
				'## Notes',
				'',
				...notes.map(({ data }) => `- ${iso(data.date)}: ${data.body}`),
			];
		}

		case 'stack': {
			const [stack, rules] = await Promise.all([list('stack'), list('rules')]);
			return [
				'## Daily drivers',
				...stack.flatMap(({ data }) => [
					'',
					`### ${data.label}`,
					'',
					...data.items.map((i) => `- ${i.name}${i.note ? ` — ${i.note}` : ''}`),
				]),
				'',
				'## Rules',
				'',
				...rules.map(({ data }, i) => `${i + 1}. ${data.body}`),
			];
		}

		case 'library': {
			const shelves = (await getCollection('shelves')).sort(
				(a, b) => a.data.order - b.data.order,
			);
			return shelves.flatMap(({ id: shelf, data }) => [
				'',
				`## ${shelf}`,
				...data.groups.flatMap((group) => [
					'',
					`### ${group.title} — ${group.meta}`,
					'',
					...groupToMarkdown(group),
				]),
			]);
		}

		case 'about': {
			const [manual, timeline, contacts] = await Promise.all([
				list('manual'),
				list('timeline'),
				list('contacts'),
			]);
			return [
				'## Manual',
				'',
				...manual.map(({ data }) => `- ${data.term}: ${data.body}`),
				'',
				'## Timeline',
				'',
				...timeline.map(({ data }) => `- ${data.period}: ${data.body}`),
				'',
				'## Contacts',
				'',
				...contacts.map(({ data }) => `- ${data.channel}: ${data.handle} (${data.href})`),
			];
		}

		default:
			return [];
	}
}

/** One shelf group, flattened to Markdown according to its `kind`. */
function groupToMarkdown(group: ShelfGroup): string[] {
	switch (group.kind) {
		case 'link':
			return group.items.map((i) => `- [${i.label}](${i.href})`);
		case 'repo':
			return group.items.map(
				(i) => `- [${i.name}](${i.href}) — ${i.description} (${i.lang})`,
			);
		case 'card':
			return group.items.map((i) => `- [${i.name}](${i.href}) — ${i.description}`);
		case 'code':
			return group.items.flatMap((i) => [
				`#### ${i.name}${i.note ? ` — ${i.note}` : ''}`,
				...(i.description ? ['', i.description] : []),
				'',
				`\`\`\`${i.lang}`,
				i.code.trimEnd(),
				'```',
				'',
			]);
	}
}

/** `/llms-full.txt` — the same inventory with every body and dataset inlined. */
export async function llmsFull({ posts }: Outline, site: URL): Promise<string> {
	const nav = await list('nav');

	const sections = [
		`# ${SITE.title} — full text`,
		'',
		`> ${SITE.description}`,
		'',
		`Generated from source at build time. Canonical site: ${site.href}`,
	];

	for (const item of nav) {
		const page = await getEntry('pages', item.id);
		if (!page) continue;
		sections.push(
			'',
			'---',
			'',
			`# ${page.data.head.title}`,
			'',
			`> ${page.data.description}`,
			'',
			`Source: ${new URL(item.data.href, site).href}`,
			...(page.body?.trim() ? ['', page.body.trim()] : []),
			...(await routeData(item.id)).flatMap((line, i) => (i === 0 ? ['', line] : [line])),
		);
	}

	for (const post of posts) {
		sections.push(
			'',
			'---',
			'',
			`# ${post.data.title}`,
			'',
			`> ${post.data.description}`,
			'',
			`Published ${iso(post.data.pubDate)} · ${post.minutes} min · ${post.data.tags.map((t) => `#${t}`).join(' ')}`,
			`Source: ${new URL(`/writing/${post.id}/`, site).href}`,
			'',
			(post.body ?? '').trim(),
		);
	}

	return `${sections.join('\n')}\n`;
}
