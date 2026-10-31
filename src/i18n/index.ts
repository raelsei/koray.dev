/**
 * Interface strings: the words on controls and page chrome. Editorial copy
 * lives in the content collections, never here. The site is English-only by
 * decision (see AGENTS.md), so this is one object, not a table of locales.
 */
export const t = {
  nav: {
    work: "Work",
    log: "Log",
    writing: "Writing",
    about: "About",
    search: "Search",
  },
  home: {
    work: "Work",
    shippedUnder: "Shipped under",
    elsewhere: "Elsewhere",
    log: "Log",
    source: "Source",
  },
  post: {
    updatedAt: "Updated",
    readingTime: (minutes: number) => `${minutes} min read`,
    sharePostIntro: "Share this post:",
    sharePostOn: (platform: string) => `Share this post on ${platform}`,
    sharePostViaEmail: "Share this post via email",
    backToTop: "Back to top",
    goBack: "Go back",
    previousPost: "Previous post",
    nextPost: "Next post",
  },
  footer: {
    hire: "Hire",
  },
  pages: {
    writingTitle: "Writing",
    writingDesc: "Posts by Koray Güler.",
    searchTitle: "Search",
    searchDesc: "Search the posts.",
  },
  a11y: {
    skipToContent: "Skip to content",
  },
  notFound: {
    title: "404 Not Found",
    message: "This page does not exist.",
    goHome: "Go to the home page",
  },
} as const;
