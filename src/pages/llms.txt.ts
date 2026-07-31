import type { APIRoute } from 'astro';

import { llmsIndex, outline } from '../lib/llms';

/** https://llmstxt.org — the index a model should read first. */
export const GET: APIRoute = async ({ site }) => {
	const body = llmsIndex(await outline(site!), site!);

	return new Response(body, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
	});
};
