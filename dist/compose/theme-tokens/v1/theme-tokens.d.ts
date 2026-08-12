/**
 * `@m0saic-starter/compose/theme-tokens/v1` — the CONSUMER half of theming,
 * and the three places tokens can come from.
 *
 * ONE CONCEPT: theming is data flow that happens to carry colors. A consumer
 * overlays whatever arrived onto its own constants — `applyTheme(LOCAL, ctx)`
 * — so it is never coupled to a specific producer, only to the token SHAPE
 * and an alias string.
 *
 * `source` walks the three ways that data reaches you:
 *
 *   - "local" — nothing arrived. `applyTheme` returns the fallback untouched,
 *     so an un-themed render is byte-identical to a template that never heard
 *     of theming. This is the path you ship.
 *   - "upstream" — the REAL one: a producer ran earlier in the pipeline and
 *     its tokens are sitting on `ctx.upstreamData[alias]`. Standalone in the
 *     editor there is no pipeline, so this path honestly reports finding
 *     nothing and falls back.
 *   - "provider" — the TUTORIAL shortcut: this template renders a producer BY
 *     ID itself and reads what it published. You would not normally write
 *     this; a pipeline step publishes and the channel does the delivering. It
 *     is here so the merge is visible with one template open.
 *
 * The provider is late-bound by id — paste `@m0saic/theming/v1` (the built-in
 * m0saic palette) or the starter's own `compose/theme-provider/v1` and the
 * swatches re-skin. Nothing is imported: the lookup goes through the host's
 * registry, which is exactly why an id is enough.
 *
 * `mode` rides along to the provider (dark | light | high-contrast). The merge
 * itself is per KEY, so a producer that publishes only `accent` overrides only
 * `accent` — everything else stays local.
 */
export type ThemeTokensProps = {
    /** Where the tokens come from. */
    source?: "local" | "upstream" | "provider";
    /** Provider template id, used when source is "provider". */
    providerId?: string;
    /** Palette to ask the provider for. */
    mode?: "dark" | "light" | "high-contrast";
    /** Upstream channel name — both halves must agree on it. */
    alias?: string;
    /** The template's OWN accent — used for every key nobody published. */
    accentFallback?: string;
};
export declare const ThemeTokensV1: import("@m0saic/types").MosaicTemplate<ThemeTokensProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default ThemeTokensV1;
