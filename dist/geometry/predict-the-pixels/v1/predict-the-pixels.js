"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictThePixelsV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const geometry_1 = require("../../../_shared/geometry");
const svg_text_1 = require("../../../_shared/svg-text");
const ID = "@m0saic-starter/geometry/predict-the-pixels/v1";
/** Two alternating tile fills + the label ink. */
const FILL_EVEN = "#21618c";
const FILL_ODD = "#2874a6";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    tileCount: {
        type: "number",
        required: false,
        description: "How many equal tiles to split into (2-12).",
        meta: {
            constraints: { min: 2, max: 12 },
            control: { step: 1 },
            ui: { label: "Tiles" },
        },
    },
});
exports.PredictThePixelsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "Predict the Pixels",
    version: 1,
    description: "Every tile is labeled with the width the outside-in remainder rule predicts for it — floor(T/N) each, spare pixels to the edges first, center last. Render at any canvas and the labels are always right: quantization is arithmetic you can run ahead of time.",
    capabilities: { tier: "core" },
    tags: ["geometry", "quantization", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Try odd widths (1030, 1031…) and higher tile counts to watch the remainder walk outside-in.",
    },
    propsSchema,
    defaultProps: { tileCount: 4 },
    async render(props, ctx) {
        var _a;
        const count = (_a = props.tileCount) !== null && _a !== void 0 ? _a : 4;
        if (!Number.isInteger(count) || count < 2 || count > 12) {
            throw new Error(`${ID}: tileCount must be an integer 2-12, got ${count}.`);
        }
        const { width, height } = ctx.target;
        // THE rule, run ahead of the render. sizes[i] is what tile i will
        // actually measure on screen.
        const sizes = (0, geometry_1.outsideInSizes)(width, count);
        const row = (0, dsl_stdlib_1.weightedSplit)(new Array(count).fill(1), "col");
        // Base row carries the fills; the attached overlay re-splits the same
        // canvas identically and carries one label per tile.
        const m0 = (0, dsl_stdlib_1.toM0String)(`${row}{${row}}`, ID);
        const fills = sizes.map((_, i) => (0, template_utils_1.makeColorTile)(i % 2 === 0 ? FILL_EVEN : FILL_ODD));
        const labels = sizes.map((px, i) => (0, svg_text_1.svgLabel)(`${px}px`, sizes[i], height, { maxPx: Math.round(height * 0.06) }));
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [...fills, ...labels],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Predict the Pixels",
        lines: [
            "Equal splits follow the outside-in remainder rule: floor(T/N) pixels each, then the spare pixels go to indexes 0, N-1, 1, N-2, ... - edges first, center last.",
            "It is exact arithmetic, locked by an engine test - so this template computes every tile's width BEFORE rendering and labels it. The labels are always right.",
        ],
        explore: [
            "Custom size with an odd width like 1031",
            "Raise Tiles and watch the remainder walk outside-in",
            "Cross-check with eye menu > Show dimensions",
        ],
    }),
});
exports.default = exports.PredictThePixelsV1;
