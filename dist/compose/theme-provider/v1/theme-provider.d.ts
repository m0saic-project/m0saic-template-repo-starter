import type { MosaicThemeTokens } from "@m0saic/types";
/**
 * `@m0saic-starter/compose/theme-provider/v1` — the PRODUCER half of theming.
 *
 * ONE CONCEPT: a producer publishes a token set onto the upstream channel and
 * that is its entire job. `publishTheme(tokens, { alias })` returns a
 * `type: "data"` source; drop it in `sources` and every downstream template
 * reading that alias sees the tokens as `ctx.upstreamData[alias]`.
 *
 * Two things make this composable rather than a coupling:
 *
 *   - THE CONTRACT IS THE SHAPE, NOT THE TEMPLATE. Producer and consumer
 *     agree on `MosaicThemeTokens` and an alias string — never on each
 *     other's id — so any conforming producer swaps under any consumer.
 *   - A DATA SOURCE PAINTS NOTHING. It occupies a cell and renders a
 *     degenerate carrier, which is why a real pipeline marks a pure producer
 *     step `intermediate: true` and pays no render cost at all. This one also
 *     draws its swatches, so you can see what it is publishing.
 *
 * `mode` is the whole point of a producer being a TEMPLATE instead of a
 * constant: one prop re-skins every consumer downstream. The built-in
 * `@m0saic/theming/v1` is the same idea with the full m0saic palette.
 */
export type ThemeProviderProps = {
    /** Which palette to publish. */
    mode?: "dark" | "light" | "high-contrast";
    /** Upstream alias the tokens appear under (consumers read this name). */
    alias?: string;
};
/** Read a producer's published tokens back out of its rendered document —
 *  what a consumer does when it calls a provider itself instead of waiting
 *  for a pipeline to thread the channel. */
export declare function publishedTokensOf(doc: {
    sources?: unknown[];
} | null | undefined, alias?: string): MosaicThemeTokens | undefined;
export declare const ThemeProviderV1: import("@m0saic/types").MosaicTemplate<ThemeProviderProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ThemeProviderV1;
