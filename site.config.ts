import { defineSiteConfig } from "./src/types/config";

export default defineSiteConfig({
  site: {
    url: "https://koray.dev",
    title: "Koray Güler",
    description:
      "Koray Güler — product engineer in İstanbul. OpenMacApps, OpenBucket, Cento, Rast.",
    author: "Koray Güler",
    email: "hello@koray.dev",
    lang: "en",
    timezone: "Europe/Istanbul",
    dir: "ltr",
  },
  posts: {
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    dynamicOgImage: true,
    showBackButton: true,
    search: "pagefind",
  },
  // Every profile in brain/accounts.md (Work, Life, Reserved) that has a URL and
  // is ours. All of them go into JSON-LD `sameAs` and `<link rel="me">`; the
  // `listed` ones are also the visible links on the home page, in this order.
  // Left out: Linktree `korayguler` (ownership unconfirmed), Telegram and
  // Threads (no URL in accounts.md), X `@koative` (not ours).
  profiles: [
    { name: "X", url: "https://x.com/raelsei", listed: true },
    { name: "GitHub", url: "https://github.com/raelsei", listed: true },
    { name: "LinkedIn", url: "https://linkedin.com/in/raelsei", listed: true },
    { name: "Instagram", url: "https://www.instagram.com/raelsei/", listed: true },
    { name: "YouTube", url: "https://www.youtube.com/@raelsei", listed: true },
    { name: "Product Hunt", url: "https://www.producthunt.com/@raelsei" },
    { name: "Peerlist", url: "https://peerlist.io/raelsei" },
    { name: "Reddit", url: "https://www.reddit.com/user/raelsei/" },
    { name: "Instagram", url: "https://www.instagram.com/koray.dev/" },
    { name: "YouTube", url: "https://www.youtube.com/@korayguler" },
    { name: "TikTok", url: "https://www.tiktok.com/@raelsei" },
    { name: "Bluesky", url: "https://bsky.app/profile/raelsei.bsky.social" },
    { name: "Medium", url: "https://medium.com/@raelsei" },
    { name: "DEV", url: "https://dev.to/raelsei" },
    { name: "npm", url: "https://www.npmjs.com/~raelsei" },
    { name: "GitLab", url: "https://gitlab.com/raelsei" },
  ],
  // Trimmed to where this audience actually shares: no Facebook, WhatsApp or Pinterest.
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "linkedin", url: "https://www.linkedin.com/sharing/share-offsite/?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
