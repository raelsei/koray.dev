import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import config from "./site.config";

export default defineConfig({
  site: config.site.url,
  // Every canonical URL, sitemap entry and internal link already ends in a
  // slash; without this, Astro's `paginate()` emits `/posts/2` and a strict
  // static host answers with a 301 to `/posts/2/`. It also makes the dev server
  // reject the slash-less form, so the mismatch surfaces locally instead of in
  // production. Routes with a file extension (`/rss.xml`) are exempt.
  trailingSlash: "always",
  integrations: [
    mdx(),
    sitemap({
      filter: page => {
        // /search/ is noindex; listing it in the sitemap is a mixed signal.
        if (page.endsWith("/search/")) return false;
        return (
          config.features?.showArchives !== false ||
          !page.endsWith("/archives/")
        );
      },
    }),
  ],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [rehypeCallouts],
    }),
    shikiConfig: {
      // `night-owl` is navy; it reads as a foreign slab against the phosphor
      // palette. `vitesse-dark` is neutral-dark with olive/sage syntax.
      themes: { light: "min-light", dark: "vitesse-dark" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
