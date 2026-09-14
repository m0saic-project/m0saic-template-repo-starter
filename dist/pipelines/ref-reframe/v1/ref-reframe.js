"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefReframeV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/pipelines/ref-reframe/v1";
const FITS = ["contain", "cover"];
const LOOPS = ["loop", "freeze", "cut"];
const HERO_BG = "#EF7525";
const PANEL = "#17202a";
const INK = "#17202a";
const INK_DIM = "#7f8c9b";
const PRODUCER_MS = 600;
/** The producer's layout, built once so its key can be read off it. */
function producerM0() {
    return (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([4, 1], "row", { claimants: ["1", "1"] })), `${ID}:producer`);
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    fit: {
        type: "string",
        required: false,
        description: "How the mirror frames a slot with a different shape: contain letterboxes, cover crops. Same pixels either way.",
        meta: { constraints: { oneOf: [...FITS] }, ui: { label: "Fit" } },
    },
    loopMode: {
        type: "string",
        required: false,
        description: "What fills the tail once the mirrored pixels run out: loop repeats them, freeze holds the last frame, cut goes black.",
        meta: { constraints: { oneOf: [...LOOPS] }, ui: { label: "Loop mode" } },
    },
    tailMs: {
        type: "number",
        required: false,
        description: "How much LONGER the consumer step runs than the target. Without a tail there is nothing for loopMode to decide.",
        meta: {
            constraints: { min: 0, max: 3000 },
            control: { step: 100 },
            ui: { label: "Tail ms" },
        },
    },
});
function producerStep(m0, width, height, fps) {
    const hero = {
        type: "text",
        renderMode: { kind: "video" },
        visual: { backgroundColor: (0, template_utils_1.solidBackground)(HERO_BG) },
        layers: [
            {
                content: { kind: "literal", text: "SOURCE" },
                style: { fontSize: Math.round(height * 0.16), fontColor: INK },
                placement: { hAlign: "center", vAlign: "middle" },
            },
            {
                // The tail is the whole point of this lesson, and a STILL mirror
                // cannot show it: loop, freeze and cut all look identical when the
                // mirrored pixels never change. So the target counts — the number IS
                // the readout. Past the producer's end, `loop` sends it back to 0,
                // `freeze` holds its last value, and `cut` goes black.
                content: {
                    kind: "expr",
                    expr: (0, template_utils_1.animateNumbersInText)(PRODUCER_MS.toString(), {
                        durationSec: PRODUCER_MS / 1000,
                    }),
                    eval: "frame",
                },
                style: {
                    fontSize: Math.round(height * 0.09),
                    fontColor: INK,
                },
                placement: { hAlign: "center", vAlign: "bottom", padding: { bottom: 0.08 } },
            },
        ],
    };
    return {
        kind: "mosaic_document",
        version: 1,
        m0,
        assets: {},
        // A WIDE producer: the consumer's slot is tall, so the mirror has a real
        // shape mismatch to resolve.
        size: { width, height: Math.round(height / 2) },
        fps,
        durationMs: PRODUCER_MS,
        backgroundColor: PANEL,
        sources: [
            hero,
            (0, svg_text_1.svgLabel)(`${width}x${Math.round(height / 2)} - ${PRODUCER_MS}ms`, width, Math.round(height / 10), {
                maxPx: Math.round(height * 0.032),
                maxLines: 1,
                color: INK_DIM,
            }),
        ],
    };
}
exports.RefReframeV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "61 · Ref Reframe",
    version: 1,
    description: "A mirror whose slot differs in shape and length: placement.fit reframes the pixels and playback.loopMode fills the tail (loop, freeze or cut). Nothing is re-rendered — one intermediate, per-consumer decoration.",
    capabilities: { tier: "core" },
    tags: ["pipelines", "refs", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 1600,
        note: "The second step outlives its target on purpose — loopMode decides what fills the tail.",
    },
    propsSchema,
    defaultProps: { fit: "contain", loopMode: "freeze", tailMs: 400 },
    async render(props, ctx) {
        var _a, _b, _c;
        const fit = (_a = props.fit) !== null && _a !== void 0 ? _a : "contain";
        const loopMode = (_b = props.loopMode) !== null && _b !== void 0 ? _b : "freeze";
        const tailMs = (_c = props.tailMs) !== null && _c !== void 0 ? _c : 400;
        const problems = [];
        if (!FITS.includes(fit)) {
            problems.push(`fit must be one of ${FITS.join(" | ")}, got ${JSON.stringify(fit)}`);
        }
        if (!LOOPS.includes(loopMode)) {
            problems.push(`loopMode must be one of ${LOOPS.join(" | ")}, got ${JSON.stringify(loopMode)}`);
        }
        if (!Number.isFinite(tailMs) || tailMs < 0 || tailMs > 3000) {
            problems.push(`tailMs must be 0-3000, got ${JSON.stringify(tailMs)}`);
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height, fps } = ctx.target;
        const consumerMs = PRODUCER_MS + tailMs;
        // The key is read off the PRODUCER's m0 at the PRODUCER's canvas — a key
        // is a coordinate in one document's flattened geometry, so it must be
        // asked of that document, not of the consumer doing the mirroring.
        const pm0 = producerM0();
        const producerHeight = Math.round(height / 2);
        const heroKey = (0, dsl_stdlib_1.findStableKeys)(pm0, (f) => f.kind === "frame", {
            width,
            height: producerHeight,
        })[0];
        const caption = tailMs > 0
            ? `mirror of ${heroKey}: fit "${fit}", and ${tailMs}ms of tail filled by "${loopMode}"`
            : `mirror of ${heroKey}: fit "${fit}" - no tail, so loopMode has nothing to decide`;
        // A TALL slot for a wide target: the shape mismatch is the point.
        const consumer = {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: ["1", "1"] })), `${ID}:consumer`),
            assets: {},
            size: { width: Math.round(width / 2), height },
            fps,
            durationMs: consumerMs,
            backgroundColor: PANEL,
            sources: [
                {
                    type: "ref",
                    flattenedStableKey: heroKey,
                    stepIndex: 0,
                    placement: { fit },
                    playback: { loopMode },
                },
                (0, svg_text_1.svgLabel)(caption, Math.round(width / 2), Math.round(height / 6), {
                    maxPx: Math.round(height * 0.026),
                    maxLines: 3,
                    color: INK_DIM,
                }),
            ],
        };
        return {
            kind: "mosaic_pipeline",
            version: 1,
            emit: "multi",
            fps,
            steps: [
                { name: "source", durationMs: PRODUCER_MS, file: producerStep(pm0, width, height, fps) },
                { name: "reframed", durationMs: consumerMs, file: consumer },
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Ref Reframe",
        lines: [
            "A mirror need not match its target: when the slot differs in size, aspect, fps or duration, the ref's decoration decides.",
            "Shape is placement.fit - contain letterboxes, cover crops. The pixels are identical; only the framing is yours.",
            "Time is playback.loopMode: loop repeats, freeze holds the last frame, cut goes black. The target counts, so read the tail off the number.",
            "Nothing is re-rendered for any of it: one intermediate, one decode, decoration on top.",
        ],
        explore: [
            "Flip Loop mode: the counter repeats, holds, or cuts",
            "Set Tail ms to 0 - loopMode stops mattering",
            "Switch fit: the same pixels letterbox or crop",
        ],
    }),
});
exports.default = exports.RefReframeV1;
