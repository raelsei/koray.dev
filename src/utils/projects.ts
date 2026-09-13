import type { CollectionEntry } from "astro:content";
import { getRelativeLocaleUrl } from "astro:i18n";

export type Project = CollectionEntry<"projects">;
export type ProjectKind = Project["data"]["kind"];

/**
 * Group order on the index, and the headings they render as. Ventures lead
 * because they are the evidence a reader is here for; the rest came out of them.
 *
 * A kind with no entries is not rendered, so this list can name a group before
 * anything fills it.
 */
export const KIND_GROUPS: ReadonlyArray<{ kind: ProjectKind; label: string }> =
  [
    { kind: "venture", label: "Ventures" },
    { kind: "library", label: "Libraries" },
    { kind: "starter", label: "Starters" },
    { kind: "tool", label: "Tools" },
  ];

/**
 * An entry earns a page by having something written in it. Deriving this from
 * the body rather than a frontmatter flag means the page cannot disagree with
 * whether there is anything on it.
 */
export function hasWriteup(project: Project): boolean {
  return Boolean(project.body?.trim());
}

/** Where the index should send a reader: the write-up, or the thing itself. */
export function projectUrl(
  project: Project,
  locale: string | undefined
): string | undefined {
  if (hasWriteup(project)) {
    return getRelativeLocaleUrl(locale ?? "", `projects/${project.id}`);
  }
  return project.data.url ?? project.data.repo;
}

/** Non-empty groups, in `KIND_GROUPS` order, each sorted by its own `order`. */
export function groupProjects(projects: Project[]) {
  return KIND_GROUPS.map(({ kind, label }) => ({
    kind,
    label,
    items: projects
      .filter(p => p.data.kind === kind)
      .sort((a, b) => a.data.order - b.data.order),
  })).filter(group => group.items.length > 0);
}
