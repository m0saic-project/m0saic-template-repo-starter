"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlAssetV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/media/url-asset/v1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    url: {
        type: "string",
        required: false,
        description: "Remote image URL (https). The HOST fetches it at render time.",
        meta: {
            control: { flavor: "url", placeholder: "https://example.com/image.png" },
            ui: { label: "Image URL" },
        },
    },
});
exports.UrlAssetV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "40 · URL Asset",
    version: 1,
    description: "The {kind:\"url\"} asset: a manifest entry pointing at remote media the HOST fetches at render time — with the costs stated on canvas: offline fails, bytes can drift, no probe before fetch. Prefer {kind:\"file\"} for anything reproducible.",
    capabilities: { tier: "core" },
    tags: ["media", "url", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Renders offline as the explainer card; paste an https image URL to fetch one at render time.",
    },
    propsSchema,
    defaultProps: { url: "" },
    async render(props, ctx) {
        var _a;
        const url = ((_a = props.url) !== null && _a !== void 0 ? _a : "").trim();
        const { width, height } = ctx.target;
        if (url.length === 0) {
            const lines = "The {kind:\"url\"} asset points the manifest at REMOTE media - the host fetches it at render time.\n" +
                "Costs: offline hosts fail the render; the bytes can change under you; there is no probe before the fetch.\n" +
                "Prefer {kind:\"file\"} for anything you need reproducible. Paste an https image URL above to try it.";
            return {
                kind: "mosaic_document",
                version: 1,
                m0: (0, dsl_stdlib_1.toM0String)("1", ID),
                assets: {},
                backgroundColor: "#0b0e11",
                sources: [
                    (0, svg_text_1.svgLabel)(lines, width, height, {
                        maxPx: Math.round(height * 0.034),
                        maxLines: 6,
                        color: "#c8d2dc",
                    }),
                ],
            };
        }
        if (!/^https:\/\/[\x21-\x7E]+$/.test(url)) {
            throw new Error(`${ID}: url must be an https URL, got ${JSON.stringify(url)}.`);
        }
        // No probe exists for an unfetched URL — the template declares the
        // media kind itself. That asymmetry is part of the lesson.
        const key = "remote_image";
        const assets = {
            [key]: { kind: "url", url },
        };
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: ["1", "1"] })), ID);
        const caption = `{kind:"url"} - fetched by the HOST at render time - no probe, offline fails, bytes may drift - ${url}`;
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
                    placement: { fit: "contain" },
                },
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.022),
                    maxLines: 2,
                    color: "#7f8c9b",
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "URL Asset",
        lines: [
            "A manifest entry can be {kind:\"url\"} instead of {kind:\"file\"} - the host fetches the bytes; the template still does no I/O.",
            "The trade is reproducibility: offline hosts fail, the bytes can change, and there is no probe before the fetch.",
            "Prefer files for anything you need byte-stable. Reach for URLs only when the source is genuinely remote.",
        ],
        explore: [
            "Paste an https image URL and render - the host fetches it",
            "Go offline and render again - read the failure, that's the cost",
            "Compare with image-card: same shape, opposite promise",
        ],
    }),
});
exports.default = exports.UrlAssetV1;
