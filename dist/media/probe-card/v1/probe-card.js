"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProbeCardV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const svg_text_2 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/media/probe-card/v1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    media: {
        type: "media",
        required: false,
        description: "Any image or video file. The card prints the host's probe of it.",
        meta: { control: { picker: "file", accept: ["image", "video"] }, ui: { label: "Media" } },
    },
});
exports.ProbeCardV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "34 · Probe Card",
    version: 1,
    description: "ctx.media is the host's ffprobe registry, keyed by the RAW prop string — templates read it, never probe. Pick any image or video and the card prints its entry: kind, dimensions, duration; the thumb renders beside the facts.",
    capabilities: { tier: "core" },
    tags: ["media", "probe", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Pick a video, then an image — watch the duration line appear and vanish.",
    },
    propsSchema,
    defaultProps: { media: "" },
    async render(props, ctx) {
        var _a, _b;
        const raw = ((_a = props.media) !== null && _a !== void 0 ? _a : "").trim();
        const { width, height } = ctx.target;
        if (raw.length === 0) {
            return {
                kind: "mosaic_document",
                version: 1,
                m0: (0, dsl_stdlib_1.toM0String)("1", ID),
                assets: {},
                backgroundColor: "#0b0e11",
                sources: [
                    (0, svg_text_2.svgLabel)("Pick any image or video (Media) - this card prints its probe", width, height, {
                        maxPx: Math.round(height * 0.04),
                        maxLines: 2,
                        color: "#7f8c9b",
                    }),
                ],
            };
        }
        const meta = ctx.media[(0, types_1.asAssetId)(raw)];
        if (!meta) {
            throw new Error(`${ID}: ctx.media has no entry for "${raw}" - the host probes every media path the props mention before render() runs. Check the path.`);
        }
        const isVideo = meta.kind === "video";
        const durationMs = meta.durationMs;
        const lines = [
            `path      ${raw}`,
            `kind      ${String((_b = meta.kind) !== null && _b !== void 0 ? _b : "unknown")}`,
            `size      ${meta.width}x${meta.height}px`,
            ...(isVideo && typeof durationMs === "number"
                ? [`duration  ${(durationMs / 1000).toFixed(2)}s`]
                : ["duration  (still - no timeline)"]),
        ];
        const key = String((0, template_utils_1.slugifyAssetKeyFromPath)(raw));
        const assets = {
            [key]: { kind: "file", path: raw, mediaType: isVideo ? "video" : "image" },
        };
        // Facts (left 2/3) beside the thumb (right 1/3).
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([2, 1], "col", { claimants: ["1", "1"] })), ID);
        const sheet = (0, svg_text_1.fitSvgLines)(lines, Math.round((width * 2) / 3), height, {
            maxPx: Math.round(height * 0.04),
            widthFrac: 0.7,
        });
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets,
            backgroundColor: "#0b0e11",
            sources: [
                (0, svg_text_1.svgTextSource)([
                    { text: sheet.text, fontSize: sheet.fontSize, color: "#c8d2dc" },
                ]),
                {
                    type: "media",
                    mediaType: isVideo ? "video" : "image",
                    assetId: key,
                    placement: { fit: "contain" },
                },
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Probe Card",
        lines: [
            "Templates do no I/O. The host probes every media path in the props first and keys the results by the RAW prop string.",
            "That registry is ctx.media, and every decision downstream - aspect branches, clip windows, fit - is built on it.",
            "A path with no entry fails fast: an empty registry means the host never saw your path.",
        ],
        explore: [
            "Pick a video, then an image - the duration line comes and goes",
            "The thumb beside the facts is an ordinary media source",
            "Feed the same file to image-card - same registry, same facts",
        ],
    }),
});
exports.default = exports.ProbeCardV1;
