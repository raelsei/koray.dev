import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { SITE } from '../consts';
import { getPosts } from '../lib/writing';

export const GET: APIRoute = async (context) =>
	rss({
		title: `${SITE.title} — writing`,
		description: SITE.description,
		site: context.site!,
		items: (await getPosts()).map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			categories: post.data.tags,
			link: `/writing/${post.id}/`,
		})),
		customData: `<language>${SITE.locale}</language>`,
	});
