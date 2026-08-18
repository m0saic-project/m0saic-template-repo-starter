"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BelowTheFloorV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/quality/below-the-floor/v1";
const MODES = ["fits", "under-precision", "unrenderable"];
/**
 * Granularity per state, derived from the canvas.
 *
 *   precision  = 10·S   (total slots)
 *   feasibility ~ 4·S+1 (claimants + carry chain; passthroughs donate)
 *
 * so S past W/10 crosses precision, and S past W/4 crosses feasibility.
 * Verified against `evaluateM0` from 640x360 through 4K.
 */
function scaleFor(mode, canvasW) {
    switch (mode) {
        case "fits":
            return Math.max(2, Math.floor(canvasW / 160));
        case "under-precision":
            return Math.ceil(canvasW / 10) + 12;
        case "unrenderable":
            return Math.ceil(canvasW / 4) + 20;
    }
}
/**
 * A darker twin of a #rrggbb colour, so two equal-weight neighbours can be
 * told apart by eye. Deterministic integer math, no colour library.
 */
function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const dim = (v) => Math.max(0, Math.round(v * 0.62));
    const hh = (v) => v.toString(16).padStart(2, "0");
    return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}`;
}
/**
 * The design. Identical proportions at every scale — only slot count moves.
 * Returns the branded `M0String` straight from the builder (validated on the
 * way out), so the document never carries a bare string.
 */
function designM0(scale) {
    return (0, dsl_stdlib_1.weightedSplit)([scale, scale, 8 * scale], "col", {
        mode: "literal",
        claimants: ["1", "1", "1{1}"],
    });
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    mode: {
        type: "string",
        required: false,
        description: "fits: clears both floors. under-precision: renders but cells lose their pixel — the silent failure. unrenderable: feasibility refuses the m0 at this canvas.",
        meta: {
            constraints: { oneOf: MODES },
            ui: { label: "Mode", order: 1 },
        },
    },
    bandColor: {
        type: "string",
        required: false,
        description: "Band fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#c0392b" },
            ui: { label: "Band color", order: 2 },
        },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Backdrop as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Page color", order: 3 },
        },
    },
});
exports.BelowTheFloorV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "69 · Below the Floor",
    version: 1,
    description: "A layout has two independent minimum sizes: feasibility (renders at all) and precision (looks right). One design, three states — clears both, clears only feasibility and quietly squashes, or falls through feasibility and is refused outright. The caption prints all three numbers at your canvas, so the loud failure and the silent one are told apart by arithmetic.",
    capabilities: { tier: "core" },
    tags: ["quality", "feasibility", "lesson"],
    /**
     * REQUIRED HERE, and a lesson in itself. Every render is auto-compacted:
     * the framework losslessly reduces splits to their minimum representation,
     * so `[8,8,64]` becomes `[1,1,8]` — a 10-slot m0 that draws the identical
     * picture. Excellent default, fatal to this template: the slot count IS
     * the subject, and compaction would quietly delete it, leaving the caption
     * describing an m0 the document no longer carries.
     *
     * (The failing modes survived compaction on their own, because below the
     * precision floor the reduction is no longer pixel-identical and the
     * compactor correctly declines — which is a neat proof that the floor is
     * real, and exactly the kind of half-working state that makes a bug hard
     * to see. Opt out explicitly rather than relying on that.)
     */
    skipAutoCompact: true,
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Walk Mode through all three, then resize — the state belongs to (design, canvas), not the design.",
    },
    propsSchema,
    defaultProps: {
        mode: "fits",
        bandColor: "#c0392b",
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c;
        for (const [key, value] of [
            ["bandColor", props.bandColor],
            ["pageColor", props.pageColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const mode = ((_a = props.mode) !== null && _a !== void 0 ? _a : "fits");
        if (!MODES.includes(mode)) {
            throw new Error(`${ID}: mode "${mode}" must be one of ${MODES.join(", ")}.`);
        }
        const { width, height } = ctx.target;
        const band = ((_b = props.bandColor) !== null && _b !== void 0 ? _b : "#c0392b");
        const page = ((_c = props.pageColor) !== null && _c !== void 0 ? _c : "#1c2833");
        const scale = scaleFor(mode, width);
        const m0 = designM0(scale);
        // MEASURE, don't assume. This is the same call the app's Safe-Minimum
        // callout and the preview's below-floor chip read.
        const evalResult = (0, dsl_stdlib_1.evaluateM0)(m0, { width, height });
        const { feasibility, feasible, precision, meetsPrecision, recommendedMin } = evalResult;
        const numbers = [
            `canvas ${width}x${height}`,
            `feasibility ${feasibility.minWidthPx}px`,
            `precision ${precision.maxSplitX}px`,
            `folded floor ${recommendedMin.width}px`,
        ].join("   ");
        // INFEASIBLE: the engine would raise SPLIT_EXCEEDS_AXIS on this m0 at this
        // canvas. Report instead of handing the renderer a document that dies —
        // a report card beats a dead preview, and it names the number to fix.
        if (!feasible) {
            return (0, template_utils_1.makeErrorMosaic)([
                `- feasibility floor is ${feasibility.minWidthPx}px wide; this canvas is ${width}px`,
                `- the split would produce a 0-size frame (SPLIT_EXCEEDS_AXIS)`,
                `- fix: raise the canvas to ${recommendedMin.width}x${recommendedMin.height}, or use fewer cells`,
            ].join("\n"), {
                width,
                height,
                title: "Unrenderable at this canvas",
                errorCode: "STARTER_BELOW_FEASIBILITY",
            });
        }
        // Feasible. Either it also clears precision, or it is about to render
        // something that looks wrong without saying so.
        const verdict = meetsPrecision
            ? "FITS - clears both floors"
            : "UNDER PRECISION - renders, but cells cannot each hold a pixel. Silent.";
        const heading = (0, svg_text_1.fitSvgText)(verdict, width * 0.86, height * 0.3, {
            maxPx: Math.round(height * (meetsPrecision ? 0.075 : 0.06)),
            maxLines: 2,
        });
        // Report MEASURED numbers, never recomputed ones — `precision.maxSplitX`
        // is the slot count of the m0 actually being shipped. `maxSpreadPx` is
        // the payoff line: 0 when balanced, and how far equal cells have drifted
        // apart once the layout is under the floor.
        const readout = (0, svg_text_1.fitSvgLines)([
            numbers,
            `slots ${precision.maxSplitX}   scale S=${scale}   spread ${evalResult.maxSpreadPx}px`,
        ], width * 0.86, height * 0.22, { maxPx: Math.round(height * 0.032), widthFrac: 0.9 });
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: page,
            // Three claimants: two narrow bands, then the wide one carrying the
            // readout on its attached overlay. Same three at every scale.
            //
            // The two narrow bands carry the SAME weight, so they should be
            // pixel-identical. They are deliberately different shades: adjacent
            // same-coloured cells merge into one block, and the whole point here
            // is being able to SEE them drift apart once the layout is under the
            // precision floor. `spread` in the readout is that drift, measured.
            sources: [
                (0, template_utils_1.makeColorTile)(band),
                (0, template_utils_1.makeColorTile)(shade(band)),
                (0, template_utils_1.makeColorTile)(page),
                (0, svg_text_1.svgTextSource)([
                    {
                        text: heading.text,
                        fontSize: heading.fontSize,
                        color: (meetsPrecision ? "#eaeef2" : "#f2a03d"),
                    },
                    {
                        text: readout.text,
                        fontSize: readout.fontSize,
                        color: "#7f8c9b",
                        vAlign: "bottom",
                        padding: { bottom: 0.1 },
                    },
                ]),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Below the Floor",
        lines: [
            "Two independent floors. FEASIBILITY: renders at all, and below it the engine refuses - loud. PRECISION: looks right, and below it cells squash - silent.",
            "Neither is a floor on the other; they cross both ways. The number you want is the folded floor, the per-axis max, which evaluateM0 gives as recommendedMin.",
            "Every mode here draws the SAME design at the same proportions - only the slot count changes, walking the floors up past your canvas.",
        ],
        explore: [
            "Walk Mode through fits, under-precision, unrenderable",
            "Resize - the same m0 changes state, the numbers say why",
        ],
    }),
});
exports.default = exports.BelowTheFloorV1;
