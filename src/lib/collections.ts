import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';

/** Collections whose entries carry the `order` stamped by the `ordered()` loader. */
export type OrderedCollection = {
	[K in CollectionKey]: CollectionEntry<K> extends { data: { order: number } } ? K : never;
}[CollectionKey];

/**
 * Reads an ordered collection back in the order it was authored.
 *
 * Astro sorts the data store by `id`, so this is the only correct way to read
 * these collections — pages must never call `getCollection` on them directly.
 */
export async function list<K extends OrderedCollection>(
	name: K,
): Promise<Array<CollectionEntry<K>>> {
	// `OrderedCollection` already guarantees an `order` field — Zod validated it
	// at the content boundary — but Astro's generic `CollectionEntry<K>` cannot
	// carry that through, so the guarantee is restated once, here, and nowhere else.
	const entries: Array<CollectionEntry<K> & { data: { order: number } }> =
		await getCollection(name);
	return entries.sort((a, b) => a.data.order - b.data.order);
}
