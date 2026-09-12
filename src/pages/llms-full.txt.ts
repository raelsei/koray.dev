import type { APIRoute } from 'astro';

import { llmsHandler, llmsFull } from '../lib/llms';

/** Every page and post inlined, for models that would rather not crawl. */
export const GET: APIRoute = llmsHandler((outline, site) => llmsFull(outline, site));
