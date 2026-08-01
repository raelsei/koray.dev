import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import yaml from 'js-yaml';

/* ─── Loaders ────────────────────────────────────────────────────────────── */

/**
 * Astro's data store re-sorts every collection by `id` when it serialises
 * (`data-store-writer.ts`), so authored array order is lost by the time
 * `getCollection` runs. This loader stamps each item's position in the file as
 * `order`, which `list()` in `lib/collections.ts` sorts by — the YAML stays
 * free of bookkeeping and the file reads top-to-bottom exactly as it renders.
 */
const ordered = (path: string) =>
	file(path, {
		parser: (text) => {
			const items = yaml.load(text);
			if (!Array.isArray(items)) {
				throw new Error(`${path} must contain a YAML array.`);
			}
			return items.map((item, order) => ({ ...item, order }));
		},
	});

/** Every ordered collection carries this. Never authored by hand. */
const withOrder = { order: z.number() };

/* ─── Shared shapes ──────────────────────────────────────────────────────── */

/** A `$ command` eyebrow plus the heading it introduces. */
const heading = z.object({
	prompt: z.string(),
	title: z.string(),
});

/** The bordered "get in touch" panel used on `/` and `/about`. */
const cta = z
	.object({
		prompt: z.string(),
		email: z.string(),
		body: z.string(),
		aside: z.string(),
		asideHref: z.string().optional(),
	})
	.optional();

const tone = z.enum(['accent', 'muted']).default('muted');

/* ─── Prose ──────────────────────────────────────────────────────────────── */

/**
 * One file per route. The body is the page's long-form copy; frontmatter
 * carries the chrome (eyebrow, heading, CTA) so no page hardcodes a string.
 */
const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '*.md' }),
	schema: z.object({
		head: heading,
		title: z.string(),
		description: z.string(),
		cta,
	}),
});

const writing = defineCollection({
	loader: glob({ base: './src/content/writing', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		/** Rendered as the post lede and as the list-row description. */
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		tags: z.array(z.string()).default([]),
		/** Closing line under the article, e.g. "written in İstanbul, june 2026". */
		colophon: z.string().optional(),
		draft: z.boolean().default(false),
	}),
});

/* ─── Index ──────────────────────────────────────────────────────────────── */

/** The four-cell readout under the hero. */
const status = defineCollection({
	loader: ordered('./src/content/data/status.yaml'),
	schema: z.object({
		...withOrder,
		label: z.string(),
		/** Omitted when `live` supplies the value at runtime. */
		value: z.string().optional(),
		note: z.string(),
		/** Hydrated client-side; `clock` ticks in the site's timezone. */
		live: z.literal('clock').optional(),
		tone,
	}),
});

const now = defineCollection({
	loader: ordered('./src/content/data/now.yaml'),
	schema: z.object({ ...withOrder, label: z.string(), body: z.string() }),
});

/* ─── Work ───────────────────────────────────────────────────────────────── */

const ventures = defineCollection({
	loader: ordered('./src/content/data/ventures.yaml'),
	schema: z.object({
		...withOrder,
		name: z.string(),
		/** Full pitch, shown on `/work`. */
		description: z.string(),
		/** One-line pitch, shown in the index preview. */
		summary: z.string(),
		/** Short status shown in the index preview, e.g. "beta". */
		status: z.string(),
		/** Years shown in the index preview, e.g. "2026 —". */
		period: z.string(),
		/** Longer status shown beside the title on `/work`, e.g. "private beta". */
		badge: z.string().optional(),
		badgeTone: tone,
		/** Right-hand note on `/work`, e.g. "under koative". */
		aside: z.string().optional(),
		href: z.url().optional(),
		/** The flagship entry renders larger and in the accent colour. */
		lead: z.boolean().default(false),
		tags: z.array(z.string()).default([]),
		metrics: z
			.array(z.object({ value: z.string(), label: z.string(), tone }))
			.default([]),
	}),
});

