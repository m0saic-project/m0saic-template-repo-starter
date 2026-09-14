"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsetRecoveryV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const svg_text_1 = require("../../../_shared/svg-text");
const ID = "@m0saic-starter/geometry/inset-recovery/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    chipColor: {
        type: "string",
        required: false,
        description: "Chip fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#b7950b" },
            ui: { label: "Chip color" },
        },
    },
});
/** Deliberately awkward design rects — prime-ish offsets, exact pixels. */
function chipRects(width, height) {
    const w = Math.round(width * 0.23);
    const h = Math.round(height * 0.17);
    return [
        { x: Math.round(width * 0.071), y: Math.round(height * 0.13), w, h },
        { x: Math.round(width * 0.409), y: Math.round(height * 0.437), w, h },
        { x: Math.round(width * 0.719), y: Math.round(height * 0.211), w, h },
    ];
}
exports.InsetRecoveryV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "10 · Inset Recovery",
    version: 1,
    description: "Three chips at exact pixel rects, placed with placeInsetPieces: the string stays coarse (precision bounded at the lattice basis) while placement.inset recovers every rect byte-exact. The card prints the same layout's precision floor spelled via placeRects — the hereditary cost a parent would inherit. Why nestable templates use inset recovery.",
    capabilities: { tier: "core" },
    tags: ["geometry", "precision", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Read the two precision numbers on the caption — same pixels, different promises to a parent.",
    },
    propsSchema,
    defaultProps: { chipColor: "#b7950b" },
    async render(props, ctx) {
        var _a;
        const chipColor = (_a = props.chipColor) !== null && _a !== void 0 ? _a : "#b7950b";
        if (!HEX.test(chipColor)) {
            throw new Error(`${ID}: chipColor ${JSON.stringify(chipColor)} must be #rrggbb.`);
        }
        const { width, height } = ctx.target;
        const rects = chipRects(width, height);
        const chipPieces = rects.map((rect) => ({
            rect,
            source: (0, template_utils_1.makeColorTile)(chipColor),
        }));
        // Measure the chips' two spellings FIRST so the caption can print the
        // receipts: the coarse inset-recovery string vs the same rects spelled
        // raw (the precision floor a parent would inherit from each).
        const chipsOnly = (0, template_utils_1.placeInsetPieces)({ rootW: width, rootH: height, pieces: chipPieces });
        const raw = (0, dsl_stdlib_1.placeRects)({ rootW: width, rootH: height, rects });
        const insetPrec = (0, dsl_stdlib_1.evaluateM0)(chipsOnly.m0, { width, height }).precision;
        const rawPrec = (0, dsl_stdlib_1.evaluateM0)(raw.m0, { width, height }).precision;
        const caption = `placeInsetPieces: precision ${insetPrec.maxSplitX}x${insetPrec.maxSplitY}` +
            ` - placeRects same chips: ${rawPrec.maxSplitX}x${rawPrec.maxSplitY}.` +
            ` Coarse string, exact pixels - parents inherit the small number.`;
        // THE move: coarse quantized cells + per-source recovery insets, with
        // the caption riding as one more (full-canvas, lattice-aligned, top-
        // importance) piece — the builder owns ALL the layer composition, so
        // there's no hand-rolled overlay to get wrong.
        const placed = (0, template_utils_1.placeInsetPieces)({
            rootW: width,
            rootH: height,
            pieces: [
                ...chipPieces,
                {
                    // The caption binds to its OWN bottom band — full-canvas text
                    // would sit over every chip's rect and hijack tile selection in
                    // the editor. Tight rects are kinder to humans clicking around.
                    rect: {
                        x: Math.round(width * 0.08),
                        y: Math.round(height * 0.86),
                        w: Math.round(width * 0.84),
                        h: Math.round(height * 0.12),
                        importance: 10,
                    },
                    source: (0, svg_text_1.svgLabel)(caption, Math.round(width * 0.84), Math.round(height * 0.12), {
                        maxPx: Math.round(height * 0.035),
                        maxLines: 2,
                    }),
                },
            ],
        });
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)(placed.m0, ID),
            assets: {},
            backgroundColor: "#0b0e11",
            sources: placed.sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Inset Recovery",
        lines: [
            "placeInsetPieces quantizes each chip onto a coarse lattice, then recovers the EXACT rect via placement.inset - coarse string, exact pixels.",
            "Precision is hereditary: raw placeRects here demands near-canvas precision, while the inset spelling stays bounded at the lattice basis.",
            "This is why nestable production templates reach for inset recovery by default.",
        ],
        explore: [
            "Two precision numbers on the caption - same pixels, different promises",
            "Select a chip: rect is the quantized cell, effective the painted box",
            "Resize the canvas - the chips stay exact",
        ],
    }),
});
exports.default = exports.InsetRecoveryV1;
