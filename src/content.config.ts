import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { file, glob } from "astro/loaders";
import config from "@/config";

export const BLOG_PATH = "src/content/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(config.site.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    /**
     * Document title when the visible heading is the wrong length for a tab or
     * a search result. The home page's heading is a full sentence.
     */
    seoTitle: z.string().optional(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

/**
 * Bookmarks are data, not prose: the page renders them and also emits them as
 * an `ItemList`, and prose cannot be read twice like that.
 */
const bookmarks = defineCollection({
  loader: file("src/content/bookmarks.yaml"),
  schema: z.object({
    id: z.string(),
    group: z.string(),
    order: z.number(),
    links: z
      .array(
        z.object({
          name: z.string(),
          url: z.url(),
          note: z.string(),
        })
      )
      .min(1),
  }),
});

export const collections = { posts, pages, bookmarks };
