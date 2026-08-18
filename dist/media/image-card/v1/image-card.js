"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageCardV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/media/image-card/v1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    image: {
        type: "media",
        required: false,
        description: "The image to frame. The value is a raw path; the host probes it.",
        meta: { control: { picker: "file", accept: ["image"] }, ui: { label: "Image" } },
    },
    fit: {
        type: "string",
        required: false,
        description: "contain letterboxes (whole image visible); cover fills the cell (crops).",
        meta: { constraints: { oneOf: ["contain", "cover"] }, ui: { label: "Fit" } },
    },
});
exports.ImageCardV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "23 · Image Card",
    version: 1,
    description: "One image through the whole media pipeline: raw path prop, host-side probe via ctx.media, slugified asset key, {kind:\"file\"} manifest entry, and a media source — with the contain-vs-cover fit decision on a knob.",
    capabilities: { tier: "core" },
    tags: ["media", "image", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Pick an image, then flip Fit between contain and cover.",
    },
    propsSchema,
    defaultProps: { image: "", fit: "contain" },
    async render(props, ctx) {
        var _a, _b, _c;
        const raw = ((_a = props.image) !== null && _a !== void 0 ? _a : "").trim();
        const fit = (_b = props.fit) !== null && _b !== void 0 ? _b : "contain";
        if (fit !== "contain" && fit !== "cover") {
            throw new Error(`${ID}: fit must be "contain" or "cover", got ${JSON.stringify(fit)}.`);
        }
        const { width, height } = ctx.target;
        // No image yet → a prompt card, not a dead preview.
        if (raw.length === 0) {
            return {
                kind: "mosaic_document",
                version: 1,
                m0: (0, dsl_stdlib_1.toM0String)("1", ID),
                assets: {},
                backgroundColor: "#0b0e11",
                sources: [
                    (0, svg_text_1.svgLabel)("Pick an image in the sidebar (Image) to frame it here", width, height, {
                        maxPx: Math.round(height * 0.04),
                        maxLines: 2,
                        color: "#7f8c9b",
                    }),
                ],
            };
        }
        // The HOST probed the file; the template only reads the registry.
        const meta = ctx.media[(0, types_1.asAssetId)(raw)];
        if (!meta || !(meta.width > 0) || !(meta.height > 0)) {
            throw new Error(`${ID}: no probed dimensions for "${raw}" - the host's ctx.media registry has no entry. Check the path.`);
        }
        if (meta.kind !== "image") {
            throw new Error(`${ID}: "${raw}" probed as ${(_c = meta.kind) !== null && _c !== void 0 ? _c : "unknown"} - pick an image file.`);
        }
        const key = String((0, template_utils_1.slugifyAssetKeyFromPath)(raw));
        const assets = {
            [key]: { kind: "file", path: raw, mediaType: "image" },
        };
        // Image cell over a caption band.
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: ["1", "1"] })), ID);
        const caption = `probed ${meta.width}x${meta.height} - fit "${fit}" ` +
            (fit === "contain" ? "(letterboxes, whole image visible)" : "(fills the cell, crops)");
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets,
            backgroundColor: "#0b0e11",
            sources: [
                {
                    type: "media",
                    mediaType: "image",
                    assetId: key,
                    placement: { fit },
                },
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.026),
                    maxLines: 1,
                    color: "#7f8c9b",
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Image Card",
        lines: [
            "A media prop's value is a RAW PATH STRING. The template does no I/O - the host probes the file and hands you ctx.media[rawPath].",
            "From there it's four moves: check the probe, mint an asset key, write the manifest entry, emit the media source.",
            "fit is the one placement decision every image needs: contain letterboxes, cover crops.",
            "No image picked renders a PROMPT card, never a dead preview.",
        ],
        explore: [
            "Pick an image with the Image file picker",
            "Flip Fit between contain and cover on a non-16:9 photo",
            "Select the tile: MEDIA shows the assetId the manifest carries",
        ],
    }),
});
exports.default = exports.ImageCardV1;
