"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberDisplayV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/number-display/v1";
const HOLD_MIN = 500;
const HOLD_MAX = 10000;
const FADE_MIN = 0;
const FADE_MAX = 1000;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    holdMs: {
        type: "number",
        required: false,
        description: "Hold per slide. Stored in ms (the canonical unit render reads); the editor shows seconds by default and the unit chip cycles the family.",
        meta: {
            constraints: { min: HOLD_MIN, max: HOLD_MAX },
            control: { unit: "ms", displayUnit: "s", step: 100 },
            ui: { label: "Hold", order: 1 },
        },
    },
    fadeMs: {
        type: "number",
        required: false,
        description: "Crossfade between slides. Also stored in ms — but the display is LOCKED to ms, because cycling this tiny value's chip to hours would be a silent catastrophe.",
        meta: {
            constraints: { min: FADE_MIN, max: FADE_MAX },
            control: { unit: "ms", displayUnit: "ms", lockDisplayUnit: true, step: 50 },
            ui: { label: "Fade", order: 2 },
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
exports.NumberDisplayV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "31 · Number Display",
    version: 1,
    description: "The stored unit and the shown unit are different decisions: unit names the canonical scale (ms here — what props, files, and render carry), displayUnit converts only the editor's field (2400 shows as 2.4 s), lockDisplayUnit freezes the unit chip where a swap could silently rescale a value, and step is authored in the canonical unit. Render reads canonical ms and prints it — presentation never leaks into meaning.",
    capabilities: { tier: "core" },
    tags: ["controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Hold shows seconds — cycle its unit chip. Fade's chip won't cycle (locked). Save the file: both stored in plain ms either way.",
    },
    propsSchema,
    defaultProps: {
        holdMs: 2400,
        fadeMs: 250,
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c;
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const holdMs = (_a = props.holdMs) !== null && _a !== void 0 ? _a : 2400;
        if (typeof holdMs !== "number" || !Number.isFinite(holdMs) || holdMs < HOLD_MIN || holdMs > HOLD_MAX) {
            throw new Error(`${ID}: holdMs must be a number in [${HOLD_MIN}, ${HOLD_MAX}].`);
        }
        const fadeMs = (_b = props.fadeMs) !== null && _b !== void 0 ? _b : 250;
        if (typeof fadeMs !== "number" || !Number.isFinite(fadeMs) || fadeMs < FADE_MIN || fadeMs > FADE_MAX) {
            throw new Error(`${ID}: fadeMs must be a number in [${FADE_MIN}, ${FADE_MAX}].`);
        }
        const { width, height } = ctx.target;
        const page = ((_c = props.pageColor) !== null && _c !== void 0 ? _c : "#1c2833");
        // A slide-timing strip: hold band + fade band, proportional in ms —
        // canonical values drawn as canonical geometry.
        const total = holdMs + fadeMs;
        const holdW = Math.max(2, Math.round((holdMs / total) * 88));
        const fadeW = Math.max(1, 88 - holdW);
        const strip = String((0, dsl_stdlib_1.weightedSplit)([6, holdW, fadeW, 6], "col", {
            mode: "literal",
            claimants: ["-", "1{1}", "1{1}", "-"],
        }));
        const rows = String((0, dsl_stdlib_1.weightedSplit)([18, 20, 62], "row", {
            mode: "literal",
            claimants: ["-", strip, "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const sources = [
            (0, template_utils_1.makeColorTile)("#2e86c1"),
            (0, template_utils_1.svgLabel)(`hold ${holdMs}ms`, width * 0.4, height * 0.14, {
                color: "#eaeef2",
                maxPx: Math.round(height * 0.032),
                vAlign: "middle",
            }),
            (0, template_utils_1.makeColorTile)("#1d5378"),
            (0, template_utils_1.svgLabel)(`fade ${fadeMs}ms`, width * 0.2, height * 0.14, {
                color: "#b9c4cf",
                maxPx: Math.round(height * 0.024),
                maxLines: 2,
                vAlign: "middle",
            }),
        ];
        const heading = (0, svg_text_1.fitSvgText)("NUMBER DISPLAY - stored in ms, shown in seconds, meaning never leaks", width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.032), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            'unit "ms" = the canonical scale; displayUnit "s" converts only the FIELD; step is authored canonical (100ms per click)',
            "fade locks its unit chip - a swap to hours on a 250ms value would be a silent catastrophe; the chip shows, but won't cycle",
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
        title: "Number Display",
        lines: [
            "unit names the canonical scale - props, files, and render always carry it. displayUnit converts only the editor's field.",
            "lockDisplayUnit freezes the unit chip where a swap could silently rescale a value - it shows the unit but stops being a toggle.",
            "step is authored in the CANONICAL unit: step 100 on an ms prop is a tenth-of-a-second click, whatever the display shows.",
        ],
        explore: [
            "Cycle Hold's unit chip; try Fade's - locked",
            "Save the file - both numbers are plain ms",
        ],
    }),
});
exports.default = exports.NumberDisplayV1;
