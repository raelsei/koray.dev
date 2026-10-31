/**
 * Shiki transformer that lifts the few syntax colours in `vitesse-dark` that
 * fall under WCAG AA (4.5:1) on its own background, keeping each hue and only
 * moving it far enough to pass:
 *
 * - punctuation `#666666` (3.26:1 on #121212) → `#808080` (4.74:1)
 * - string quotes `#C98A7D77` (2.36:1) → `#9E776E` (4.74:1)
 * - comments `#758575DD` (3.89:1) → `#788878` (4.99:1)
 *
 * Every other colour already clears 4.5:1. Re-measure if the theme changes:
 * the keys must match what Shiki emits, case-insensitively.
 */
const REPLACEMENTS = {
  "#666666": "#808080",
  "#c98a7d77": "#9E776E",
  "#758575dd": "#788878",
};

export const transformerContrast = () => ({
  name: "koray:contrast",
  span(node) {
    const style = node.properties.style;
    if (typeof style !== "string") return;
    node.properties.style = style.replace(
      /(^|;)color:(#[0-9a-f]{3,8})/gi,
      (match, sep, color) =>
        REPLACEMENTS[color.toLowerCase()]
          ? `${sep}color:${REPLACEMENTS[color.toLowerCase()]}`
          : match
    );
  },
});
