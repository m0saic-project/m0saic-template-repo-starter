"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaySpeedV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/media/play-speed/v1";
const LOOP_MODES = ["loop", "cut", "freeze"];
const propsSchema = (0, template_utils_1.definePropsSchema)({
    video: {
        type: "media",
        required: false,
        description: "The video to re-time.",
        meta: { control: { picker: "file", accept: ["video"] }, ui: { label: "Video" } },
    },
    speed: {
        type: "number",
        required: false,
        description: "Playback rate: 0.25-4 in steps of 0.25. 1 is realtime.",
        meta: { constraints: { min: 0.25, max: 4 }, control: { step: 0.25 }, ui: { label: "Speed" } },
    },
    sampleMs: {
        type: "number",
        required: false,
        description: "How much SOURCE time to sample, ms (250-5000). Kept small so the window ends before the output does — that gap is where loopMode shows itself.",
        meta: {
            constraints: { min: 250, max: 5000 },
            control: { step: 250 },
            ui: { label: "Sample (source ms)" },
        },
    },
    loopMode: {
        type: "string",
        required: false,
        description: "What fills the output once the re-timed window runs out: loop repeats it, freeze holds the last frame, cut goes black.",
        meta: {
            constraints: { oneOf: [...LOOP_MODES] },
            ui: { label: "Loop mode" },
        },
    },
});
exports.PlaySpeedV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "25 · Play Speed",
    version: 1,
    description: "playback.playSpeed: source time vs output time. A SMALL source window (1s by default) is re-timed by the speed knob, so it ends before the output does — and loopMode (loop / freeze / cut) visibly fills the rest. The caption does the arithmetic for the current knobs.",
    capabilities: { tier: "core" },
    tags: ["media", "playback", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 4000,
        note: "4s of output on purpose: a 1s sample at 1x loops four times, so loopMode is obvious.",
    },
    propsSchema,
    defaultProps: { video: "", speed: 1, sampleMs: 1000, loopMode: "loop" },
    async render(props, ctx) {
        var _a, _b, _c, _d;
        const raw = ((_a = props.video) !== null && _a !== void 0 ? _a : "").trim();
        const speed = (_b = props.speed) !== null && _b !== void 0 ? _b : 1;
        const sampleMs = (_c = props.sampleMs) !== null && _c !== void 0 ? _c : 1000;
        const loopMode = (_d = props.loopMode) !== null && _d !== void 0 ? _d : "loop";
        const { width, height } = ctx.target;
        if (!Number.isFinite(speed) || speed < 0.25 || speed > 4 || Math.round(speed * 4) !== speed * 4) {
            throw new Error(`${ID}: speed must be 0.25-4 in steps of 0.25, got ${JSON.stringify(speed)}.`);
        }
        if (!Number.isInteger(sampleMs) || sampleMs < 250 || sampleMs > 5000) {
            throw new Error(`${ID}: sampleMs must be an integer 250-5000, got ${JSON.stringify(sampleMs)}.`);
        }
        if (!LOOP_MODES.includes(loopMode)) {
            throw new Error(`${ID}: loopMode must be one of ${LOOP_MODES.join(" | ")}.`);
        }
        if (raw.length === 0) {
            return {
                kind: "mosaic_document",
                version: 1,
                m0: (0, dsl_stdlib_1.toM0String)("1", ID),
                assets: {},
                backgroundColor: "#0b0e11",
                sources: [
                    (0, svg_text_1.svgLabel)("Pick a video (Video) - a 1s sample, re-timed, on repeat", width, height, {
                        maxPx: Math.round(height * 0.04),
                        maxLines: 2,
                        color: "#7f8c9b",
                    }),
                ],
            };
        }
        const meta = ctx.media[(0, types_1.asAssetId)(raw)];
        if (!meta || meta.kind !== "video") {
            throw new Error(`${ID}: "${raw}" must be a probed video.`);
        }
        const srcMs = meta.durationMs;
        // The window can't outrun the source it samples.
        const windowMs = typeof srcMs === "number" ? Math.min(sampleMs, Math.max(250, srcMs)) : sampleMs;
        const key = String((0, template_utils_1.slugifyAssetKeyFromPath)(raw));
        const assets = {
            [key]: { kind: "file", path: raw, mediaType: "video" },
        };
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: ["1", "1"] })), ID);
        // The whole lesson in one line of arithmetic: a SOURCE-time window,
        // divided by the rate, becomes OUTPUT time — and whatever output time
        // is left over belongs to loopMode.
        const playedMs = Math.round(windowMs / speed);
        const targetMs = ctx.target.durationMs;
        const fills = playedMs > 0 ? (targetMs / playedMs).toFixed(1) : "?";
        const tail = loopMode === "loop"
            ? `repeats ~${fills}x to fill ${targetMs}ms`
            : loopMode === "freeze"
                ? `then FREEZES its last frame for the remaining ${Math.max(0, targetMs - playedMs)}ms`
                : `then CUTS to nothing for the remaining ${Math.max(0, targetMs - playedMs)}ms`;
        const caption = `${windowMs}ms of source / playSpeed ${speed} = ${playedMs}ms of output - ` +
            `loopMode "${loopMode}" ${tail}`;
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets,
            backgroundColor: "#0b0e11",
            sources: [
                {
                    type: "media",
                    mediaType: "video",
                    assetId: key,
                    placement: { fit: "contain" },
                    // clipDurationMs is SOURCE time; playSpeed re-times it into
                    // output time; loopMode owns whatever output time is left.
                    playback: {
                        clipStartMs: 0,
                        clipDurationMs: windowMs,
                        playSpeed: speed,
                        loopMode,
                    },
                },
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.024),
                    maxLines: 2,
                    color: "#7f8c9b",
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Play Speed",
        lines: [
            "playSpeed re-times the source: at 2, one second of output spends two seconds of source. Two different clocks.",
            "Clip windows are SOURCE time, so a window fills clipDurationMs / playSpeed of OUTPUT time.",
            "This one samples a small window on purpose so it runs out early - that leftover is where loopMode lives.",
            "loop repeats the window, freeze holds its last frame, cut goes black.",
        ],
        explore: [
            "Flip Loop mode: repeat, hold, or black",
            "Step Speed 0.25 to 4 and watch the loop count change",
            "Raise Sample past the render duration - the seam disappears",
            "Select the tile: PLAYBACK carries all three",
        ],
    }),
});
exports.default = exports.PlaySpeedV1;
