import type { FontData } from "astro:assets";

export function getFontPathByWeight(
  fonts: FontData[],
  weight: number,
  options?: {
    style?: "normal" | "italic";
    format?: string;
  }
): string | undefined {
  const style = options?.style ?? "normal";
  const format = options?.format ?? "truetype";

  // A family can carry several faces per weight (woff2 per subset for the
  // browser, one ttf for Satori), so keep looking until one has the format.
  // Falling back to another format would only move the failure into Satori,
  // which cannot read woff2.
  for (const font of fonts) {
    if (font.weight !== String(weight) || font.style !== style) continue;
    const src = font.src.find(file => file.format === format);
    if (src) return src.url;
  }

  return undefined;
}
