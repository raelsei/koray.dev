import type { APIRoute } from 'astro';

import { llmsFull, outline } from '../lib/llms';

/** Every page and post inlined, for models that would rather not crawl. */
export const GET: APIRoute = async ({ site }) => {
	const body = await llmsFull(await outline(site!), site!);

	return new Response(body, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
};
