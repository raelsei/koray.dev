import { z } from "astro/zod";
import { PRODUCTS_JSON_URL } from "astro:env/server";

/**
 * The product cards come from koative.com, which publishes every public
 * product from the brain repo. Fetched once per build. A failed fetch or a
 * malformed list fails the build: there is no committed copy to fall back to,
 * so a stale list can never ship.
 */
const Product = z.object({
  name: z.string(),
  slug: z.string(),
  oneLiner: z.string(),
  status: z.enum(["live", "beta", "building"]),
  website: z.url(),
  repo: z.url().startsWith("https://github.com/"),
  icon: z.url().nullable(),
  tint: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .nullable(),
});

export type Product = z.infer<typeof Product>;

/** Badge words from brain/brand.md. */
export const STATUS_LABEL: Record<Product["status"], string> = {
  live: "Live",
  beta: "Beta",
  building: "Coming soon",
};

let products: Promise<Product[]> | undefined;

export function getProducts(): Promise<Product[]> {
  products ??= load();
  return products;
}

async function load(): Promise<Product[]> {
  const res = await fetch(PRODUCTS_JSON_URL).catch(error => {
    throw new Error(`Cannot fetch ${PRODUCTS_JSON_URL}: ${error.message}`);
  });
  if (!res.ok) {
    throw new Error(`Cannot fetch ${PRODUCTS_JSON_URL}: HTTP ${res.status}`);
  }
  const parsed = z
    .array(Product)
    .min(1)
    .safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(
      `${PRODUCTS_JSON_URL} does not match the products.json contract:\n${z.prettifyError(parsed.error)}`
    );
  }
  return parsed.data;
}
