"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnatomyV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/basics/anatomy/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const INK = "#ecf0f1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    text: {
        type: "string",
        required: false,
        description: "The greeting rendered under the M.",
        meta: { control: { placeholder: "Hello, m0saic" }, ui: { label: "Text" } },
    },
    backgroundColor: {
        type: "string",
        required: false,
        description: "Canvas fill as #rrggbb.",
        // Color props declare themselves: `isColor` + `colorPicker` gives the
        // app a real swatch control instead of a bare text field.
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#0d1117" },
            ui: { label: "Background" },
        },
    },
});
exports.AnatomyV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "02 · Anatomy",
    version: 1,
    description: "The smallest correct template, wearing the brand: the pixel-M in a square cell over a greeting, placed with one placeInsetPieces call. A typed props surface, deterministic defaults, and a validated m0 string. Start here — this is the smoke render.",
    capabilities: { tier: "core" },
    tags: ["basics", "starter", "brand"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Static content — any canvas and any duration render cleanly.",
    },
    propsSchema,
    defaultProps: {
        text: "Hello, m0saic",
        backgroundColor: "#0d1117",
    },
    async render(props, ctx) {
        var _a, _b;
        // Fail fast on bad input rather than rendering something misleading.
        // The props schema above is DOCUMENTATION — hosts can (and the CLI does)
        // call render() directly with a raw props bag, so render() is the gate.
        if (props.backgroundColor !== undefined &&
            !HEX.test(props.backgroundColor)) {
            throw new Error(`${ID}: backgroundColor ` +
                `${JSON.stringify(props.backgroundColor)} must be a #rrggbb hex color.`);
        }
        const text = (_a = props.text) !== null && _a !== void 0 ? _a : "Hello, m0saic";
        const fill = ((_b = props.backgroundColor) !== null && _b !== void 0 ? _b : "#0d1117");
        const { width, height } = ctx.target;
        // The brand square: a pixel size the CANVAS decides (ratios can't
        // promise squareness — that's ctx.target's job).
        const side = Math.round(Math.min(width, height) * 0.32);
        const gx = Math.round((width - side) / 2);
        const gy = Math.round(height * 0.42 - side / 2);
        const label = {
            x: Math.round(width * 0.08),
            y: gy + side + Math.round(height * 0.05),
            w: Math.round(width * 0.84),
            h: Math.round(height * 0.12),
        };
        const placed = (0, template_utils_1.placeInsetPieces)({
            rootW: width,
            rootH: height,
            pieces: [
                {
                    // Backdrop — the old `F`, now the page the brand sits on.
                    rect: { x: 0, y: 0, w: width, h: height, importance: 0 },
                    source: (0, template_utils_1.makeColorTile)(fill),
                },
                {
                    rect: { x: gx, y: gy, w: side, h: side, importance: 2 },
                    source: (0, template_utils_1.brandGlyphTile)(template_utils_1.HEADER_M_GLYPH, template_utils_1.BRAND_ORANGE),
                },
                {
                    rect: { x: label.x, y: label.y, w: label.w, h: label.h, importance: 1 },
                    source: (0, template_utils_1.bindProp)((0, svg_text_1.svgLabel)(text, label.w, label.h, {
                        maxPx: Math.round(height * 0.055),
                        maxLines: 1,
                        color: INK,
                    }), "text"),
                },
            ],
        });
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)(placed.m0, ID),
            assets: {},
            backgroundColor: fill,
            sources: placed.sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Anatomy of a template",
        lines: [
            "The smallest correct template: an id, typed props with defaults, and a render() returning an m0 string plus one source per tile, in walk order.",
            "toM0String canonicalizes and validates, so a bad layout fails at build time instead of mid-render.",
            "The M is a color tile wearing the brand glyph as a mask, in a square cell - square is a pixel fact, so only ctx.target can decide it.",
        ],
        explore: [
            "Edit Text and Background in the props panel",
            "Switch to Geometry: a backdrop, a square, a text band",
            "Select the M and read its rect, effective box and mask bounds",
            "Read the source: src/basics/anatomy/",
        ],
    }),
});
exports.default = exports.AnatomyV1;
