import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { transformerContrast } from "./src/utils/transformers/contrast";
import config from "./site.config";

// Pages removed in the 2026-10-31 redesign. Each URL was live, so each one
// lands somewhere instead of 404ing.
const REMOVED_TO_WRITING = [
  "/posts",
  "/posts/2",
  "/posts/3",
  "/archives",
  "/tags",
  ...["caching", "cloudflare", "correctness", "cost", "llm", "security"].map(
    tag => `/tags/${tag}`
  ),
];
const REMOVED_TO_HOME = [
  "/bookmarks",
  "/projects",
  ...["arcstack", "keel", "koative", "lumi", "pocketbase-ts-starter"].map(
    slug => `/projects/${slug}`
  ),
];

const redirects: Record<string, string> = {
  // Posts renamed on 2026-10-04. Each old URL was live, so it keeps working.
  "/posts/a-missing-capability-beats-a-threshold":
    "/posts/keep-the-model-call-off-the-request-path/",
  "/posts/a-signing-key-in-the-browser":
    "/posts/what-a-non-extractable-key-protects/",
  "/posts/the-endpoint-that-succeeded-at-doing-nothing":
    "/posts/fire-and-forget-on-cloudflare-workers/",
  ...Object.fromEntries(REMOVED_TO_WRITING.map(path => [path, "/writing/"])),
  ...Object.fromEntries(REMOVED_TO_HOME.map(path => [path, "/"])),
};

export default defineConfig({
  site: config.site.url,
  // Every canonical URL, sitemap entry and internal link already ends in a
  // slash; a strict static host answers the slash-less form with a 301. It
  // also makes the dev server reject the slash-less form, so the mismatch
  // surfaces locally instead of in production. Routes with a file extension
  // (`/rss.xml`) are exempt.
  trailingSlash: "always",
  redirects,
  integrations: [
    sitemap({
      // /search/ is noindex; listing it in the sitemap is a mixed signal. The
      // redirect stubs are not pages either.
      filter: page => {
        const path = new URL(page).pathname.replace(/\/$/, "");
        return path !== "/search" && !(path in redirects);
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
    shikiConfig: {
      // One dark theme: the site has one ground. `vitesse-dark` is neutral,
      // so it sits on the void without a blue or green cast.
      theme: "vitesse-dark",
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerContrast(),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  // Clash Grotesk (display) and Switzer (text), Indian Type Foundry, ITF Free
  // Font License, self-hosted from src/assets/fonts (see LICENSE.md there). The
  // same files koative.com ships. `block` holds text for the moment the
  // preloaded files take instead of painting the fallback and swapping.
  fonts: [
    {
      name: "Clash Grotesk",
      cssVariable: "--font-clash",
      provider: fontProviders.local(),
      fallbacks: ["sans-serif"],
      display: "block",
      options: {
        variants: [
          { src: ["./src/assets/fonts/ClashGrotesk-500.woff2"], weight: 500 },
          { src: ["./src/assets/fonts/ClashGrotesk-600.woff2"], weight: 600 },
        ],
      },
    },
    {
      name: "Switzer",
      cssVariable: "--font-switzer",
      provider: fontProviders.local(),
      fallbacks: ["sans-serif"],
      display: "block",
      options: {
        variants: [
          { src: ["./src/assets/fonts/Switzer-400.woff2"], weight: 400 },
          { src: ["./src/assets/fonts/Switzer-500.woff2"], weight: 500 },
          { src: ["./src/assets/fonts/Switzer-600.woff2"], weight: 600 },
        ],
      },
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
      // Where the product cards come from. Overridable so a local build can
      // point at a file served from disk before koative.com publishes it.
      PRODUCTS_JSON_URL: envField.string({
        access: "public",
        context: "server",
        default: "https://koative.com/products.json",
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
