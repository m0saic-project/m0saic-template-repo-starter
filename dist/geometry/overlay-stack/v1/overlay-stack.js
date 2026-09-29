"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OverlayStackV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const svg_text_1 = require("../../../_shared/svg-text");
const ID = "@m0saic-starter/geometry/overlay-stack/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    baseColor: {
        type: "string",
        required: false,
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#154360" },
        },
    },
    bandColor: {
        type: "string",
        required: false,
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2e86c1" },
        },
    },
});
exports.OverlayStackV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: { tier: "core" },
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Three layers of paint from three frames — read the string alongside the render.",
    },
    propsSchema,
    defaultProps: { baseColor: "#154360", bandColor: "#2e86c1" },
    async render(props, ctx) {
        var _a, _b;
        const baseColor = (_a = props.baseColor) !== null && _a !== void 0 ? _a : "#154360";
        const bandColor = (_b = props.bandColor) !== null && _b !== void 0 ? _b : "#2e86c1";
        for (const [key, value] of [
            ["baseColor", baseColor],
            ["bandColor", bandColor],
        ]) {
            if (!HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const { width, height } = ctx.target;
        // base -> its overlay band (middle third of the canvas) -> the band's
        // own overlay badge. Every `{...}` restores its node's full rect.
        const m0 = (0, dsl_stdlib_1.toM0String)("1{3[-,1{1},-]}", ID);
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            sources: [
                (0, template_utils_1.bindProp)((0, template_utils_1.makeColorTile)(baseColor), "baseColor"),
                (0, template_utils_1.bindProp)((0, template_utils_1.makeColorTile)(bandColor), "bandColor"),
                (0, svg_text_1.svgLabel)("badge: painted last, above everything", width, height / 3, {
                    maxPx: Math.round(height * 0.05),
                    maxLines: 2,
                }),
            ],
        };
    },
    // `canvasFill` is a THROW: a full-canvas colour rect is normally the smell.
    // Here it is the SUBJECT, so it is declared rather than removed.
    canvas: { baseRect: "the lesson IS the full-rect base: `1{3[-,1{1},-]}` shows every `{…}` restoring its node's whole rect, with two overlays stacked on it" },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Overlay Stack",
        lines: [
            "Attach {...} to any node and its content re-splits that node's FULL rect - layered above, painted after.",
            "Walk order is paint order is source-binding order: base, then band, then badge.",
            "The whole card is one string: 1{3[-,1{1},-]}.",
        ],
        explore: [
            "Geometry view: step the layer filter through depths",
            "Change the two colors - base and band bind in walk order",
        ],
    }),
});
exports.default = exports.OverlayStackV1;
