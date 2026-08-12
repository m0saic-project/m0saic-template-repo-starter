"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceRectDockV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const svg_text_1 = require("../../../_shared/svg-text");
const ID = "@m0saic-starter/geometry/place-rect-dock/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    widthFrac: {
        type: "number",
        required: false,
        description: "Dock width as a fraction of canvas width (0.1-0.5).",
        meta: { constraints: { min: 0.1, max: 0.5 }, control: { step: 0.02 }, ui: { label: "Width" } },
    },
    heightFrac: {
        type: "number",
        required: false,
        description: "Dock height as a fraction of canvas height (0.06-0.4).",
        meta: { constraints: { min: 0.06, max: 0.4 }, control: { step: 0.02 }, ui: { label: "Height" } },
    },
    marginPx: {
        type: "number",
        required: false,
        description: "Margin from the bottom-right corner in pixels (0-128).",
        meta: { constraints: { min: 0, max: 128 }, control: { step: 1 }, ui: { label: "Margin" } },
    },
    dockColor: {
        type: "string",
        required: false,
        description: "Dock fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#b7950b" },
            ui: { label: "Dock color" },
        },
    },
});
exports.PlaceRectDockV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "PlaceRect Dock",
    version: 1,
    description: "Docks one pixel-exact rect in the bottom-right corner via placeRect: margins are null tiles, so nothing quantizes into your rect. Head-only by design — the emitted string bakes THIS canvas's pixels, and the caption prints them so you can watch it re-bake per size.",
    capabilities: { tier: "core" },
    tags: ["geometry", "placement", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Render at two widths and diff the saved m0 — the dock's numbers move, the design doesn't.",
    },
    propsSchema,
    defaultProps: { widthFrac: 0.24, heightFrac: 0.14, marginPx: 32, dockColor: "#b7950b" },
    async render(props, ctx) {
        var _a, _b, _c, _d;
        const widthFrac = (_a = props.widthFrac) !== null && _a !== void 0 ? _a : 0.24;
        const heightFrac = (_b = props.heightFrac) !== null && _b !== void 0 ? _b : 0.14;
        const marginPx = (_c = props.marginPx) !== null && _c !== void 0 ? _c : 32;
        const dockColor = (_d = props.dockColor) !== null && _d !== void 0 ? _d : "#b7950b";
        if (widthFrac < 0.1 || widthFrac > 0.5 || heightFrac < 0.06 || heightFrac > 0.4) {
            throw new Error(`${ID}: widthFrac 0.1-0.5 and heightFrac 0.06-0.4 required.`);
        }
        if (!Number.isInteger(marginPx) || marginPx < 0 || marginPx > 128) {
            throw new Error(`${ID}: marginPx must be an integer 0-128, got ${marginPx}.`);
        }
        if (!HEX.test(dockColor)) {
            throw new Error(`${ID}: dockColor ${JSON.stringify(dockColor)} must be #rrggbb.`);
        }
        const { width, height } = ctx.target;
        const rectW = Math.round(width * widthFrac);
        const rectH = Math.round(height * heightFrac);
        const x = Math.max(0, width - rectW - marginPx);
        const y = Math.max(0, height - rectH - marginPx);
        const placed = (0, dsl_stdlib_1.placeRect)({ rootW: width, rootH: height, rectW, rectH, x, y });
        // The dock plus a caption overlay printing the baked pixels. The
        // caption's overlay is a plain row split whose only tile is the TOP
        // sixth — text stays tightly bound to its band instead of claiming the
        // whole canvas (which would cover the dock's rect in the editor).
        const m0 = (0, dsl_stdlib_1.toM0String)(`${placed.m0}{6[1,-,-,-,-,-]}`, ID);
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                (0, template_utils_1.makeColorTile)(dockColor),
                (0, svg_text_1.svgLabel)(`placeRect ${rectW}x${rectH} at (${x},${y}) - exact px, baked for ${width}x${height}`, width, Math.round(height / 6), { maxPx: Math.round(height * 0.04), maxLines: 2 }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "PlaceRect Dock",
        lines: [
            "placeRect places ONE pixel-exact rect; its margins are null tiles, so nothing quantizes into your rect.",
            "Head-only by design: the emitted string bakes THIS canvas's pixels. For exact rects that must survive nesting, use inset recovery instead.",
        ],
        explore: [
            "Resize the canvas and watch the caption's numbers re-bake",
            "Move the dock with Width / Height / Margin",
        ],
    }),
});
exports.default = exports.PlaceRectDockV1;
