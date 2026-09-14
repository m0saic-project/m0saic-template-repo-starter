"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AspectAdaptiveCardV1 = exports.wrapMeasured = exports.fitSvgText = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
Object.defineProperty(exports, "fitSvgText", { enumerable: true, get: function () { return svg_text_1.fitSvgText; } });
Object.defineProperty(exports, "wrapMeasured", { enumerable: true, get: function () { return svg_text_1.wrapMeasured; } });
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/basics/aspect-adaptive-card/v1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    title: {
        type: "string",
        required: false,
        description: "Headline, accent panel.",
        meta: { ui: { label: "Title", order: 1 } },
    },
    body: {
        type: "string",
        required: false,
        description: "Supporting line, body panel.",
        meta: { ui: { label: "Body", order: 2 } },
    },
    accentColor: {
        type: "string",
        required: false,
        description: "Accent panel fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2471a3" },
            ui: { label: "Accent color", order: 3 },
        },
    },
    panelColor: {
        type: "string",
        required: false,
        description: "Body panel fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Panel color", order: 4 },
        },
    },
});
exports.AspectAdaptiveCardV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "05 · Aspect-Adaptive Card",
    version: 1,
    description: "One template, every aspect: reads ctx.target, flips columns to rows on portrait, prints its decision live, and fits svg-rasterized text to the panels it computed. Teaches the rule that prevents the classic nested-render bug — size off ctx.target, never ctx.output.",
    capabilities: { tier: "core" },
    tags: ["basics", "ctx", "layout"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Try 1080x1920 too — the layout flips to a stack and the caption follows.",
    },
    propsSchema,
    defaultProps: {
        title: "Reads the room",
        body: "Same template, either way.",
        accentColor: "#2471a3",
        panelColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c, _d;
        for (const [key, value] of [
            ["accentColor", props.accentColor],
            ["panelColor", props.panelColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        // THE lesson: the target slot decides the layout. Nested or top-level,
        // this is the canvas these pixels actually fill.
        const { width, height } = ctx.target;
        const landscape = width >= height;
        // Landscape: 1:2 columns. Portrait: 1:2 rows. Each panel is a BASE color
        // tile with its text attached as an overlay (`1{1}`): svg-rasterized text
        // carries no background of its own, and "fill underneath, content on the
        // attached overlay" is the standard pairing. Knowing our own weights
        // means we also know each panel's PIXEL box — which is what the text
        // must be fitted against (nothing soft-wraps).
        const m0 = (0, dsl_stdlib_1.weightedSplit)([1, 2], landscape ? "col" : "row", {
            claimants: ["1{1}", "1{1}"],
        });
        const accentBox = landscape
            ? { w: width / 3, h: height }
            : { w: width, h: height / 3 };
        const bodyBox = landscape
            ? { w: (width * 2) / 3, h: height }
            : { w: width, h: (height * 2) / 3 };
        const title = (_a = props.title) !== null && _a !== void 0 ? _a : "Reads the room";
        const body = (_b = props.body) !== null && _b !== void 0 ? _b : "Same template, either way.";
        const titleFit = (0, svg_text_1.fitSvgText)(title, accentBox.w, accentBox.h, {
            maxPx: Math.round(Math.min(accentBox.h * 0.12, accentBox.w * 0.14)),
            maxLines: 3,
        });
        const bodyFit = (0, svg_text_1.fitSvgText)(body, bodyBox.w, bodyBox.h * 0.6, {
            maxPx: Math.round(bodyBox.h * 0.065),
            maxLines: 3,
        });
        // The decision, printed on the card — watch it flip with the canvas.
        // ASCII "->" on purpose: the bundled glyph font is lean, and exotic
        // codepoints (like U+2192) render as tofu. Keep card copy ASCII.
        const caption = `${width}x${height} -> ${landscape ? "columns" : "rows"}`;
        const captionFit = (0, svg_text_1.fitSvgText)(caption, bodyBox.w, bodyBox.h * 0.2, {
            maxPx: Math.round(bodyBox.h * 0.038),
            maxLines: 1,
        });
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            // Paint order follows the DSL walk: base tile, then its attached
            // overlay, per panel — so sources bind [fillA, textA, fillB, textB].
            sources: [
                (0, template_utils_1.makeColorTile)(((_c = props.accentColor) !== null && _c !== void 0 ? _c : "#2471a3")),
                (0, svg_text_1.svgTextSource)([
                    {
                        text: titleFit.text,
                        fontSize: titleFit.fontSize,
                        color: "#ffffff",
                    },
                ]),
                (0, template_utils_1.makeColorTile)(((_d = props.panelColor) !== null && _d !== void 0 ? _d : "#1c2833")),
                (0, svg_text_1.svgTextSource)([
                    {
                        text: bodyFit.text,
                        fontSize: bodyFit.fontSize,
                        color: "#ffffff",
                    },
                    {
                        text: captionFit.text,
                        fontSize: captionFit.fontSize,
                        color: "#7f8c9b",
                        vAlign: "bottom",
                        padding: { bottom: 0.06 },
                    },
                ]),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Aspect-Adaptive Card",
        lines: [
            "ctx.target is the canvas your pixels actually fill - branch on it and one template serves every aspect.",
            "Size off ctx.target, NEVER ctx.output: nested, target is your slot while output still describes the final deliverable.",
            "Nothing soft-wraps - the copy is fitted with measureText against the font the renderer draws with.",
        ],
        explore: [
            "Switch Device to Portrait - the layout flips and the caption follows",
            "Feed a long Title - it wraps and shrinks to fit its panel",
        ],
    }),
});
exports.default = exports.AspectAdaptiveCardV1;
