/**
 * Lowercase, accents folded, anything that is not a letter or a digit
 * collapsed to one hyphen: "E2E Testing" → "e2e-testing", "Güvenlik" →
 * "guvenlik". Letters of other scripts are kept rather than dropped.
 */
export const slugifyStr = (str: string): string =>
  str
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/ı/g, "i")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));
