"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeV1 = void 0;
exports.parseHold = parseHold;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/range/v1";
const MIN_S = 1;
const MAX_S = 10;
/** Normalize the three legal shapes; reject everything else loudly. */
function parseHold(raw) {
    const value = raw !== null && raw !== void 0 ? raw : 4;
    const num = (v, at) => {
        if (typeof v !== "number" || !Number.isFinite(v) || v < MIN_S || v > MAX_S) {
            throw new Error(`${ID}: ${at} must be a number in [${MIN_S}, ${MAX_S}].`);
        }
        return v;
    };
    if (typeof value === "number") {
        return { intent: "flat", value: num(value, "hold") };
    }
    if (typeof value === "object" && value !== null) {
        const r = value;
        const low = num(r.low, "hold.low");
        const high = num(r.high, "hold.high");
        if (low > high) {
            throw new Error(`${ID}: hold.low must not exceed hold.high.`);
        }
        if (r.once !== undefined && r.once !== true) {
            throw new Error(`${ID}: hold.once is either true or absent — never false.`);
        }
        return { intent: "range", low, high, once: r.once === true };
    }
    throw new Error(`${ID}: hold must be a number or { low, high, once? }.`);
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    hold: {
        type: "json",
        required: false,
        description: "Seconds each slide holds. Flat number = exactly this; { low, high } = vary per slide; add once: true = pick one value and keep it. The control records intent; the template owns what a 'use' means.",
        meta: {
            constraints: { min: MIN_S, max: MAX_S },
            control: {
                flavor: "range",
                range: {
                    collapsible: true,
                    allowOnce: true,
                    onceLabel: "Pick once per render",
                    min: MIN_S,
                    max: MAX_S,
                },
                step: 0.5,
            },
            ui: { label: "Hold", order: 1 },
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
exports.RangeV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "25 · Range",
    version: 1,
    description: "A number allowed to be a range: flavor range gives one prop three intents, readable off the value shape — a flat number (use exactly this), { low, high } (sample fresh per use), or { low, high, once: true } (sample one value, reuse it; once is never written false). collapsible renders the flat/range toggle, allowOnce the pick-once toggle with its onceLabel. The control records intent only; this render VISUALIZES it on a scale instead of sampling, because dice belong to templates with a seed prop.",
    capabilities: { tier: "core" },
    tags: ["controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Toggle Hold between flat and range, then flip Pick once — the value shape changes in the saved file, and the scale re-draws the intent.",
    },
    propsSchema,
    defaultProps: {
        hold: { low: 3, high: 6 },
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
        const hold = parseHold(props.hold);
        const { width, height } = ctx.target;
        const bandHex = (_a = props.bandColor) !== null && _a !== void 0 ? _a : "#2e86c1";
        const band = bandHex;
        const page = ((_b = props.pageColor) !== null && _b !== void 0 ? _b : "#1c2833");
        // The scale: MIN..MAX seconds across a 90-slot band. Flat = a thin
        // marker at the value; range = a lit span low..high.
        const slot = (v) => Math.round(((v - MIN_S) / (MAX_S - MIN_S)) * 90);
        const lo = hold.intent === "flat" ? slot(hold.value) : slot(hold.low);
        const hi = hold.intent === "flat" ? Math.min(90, lo + 2) : Math.max(slot(hold.high), lo + 1);
        const scale = String((0, dsl_stdlib_1.weightedSplit)([5, Math.max(1, lo), Math.max(1, hi - lo), Math.max(1, 90 - hi), 5].map((w) => Math.max(1, w)), "col", { mode: "literal", claimants: ["-", "1", "1", "1", "-"] }));
        const labelText = hold.intent === "flat"
            ? `hold exactly ${hold.value}s`
            : `hold ${hold.low}s to ${hold.high}s${hold.once ? " - picked once, then reused" : " - fresh per slide"}`;
        const labelRow = String((0, dsl_stdlib_1.weightedSplit)([5, 90, 5], "col", {
            mode: "literal",
            claimants: ["-", "1", "-"],
        }));
        const rows = String((0, dsl_stdlib_1.weightedSplit)([16, 18, 8, 12, 46], "row", {
            mode: "literal",
            claimants: ["-", scale, "-", labelRow, "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const dim = shade(bandHex);
        const sources = [
            (0, template_utils_1.makeColorTile)(dim),
            (0, template_utils_1.makeColorTile)(band),
            (0, template_utils_1.makeColorTile)(dim),
            (0, template_utils_1.svgLabel)(labelText, width * 0.8, height * 0.1, {
                color: "#eaeef2",
                maxPx: Math.round(height * 0.036),
                vAlign: "middle",
            }),
        ];
        const shapeText = hold.intent === "flat"
            ? `${hold.intent === "flat" ? hold.value : ""}`
            : `{ low: ${hold.low}, high: ${hold.high}${hold.once ? ", once: true" : ""} }`;
        const heading = (0, svg_text_1.fitSvgText)(`RANGE - one prop, three intents (this file carries: ${hold.intent === "flat" ? "a flat number" : shapeText})`, width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.032), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            "flat number = exactly this; { low, high } = fresh per use; add once: true = pick one and keep it (never written false)",
            "the control records INTENT - what a use means belongs to the template; sampling needs a seed prop (see seeded-shuffle)",
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
        title: "Range",
        lines: [
            "flavor range: one prop, three intents by value shape - a flat number, { low, high }, or { low, high, once: true }. once is never written false.",
            "collapsible renders the flat/range toggle; allowOnce adds pick-once with its onceLabel. The control records intent only.",
            "What a 'use' means belongs to the template - and sampling belongs to templates with a seed prop. This one visualizes instead.",
        ],
        explore: [
            "Toggle flat vs range, then Pick once - watch the value shape",
            "Save and read the file - three different shapes, one prop",
        ],
    }),
});
exports.default = exports.RangeV1;
