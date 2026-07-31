import type { APIRoute } from 'astro';

/**
 * Generated rather than dropped in `public/` so the absolute URLs always track
 * `site` in `astro.config.mjs`.
 *
 * The site ships an `llms.txt`, so blocking AI crawlers here would be
 * incoherent — everything published is meant to be readable, by anyone.
 */
export const GET: APIRoute = ({ site }) => {
	const url = (path: string) => new URL(path, site).href;

	const body = [
		'User-agent: *',
		'Allow: /',
		'',
		`Sitemap: ${url('sitemap-index.xml')}`,
		'',
		'# Structured for language models — see https://llmstxt.org',
		`# ${url('llms.txt')}`,
		`# ${url('llms-full.txt')}`,
		'',
	].join('\n');

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
