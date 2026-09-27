/** Prose read at about this many words a minute. */
const WORDS_PER_MINUTE = 230;

/**
 * A line of code has to be read rather than skimmed, so it costs about what a
 * short sentence does, not what its word count says.
 */
const WORDS_PER_CODE_LINE = 12;

/**
 * Whole minutes to read a post's Markdown body, never less than one. Derived
 * at build time from the source, so it cannot drift from what was published.
 */
export function getReadingTime(body = ""): number {
  let words = 0;
  let codeLines = 0;
  let inFence = false;

  for (const line of body.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
    } else if (inFence) {
      if (line.trim()) codeLines++;
    } else {
      words += line.split(/\s+/).filter(Boolean).length;
    }
  }

  return Math.max(
    1,
    Math.round((words + codeLines * WORDS_PER_CODE_LINE) / WORDS_PER_MINUTE)
  );
}
