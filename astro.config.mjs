// @ts-check

import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

import { SITE } from './src/consts';
import { rehypeCodeBox, shikiCodeMeta } from './src/lib/rehype-code-box';
import { voidTerminal } from './src/lib/shiki-void';

// https://astro.build/config
export default defineConfig({
	site: SITE.url,
	// Makes the slash-less form a hard 404 in dev, so the link graph cannot
	// silently drift from the canonical/sitemap form again. See src/lib/urls.ts.
	trailingSlash: 'always',
	integrations: [sitemap()],
	// Real routes, SPA-grade feel: prefetch on hover, swap without a full reload.
	prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
	vite: { plugins: [tailwindcss()] },
	markdown: {
		processor: unified({ rehypePlugins: [rehypeCodeBox] }),
		shikiConfig: {
			theme: voidTerminal,
			transformers: [shikiCodeMeta],
			wrap: true,
		},
	},
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			// Variable font: one file covers the whole 400–700 range the design uses.
			weights: ['400 700'],
			styles: ['normal', 'italic'],
			// `latin-ext` carries İ/ü/ğ/ş/ç — the site says "İstanbul" and "Türkiye".
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
			display: 'swap',
		},
	],
});
