import type { APIRoute } from 'astro';

import { llmsHandler, llmsIndex } from '../lib/llms';

/** https://llmstxt.org — the index a model should read first. */
export const GET: APIRoute = llmsHandler((outline, site) => llmsIndex(outline, site));
