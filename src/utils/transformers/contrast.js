/**
 * Shiki transformer that lifts the few syntax colours in `min-light` and
 * `vitesse-dark` that fall under WCAG AA (4.5:1) on their own backgrounds,
 * keeping each hue and only moving it far enough to pass:
 *
 * - light comments `#C2C3C5` (1.76:1 on #ffffff) → `#6E7276` (4.85:1)
 * - dark punctuation `#666666` (3.26:1 on #121212) → `#808080` (4.74:1)
 * - dark string quotes `#C98A7D77` (2.36:1) → `#9E776E` (4.74:1)
 * - dark comments `#758575DD` (3.89:1) → `#788878` (4.99:1)
 *
 * Every other colour in both themes already clears 4.5:1. Re-measure if a
 * theme changes: the keys must match what Shiki emits, case-insensitively.
 */
const REPLACEMENTS = {
  "--shiki-light": { "#c2c3c5": "#6E7276" },
  "--shiki-dark": {
    "#666666": "#808080",
    "#c98a7d77": "#9E776E",
    "#758575dd": "#788878",
  },
};

export const transformerContrast = () => ({
  name: "koray:contrast",
  span(node) {
    const style = node.properties.style;
    if (typeof style !== "string") return;
    node.properties.style = style.replace(
      /(--shiki-(?:light|dark)):(#[0-9a-f]{3,8})/gi,
      (match, variable, color) =>
        REPLACEMENTS[variable]?.[color.toLowerCase()]
          ? `${variable}:${REPLACEMENTS[variable][color.toLowerCase()]}`
          : match
    );
  },
});
