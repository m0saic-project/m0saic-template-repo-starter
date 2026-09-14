"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LumaBadgeV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/media/luma-badge/v1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    image: {
        type: "media",
        required: false,
        description: "The image the corner badge sits on.",
        meta: { control: { picker: "file", accept: ["image"] }, ui: { label: "Image" } },
    },
    badge: {
        type: "string",
        required: false,
        description: "Badge text (ASCII, 1-16 chars).",
        meta: { control: { placeholder: "PREVIEW" }, ui: { label: "Badge" } },
    },
});
exports.LumaBadgeV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "37 · Luma Badge",
    version: 1,
    description: "Content-aware with a fallback: ctx.analysis.regionLuminance asks the host how bright the badge corner is, and the badge flips dark-on-light / light-on-dark to stay readable. Analysis is OPTIONAL — no-analysis hosts degrade to a stated default, printed on the caption.",
    capabilities: { tier: "core" },
    tags: ["media", "analysis", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "The corner badge picks its contrast from the pixels under it — or says it couldn't.",
    },
    propsSchema,
    defaultProps: { image: "", badge: "PREVIEW" },
    async render(props, ctx) {
        var _a, _b;
        const raw = ((_a = props.image) !== null && _a !== void 0 ? _a : "").trim();
        const badge = (_b = props.badge) !== null && _b !== void 0 ? _b : "PREVIEW";
        const { width, height } = ctx.target;
        if (badge.length < 1 || badge.length > 16 || !/^[\x20-\x7E]+$/.test(badge)) {
            throw new Error(`${ID}: badge must be 1-16 ASCII characters.`);
        }
        if (raw.length === 0) {
            return {
                kind: "mosaic_document",
                version: 1,
                m0: (0, dsl_stdlib_1.toM0String)("1", ID),
                assets: {},
                backgroundColor: "#0b0e11",
                sources: [
                    (0, svg_text_1.svgLabel)("Pick an image (Image) - the badge reads the pixels under it", width, height, {
                        maxPx: Math.round(height * 0.04),
                        maxLines: 2,
                        color: "#7f8c9b",
                    }),
                ],
            };
        }
        const meta = ctx.media[(0, types_1.asAssetId)(raw)];
        if (!meta || meta.kind !== "image") {
            throw new Error(`${ID}: "${raw}" must be a probed image.`);
        }
        // Ask the host about the badge corner (bottom-right 25% x 15%) — and
        // DEGRADE when the surface isn't there. Analysis is optional by
        // contract: design mode hands render() none at all.
        const REGION = { xPct: 0.75, yPct: 0.85, wPct: 0.25, hPct: 0.15 };
        let luma = null;
        if (ctx.analysis) {
            try {
                const result = await ctx.analysis.regionLuminance(raw, REGION);
                luma = result.overallAvgLuma;
            }
            catch {
                luma = null; // degraded — stated on the caption below
            }
        }
        const brightCorner = luma !== null && luma >= 128;
        const badgeBg = brightCorner ? "#101418" : "#ecf0f1";
        const badgeInk = brightCorner ? "#ecf0f1" : "#101418";
        const key = String((0, template_utils_1.slugifyAssetKeyFromPath)(raw));
        const assets = {
            [key]: { kind: "file", path: raw, mediaType: "image" },
        };
        // Image full-bleed; overlay: caption row on top, badge in the
        // bottom-right cell of a 4x coarse lattice.
        const m0 = (0, dsl_stdlib_1.toM0String)("1{5[1,-,-,-,4(-,-,-,1{1})]}", ID);
        const caption = luma !== null
            ? `regionLuminance(bottom-right) = ${Math.round(luma)} -> ${brightCorner ? "dark badge on bright pixels" : "light badge on dark pixels"}`
            : "analysis unavailable on this host - defaulting to a light badge (stated, not silent)";
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
                    placement: { fit: "cover" },
                },
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 5), {
                    maxPx: Math.round(height * 0.024),
                    maxLines: 1,
                    color: "#c8d2dc",
                }),
                (0, template_utils_1.makeColorTile)(badgeBg),
                (0, svg_text_1.svgLabel)(badge, Math.round(width / 4), Math.round(height / 5), {
                    maxPx: Math.round(height * 0.045),
                    maxLines: 1,
                    color: badgeInk,
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Luma Badge",
        lines: [
            "ctx.analysis asks about the PIXELS without doing I/O: regionLuminance returns an average luma for a fractional rect.",
            "THE LAW: analysis is OPTIONAL. Design mode hands render() none, so degrade to a stated default and SAY SO.",
            "A silent fallback is a lie - the caption prints the measured luma or the degradation notice.",
        ],
        explore: [
            "Pick a bright photo, then a dark one - the badge flips",
            "The caption prints the measured corner luma",
        ],
    }),
});
exports.default = exports.LumaBadgeV1;
