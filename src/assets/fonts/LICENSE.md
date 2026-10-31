# Fonts

| Family        | Files                                                     | Designer            | Licence               |
| ------------- | --------------------------------------------------------- | ------------------- | --------------------- |
| Clash Grotesk | `ClashGrotesk-500/600` (`.woff2`), `ClashGrotesk-600.ttf` | Indian Type Foundry | ITF Free Font License |
| Switzer       | `Switzer-400/500/600` (`.woff2`), `Switzer-400/500.ttf`   | Indian Type Foundry | ITF Free Font License |

Both families come from [Fontshare](https://www.fontshare.com), Indian Type
Foundry's free font service, and are self-hosted here under the ITF Free Font
License (free for personal and commercial use). They are the same files
koative.com ships. The licence text is published with each family:

- Clash Grotesk: https://www.fontshare.com/fonts/clash-grotesk
- Switzer: https://www.fontshare.com/fonts/switzer

Where they are used:

- `.woff2`: the site, via the `fonts` entries in `astro.config.ts`.
- `.ttf`: the Open Graph images (`src/utils/og.ts`), because Satori cannot read
  WOFF2.
