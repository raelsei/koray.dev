/**
 * Internal resolved configuration used throughout the codebase.
 *
 * Prefer editing `site.config.ts` instead of this file. This module exists to
 * apply defaults and expose a fully-resolved config shape (`ResolvedConfig`).
 */
import userConfig from "@/site.config";
import type { ResolvedConfig } from "./types/config";
import { PUBLIC_GOOGLE_SITE_VERIFICATION } from "astro:env/client";

const DEFAULT_OG_IMAGE = "default-og.jpg";

const config: ResolvedConfig = {
  site: {
    ...userConfig.site,
    ogImage: userConfig.site.ogImage ?? DEFAULT_OG_IMAGE,
    lang: userConfig.site.lang ?? "en",
    timezone: userConfig.site.timezone ?? "UTC",
    dir: userConfig.site.dir ?? "ltr",
    googleVerification:
      userConfig.site.googleVerification || PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  posts: {
    scheduledPostMargin:
      userConfig.posts?.scheduledPostMargin ?? 15 * 60 * 1000,
  },
  features: {
    dynamicOgImage: userConfig.features?.dynamicOgImage ?? true,
    showBackButton: userConfig.features?.showBackButton ?? true,
    search: userConfig.features?.search ?? "pagefind",
  },
  profiles: userConfig.profiles ?? [],
  shareLinks: userConfig.shareLinks ?? [],
};

export default config;
