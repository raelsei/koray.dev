import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { SITE } from '../consts';
import { WRITING, absolute, post as postPath } from '../lib/urls';
import { getPosts } from '../lib/writing';

export const GET: APIRoute = async (context) => {
	const site = context.site!;
	const posts = await getPosts();

	return rss({
		title: `${SITE.title} — writing`,
		description: SITE.description,
		site,
		xmlns: { atom: 'http://www.w3.org/2005/Atom' },
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			categories: post.data.tags,
			// RSS 2.0 <author> is email-first by spec.
			author: `${SITE.email} (${SITE.author})`,
			link: postPath(post.id),
		})),
		customData: [
			`<language>${SITE.locale}</language>`,
			// The feed's scope is the archive, not the home page.
			`<link>${absolute(WRITING, site)}</link>`,
			`<atom:link href="${absolute('/rss.xml', site)}" rel="self" type="application/rss+xml"/>`,
			...(posts[0]
				? [`<lastBuildDate>${posts[0].data.pubDate.toUTCString()}</lastBuildDate>`]
				: []),
		].join(''),
	});
};
