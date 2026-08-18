"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncodeMatrixV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/pipelines/encode-matrix/v1";
const PANEL = "#17202a";
const BRAND = "#EF7525";
const INK_DIM = "#7f8c9b";
/** Nearest even pixel count, never below 2 — what yuv420p requires. */
function even(n) {
    return Math.max(2, Math.round(n / 2) * 2);
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    web: {
        type: "boolean",
        required: false,
        description: "Add a VP9-in-WebM encode. Same master, different codec — no second render.",
        meta: { ui: { label: "WebM (VP9)" } },
    },
    mobile: {
        type: "boolean",
        required: false,
        description: "Add a half-size h264 encode. size on an encode is an ffmpeg scale pass: it STRETCHES, it does not re-lay out.",
        meta: { ui: { label: "Mobile (half size)" } },
    },
    title: {
        type: "string",
        required: false,
        description: "Title on the card, so every deliverable is visibly the same render.",
        meta: { control: { placeholder: "One render" }, ui: { label: "Title" } },
    },
});
exports.EncodeMatrixV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "54 · Encode Matrix",
    version: 1,
    description: "One render, many deliverables, no pipeline: `encodes` declares post-render transcode passes off a single workspace master. Codec, container and even size (as a stretching scale pass) — but never fps, duration or layout.",
    capabilities: { tier: "core" },
    tags: ["pipelines", "encodes", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 1000,
        note: "Render it and count the files: one master plus one per encode entry.",
    },
    propsSchema,
    defaultProps: { web: true, mobile: true, title: "One render" },
    async render(props, ctx) {
        var _a, _b, _c;
        const web = (_a = props.web) !== null && _a !== void 0 ? _a : true;
        const mobile = (_b = props.mobile) !== null && _b !== void 0 ? _b : true;
        const title = ((_c = props.title) !== null && _c !== void 0 ? _c : "One render").trim();
        if (title.length < 1 || title.length > 24) {
            throw new Error(`${ID}: title must be 1-24 characters, got ${JSON.stringify(title)}.`);
        }
        const { width, height } = ctx.target;
        const encodes = {};
        if (web) {
            // Codec + container only: the cheapest kind of variant.
            encodes.web = {
                format: { kind: "video", container: "webm", videoCodec: "libvpx-vp9" },
            };
        }
        if (mobile) {
            // `size` here is a scale pass on the master's pixels — same aspect on
            // purpose, because anything else would stretch. Rounded to EVEN: h264
            // in yuv420p subsamples chroma 2x2, so an odd dimension fails the
            // encode outright (a 480x270 master halves to 240x135 and dies).
            encodes.mobile = {
                size: { width: even(width / 2), height: even(height / 2) },
                format: { kind: "video", container: "mp4", videoCodec: "libx264" },
            };
        }
        const names = Object.keys(encodes);
        const caption = names.length > 0
            ? `master + ${names.length} encode(s): ${names.join(", ")} - one render, ${names.length + 1} files`
            : "no encodes declared - just the master render";
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([4, 1], "row", { claimants: ["1{1}", "1"] })), ID);
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: PANEL,
            // The whole lesson: a map of transcode passes, beside the geometry.
            ...(names.length > 0 ? { encodes } : {}),
            sources: [
                (0, template_utils_1.makeColorTile)(BRAND),
                (0, svg_text_1.svgLabel)(title, width, Math.round((height * 4) / 5), {
                    maxPx: Math.round(height * 0.14),
                    maxLines: 1,
                    color: PANEL,
                }),
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 5), {
                    maxPx: Math.round(height * 0.03),
                    maxLines: 2,
                    color: INK_DIM,
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Encode Matrix",
        lines: [
            "encodes is a separate axis from geometry: the document renders ONCE into a master, and each entry is a transcode pass off it.",
            "It can change codec, container, pixel format, audio and colour - and size, but only as a scale pass, which STRETCHES.",
            "It cannot change fps, durationMs, target or emit. Those belong to the master render.",
            "So: encodes when the picture is the same and the file differs; fan-out when the LAYOUT differs.",
        ],
        explore: [
            "Toggle the two encodes and re-render - count the files",
            "Compare with pipelines/fan-out: re-encode versus re-layout",
            "Select the tile: encodes never touch the geometry",
        ],
    }),
});
exports.default = exports.EncodeMatrixV1;
