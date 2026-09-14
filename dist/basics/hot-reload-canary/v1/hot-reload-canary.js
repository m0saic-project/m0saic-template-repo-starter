"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotReloadCanaryV1 = exports.CANARY_COLOR = exports.CANARY_BLUE = exports.CANARY_RED = void 0;
exports.canaryColorLabel = canaryColorLabel;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
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
exports.CANARY_RED = "#c0392b";
exports.CANARY_BLUE = "#2471a3";
/**
 * THE ONE LINE TO FLIP when verifying the reload loop. Swap `CANARY_RED` for
 * `CANARY_BLUE`, rebuild, refresh — the app must follow.
 */
exports.CANARY_COLOR = exports.CANARY_RED;
/** Human-readable name for the current constant, printed on the square. */
function canaryColorLabel(color) {
    if (color === exports.CANARY_RED)
        return "RED";
    if (color === exports.CANARY_BLUE)
        return "BLUE";
    return color.toUpperCase();
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    color: {
        type: "string",
        required: false,
        description: "Optional fill override (#rrggbb). Unset: the CANARY_COLOR constant baked into the template source.",
        // The picker meta only shapes the CONTROL — defaultProps still omits
        // `color`, which is what keeps this template a reload canary.
        meta: {
            constraints: { isColor: true },
            control: { placeholder: "module constant CANARY_COLOR", colorPicker: true, defaultColor: exports.CANARY_RED },
            ui: { label: "Override fill" },
        },
    },
});
exports.HotReloadCanaryV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)("@m0saic-starter/basics/hot-reload-canary/v1"),
    label: "03 · Hot-Reload Canary",
    version: 1,
    description: "A solid square whose fill comes from a CONSTANT in the template source, not a prop default. Flip the constant, rebuild, hit Refresh repos — the running app must follow without a restart. This is how you verify your edit loop.",
    capabilities: { tier: "core" },
    tags: ["basics", "starter", "smoke"],
    outputHints: {
        width: 720,
        height: 720,
        fps: 30,
        durationMs: 1000,
        format: { kind: "image", container: "png" },
        note: "Square canvas — the canary is a solid fill, so the aspect only has to be unmistakable.",
    },
    propsSchema,
    // `color` deliberately absent — see the module doc. Its deterministic
    // default is the constant, resolved in render().
    defaultProps: {},
    async render(props, _ctx) {
        var _a;
        if (props.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(props.color)) {
            throw new Error(`@m0saic-starter/basics/hot-reload-canary/v1: color ` +
                `${JSON.stringify(props.color)} must be a #rrggbb hex color.`);
        }
        const fill = (_a = props.color) !== null && _a !== void 0 ? _a : exports.CANARY_COLOR;
        // xExpr / yExpr are ffmpeg drawtext expressions, and supplying them
        // OVERRIDES hAlign/vAlign entirely — so centering is spelled
        // `(w-text_w)/2`, not `hAlign: "center"` (which the expr would ignore).
        const layers = [
            {
                content: { kind: "literal", text: canaryColorLabel(fill) },
                style: { fontSize: 96, fontColor: "#ffffff" },
                placement: { xExpr: "(w-text_w)/2", yExpr: "h*0.44-text_h/2" },
            },
            {
                content: { kind: "literal", text: "basics/hot-reload-canary/v1" },
                style: { fontSize: 24, fontColor: "#ffffff" },
                placement: { xExpr: "(w-text_w)/2", yExpr: "h*0.62-text_h/2" },
            },
        ];
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)("F", "@m0saic-starter/basics/hot-reload-canary/v1"),
            assets: {},
            sources: [
                {
                    type: "text",
                    visual: { backgroundColor: (0, template_utils_1.solidBackground)(fill) },
                    layers,
                },
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Hot-Reload Canary",
        lines: [
            "The fill comes from a CONSTANT in the source, not a prop default - so the color can only change if the app really re-evaluated your rebuilt code.",
            "The loop: edit the constant, npm run build, press Refresh repos. No app restart.",
            "A prop default could not prove it - the editor may hold a stale prop bag that hides your change.",
        ],
        explore: [
            "Flip CANARY_COLOR in the source, rebuild, Refresh repos",
            "Set a color override, then clear it - the constant returns",
        ],
    }),
});
exports.default = exports.HotReloadCanaryV1;
