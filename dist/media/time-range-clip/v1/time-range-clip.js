"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeRangeClipV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/media/time-range-clip/v1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    video: {
        type: "media",
        required: false,
        description: "The video to window.",
        meta: { control: { picker: "file", accept: ["video"] }, ui: { label: "Video" } },
    },
    clipStartMs: {
        type: "number",
        required: false,
        description: "Window start (ms into the source). Half of the time-range pair.",
        meta: {
            control: { picker: "time-range", videoFromProp: "video" },
            ui: { label: "Clip start" },
        },
    },
    clipEndMs: {
        type: "number",
        required: false,
        description: "Window end (ms into the source). The other half of the pair.",
        meta: {
            control: { picker: "time-range", videoFromProp: "video" },
            ui: { label: "Clip end" },
        },
    },
});
exports.TimeRangeClipV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "26 · Time-Range Clip",
    version: 1,
    description: "The time-range picker pair: two number props ending in StartMs/EndMs (here clipStartMs and clipEndMs) with picker:\"time-range\" + videoFromProp render ONE scrubber with two handles — and the window lands on the source as playback.clipStartMs + clipDurationMs (start + LENGTH).",
    capabilities: { tier: "core" },
    tags: ["media", "playback", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Pick a video, then drag the scrubber's two handles — the render plays only that window.",
    },
    propsSchema,
    defaultProps: { video: "", clipStartMs: 0, clipEndMs: 1000 },
    async render(props, ctx) {
        var _a, _b, _c;
        const raw = ((_a = props.video) !== null && _a !== void 0 ? _a : "").trim();
        const start = (_b = props.clipStartMs) !== null && _b !== void 0 ? _b : 0;
        const end = (_c = props.clipEndMs) !== null && _c !== void 0 ? _c : 1000;
        const { width, height } = ctx.target;
        if (raw.length === 0) {
            return {
                kind: "mosaic_document",
                version: 1,
                m0: (0, dsl_stdlib_1.toM0String)("1", ID),
                assets: {},
                backgroundColor: "#0b0e11",
                sources: [
                    (0, svg_text_1.svgLabel)("Pick a video (Video), then set the window with the scrubber", width, height, {
                        maxPx: Math.round(height * 0.04),
                        maxLines: 2,
                        color: "#7f8c9b",
                    }),
                ],
            };
        }
        if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start) {
            throw new Error(`${ID}: the window must be integer ms with 0 <= start < end, got start ${JSON.stringify(start)} end ${JSON.stringify(end)}.`);
        }
        const meta = ctx.media[(0, types_1.asAssetId)(raw)];
        if (!meta || meta.kind !== "video") {
            throw new Error(`${ID}: "${raw}" must be a probed video (ctx.media entry missing or not video).`);
        }
        const sourceDurationMs = meta.durationMs;
        if (typeof sourceDurationMs === "number" && end > sourceDurationMs) {
            throw new Error(`${ID}: window end ${end}ms is past the source's ${sourceDurationMs}ms - drag the right handle back.`);
        }
        const key = String((0, template_utils_1.slugifyAssetKeyFromPath)(raw));
        const assets = {
            [key]: { kind: "file", path: raw, mediaType: "video" },
        };
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: ["1", "1"] })), ID);
        const caption = `window ${start}ms -> ${end}ms (${end - start}ms of ` +
            `${typeof sourceDurationMs === "number" ? `${sourceDurationMs}ms` : "?"} source) - ` +
            `playback: clipStartMs ${start}, clipDurationMs ${end - start}, loop fills the rest`;
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
                    // Start + LENGTH, not start + end — the one conversion this
                    // template exists to teach.
                    playback: {
                        clipStartMs: start,
                        clipDurationMs: end - start,
                        loopMode: "loop",
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
        title: "Time-Range Clip",
        lines: [
            "Two number props whose names end in StartMs and EndMs, both with picker:\"time-range\", render as ONE scrubber with two handles.",
            "On the wire they stay two flat numbers - the editor pairs them by that name suffix.",
            "The window lands on the source as clipStartMs + clipDurationMs: start plus LENGTH, not start plus end.",
            "Need several windows? That is one json prop with picker:\"time-ranges\" - see media/time-ranges-medley.",
        ],
        explore: [
            "Pick a video and drag both handles",
            "Drag the end past the source's duration and read the remedy",
            "Select the tile: PLAYBACK carries clipStartMs/clipDurationMs",
        ],
    }),
});
exports.default = exports.TimeRangeClipV1;
