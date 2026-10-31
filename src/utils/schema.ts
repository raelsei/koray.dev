/**
 * JSON-LD builders.
 *
 * Every page emits exactly one `application/ld+json` block containing a single
 * `@graph`. Entities are declared once with a stable `@id` and referenced by
 * `@id` everywhere else, so the Person and WebSite are never duplicated inside
 * a document — and a crawler reading two pages sees the same two entities
 * rather than two near-identical copies.
 *
 * Pass page-specific nodes through `Layout`'s `schema` prop; `graph()` prepends
 * the sitewide identity and appends a breadcrumb derived from the URL.
 */
import type { ResolvedConfig } from "@/types/config";

type Node = Record<string, unknown>;

/** Stable identifiers. Referencing these is what keeps the graph de-duplicated. */
export const ids = {
  person: (url: string) => `${trimEnd(url)}/#person`,
  website: (url: string) => `${trimEnd(url)}/#website`,
  page: (canonical: string) => `${canonical}#webpage`,
  breadcrumb: (canonical: string) => `${canonical}#breadcrumb`,
};

const trimEnd = (u: string) => u.replace(/\/+$/, "");

/** Path segment -> breadcrumb label. The site is English-only by constraint. */
const SEGMENT_LABELS: Record<string, string> = {
  posts: "Writing",
  writing: "Writing",
  about: "About",
  search: "Search",
};

/** Segments whose own URL is a redirect: the crumb points where it lands. */
const SEGMENT_PATHS: Record<string, string> = { "/posts": "/writing" };

/** koative.com declares this entity in full; here it is only referenced. */
const KOATIVE_ORG = "https://koative.com/#org";

/**
 * The two sitewide entities. `sameAs` carries only real profile URLs — a
 * `mailto:` is not a profile, and Google treats a bad `sameAs` as a bad signal.
 */
export function identity(
  config: ResolvedConfig,
  { image }: { image: string }
): Node[] {
  const { site, profiles } = config;
  const base = trimEnd(site.url);

  return [
    {
      "@type": "Person",
      "@id": ids.person(base),
      name: site.author,
      url: `${base}/`,
      image,
      email: site.email,
      jobTitle: "Founder",
      worksFor: {
        "@type": "Organization",
        "@id": KOATIVE_ORG,
        name: "koative",
        url: "https://koative.com/",
      },
      sameAs: profiles.map(p => p.url),
    },
    {
      "@type": "WebSite",
      "@id": ids.website(base),
      url: `${base}/`,
      name: site.title,
      description: site.description,
      inLanguage: site.lang,
      publisher: { "@id": ids.person(base) },
    },
  ];
}

/**
 * Breadcrumb for an interior page, derived from the canonical path. The visible
 * trail was removed from the routes in favour of the nav, which already carries
 * every top-level destination; this markup stays, because it is what puts the
 * path under the title in a search result. Returns `null` for the home page,
 * which has nothing to trail.
 */
export function breadcrumb(
  config: ResolvedConfig,
  canonical: string
): Node | null {
  const base = trimEnd(config.site.url);
  const path = new URL(canonical).pathname.replace(/^\/+|\/+$/g, "");
  if (!path) return null;

  const segments = path.split("/").filter(Boolean);
  const items: Node[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${base}/`,
    },
  ];

  let walked = "";
  segments.forEach((segment, i) => {
    walked += `/${segment}`;
    const last = i === segments.length - 1;
    // A trailing page number ("/posts/2") is pagination, not a crumb of its own.
    const name = /^\d+$/.test(segment)
      ? `Page ${segment}`
      : (SEGMENT_LABELS[segment] ??
        decodeURIComponent(segment)
          .replace(/-/g, " ")
          .replace(/^\w/, c => c.toUpperCase()));
    items.push({
      "@type": "ListItem",
      position: i + 2,
      name,
      // The current page is its own position; naming an `item` for it is noise.
      ...(last ? {} : { item: `${base}${SEGMENT_PATHS[walked] ?? walked}/` }),
    });
  });

  return {
    "@type": "BreadcrumbList",
    "@id": ids.breadcrumb(canonical),
    itemListElement: items,
  };
}

type PageKind = "WebPage" | "CollectionPage" | "ProfilePage";

/** The page node itself, tied to the website and attributed to the person. */
export function page(
  config: ResolvedConfig,
  canonical: string,
  {
    kind = "WebPage",
    name,
    description,
  }: { kind?: PageKind; name: string; description?: string }
): Node {
  const base = trimEnd(config.site.url);
  return {
    "@type": kind,
    "@id": ids.page(canonical),
    url: canonical,
    name,
    ...(description && { description }),
    isPartOf: { "@id": ids.website(base) },
    inLanguage: config.site.lang,
    ...(kind === "ProfilePage"
      ? { mainEntity: { "@id": ids.person(base) } }
      : { about: { "@id": ids.person(base) } }),
  };
}

/** An ordered list of links or posts belonging to the page that declares it. */
export function itemList(
  canonical: string,
  items: Array<{ name: string; url: string }>
): Node {
  return {
    "@type": "ItemList",
    "@id": `${canonical}#items`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

/** One published post. Authored by the Person node, part of the WebSite. */
export function blogPosting(
  config: ResolvedConfig,
  canonical: string,
  post: {
    title: string;
    description?: string;
    image?: string;
    pubDatetime?: Date;
    modDatetime?: Date | null;
    tags?: string[];
  }
): Node {
  const base = trimEnd(config.site.url);
  return {
    "@type": "BlogPosting",
    "@id": `${canonical}#post`,
    mainEntityOfPage: { "@id": ids.page(canonical) },
    headline: post.title,
    ...(post.description && { description: post.description }),
    ...(post.image && { image: post.image }),
    ...(post.pubDatetime && { datePublished: post.pubDatetime.toISOString() }),
    ...(post.modDatetime && { dateModified: post.modDatetime.toISOString() }),
    ...(post.tags?.length && { keywords: post.tags }),
    inLanguage: config.site.lang,
    author: { "@id": ids.person(base) },
    publisher: { "@id": ids.person(base) },
    isPartOf: { "@id": ids.website(base) },
  };
}

/** Compose the document's single graph. */
export function graph(
  config: ResolvedConfig,
  canonical: string,
  nodes: Node[],
  person: { image: string }
) {
  const crumb = breadcrumb(config, canonical);
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...identity(config, person),
      ...nodes,
      ...(crumb ? [crumb] : []),
    ],
  };
}
