"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoScenesV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/pipelines/two-scenes/v1";
const TRANSITIONS = ["cut", "fade"];
const SCENE_A = "#EF7525";
const SCENE_B = "#2e86c1";
const INK = "#0b0e11";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    transition: {
        type: "string",
        required: false,
        description: "\"cut\": a hard boundary, and the output is exactly A + B. \"fade\": a crossfade that OVERLAPS the two scenes, so the output is A + B minus the overlap.",
        meta: { constraints: { oneOf: [...TRANSITIONS] }, ui: { label: "Transition" } },
    },
    transitionMs: {
        type: "number",
        required: false,
        description: "Overlap length in ms. This is time the stitched output LOSES — the planner clamps it to the shorter scene.",
        meta: {
            constraints: { min: 0, max: 2000 },
            control: { step: 100 },
            ui: { label: "Overlap ms" },
        },
    },
});
/** One scene: a colour field with its name on it. */
function scene(label, color, width, height, durationMs, fps) {
    return {
        kind: "mosaic_document",
        version: 1,
        m0: (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([4, 1], "row", { claimants: ["1", "1"] })), ID),
        assets: {},
        // A step is a whole document: it declares its own canvas and length.
        size: { width, height },
        fps,
        durationMs,
        backgroundColor: color,
        sources: [
            (0, template_utils_1.makeColorTile)(color),
            (0, svg_text_1.svgLabel)(label, width, Math.round(height / 5), {
                maxPx: Math.round(height * 0.09),
                maxLines: 1,
                color: INK,
            }),
        ],
    };
}
exports.TwoScenesV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "42 · Two Scenes",
    version: 1,
    description: "The smallest pipeline: two documents concatenated into one file. Shows that a step IS a document (own m0, own canvas, own exact durationMs) and the transition OVERLAP rule — a d-ms crossfade makes the output A + B − d, not A + B.",
    capabilities: { tier: "core" },
    tags: ["pipelines", "time", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Render it: two scenes, one file. Raise Overlap ms and the output gets SHORTER.",
    },
    propsSchema,
    defaultProps: { transition: "fade", transitionMs: 300 },
    async render(props, ctx) {
        var _a, _b;
        const transition = (_a = props.transition) !== null && _a !== void 0 ? _a : "fade";
        const transitionMs = (_b = props.transitionMs) !== null && _b !== void 0 ? _b : 300;
        const { width, height, fps } = ctx.target;
        // TIME COMES FROM ctx.target, exactly like size does. A pipeline must
        // STITCH TO ctx.target.durationMs, and the stitch is
        // `Σ output-step durations − Σ overlap` — so the scenes are derived,
        // never chosen. Pick your own numbers and the render is short.
        const total = ctx.target.durationMs;
        const overlap = transition === "fade" ? transitionMs : 0;
        const problems = [];
        if (!TRANSITIONS.includes(transition)) {
            problems.push(`transition must be one of ${TRANSITIONS.join(" | ")}, got ${JSON.stringify(transition)}`);
        }
        if (!Number.isFinite(transitionMs) || transitionMs < 0 || transitionMs > 2000) {
            problems.push(`transitionMs must be 0-2000, got ${JSON.stringify(transitionMs)}`);
        }
        else if (overlap >= total) {
            problems.push(`transitionMs ${transitionMs} must be shorter than the clip (${total}ms) - the overlap would eat both scenes`);
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        // Each scene carries half the overlap on top of its visible time, so the
        // two of them stitch back down to exactly `total`.
        const sceneA = Math.ceil((total + overlap) / 2);
        const sceneB = total + overlap - sceneA;
        const captionA = `scene A - renders ${sceneA}ms`;
        const captionB = overlap > 0
            ? `scene B - renders ${sceneB}ms - stitched ${sceneA}+${sceneB}-${overlap} = ${total}ms`
            : `scene B - renders ${sceneB}ms - cut, so stitched = ${total}ms`;
        return {
            kind: "mosaic_pipeline",
            version: 1,
            // "single" is the default; spelled out because it is half the lesson.
            emit: "single",
            size: { width, height },
            fps,
            steps: [
                {
                    name: "scene-a",
                    durationMs: sceneA,
                    transitionToNext: transition === "fade"
                        ? { type: "fade", durationMs: transitionMs }
                        : { type: "cut" },
                    file: scene(captionA, SCENE_A, width, height, sceneA, fps),
                },
                {
                    name: "scene-b",
                    durationMs: sceneB,
                    file: scene(captionB, SCENE_B, width, height, sceneB, fps),
                },
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Two Scenes",
        lines: [
            "A template may return a PIPELINE: a sequence of documents, each with its own m0, sources and exact durationMs.",
            "That is how time enters. One document is one geometry, so anything that changes over the clip needs a second document.",
            "emit \"single\" concatenates the steps. THE OVERLAP RULE: a d-ms transition overlaps them, so the output is A + B - d.",
            "Steps at different canvas sizes fall back to a hard cut - xfade needs matching dimensions.",
        ],
        explore: [
            "Raise Overlap ms - the rendered file gets SHORTER",
            "Switch Transition to cut: output is exactly A + B",
            "Set Overlap past Scene ms and read the refusal",
        ],
    }),
});
exports.default = exports.TwoScenesV1;
