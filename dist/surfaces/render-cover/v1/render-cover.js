"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderCoverV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/surfaces/render-cover/v1";
const ACCENT = "#e67e22";
const INK = "#0b0e11";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    clip: {
        type: "media",
        required: false,
        description: "The video to play. render() needs this; the cover does not.",
        meta: {
            control: { picker: "file", accept: ["video"] },
            ui: { label: "Clip", order: 1 },
        },
    },
    accentColor: {
        type: "string",
        required: false,
        description: "Cover and caption accent as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: ACCENT },
            ui: { label: "Accent color", order: 2 },
        },
    },
});
exports.RenderCoverV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "60 · Render Cover",
    version: 1,
    description: "A friendly first frame for a template that fails fast. render() still reports exactly what is missing when it has no clip; renderCover puts a welcome page there instead on a pure-default open — opt-in, dismissed by the first prop edit, never synthesized by the host.",
    capabilities: { tier: "core" },
    tags: ["surfaces", "onboarding", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 3000,
        note: "Open with no props to see the cover. Set Clip, and render plays it.",
    },
    propsSchema,
    defaultProps: {
        accentColor: ACCENT,
    },
    /**
     * Strict on purpose. No clip is a real problem, and it says so — the
     * fail-fast contract the cover exists to protect.
     */
    async render(props, ctx) {
        var _a;
        const { width, height } = ctx.target;
        if (props.accentColor !== undefined && !HEX.test(props.accentColor)) {
            throw new Error(`${ID}: accentColor ${JSON.stringify(props.accentColor)} must be #rrggbb.`);
        }
        const raw = ((_a = props.clip) !== null && _a !== void 0 ? _a : "").trim();
        if (raw === "") {
            // Renders, exits clean, and names the remedy. The cover means this
            // card is not what greets a first-time user.
            return (0, template_utils_1.makeErrorMosaic)("- clip is required - pick a video file", {
                width,
                height,
                title: "This template needs a clip",
                errorCode: "STARTER_CLIP_REQUIRED",
            });
        }
        // No probe here on purpose: ctx.media and the asset pipeline get their
        // own chapter (media/image-card). This lesson is about the surface.
        const key = String((0, template_utils_1.slugifyAssetKeyFromPath)(raw));
        const assets = {
            [key]: { kind: "file", path: raw, mediaType: "video" },
        };
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)("1", ID),
            assets,
            backgroundColor: INK,
            sources: [
                {
                    type: "media",
                    mediaType: "video",
                    assetId: key,
                    placement: { fit: "contain" },
                },
            ],
        };
    },
    /**
     * The welcome. Ignores props entirely — at the only moment a cover shows,
     * the working props ARE the defaults, so there is nothing to read.
     * Deterministic, no ctx.media, sized off ctx.target.
     */
    renderCover(_props, ctx) {
        const { width, height } = ctx.target;
        // Three real bands: title, instruction, hint.
        const bands = [3, 2, 1];
        const m0 = (0, dsl_stdlib_1.weightedSplit)(bands, "row", {
            claimants: ["1{1}", "1{1}", "1{1}"],
        });
        const total = bands.reduce((n, b) => n + b, 0);
        const bandH = (weight) => (height * weight) / total;
        const title = (0, svg_text_1.fitSvgText)("Drop in a clip", width * 0.86, bandH(3) * 0.6, {
            maxPx: Math.round(height * 0.13),
            maxLines: 1,
        });
        const step = (0, svg_text_1.fitSvgText)("Set the Clip field to any video file, then press Make.", width * 0.86, bandH(2) * 0.7, { maxPx: Math.round(height * 0.05), maxLines: 2 });
        // ASCII only - the bundled glyph font renders arrows and dashes as tofu.
        const hint = (0, svg_text_1.fitSvgText)("Editing any prop hides this cover - the pill above reopens it.", width * 0.86, bandH(1) * 0.6, { maxPx: Math.round(height * 0.033), maxLines: 1 });
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            sources: [
                (0, template_utils_1.makeColorTile)(INK),
                (0, svg_text_1.svgTextSource)([
                    { text: title.text, fontSize: title.fontSize, color: ACCENT },
                ]),
                (0, template_utils_1.makeColorTile)("#111820"),
                (0, svg_text_1.svgTextSource)([
                    { text: step.text, fontSize: step.fontSize, color: "#eaeef2" },
                ]),
                (0, template_utils_1.makeColorTile)(INK),
                (0, svg_text_1.svgTextSource)([
                    { text: hint.text, fontSize: hint.fontSize, color: "#7f8c9b" },
                ]),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Render Cover",
        lines: [
            "renderCover is the welcome page shown on a pure-default open, so a template can fail fast in render WITHOUT a broken-looking first frame.",
            "Opt-in only: no cover declared means no cover happens. Hosts never synthesize one, and a cover that throws falls through in silence.",
            "The first prop edit dismisses it, but not one-way: the cover gets its own pill beside the ? and you can reopen it whenever.",
        ],
        explore: [
            "Press Make with no Clip - render reports what is missing",
            "Set Clip, then Make - the strict path was never weakened",
        ],
    }),
});
exports.default = exports.RenderCoverV1;
