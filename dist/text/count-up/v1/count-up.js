"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountUpV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/text/count-up/v1";
const PANEL = "#17202a";
const INK = "#ecf0f1";
const INK_DIM = "#7f8c9b";
const MAX_VALUE = 1000000000;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    value: {
        type: "number",
        required: false,
        description: "The number the counter ramps up to over the clip's duration.",
        meta: {
            constraints: { min: 0, max: MAX_VALUE },
            control: { step: 1 },
            ui: { label: "Value" },
        },
    },
    suffix: {
        type: "string",
        required: false,
        description: "Text drawn after the number. Kept literal — animateNumbersInText only animates digit runs, so \"stars\" stays \"stars\".",
        meta: { control: { placeholder: "stars" }, ui: { label: "Suffix" } },
    },
    label: {
        type: "string",
        required: false,
        description: "Static label under the counter — an svg source, because it never changes.",
        meta: { control: { placeholder: "since launch" }, ui: { label: "Label" } },
    },
    freezeAsStill: {
        type: "boolean",
        required: false,
        description: "Render the counter as an image instead of video. The expression still compiles — it just never gets a second frame to evaluate on.",
        meta: { ui: { label: "Freeze as a still" } },
    },
});
exports.CountUpV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "30 · Count Up",
    version: 1,
    description: "A drawtext counter that ramps 0 → value over the clip: content.kind \"expr\" + eval \"frame\" + renderMode \"video\", the three fields that must agree. Flip Freeze as a still to see the quiet failure when one of them doesn't.",
    capabilities: { tier: "core" },
    tags: ["text", "expr", "animation", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 3000,
        note: "Press play — the number ramps over the whole clip. Then flip Freeze as a still.",
    },
    propsSchema,
    defaultProps: {
        value: 1200,
        suffix: "stars",
        label: "since launch",
        freezeAsStill: false,
    },
    async render(props, ctx) {
        var _a, _b, _c, _d;
        const value = (_a = props.value) !== null && _a !== void 0 ? _a : 1200;
        const suffix = ((_b = props.suffix) !== null && _b !== void 0 ? _b : "stars").trim();
        const label = ((_c = props.label) !== null && _c !== void 0 ? _c : "since launch").trim();
        const freezeAsStill = (_d = props.freezeAsStill) !== null && _d !== void 0 ? _d : false;
        const problems = [];
        if (!Number.isFinite(value) || value < 0 || value > MAX_VALUE) {
            problems.push(`value must be 0-${MAX_VALUE}, got ${JSON.stringify(value)}`);
        }
        else if (!Number.isInteger(value)) {
            // %{eif:…:d} prints an integer — a fractional target would count up to
            // a number the counter can never show.
            problems.push(`value must be a whole number (the eif expansion prints integers), got ${value}`);
        }
        if (suffix.length > 24)
            problems.push("suffix must be 24 characters or fewer");
        if (label.length > 32)
            problems.push("label must be 32 characters or fewer");
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height } = ctx.target;
        const durationSec = ctx.target.durationMs / 1000;
        // The whole animation, in one call: digits become an eased ramp, the
        // literal words around them are escaped and left alone.
        const counterText = suffix.length > 0 ? `${value} ${suffix}` : `${value}`;
        const expr = (0, template_utils_1.animateNumbersInText)(counterText, { durationSec });
        // A drawtext source paints an OPAQUE background (black unless told
        // otherwise), so it carries the panel fill itself instead of sitting on
        // a color tile — one source, not two.
        const counter = {
            type: "text",
            renderMode: { kind: freezeAsStill ? "image" : "video" },
            visual: { backgroundColor: (0, template_utils_1.solidBackground)(PANEL) },
            layers: [
                {
                    content: { kind: "expr", expr, eval: "frame" },
                    style: { fontSize: Math.round(height * 0.22), fontColor: INK },
                },
            ],
        };
        const caption = freezeAsStill
            ? `renderMode "image": one frame, so the counter is frozen at t=0 - the expr never ticks`
            : `renderMode "video": eval "frame" re-evaluates the expr every frame over ${durationSec}s`;
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([4, 1, 1], "row", { claimants: ["1", "1", "1"] })), ID);
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                counter,
                (0, svg_text_1.svgLabel)(label, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.06),
                    maxLines: 1,
                    color: INK,
                }),
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.03),
                    maxLines: 2,
                    color: freezeAsStill ? "#e67e22" : INK_DIM,
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Count Up",
        lines: [
            "content.kind \"expr\" hands ffmpeg an expression instead of a string - the only way to get text that changes over time.",
            "Three fields must agree: eval \"frame\", renderMode \"video\", and no svg rasterizer. Each fails quietly on its own.",
            "animateNumbersInText turns every digit run into an eased ramp and leaves the words around it alone.",
            "The label under it is an ordinary svg source: reach for drawtext where you need time, stay baked elsewhere.",
        ],
        explore: [
            "Press play and watch the ramp ease out",
            "Flip Freeze as a still - same expression, frozen at frame 0",
            "Type a suffix with its own number and both count",
            "Change the Device duration - the ramp still lands on time",
        ],
    }),
});
exports.default = exports.CountUpV1;
