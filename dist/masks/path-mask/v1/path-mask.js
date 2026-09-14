"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathMaskV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/masks/path-mask/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const WINDINGS = ["opposite", "same"];
const INK_DIM = "#7f8c9b";
/**
 * One circle as two half-arcs. `sweep` is the SVG arc sweep flag and it is
 * the whole lesson: 1 draws clockwise, 0 counter-clockwise.
 */
function circlePathD(cx, cy, r, sweep) {
    return (`M ${cx - r} ${cy} ` +
        `A ${r} ${r} 0 1 ${sweep} ${cx + r} ${cy} ` +
        `A ${r} ${r} 0 1 ${sweep} ${cx - r} ${cy} Z`);
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    innerWinding: {
        type: "string",
        required: false,
        description: "Which way round the inner circle is drawn. \"opposite\" = the other way from the outer circle, which is what punches the hole (the two directions cancel out in the middle). \"same\" = the same way round, and the middle fills in instead — a disc, with nothing to tell you why.",
        meta: {
            constraints: { oneOf: [...WINDINGS] },
            ui: { label: "Inner circle drawn" },
        },
    },
    matte: {
        type: "number",
        required: false,
        description: "Alpha for everything OUTSIDE the path (0 = clipped away, the default). Above 0 the whole bounds box renders at this alpha beneath the fully-opaque path — one tile, translucent wash plus crisp marks.",
        meta: {
            constraints: { min: 0, max: 1 },
            control: { step: 0.05 },
            ui: { label: "Matte alpha" },
        },
    },
    inkColor: {
        type: "string",
        required: false,
        description: "Ink for the tile the mask clips, as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2e86c1" },
            ui: { label: "Ink" },
        },
    },
});
exports.PathMaskV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "46 · Path Mask",
    version: 1,
    description: "A donut, and the two rules behind it: a shape inside another cuts a hole only when it is DRAWN the other way round (the two directions cancel; draw them the same way and the middle fills in silently), and `matte` renders the area outside the path at a chosen alpha instead of clipping it away.",
    capabilities: { tier: "core" },
    tags: ["masks", "paths", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Flip Inner circle drawn to \"same\" — the hole fills in with no error at all.",
    },
    propsSchema,
    defaultProps: { innerWinding: "opposite", matte: 0, inkColor: "#2e86c1" },
    async render(props, ctx) {
        var _a, _b, _c;
        const innerWinding = (_a = props.innerWinding) !== null && _a !== void 0 ? _a : "opposite";
        const matte = (_b = props.matte) !== null && _b !== void 0 ? _b : 0;
        const inkColor = (_c = props.inkColor) !== null && _c !== void 0 ? _c : "#2e86c1";
        const problems = [];
        if (!WINDINGS.includes(innerWinding)) {
            problems.push(`innerWinding must be one of ${WINDINGS.join(" | ")}, got ${JSON.stringify(innerWinding)}`);
        }
        if (!Number.isFinite(matte) || matte < 0 || matte > 1) {
            problems.push(`matte is an alpha 0-1, got ${JSON.stringify(matte)}`);
        }
        if (!HEX.test(inkColor)) {
            problems.push(`inkColor ${JSON.stringify(inkColor)} must be #rrggbb`);
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height } = ctx.target;
        const cell = {
            width: Math.round((width * 2) / 4),
            height: Math.round((height * 5) / 6),
        };
        const cx = cell.width / 2;
        const cy = cell.height / 2;
        const outerR = Math.round(Math.min(cell.width, cell.height) * 0.42);
        const innerR = Math.round(outerR * 0.5);
        // Outer always clockwise. The inner subpath's sweep flag is the entire
        // difference between a ring and a disc.
        const localPath = circlePathD(cx, cy, outerR, 1) +
            " " +
            circlePathD(cx, cy, innerR, innerWinding === "opposite" ? 0 : 1);
        const mask = {
            kind: "inline-mask",
            localPath,
            bounds: { x: 0, y: 0, width: cell.width, height: cell.height },
            // Omit the field entirely at 0 — that IS the default, and a document
            // shouldn't carry knobs it isn't using.
            ...(matte > 0 ? { matte } : {}),
        };
        const caption = `2 circles in one path (budget ${template_utils_1.MASK_SUBPATH_BUDGET}) - inner drawn the ${innerWinding === "opposite" ? "OTHER way round" : "SAME way round"}: ` +
            (innerWinding === "opposite"
                ? "the two directions cancel, so the middle is a HOLE"
                : "the directions add up, so the middle fills in - a ring that isn't") +
            (matte > 0 ? ` - matte ${matte}: the box outside the path renders at that alpha` : "");
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", {
            claimants: [
                String((0, dsl_stdlib_1.weightedSplit)([1, 2, 1], "col", { claimants: ["-", "1", "-"] })),
                "1",
            ],
        })), ID);
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                (0, template_utils_1.makeColorTile)(inkColor, { mask }),
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.028),
                    maxLines: 2,
                    color: INK_DIM,
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Path Mask",
        lines: [
            "A path is a pen stroke, and every loop goes round one way or the other.",
            "To decide if a spot is a hole, the renderer counts the loops around it: clockwise +1, counter-clockwise -1. Zero means hole.",
            "So a donut is two circles drawn OPPOSITE ways. Draw them the same way and the middle fills in - a disc, and nothing errors.",
            "matte is the other knob: instead of clipping the outside away, render it at an alpha under the opaque path.",
        ],
        explore: [
            "Flip Inner circle drawn to \"same\" - the hole fills in, silently",
            "Raise Matte alpha to 0.3 - the cell washes in, the ring stays solid",
            "Judge a matte in motion; a still shows it at full strength today",
            "Change the ink: the mask decides the shape, never the pixels",
        ],
    }),
});
exports.default = exports.PathMaskV1;
