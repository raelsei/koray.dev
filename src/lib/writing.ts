import { getCollection, type CollectionEntry } from 'astro:content';

import { readingTime } from './format';

export type Post = CollectionEntry<'writing'> & { minutes: number };

/** Published posts, newest first, each carrying its derived reading time. */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('writing', ({ data }) => !data.draft);
	return posts
		.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
		.map((post) => ({ ...post, minutes: readingTime(post.body ?? '') }));
}

/** Archive groups, newest year first. */
export function byYear(posts: Post[]): Array<{ year: number; posts: Post[] }> {
	const groups = new Map<number, Post[]>();
	for (const post of posts) {
		const y = post.data.pubDate.getUTCFullYear();
		(groups.get(y) ?? groups.set(y, []).get(y)!).push(post);
	}
	return [...groups.entries()]
		.sort((a, b) => b[0] - a[0])
		.map(([year, posts]) => ({ year, posts }));
}

/** The post after this one in reverse-chronological order, wrapping to the top. */
export function nextPost(posts: Post[], id: string): Post | undefined {
	if (posts.length < 2) return undefined;
	const i = posts.findIndex((p) => p.id === id);
	return i === -1 ? undefined : posts[(i + 1) % posts.length];
}
