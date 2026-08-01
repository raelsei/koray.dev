import { SITE } from '../consts';
import { list } from './collections';
import { wordCount } from './format';
import { absolute, post as postPath } from './urls';
import type { Post } from './writing';

/**
 * JSON-LD, assembled as a single `@graph` per page.
 *
 * Entities are declared once with a stable `@id` and referenced by `@id`
 * everywhere else, so the Person and WebSite are never duplicated across a
 * document — that is what search engines reconcile on, and repeating a full
 * entity invites contradictory copies.
 *
 * Every value is derived from the content collections. There is no second copy
 * of the bio, the social links or the publication dates to keep in sync.
 */

/** A `@id` reference to an entity declared elsewhere in the same graph. */
interface Ref {
	'@id': string;
}

type Node = Record<string, unknown> & { '@type': string; '@id'?: string };

/** Stable graph identifiers, so cross-page references reconcile. */
export const id = {
	person: (site: URL) => new URL('/#person', site).href,
	website: (site: URL) => new URL('/#website', site).href,
	studio: (site: URL) => new URL('/#studio', site).href,
	page: (path: string, site: URL) => `${absolute(path, site)}#page`,
	post: (slug: string, site: URL) => `${absolute(postPath(slug), site)}#article`,
};

const ref = (value: string): Ref => ({ '@id': value });

/**
 * The two entities every page asserts: who runs this site, and what the site
 * is. Social profiles come from `contacts.yaml`, the studio from `ventures.yaml`.
 */
export async function identity(site: URL): Promise<Node[]> {
	const [contacts, ventures] = await Promise.all([list('contacts'), list('ventures')]);

	const studio = ventures.find((v) => v.data.lead)?.data;

	const person: Node = {
		'@type': 'Person',
		'@id': id.person(site),
		name: SITE.author,
		url: absolute('/about', site),
		email: `mailto:${SITE.email}`,
		jobTitle: 'Founder, product engineer',
		description: SITE.description,
		address: {
			'@type': 'PostalAddress',
			addressLocality: SITE.terminal.city,
			addressCountry: 'TR',
		},
		// Only real profile URLs; `mailto:` is already covered by `email`.
		sameAs: contacts
			.filter(({ data }) => data.href.startsWith('http'))
			.map(({ data }) => data.href),
		...(studio ? { worksFor: ref(id.studio(site)) } : {}),
	};

	const website: Node = {
		'@type': 'WebSite',
		'@id': id.website(site),
		url: site.href,
		name: SITE.title,
		description: SITE.description,
		inLanguage: SITE.locale,
		publisher: ref(id.person(site)),
	};

	if (!studio) return [person, website];

	return [
		person,
		website,
		{
			'@type': 'Organization',
			'@id': id.studio(site),
			name: studio.name,
			description: studio.summary,
			...(studio.href ? { url: studio.href } : {}),
			founder: ref(id.person(site)),
			foundingLocation: {
				'@type': 'Place',
				name: SITE.terminal.city,
			},
		},
	];
}

/** The generic page node. Every route emits one of these or a subtype. */
export function webPage(
	{ path, title, description, type = 'WebPage' }: {
		path: string;
		title: string;
		description: string;
		type?: 'WebPage' | 'CollectionPage' | 'ProfilePage' | 'AboutPage';
	},
	site: URL,
): Node {
	return {
		'@type': type,
		'@id': id.page(path, site),
		url: absolute(path, site),
		name: title,
		description,
		inLanguage: SITE.locale,
		isPartOf: ref(id.website(site)),
		about: ref(id.person(site)),
	};
}

/** An article, with the metrics the post page already displays. */
export function blogPosting(post: Post, site: URL): Node {
	const url = absolute(postPath(post.id), site);

	return {
		'@type': 'BlogPosting',
		'@id': id.post(post.id, site),
		url,
		mainEntityOfPage: url,
		headline: post.data.title,
		description: post.data.description,
		datePublished: post.data.pubDate.toISOString(),
		dateModified: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
		author: ref(id.person(site)),
		publisher: ref(id.person(site)),
		isPartOf: ref(id.website(site)),
		inLanguage: SITE.locale,
		keywords: post.data.tags,
		wordCount: wordCount(post.body ?? ''),
		timeRequired: `PT${post.minutes}M`,
		image: absolute('/og.png', site),
	};
}

/** Breadcrumbs for nested routes; the trail excludes the site root's own label. */
export function breadcrumbs(trail: Array<{ name: string; path: string }>, site: URL): Node {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: [{ name: SITE.title, path: '/' }, ...trail].map((crumb, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: crumb.name,
			item: absolute(crumb.path, site),
		})),
	};
}

/** An ordered index of posts, for `/writing`. */
export function postList(posts: Post[], site: URL): Node {
	return {
		'@type': 'ItemList',
		itemListOrder: 'https://schema.org/ItemListOrderDescending',
		numberOfItems: posts.length,
		itemListElement: posts.map((post, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			url: absolute(postPath(post.id), site),
			name: post.data.title,
		})),
	};
}
