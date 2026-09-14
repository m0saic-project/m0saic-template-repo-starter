"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderContactStripV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/media/folder-contact-strip/v1";
const MAX_TILES = 8;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    images: {
        type: "media[]",
        required: false,
        description: "Images from a folder. The folder picker fills the array with raw paths; the first 8 render.",
        meta: { control: { picker: "folder", accept: ["image"] }, ui: { label: "Images" } },
    },
});
exports.FolderContactStripV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "33 · Folder Contact Strip",
    version: 1,
    description: "type:\"media[]\" + the folder picker: the prop arrives as an array of raw paths, each probed by the host — the template maps them to per-file asset entries and media sources, and the strip resplits to the count (first 8).",
    capabilities: { tier: "core" },
    tags: ["media", "folder", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Pick a folder of images — the strip resplits to however many arrive (first 8).",
    },
    propsSchema,
    defaultProps: { images: [] },
    async render(props, ctx) {
        var _a;
        const images = (_a = props.images) !== null && _a !== void 0 ? _a : [];
        const { width, height } = ctx.target;
        if (!Array.isArray(images)) {
            throw new Error(`${ID}: images must be an array of paths, got ${JSON.stringify(images)}.`);
        }
        const picked = images.map((p) => String(p).trim()).filter((p) => p.length > 0);
        if (picked.length === 0) {
            return {
                kind: "mosaic_document",
                version: 1,
                m0: (0, dsl_stdlib_1.toM0String)("1", ID),
                assets: {},
                backgroundColor: "#0b0e11",
                sources: [
                    (0, svg_text_1.svgLabel)("Pick a folder of images in the sidebar (Images)", width, height, {
                        maxPx: Math.round(height * 0.04),
                        maxLines: 2,
                        color: "#7f8c9b",
                    }),
                ],
            };
        }
        const shown = picked.slice(0, MAX_TILES);
        const assets = {};
        const tiles = shown.map((raw) => {
            const meta = ctx.media[(0, types_1.asAssetId)(raw)];
            if (!meta || meta.kind !== "image" || !(meta.width > 0)) {
                throw new Error(`${ID}: "${raw}" has no image probe in ctx.media - every array entry is probed by the host; check the folder's contents.`);
            }
            const key = String((0, template_utils_1.slugifyAssetKeyFromPath)(raw));
            assets[key] = { kind: "file", path: raw, mediaType: "image" };
            return {
                type: "media",
                mediaType: "image",
                assetId: key,
                placement: { fit: "cover" },
            };
        });
        // Grammar: 1-count splits are illegal — one image IS the band.
        const strip = shown.length === 1
            ? "1"
            : `${shown.length}(${new Array(shown.length).fill("1").join(",")})`;
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: [strip, "1"] })), ID);
        const caption = `media[] delivered ${picked.length} path(s)` +
            (picked.length > MAX_TILES ? ` - showing the first ${MAX_TILES}` : "") +
            ` - one asset entry + one source each`;
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: assets,
            backgroundColor: "#0b0e11",
            sources: [
                ...tiles,
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.026),
                    maxLines: 1,
                    color: "#7f8c9b",
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Folder Contact Strip",
        lines: [
            "picker:\"folder\" hands the prop an ARRAY of raw paths, each already enumerated and probed by the host.",
            "The template just maps it: probe check, asset key, manifest entry, media source - per path.",
            "The strip's split count IS the array length, and a path with no probe fails fast by name.",
        ],
        explore: [
            "Pick a folder with a few images - the strip resplits",
            "Select any tile: each one carries its OWN assetId",
            "The caption prints how many paths media[] delivered",
        ],
    }),
});
exports.default = exports.FolderContactStripV1;
