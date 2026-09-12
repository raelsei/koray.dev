/**
 * Serialises a value for embedding in a `<script>` tag. `<` is escaped so a
 * payload containing `</script>` cannot close the element early.
 */
export const toJsonScript = (value: unknown): string =>
	JSON.stringify(value).replace(/</g, '\\u003c');
