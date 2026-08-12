"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaskInACellV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const svg_text_1 = require("../../../_shared/svg-text");
const ID = "@m0saic-starter/geometry/mask-in-a-cell/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    matchAspect: {
        type: "boolean",
        required: false,
        description: "true: mask bounds match the cell aspect (diamond stays a diamond). false: square bounds stretched over the cell — the silent smear this lesson exists to show.",
        meta: { ui: { label: "Match cell aspect" } },
    },
    shapeColor: {
        type: "string",
        required: false,
        description: "Shape fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#c0392b" },
            ui: { label: "Shape color" },
        },
    },
});
exports.MaskInACellV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "11 · Mask in a Cell",
    version: 1,
    description: "A diamond as it should be built: a color tile with an inline SVG-path mask inside a plain ratio cell. Bounds scale onto the cell PER AXIS — match their aspect to the cell or the shape silently smears. Flip the toggle to see both.",
    capabilities: { tier: "core" },
    tags: ["geometry", "masks", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Flip Match cell aspect off and re-render — same string, smeared shape.",
    },
    propsSchema,
    defaultProps: { matchAspect: true, shapeColor: "#c0392b" },
    async render(props, ctx) {
        var _a, _b;
        const matchAspect = (_a = props.matchAspect) !== null && _a !== void 0 ? _a : true;
        const shapeColor = (_b = props.shapeColor) !== null && _b !== void 0 ? _b : "#c0392b";
        if (!HEX.test(shapeColor)) {
            throw new Error(`${ID}: shapeColor ${JSON.stringify(shapeColor)} must be #rrggbb.`);
        }
        const { width, height } = ctx.target;
        // The shape's cell: the center third of a 1:1:1 column split.
        const cellW = Math.round(width / 3);
        const cellH = height;
        // The DESIGN SPACE. Correct mode: bounds shaped like the cell, with the
        // diamond drawn regular inside them (its own aspect preserved by using
        // the short side). Smear mode: square bounds — the engine stretches
        // them onto the non-square cell and the diamond distorts with them.
        const bounds = matchAspect
            ? { x: 0, y: 0, width: cellW, height: cellH }
            : { x: 0, y: 0, width: 100, height: 100 };
        const cx = bounds.width / 2;
        const cy = bounds.height / 2;
        const r = matchAspect ? Math.min(cellW, cellH) * 0.42 : 50;
        const localPath = `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
        // Caption bound to the BOTTOM sixth via a plain row-split overlay —
        // full-canvas text would cover the diamond's cell in the editor.
        const m0 = (0, dsl_stdlib_1.toM0String)("3(-,1,-){6[-,-,-,-,-,1]}", ID);
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                (0, template_utils_1.makeColorTile)(shapeColor, {
                    mask: { kind: "inline-mask", localPath, bounds },
                }),
                (0, svg_text_1.svgLabel)(matchAspect
                    ? `bounds ${bounds.width}x${bounds.height} match the ${cellW}x${cellH} cell - true diamond`
                    : `square bounds stretched onto a ${cellW}x${cellH} cell - the silent smear`, width, Math.round(height / 6), { maxPx: Math.round(height * 0.04), maxLines: 2 }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Mask in a Cell",
        lines: [
            "A shape is an ordinary color tile with an inline SVG-path mask, living in an ordinary ratio cell - shapes cost zero DSL.",
            "Mask bounds scale onto the cell PER AXIS: author against square bounds, drop into a non-square cell, and the shape silently smears. No error, no warning.",
            "The fix: make the bounds match the cell's aspect, computed from ctx.target and your own split weights.",
        ],
        explore: [
            "Toggle Match cell aspect off - same string, smeared diamond",
            "Switch the Device aspect and re-check both modes",
        ],
    }),
});
exports.default = exports.MaskInACellV1;
