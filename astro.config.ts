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

export default defineConfig({
  site: config.site.url,
  // Every canonical URL, sitemap entry and internal link already ends in a
  // slash; without this, Astro's `paginate()` emits `/posts/2` and a strict
  // static host answers with a 301 to `/posts/2/`. It also makes the dev server
  // reject the slash-less form, so the mismatch surfaces locally instead of in
  // production. Routes with a file extension (`/rss.xml`) are exempt.
  trailingSlash: "always",
  integrations: [
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
    shikiConfig: {
      // `night-owl` is navy; it reads as a foreign slab against the phosphor
      // palette. `vitesse-dark` is neutral-dark with olive/sage syntax.
      themes: { light: "min-light", dark: "vitesse-dark" },
      defaultColor: false,
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
  fonts: [
    {
      // What browsers load: one variable woff2 per subset and style, so a
      // page fetches only the ranges it uses. latin-ext carries İ, ı, ğ, ş.
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      subsets: ["latin", "latin-ext"],
      formats: ["woff2"],
      // The whole site is set in this face, so a flash of the Courier New
      // fallback is the flicker readers notice. With both upright files
      // preloaded, `block` holds text for the few milliseconds they take to
      // arrive instead of painting the fallback and swapping; past the
      // browser's ~3s block period it still falls back, so text never stays
      // hidden on a bad connection.
      display: "block",
    },
    {
      // The same face as static ttf, for Satori, which renders the OG images
      // and cannot read woff2. Build-time only: no <Font> renders it, so no
      // page ever downloads these files. Kept apart from the web family on
      // purpose: in one family the ttf faces were declared last with no
      // unicode-range, so browsers fetched them over the woff2 and swapped.
      name: "Google Sans Code",
      cssVariable: "--font-og",
      provider: fontProviders.google(),
      fallbacks: [],
      weights: [400, 700],
      styles: ["normal"],
      formats: ["ttf"],
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
