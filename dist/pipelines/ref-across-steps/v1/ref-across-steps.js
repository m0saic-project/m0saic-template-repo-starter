"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefAcrossStepsV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/pipelines/ref-across-steps/v1";
const HERO_BG = "#EF7525";
const PANEL = "#17202a";
const INK = "#17202a";
const INK_DIM = "#7f8c9b";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    word: {
        type: "string",
        required: false,
        description: "Rendered ONCE in the producer step. The consumer step mirrors those pixels back instead of drawing them again.",
        meta: { control: { placeholder: "STEP 0" }, ui: { label: "Word" } },
    },
    keepProducer: {
        type: "boolean",
        required: false,
        description: "Ship the producer step as a file too. Off, it is intermediate: it renders (the ref needs it) but never reaches the deliverable.",
        meta: { ui: { label: "Keep producer output" } },
    },
});
/** Step 0 — renders the hero and publishes a pointer to it. */
function producerStep(word, width, height, fps, stepIndex, durationMs) {
    const hero = {
        type: "text",
        renderMode: { kind: "image" },
        visual: { backgroundColor: (0, template_utils_1.solidBackground)(HERO_BG) },
        layers: [
            {
                content: { kind: "literal", text: word },
                style: { fontSize: Math.round(height * 0.18), fontColor: INK },
            },
        ],
    };
    const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([4, 1], "row", { claimants: ["1", "1"] })), `${ID}:producer`);
    // The producer ASKS its own m0 which cell the hero landed in — the first
    // painted frame in walk order — so the handle stays right even if this
    // layout changes underneath it.
    const heroKey = (0, dsl_stdlib_1.findStableKeys)(m0, (f) => f.kind === "frame", { width, height })[0];
    return {
        kind: "mosaic_document",
        version: 1,
        m0,
        assets: {},
        size: { width, height },
        fps,
        durationMs,
        backgroundColor: PANEL,
        // THE HANDOFF: the producer stamps its own coordinates, so a consumer
        // never has to guess (and a v2 can move the cell without breaking it).
        variables: {
            hero: { stepIndex, flattenedStableKey: heroKey },
        },
        sources: [
            hero,
            (0, svg_text_1.svgLabel)("step 0 - rendered here", width, Math.round(height / 5), {
                maxPx: Math.round(height * 0.04),
                maxLines: 1,
                color: INK_DIM,
            }),
        ],
    };
}
/** Step 1 — mirrors step 0's hero beside a fresh tile. */
function consumerStep(width, height, fps, producerIndex, durationMs, heroKey) {
    const top = String((0, dsl_stdlib_1.weightedSplit)([1, 1], "col", { claimants: ["1", "1"] }));
    return {
        kind: "mosaic_document",
        version: 1,
        m0: (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: [top, "1"] })), `${ID}:consumer`),
        assets: {},
        size: { width, height },
        fps,
        durationMs,
        backgroundColor: PANEL,
        sources: [
            // The back-edge. stepIndex must be strictly earlier than this step.
            {
                type: "ref",
                flattenedStableKey: heroKey,
                stepIndex: producerIndex,
                placement: { fit: "contain" },
            },
            (0, template_utils_1.makeColorTile)("#2e86c1"),
            (0, svg_text_1.svgLabel)(`step 1 - left cell is step ${producerIndex}'s ${heroKey}, mirrored (not re-rendered)`, width, Math.round(height / 6), { maxPx: Math.round(height * 0.028), maxLines: 2, color: INK_DIM }),
        ],
    };
}
exports.RefAcrossStepsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "60 · Ref Across Steps",
    version: 1,
    description: "A ref with stepIndex is a BACK-EDGE: a later step shows an earlier step's exact rendered pixels, no re-render. Back-edges only (forward refs are an error), plus the handoff idiom where the producer self-stamps {stepIndex, flattenedStableKey} for the consumer to spread.",
    capabilities: { tier: "core" },
    tags: ["pipelines", "refs", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 1400,
        format: { kind: "video", container: "mp4" },
        note: "Two steps: the second one's left cell IS the first one's pixels.",
    },
    propsSchema,
    defaultProps: { word: "STEP 0", keepProducer: false },
    async render(props, ctx) {
        var _a, _b;
        const word = ((_a = props.word) !== null && _a !== void 0 ? _a : "STEP 0").trim();
        const keepProducer = (_b = props.keepProducer) !== null && _b !== void 0 ? _b : false;
        if (word.length < 1 || word.length > 12) {
            throw new Error(`${ID}: word must be 1-12 characters, got ${JSON.stringify(word)}.`);
        }
        const { width, height, fps } = ctx.target;
        const producerIndex = 0;
        // The stitch invariant counts OUTPUT steps only, so an intermediate
        // producer is free: the consumer alone has to fill ctx.target.durationMs.
        // Ship the producer too and they split it — the same clip, two files'
        // worth of visible time.
        const total = ctx.target.durationMs;
        const consumerMs = keepProducer ? Math.ceil(total / 2) : total;
        const producerMs = keepProducer ? total - consumerMs : total;
        // Build the producer first, then READ the handle it published — exactly
        // what a downstream template does with ctx.upstreamVariables.
        const producer = producerStep(word, width, height, fps, producerIndex, producerMs);
        const heroKey = String(producer.variables.hero.flattenedStableKey);
        return {
            kind: "mosaic_pipeline",
            version: 1,
            emit: "single",
            size: { width, height },
            fps,
            steps: [
                {
                    name: "producer",
                    durationMs: producerMs,
                    // Renders either way — the ref needs its pixels. The flag only
                    // decides whether it also reaches the deliverable.
                    intermediate: !keepProducer,
                    file: producer,
                },
                {
                    name: "consumer",
                    durationMs: consumerMs,
                    file: consumerStep(width, height, fps, producerIndex, consumerMs, heroKey),
                },
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Ref Across Steps",
        lines: [
            "A ref carrying stepIndex is a BACK-EDGE: a later step shows an earlier step's exact pixels, reusing its intermediate.",
            "Back-edges only - stepIndex must be strictly earlier, and a forward reference is an error.",
            "Why it matters: in a long generated sequence, pointing at what was actually rendered cannot drift; describing it again can.",
            "THE HANDOFF: the producer self-stamps {stepIndex, flattenedStableKey} and the consumer spreads it - only it knows its keys.",
        ],
        explore: [
            "Turn Keep producer output on - the intermediate becomes a file",
            "Change Word: both steps follow, from ONE render",
            "Read the producer's variables - that is the handle",
        ],
    }),
});
exports.default = exports.RefAcrossStepsV1;
