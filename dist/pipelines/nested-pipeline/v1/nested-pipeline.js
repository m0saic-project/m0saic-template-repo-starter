"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestedPipelineV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/pipelines/nested-pipeline/v1";
const LOOPS = ["loop", "freeze", "cut"];
const CHILD_REF = "reel";
const PANEL = "#17202a";
const SCENE_A = "#EF7525";
const SCENE_B = "#2e86c1";
const INK = "#0b0e11";
const INK_DIM = "#7f8c9b";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    innerMs: {
        type: "number",
        required: false,
        description: "Total length of the nested pipeline (two scenes, split evenly). Shorter than the slot on purpose, so the fallback is visible.",
        meta: {
            constraints: { min: 200, max: 4000 },
            control: { step: 100 },
            ui: { label: "Inner ms" },
        },
    },
    loopMode: {
        type: "string",
        required: false,
        description: "What fills the gap when the inner pipeline is SHORTER than the slot: loop repeats it, freeze holds its last frame, cut goes black.",
        meta: { constraints: { oneOf: [...LOOPS] }, ui: { label: "Loop mode" } },
    },
});
/** One inner scene. */
function scene(label, color, width, height, durationMs, fps) {
    return {
        kind: "mosaic_document",
        version: 1,
        m0: (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([4, 1], "row", { claimants: ["1", "1"] })), `${ID}:scene`),
        assets: {},
        size: { width, height },
        fps,
        durationMs,
        backgroundColor: color,
        sources: [
            (0, template_utils_1.makeColorTile)(color),
            (0, svg_text_1.svgLabel)(label, width, Math.round(height / 5), {
                maxPx: Math.round(height * 0.08),
                maxLines: 1,
                color: INK,
            }),
        ],
    };
}
exports.NestedPipelineV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "53 · Nested Pipeline",
    version: 1,
    description: "A children entry may be a PIPELINE: it renders first and the parent consumes its stitched output as one tile — scene-within-scene without time in the m0. The slot's duration and canvas win, emit:\"multi\" downgrades, and loopMode fills any shortfall.",
    capabilities: { tier: "core" },
    tags: ["pipelines", "children", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "The left tile is a whole pipeline. Make Inner ms shorter than Slot ms and flip Loop mode.",
    },
    propsSchema,
    defaultProps: { innerMs: 1200, loopMode: "loop" },
    async render(props, ctx) {
        var _a, _b;
        const innerMs = (_a = props.innerMs) !== null && _a !== void 0 ? _a : 1200;
        const loopMode = (_b = props.loopMode) !== null && _b !== void 0 ? _b : "loop";
        const problems = [];
        if (!Number.isFinite(innerMs) || innerMs < 200 || innerMs > 4000) {
            problems.push(`innerMs must be 200-4000, got ${JSON.stringify(innerMs)}`);
        }
        if (!LOOPS.includes(loopMode)) {
            problems.push(`loopMode must be one of ${LOOPS.join(" | ")}, got ${JSON.stringify(loopMode)}`);
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height, fps } = ctx.target;
        // The SLOT is the render's own duration — a returned document must match
        // ctx.target exactly, so there is no slot length to invent.
        const slotMs = ctx.target.durationMs;
        const slotW = Math.round(width / 2);
        const sceneMs = Math.round(innerMs / 2);
        // The nested pipeline declares its OWN geometry triple rather than
        // inheriting whatever the parent stamped — the stamp hazard.
        const reel = {
            kind: "mosaic_pipeline",
            version: 1,
            // Declared, and ignored under nesting: multi is top-level only. Saying
            // it out loud is the point — the downgrade is SILENT.
            emit: "single",
            size: { width: slotW, height },
            fps,
            durationMs: innerMs,
            steps: [
                {
                    name: "reel-a",
                    durationMs: sceneMs,
                    transitionToNext: { type: "fade", durationMs: Math.min(200, Math.floor(sceneMs / 2)) },
                    file: scene("inner A", SCENE_A, slotW, height, sceneMs, fps),
                },
                {
                    name: "reel-b",
                    durationMs: sceneMs,
                    file: scene("inner B", SCENE_B, slotW, height, sceneMs, fps),
                },
            ],
        };
        const shortfall = Math.max(0, slotMs - innerMs);
        const caption = shortfall > 0
            ? `inner ${innerMs}ms in a ${slotMs}ms slot - "${loopMode}" fills the ${shortfall}ms remainder`
            : `inner ${innerMs}ms in a ${slotMs}ms slot - no remainder, so loopMode never fires`;
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", {
                claimants: [String((0, dsl_stdlib_1.weightedSplit)([1, 1], "col", { claimants: ["1", "1"] })), "1"],
            })), ID),
            assets: {},
            backgroundColor: PANEL,
            children: { [CHILD_REF]: reel },
            sources: [
                // A pipeline behind one tile. The playback here is what fills any gap.
                {
                    type: "mosaic",
                    ref: CHILD_REF,
                    placement: { fit: "contain" },
                    playback: { loopMode },
                },
                (0, template_utils_1.makeColorTile)("#101418"),
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.028),
                    maxLines: 2,
                    color: INK_DIM,
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Nested Pipeline",
        lines: [
            "A children entry may be a PIPELINE: it renders first and the parent consumes its stitched output as one tile.",
            "THE SLOT WINS on duration - steps are summed and trimmed, and playback.loopMode fills any shortfall.",
            "The slot wins on CANVAS too, and emit \"multi\" silently downgrades: multi is a top-level concept.",
            "The stamp hazard: declare the nested pipeline's own size, fps and durationMs, or it inherits whatever slot it lands in.",
        ],
        explore: [
            "Make Inner ms shorter than Slot ms, then flip Loop mode",
            "Match them exactly - loopMode stops mattering",
            "Open the structure dock: a whole pipeline under one tile",
        ],
    }),
});
exports.default = exports.NestedPipelineV1;
