"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DualPropsV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/dual-props/v1";
const HOLD_MIN = 1.2;
const HOLD_MAX = 12;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    holdSec: {
        type: "number",
        required: false,
        meta: {
            constraints: { min: HOLD_MIN, max: HOLD_MAX },
            ui: { consumer: "agent" },
        },
    },
    reduceMotion: {
        type: "boolean",
        required: false,
        meta: {
            ui: { consumer: "agent" },
        },
    },
    speed: {
        type: "number",
        required: false,
        meta: {
            constraints: { min: 1, max: 10 },
            control: {
                flavor: "slider",
                step: 1,
                syncsTo: [
                    {
                        prop: "holdSec",
                        map: { kind: "linear", humanMin: 1, humanMax: 10, propMin: HOLD_MAX, propMax: HOLD_MIN },
                    },
                ],
            },
            ui: { consumer: "human" },
        },
    },
    animate: {
        type: "boolean",
        required: false,
        meta: {
            control: {
                syncsTo: [{ prop: "reduceMotion", map: { kind: "boolInvert" } }],
            },
            ui: { consumer: "human" },
        },
    },
    pageColor: {
        type: "string",
        required: false,
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
        },
    },
});
exports.DualPropsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: { tier: "core" },
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Drag Speed and watch holdSec move inversely under Agent props. Flip Animate — reduceMotion flips the other way. Render only ever saw the canonical pair.",
    },
    propsSchema,
    defaultProps: {
        holdSec: 4.8,
        reduceMotion: false,
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c;
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        // THE POINT: only the canonical pair is read. `speed` and `animate`
        // are deliberately never touched here.
        const holdSec = (_a = props.holdSec) !== null && _a !== void 0 ? _a : 4.8;
        if (typeof holdSec !== "number" || !Number.isFinite(holdSec) || holdSec < HOLD_MIN || holdSec > HOLD_MAX) {
            throw new Error(`${ID}: holdSec must be a number in [${HOLD_MIN}, ${HOLD_MAX}].`);
        }
        const reduceMotion = (_b = props.reduceMotion) !== null && _b !== void 0 ? _b : false;
        if (typeof reduceMotion !== "boolean") {
            throw new Error(`${ID}: reduceMotion must be a boolean.`);
        }
        const { width, height } = ctx.target;
        const page = ((_c = props.pageColor) !== null && _c !== void 0 ? _c : "#1c2833");
        // The hold visualized: a track with the fill proportional to holdSec,
        // plus the motion flag as a state chip.
        const fill = Math.max(2, Math.round(((holdSec - HOLD_MIN) / (HOLD_MAX - HOLD_MIN)) * 88));
        const track = String((0, dsl_stdlib_1.weightedSplit)([6, fill, Math.max(1, 88 - fill), 6], "col", {
            mode: "literal",
            claimants: ["-", "1", "1", "-"],
        }));
        const chipRow = String((0, dsl_stdlib_1.weightedSplit)([6, 30, 2, 40, 22], "col", {
            mode: "literal",
            claimants: ["-", "1{1}", "-", "1", "-"],
        }));
        const rows = String((0, dsl_stdlib_1.weightedSplit)([16, 16, 8, 12, 48], "row", {
            mode: "literal",
            claimants: ["-", track, "-", chipRow, "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const sources = [
            (0, template_utils_1.makeColorTile)("#2e86c1"),
            (0, template_utils_1.makeColorTile)("#1b3a52"),
            (0, template_utils_1.makeColorTile)((reduceMotion ? "#5d6d7e" : "#27ae60")),
            (0, template_utils_1.svgLabel)(reduceMotion ? "motion reduced" : "motion on", width * 0.28, height * 0.1, {
                color: "#eaeef2",
                maxPx: Math.round(height * 0.028),
                vAlign: "middle",
            }),
            // The readout DRAWS the number, so it is that prop's handle: double-click
            // the label in Make and the inline form edits `holdSec`.
            (0, template_utils_1.bindProp)((0, template_utils_1.svgLabel)(`holdSec = ${holdSec}`, width * 0.36, height * 0.1, {
                color: "#b9c4cf",
                maxPx: Math.round(height * 0.03),
                vAlign: "middle",
            }), "holdSec"),
        ];
        const heading = (0, svg_text_1.fitSvgText)("DUAL PROPS - the dial is a view; the canonical value is the only truth", width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.032), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            'consumer "agent" = the hard form, in the Agent props escape; consumer "human" + syncsTo = the friendly derived view',
            "the human key never reaches render - this document was drawn from holdSec and reduceMotion alone",
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
        title: "Dual Props",
        lines: [
            'Canonical props (consumer "agent") hold what render reads, surfaced raw under Agent props. Friendly props (consumer "human") are derived views.',
            "syncsTo binds a human control to canonical props through a map - linear with invertible ranges, boolInvert, or identity.",
            "The human key never reaches render. Dials stay friendly, files stay exact, and the two can never disagree: only one is real.",
        ],
        explore: [
            "Drag Speed - holdSec moves inversely under Agent props",
            "Flip Animate - reduceMotion flips the other way",
        ],
    }),
});
exports.default = exports.DualPropsV1;
