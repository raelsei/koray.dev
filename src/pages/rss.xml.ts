import type { APIRoute } from 'astro';

import { rssHandler } from '../lib/rss';

export const GET: APIRoute = rssHandler;
