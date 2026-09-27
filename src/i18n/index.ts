/**
 * Interface strings: the words on controls and page chrome. Editorial copy
 * lives in the content collections, never here. The site is English-only by
 * decision (see AGENTS.md), so this is one object, not a table of locales.
 */
export const t = {
  nav: {
    posts: "Posts",
    tags: "Tags",
    about: "About",
    projects: "Projects",
    bookmarks: "Bookmarks",
    archives: "Archives",
    search: "Search",
  },
  post: {
    updatedAt: "Updated",
    readingTime: (minutes: number) => `${minutes} min read`,
    sharePostIntro: "Share this post:",
    sharePostOn: (platform: string) => `Share this post on ${platform}`,
    sharePostViaEmail: "Share this post via email",
    backToTop: "Back to top",
    goBack: "Go back",
    previousPost: "Previous Post",
    nextPost: "Next Post",
  },
  pagination: {
    prev: "Prev",
    next: "Next",
    page: "Page",
  },
  home: {
    socialLinks: "Social Links",
    featured: "Featured",
    recentPosts: "Recent Posts",
    allPosts: "All Posts",
  },
  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
  },
  pages: {
    tagTitle: "Tag",
    tagDesc: "All the articles with the tag",

    tagsTitle: "Tags",
    tagsDesc: "All the tags used in posts.",
    allTags: "All tags",

    postsTitle: "Posts",
    postsDesc: "All the articles I've posted.",

    archivesTitle: "Archives",
    archivesDesc: "All the articles I've archived.",

    searchTitle: "Search",
    searchDesc: "Search any article ...",
  },
  a11y: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleTheme: "Toggle theme",
    goToPreviousPage: "Go to previous page",
    goToNextPage: "Go to next page",
  },
  notFound: {
    title: "404 Not Found",
    message: "Page Not Found",
    goHome: "Go back home",
  },
} as const;
