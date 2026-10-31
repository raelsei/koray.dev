import { readFile } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";
import config from "@/config";

/**
 * Open Graph cards, 1200×630, in the site's own world: void ground, light
 * type in Clash Grotesk and Switzer, the B&W portrait, no colour. Satori
 * cannot read woff2, so it reads the .ttf twins of the
 * self-hosted faces in src/assets/fonts.
 */

const C = {
  void: "#08080a",
  light: "#f2f1ee",
  soft: "#a9a9b0",
  muted: "#8a8a91",
};

// Resolved from the project root: the built endpoint runs bundled under dist/.
const asset = (path: string) =>
  readFile(join(process.cwd(), "src", "assets", path));

let shared:
  | Promise<{ fonts: Parameters<typeof satori>[1]["fonts"]; portrait: string }>
  | undefined;

function load() {
  shared ??= Promise.all([
    asset("fonts/ClashGrotesk-600.ttf"),
    asset("fonts/Switzer-400.ttf"),
    asset("fonts/Switzer-500.ttf"),
    asset("portrait/koray-dark.jpg").then(file =>
      sharp(file).resize(630, 630).jpeg({ quality: 82 }).toBuffer()
    ),
  ]).then(([clash, switzer400, switzer500, portrait]) => ({
    fonts: [
      { name: "Clash Grotesk", data: clash, weight: 600, style: "normal" },
      { name: "Switzer", data: switzer400, weight: 400, style: "normal" },
      { name: "Switzer", data: switzer500, weight: 500, style: "normal" },
    ],
    portrait: `data:image/jpeg;base64,${portrait.toString("base64")}`,
  }));
  return shared;
}

type Node = {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: unknown;
    [k: string]: unknown;
  };
};

const el = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  props: Record<string, unknown> = {}
): Node => ({ type, props: { ...props, style, children } });

// The home page's lead, product first (Koray, 2026-10-31).
const ROLE = "Product engineer in İstanbul";
const PRODUCTS = "OpenMacApps · OpenBucket · Cento · Rast";

const host = new URL(config.site.url).hostname;

async function png(root: Node): Promise<Response> {
  const { fonts } = await load();
  const svg = await satori(root as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts,
  });
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": "image/png" },
  });
}

/** The site card: name, role, portrait. */
export async function siteCard(): Promise<Response> {
  const { portrait } = await load();
  return png(
    el(
      "div",
      {
        width: "100%",
        height: "100%",
        display: "flex",
        background: C.void,
        fontFamily: "Switzer",
        position: "relative",
      },
      [
        el(
          "img",
          { position: "absolute", right: 0, top: 0, width: 630, height: 630 },
          undefined,
          {
            src: portrait,
            width: 630,
            height: 630,
          }
        ),
        el("div", {
          position: "absolute",
          right: 330,
          top: 0,
          width: 300,
          height: 630,
          backgroundImage: `linear-gradient(to right, ${C.void}, rgba(8,8,10,0))`,
        }),
        el(
          "div",
          {
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 0 64px 80px",
            width: 720,
          },
          [
            el("div", { display: "flex", flexDirection: "column" }, [
              el(
                "div",
                {
                  fontFamily: "Clash Grotesk",
                  fontWeight: 600,
                  fontSize: 104,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: C.light,
                },
                config.site.author
              ),
              el(
                "div",
                { marginTop: 32, fontSize: 40, fontWeight: 500, color: C.soft },
                ROLE
              ),
              el(
                "div",
                { marginTop: 14, fontSize: 30, color: C.muted },
                PRODUCTS
              ),
            ]),
            el("div", { fontSize: 28, color: C.muted }, host),
          ]
        ),
      ]
    )
  );
}

/** A post card: the title, and who wrote it. */
export async function postCard(title: string): Promise<Response> {
  const { portrait } = await load();
  return png(
    el(
      "div",
      {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px 64px",
        background: C.void,
        fontFamily: "Switzer",
      },
      [
        el(
          "div",
          {
            fontFamily: "Clash Grotesk",
            fontWeight: 600,
            fontSize: title.length > 60 ? 64 : 76,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: C.light,
            maxHeight: 330,
            overflow: "hidden",
          },
          title
        ),
        el(
          "div",
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 30,
          },
          [
            el("div", { display: "flex", alignItems: "center", gap: 22 }, [
              el(
                "img",
                { width: 72, height: 72, borderRadius: 36 },
                undefined,
                {
                  src: portrait,
                  width: 72,
                  height: 72,
                }
              ),
              el(
                "span",
                { color: C.light, fontWeight: 500 },
                config.site.author
              ),
            ]),
            el("span", { color: C.muted }, host),
          ]
        ),
      ]
    )
  );
}
