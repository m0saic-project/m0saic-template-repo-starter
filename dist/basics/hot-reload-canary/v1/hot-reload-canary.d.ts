/**
 * `@m0saic-starter/basics/hot-reload-canary/v1` — prove the edit loop works.
 *
 * ONE CONCEPT: the external-repo development loop —
 * edit → `npm run build` → "Refresh repos" in the app → new code, no restart.
 *
 * The fill comes from the module constant {@link CANARY_COLOR}, not from a
 * prop default. That distinction is the whole lesson: a prop default can be
 * masked by a prop bag the editor is already holding, so changing it proves
 * nothing. Changing this CONSTANT can only show up if the running process
 * genuinely re-evaluated this file — which is exactly what you're verifying.
 *
 * ## Verify the loop
 *
 * 1. `npm run build` here; add this repo on the app's Templates page.
 * 2. Open this template in Make — it renders RED.
 * 3. Change `CANARY_COLOR` below to `CANARY_BLUE`.
 * 4. `npm run build` again.
 * 5. Templates page → "Refresh repos". Reopen it in Make: BLUE.
 *
 * If step 5 still shows red, the repo is probably building ESM — the reload
 * path can only refresh a CommonJS module graph (see tsconfig.json's note).
 */
/** The canary's two colors, exported so the test can pin the exact values. */
export declare const CANARY_RED = "#c0392b";
export declare const CANARY_BLUE = "#2471a3";
/**
 * THE ONE LINE TO FLIP when verifying the reload loop. Swap `CANARY_RED` for
 * `CANARY_BLUE`, rebuild, refresh — the app must follow.
 */
export declare const CANARY_COLOR: string;
/** Human-readable name for the current constant, printed on the square. */
export declare function canaryColorLabel(color: string): string;
export type HotReloadCanaryProps = {
    /**
     * Optional fill OVERRIDE (#rrggbb). Unset — the deterministic default —
     * uses the module constant, which is what makes this a reload canary.
     */
    color?: string;
};
export declare const HotReloadCanaryV1: import("@m0saic/types").MosaicTemplate<HotReloadCanaryProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default HotReloadCanaryV1;
