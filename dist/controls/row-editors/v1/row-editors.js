"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowEditorsV1 = exports.SEGMENT_PALETTE = void 0;
exports.parseSegments = parseSegments;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/row-editors/v1";
const MAX_ROWS = 6;
/** New rows seed their color cell from this, in order. */
exports.SEGMENT_PALETTE = ["#2e86c1", "#27ae60", "#ca6f1e", "#884ea0", "#c0392b", "#17a589"];
const DEFAULT_SEGMENTS = [
    { label: "Render", value: 46 },
    { label: "Encode", value: 27 },
    { label: "Upload", value: 17 },
    { label: "Idle", value: 10 },
];
/** Parse + validate (editors may deliver a JSON string). */
function parseSegments(raw) {
    const value = typeof raw === "string" ? JSON.parse(raw) : (raw !== null && raw !== void 0 ? raw : DEFAULT_SEGMENTS);
    if (!Array.isArray(value) || value.length < 2 || value.length > MAX_ROWS) {
        throw new Error(`${ID}: segments must hold 2-${MAX_ROWS} rows.`);
    }
    return value.map((entry, i) => {
        const e = entry;
        if (typeof e.label !== "string" || e.label.length === 0 || e.label.length > 16) {
            throw new Error(`${ID}: segments[${i}].label must be a 1-16 char string.`);
        }
        if (typeof e.value !== "number" || !Number.isFinite(e.value) || e.value <= 0 || e.value > 999) {
            throw new Error(`${ID}: segments[${i}].value must be a number in (0, 999].`);
        }
        if (e.color !== undefined && !HEX.test(e.color)) {
            throw new Error(`${ID}: segments[${i}].color must be #rrggbb.`);
        }
        return { label: e.label, value: e.value, ...(e.color ? { color: e.color } : {}) };
    });
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    segments: {
        type: "json",
        required: false,
        description: "The breakdown rows. flavor objectRows + columns renders them as a repeating form (text / number / color cells); palette seeds new rows' colors. Plain Array<{label, value, color?}> at render.",
        meta: {
            constraints: {
                jsonSchema: {
                    type: "array",
                    minItems: 2,
                    maxItems: MAX_ROWS,
                    items: {
                        type: "object",
                        required: ["label", "value"],
                        properties: {
                            label: { type: "string", minLength: 1, maxLength: 16 },
                            value: { type: "number", exclusiveMinimum: 0, maximum: 999 },
                            color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
                        },
                    },
                },
            },
            control: {
                flavor: "objectRows",
                columns: [
                    { key: "label", kind: "text", label: "Segment", placeholder: "Render" },
                    { key: "value", kind: "number", label: "Share" },
                    { key: "color", kind: "color", label: "Color" },
                ],
                palette: exports.SEGMENT_PALETTE,
            },
            ui: { label: "Segments", order: 1 },
        },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Backdrop as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Page color", order: 2 },
        },
    },
});
exports.RowEditorsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "21 · Row Editors",
    version: 1,
    description: "An array-of-objects prop that edits like a form: flavor objectRows + columns (text / number / color cells) renders a json prop as repeating rows with add and remove, and palette seeds new rows' colors so additions arrive on-brand. The columns contract is the same one cardList grows into cards — learn it once, use it four times. At render the prop is the plain array either way; here it draws the breakdown bar this pattern most often feeds.",
    capabilities: { tier: "core" },
    tags: ["controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Edit Segments: rows, not JSON. Add a row — its color arrives from the palette. The bar re-proportions from the plain array.",
    },
    propsSchema,
    defaultProps: {
        segments: DEFAULT_SEGMENTS,
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c;
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const segments = parseSegments(props.segments);
        const { width, height } = ctx.target;
        const page = ((_a = props.pageColor) !== null && _a !== void 0 ? _a : "#1c2833");
        // The breakdown bar: one band per row, proportional to value (Hamilton-
        // scaled to a fixed 100-slot budget), plus a legend row per segment.
        const total = segments.reduce((a, s) => a + s.value, 0);
        const bar = String((0, dsl_stdlib_1.weightedSplit)(segments.map((s) => s.value), "col", {
            precision: 100,
            claimants: segments.map(() => "1"),
        }));
        // Legend: [pad, then per segment: color chip, gap, label]. Weights are
        // RELATIVE — a split's cells share the width by proportion, so the row
        // needs no padding out to a round total.
        const legendW = Math.max(6, Math.floor(84 / segments.length) - 4);
        const legendRow = String((0, dsl_stdlib_1.weightedSplit)([6, ...segments.flatMap(() => [3, 1, legendW])], "col", {
            mode: "literal",
            claimants: ["-", ...segments.flatMap(() => ["1", "-", "1"])],
        }));
        const rows = String((0, dsl_stdlib_1.weightedSplit)([14, 30, 8, 14, 34], "row", {
            mode: "literal",
            claimants: ["-", bar, "-", legendRow, "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const sources = [];
        for (const [i, s] of segments.entries()) {
            sources.push((0, template_utils_1.makeColorTile)(((_b = s.color) !== null && _b !== void 0 ? _b : exports.SEGMENT_PALETTE[i % exports.SEGMENT_PALETTE.length])));
        }
        for (const [i, s] of segments.entries()) {
            sources.push((0, template_utils_1.makeColorTile)(((_c = s.color) !== null && _c !== void 0 ? _c : exports.SEGMENT_PALETTE[i % exports.SEGMENT_PALETTE.length])));
            sources.push((0, template_utils_1.svgLabel)(`${s.label} ${Math.round((s.value / total) * 100)}%`, (width * 0.8) / segments.length, height * 0.12, {
                color: "#b9c4cf",
                maxPx: Math.round(height * 0.022),
                maxLines: 2,
                vAlign: "middle",
            }));
        }
        const heading = (0, svg_text_1.fitSvgText)(`ROW EDITORS - ${segments.length} rows, edited as a form, rendered as proportions`, width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.034), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            "flavor objectRows + columns [text, number, color] - a repeating-row form instead of a JSON box",
            "palette seeds NEW rows' colors - and at render the prop is the plain array either way",
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
        title: "Row Editors",
        lines: [
            "flavor objectRows + columns turns an array-of-objects json prop into a repeating-row form - one row per entry, add and remove, right widget per cell.",
            "palette seeds the color cell of NEW rows, so additions arrive on-brand instead of black.",
            "Same columns contract cardList (lesson 80) grows into cards - learn it once. Render gets the plain array either way and draws the breakdown.",
        ],
        explore: [
            "Add a row - watch the palette seed its color",
            "Change a Share number - the bar re-proportions",
        ],
    }),
});
exports.default = exports.RowEditorsV1;
