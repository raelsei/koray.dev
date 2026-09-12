import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://koray.dev",
    title: "koray.dev",
    description:
      "Koray Güler — founder and product engineer. Fintech, applied AI, and small teams. Notes on money, models and shipping alone.",
    author: "Koray Güler",
    profile: "https://koray.dev/about/",
    lang: "en",
    timezone: "Europe/Istanbul",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    // No public source repository to edit against; a dead link is worse than none.
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/raelsei" },
    { name: "x", url: "https://x.com/raelsei" },
    { name: "linkedin", url: "https://linkedin.com/in/raelsei" },
    { name: "telegram", url: "https://t.me/raelsei" },
    { name: "mail", url: "mailto:id@koray.dev" },
  ],
  // Trimmed to where this audience actually shares: no Facebook, WhatsApp or Pinterest.
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "linkedin", url: "https://www.linkedin.com/sharing/share-offsite/?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