const oss = defineCollection({
	loader: ordered('./src/content/data/oss.yaml'),
	schema: z.object({
		...withOrder,
		name: z.string(),
		description: z.string(),
		lang: z.string(),
		stars: z.number(),
		href: z.url(),
	}),
});

/* ─── Writing ────────────────────────────────────────────────────────────── */

const notes = defineCollection({
	loader: ordered('./src/content/data/notes.yaml'),
	schema: z.object({ ...withOrder, date: z.coerce.date(), body: z.string() }),
});

/* ─── Stack ──────────────────────────────────────────────────────────────── */

const stack = defineCollection({
	loader: ordered('./src/content/data/stack.yaml'),
	schema: z.object({
		...withOrder,
		label: z.string(),
		items: z.array(z.object({ name: z.string(), note: z.string().optional() })),
	}),
});

const rules = defineCollection({
	loader: ordered('./src/content/data/rules.yaml'),
	schema: z.object({ ...withOrder, body: z.string() }),
});

/* ─── About ──────────────────────────────────────────────────────────────── */

/** `man`-page style term/definition pairs. */
const manual = defineCollection({
	loader: ordered('./src/content/data/manual.yaml'),
	schema: z.object({ ...withOrder, term: z.string(), body: z.string() }),
});

const timeline = defineCollection({
	loader: ordered('./src/content/data/timeline.yaml'),
	schema: z.object({ ...withOrder, period: z.string(), body: z.string(), tone }),
});

const contacts = defineCollection({
	loader: ordered('./src/content/data/contacts.yaml'),
	schema: z.object({
		...withOrder,
		channel: z.string(),
		handle: z.string(),
		href: z.string(),
		external: z.boolean().default(true),
	}),
});

/* ─── Library ────────────────────────────────────────────────────────────── */

/**
 * Every shelf is a list of groups; a group's `kind` picks its renderer.
 * Adding a shelf means adding a YAML file — no route or component changes.
 */
const shelfGroup = z.discriminatedUnion('kind', [
	z.object({
		kind: z.literal('link'),
		title: z.string(),
		meta: z.string(),
		/** Host label is derived from `href` — never written twice. */
		items: z.array(z.object({ label: z.string(), href: z.url() })),
	}),
	z.object({
		kind: z.literal('repo'),
		title: z.string(),
		meta: z.string(),
		items: z.array(
			z.object({
				name: z.string(),
				description: z.string(),
				lang: z.string(),
				href: z.url(),
			}),
		),
	}),
	z.object({
		kind: z.literal('card'),
		title: z.string(),
		meta: z.string(),
		items: z.array(
			z.object({
				name: z.string(),
				description: z.string(),
				href: z.url(),
			}),
		),
	}),
	z.object({
		kind: z.literal('code'),
		title: z.string(),
		meta: z.string(),
		/** Accented blocks get the lime rule down their left edge. */
		accent: z.boolean().default(false),
		items: z.array(
			z.object({
				name: z.string(),
				/** Inline, beside the filename. */
				note: z.string().optional(),
				/** Block, under the filename. */
				description: z.string().optional(),
				lang: z.string().default('text'),
				code: z.string(),
			}),
		),
	}),
]);

const shelves = defineCollection({
	loader: glob({ base: './src/content/shelves', pattern: '*.yaml' }),
	schema: z.object({
		/** Tab order, ascending. */
		order: z.number(),
		/** Own meta description; without it all four shelves share the page's. */
		description: z.string(),
		groups: z.array(shelfGroup),
	}),
});

/* ─── Navigation ─────────────────────────────────────────────────────────── */

const nav = defineCollection({
	loader: ordered('./src/content/data/nav.yaml'),
	schema: z.object({
		...withOrder,
		label: z.string(),
		href: z.string(),
		/** Command-bar aliases that resolve to this route. */
		aliases: z.array(z.string()).default([]),
	}),
});

export const collections = {
	pages,
	writing,
	status,
	now,
	ventures,
	oss,
	notes,
	stack,
	rules,
	manual,
	timeline,
	contacts,
	shelves,
	nav,
};
