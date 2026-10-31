import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { file, glob } from "astro/loaders";
import config from "@/config";

export const BLOG_PATH = "src/content/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
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
      timezone: z.string().optional(),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
    /** The home page's one sentence; the word koative gets the two dots. */
    intro: z.string().optional(),
    /** When a dated page (Now) was last brought up to date. */
    updated: z.date().optional(),
  }),
});

/**
 * Short dated entries: launches, numbers, what broke. Only events recorded in
 * the brain's product logs (`brain/products/*.md` → `## Log`), newest first.
 */
const log = defineCollection({
  loader: file("src/content/log.yaml"),
  schema: z.object({
    id: z.string(),
    date: z.coerce.date(),
    text: z.string(),
    url: z.url().optional(),
  }),
});

export const collections = { posts, pages, log };
