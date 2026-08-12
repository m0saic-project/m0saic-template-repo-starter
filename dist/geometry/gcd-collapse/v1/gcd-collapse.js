"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GcdCollapseV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const svg_text_1 = require("../../../_shared/svg-text");
const ID = "@m0saic-starter/geometry/gcd-collapse/v1";
const FILLS = ["#b03a2e", "#1e8449", "#b7950b"];
const propsSchema = (0, template_utils_1.definePropsSchema)({
    weights: {
        type: "number[]",
        required: false,
        description: "Column weights shared by both rows (2-6 positive integers). Try [25,50,25] vs [1,2,1] — the optimized row emits the same string for both.",
        meta: { ui: { label: "Weights" } },
    },
});
exports.GcdCollapseV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "05 · GCD Collapse",
    version: 1,
    description: "Two rows, same weights: literal mode keeps all 100 slots, the default optimized mode GCD-collapses to 4. At friendly widths they're identical; at hostile widths the 100-slot row's seams visibly drift while the 4-slot row stays tight. Labels print slots, DSL length, and the measured spread at this very canvas.",
    capabilities: { tier: "core" },
    tags: ["geometry", "quantization", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Render at an odd width (1031, 1279…) and watch the top row's seams drift off the bottom row's.",
    },
    propsSchema,
    defaultProps: { weights: [25, 50, 25] },
    async render(props, ctx) {
        var _a;
        const weights = (_a = props.weights) !== null && _a !== void 0 ? _a : [25, 50, 25];
        if (weights.length < 2 ||
            weights.length > 6 ||
            weights.some((w) => !Number.isInteger(w) || w < 1)) {
            throw new Error(`${ID}: weights must be 2-6 positive integers, got ${JSON.stringify(weights)}.`);
        }
        const { width, height } = ctx.target;
        const literal = (0, dsl_stdlib_1.weightedSplit)(weights, "col", { mode: "literal" });
        const optimized = (0, dsl_stdlib_1.weightedSplit)(weights, "col"); // mode: "optimized" is the default
        const slotCount = (m0) => {
            const match = /^(\d+)/.exec(m0);
            return match ? Number(match[1]) : 1;
        };
        // Two stacked rows of the same split, labels on the attached overlay.
        const m0 = (0, dsl_stdlib_1.toM0String)(`2[${literal},${optimized}]{2[1,1]}`, ID);
        const rowFills = () => weights.map((_, i) => (0, template_utils_1.makeColorTile)(FILLS[i % FILLS.length]));
        const halfH = Math.floor(height / 2);
        const label = (name, s) => {
            // The receipts: how far this row's tiles drift from their ideal
            // proportions AT THIS canvas (0 = exact).
            const spread = (0, dsl_stdlib_1.quantizationSpread)(s, width, halfH).maxSpreadPx;
            return (0, svg_text_1.svgLabel)(`${name}: ${slotCount(s)} slots, ${s.length} chars, spread ${spread.toFixed(1)}px`, width, halfH, { maxPx: Math.round(height * 0.045), vAlign: "bottom", padding: { bottom: 0.08 } });
        };
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            sources: [
                ...rowFills(),
                ...rowFills(),
                label("literal", literal),
                label("optimized (default)", optimized),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "GCD Collapse",
        lines: [
            "[25,50,25] and [1,2,1] are the same proportions - dividing by the GCD drops 100 slots to 4 and changes nothing visually.",
            "Fewer slots means a shorter string, more pixels per weight unit (keep it >= 4), and a lower precision floor.",
            "At hostile widths the 100-slot row visibly drifts while the 4-slot row stays tight.",
        ],
        explore: [
            "Render at width 1031 and find the drifting seams",
            "Set Weights to [1,2,1] - both rows emit the same string",
            "Eye menu > Show dimensions to see per-tile pixels",
        ],
    }),
});
exports.default = exports.GcdCollapseV1;
