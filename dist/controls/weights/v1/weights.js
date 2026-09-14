"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeightsV1 = exports.MIX_LABELS = void 0;
exports.parseMix = parseMix;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/weights/v1";
/** The fixed label set — schema-owned; the value never carries names. */
exports.MIX_LABELS = ["Footage", "Titles", "Breaks"];
const DEFAULT_MIX = [62, 26, 12];
/** Normalize to one finite non-negative weight per label, summing to 100. */
function parseMix(raw) {
    const value = raw !== null && raw !== void 0 ? raw : DEFAULT_MIX;
    if (!Array.isArray(value) || value.length !== exports.MIX_LABELS.length) {
        throw new Error(`${ID}: mix must hold exactly ${exports.MIX_LABELS.length} weights (one per label).`);
    }
    const nums = value.map((v, i) => {
        if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
            throw new Error(`${ID}: mix[${i}] must be a finite non-negative number.`);
        }
        return v;
    });
    const total = nums.reduce((a, b) => a + b, 0);
    if (total <= 0) {
        // The field's own posture: a degenerate value becomes an even split.
        return exports.MIX_LABELS.map(() => Math.round(100 / exports.MIX_LABELS.length));
    }
    return nums.map((v) => (v / total) * 100);
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    mix: {
        type: "number[]",
        required: false,
        description: "The timeline mix. flavor weights + the schema-declared labels render an auto-balancing slider group summing to 100; the value is one weight per label, order-paired.",
        meta: {
            constraints: { minItems: 3, maxItems: 3 },
            control: {
                flavor: "weights",
                weights: { labels: exports.MIX_LABELS },
            },
            ui: { label: "Mix", order: 1 },
        },
    },
    bandColor: {
        type: "string",
        required: false,
        description: "Accent fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2e86c1" },
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
/** A darker twin of a #rrggbb colour. */
function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const dim = (v) => Math.max(0, Math.round(v * 0.62));
    const hh = (v) => v.toString(16).padStart(2, "0");
    return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}`;
}
exports.WeightsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "23 · Weights",
    version: 1,
    description: "A distribution the user drags, not numbers the user types: flavor weights plus a schema-declared label set renders a number[] prop as an auto-balancing slider group holding a constant 100. One weight per label, order-paired — the labels live in the schema so the value stays pure numbers. Both the field and this render normalize forgiving-ly (stale or hand-typed values become a sane distribution), and the bands below are a weightedSplit fed directly by the prop: drag a slider, move a wall.",
    capabilities: { tier: "core" },
    tags: ["controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Drag one Mix slider — the others give way, the bands move. Hand-type numbers that don't sum to 100 into a saved file: normalized, not refused.",
    },
    propsSchema,
    defaultProps: {
        mix: DEFAULT_MIX,
        bandColor: "#2e86c1",
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b;
        for (const [key, value] of [
            ["bandColor", props.bandColor],
            ["pageColor", props.pageColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const mix = parseMix(props.mix);
        const { width, height } = ctx.target;
        const bandHex = (_a = props.bandColor) !== null && _a !== void 0 ? _a : "#2e86c1";
        const band = bandHex;
        const page = ((_b = props.pageColor) !== null && _b !== void 0 ? _b : "#1c2833");
        // The weights ARE the layout: Hamilton-scale the normalized mix onto a
        // 100-slot band, and a legend row naming each share.
        const scaled = mix.map((v) => Math.max(1, Math.round(v)));
        const bar = String((0, dsl_stdlib_1.weightedSplit)(scaled, "col", {
            precision: 100,
            claimants: exports.MIX_LABELS.map(() => "1"),
        }));
        const legendW = Math.floor(84 / exports.MIX_LABELS.length) - 4;
        const legend = String((0, dsl_stdlib_1.weightedSplit)([6, ...exports.MIX_LABELS.flatMap(() => [3, 1, legendW])], "col", { mode: "literal", claimants: ["-", ...exports.MIX_LABELS.flatMap(() => ["1", "-", "1"])] }));
        const rows = String((0, dsl_stdlib_1.weightedSplit)([16, 26, 8, 14, 36], "row", {
            mode: "literal",
            claimants: ["-", bar, "-", legend, "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const palette = [band, shade(bandHex), "#5d6d7e"];
        const sources = [];
        for (let i = 0; i < exports.MIX_LABELS.length; i++) {
            sources.push((0, template_utils_1.makeColorTile)(palette[i % palette.length]));
        }
        for (const [i, label] of exports.MIX_LABELS.entries()) {
            sources.push((0, template_utils_1.makeColorTile)(palette[i % palette.length]));
            sources.push((0, template_utils_1.svgLabel)(`${label} ${Math.round(mix[i])}%`, (width * 0.8) / exports.MIX_LABELS.length, height * 0.12, {
                color: "#b9c4cf",
                maxPx: Math.round(height * 0.024),
                vAlign: "middle",
            }));
        }
        const heading = (0, svg_text_1.fitSvgText)("WEIGHTS - drag a slider, move a wall", width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.036), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            "flavor weights + schema-declared labels: an auto-balancing group summing to 100, one weight per label by ORDER",
            "both the field and render normalize forgiving-ly - hand-authored numbers become a sane distribution, never an error",
        ], width * 0.9, height * 0.09, { maxPx: Math.round(height * 0.026), widthFrac: 0.92 });
        sources.push((0, svg_text_1.svgTextSource)([
            {
                text: heading.text,
                fontSize: heading.fontSize,
                color: "#eaeef2",
                vAlign: "top",
                padding: { top: 0.08 },
            },
            {
                text: readout.text,
                fontSize: readout.fontSize,
                color: "#7f8c9b",
                vAlign: "bottom",
                padding: { bottom: 0.12 },
            },
        ]));
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: page,
            sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Weights",
        lines: [
            "flavor weights + control.weights.labels: a number[] renders as an auto-balancing slider group - drag one up, the others give way, total stays 100.",
            "One weight per label, paired by ORDER - the labels live in the schema so the value stays pure numbers.",
            "Normalize forgiving-ly at render: stale or hand-typed values become a sane distribution, exactly like the field itself does.",
        ],
        explore: [
            "Drag Footage up - Titles and Breaks give way, bands move",
            "Hand-type [3, 1, 1] into a saved file - normalized, not refused",
        ],
    }),
});
exports.default = exports.WeightsV1;
