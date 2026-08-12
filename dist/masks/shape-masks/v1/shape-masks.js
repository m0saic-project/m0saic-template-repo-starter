"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShapeMasksV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/masks/shape-masks/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const SHAPES = ["circle", "ellipse", "rounded-rect", "pill"];
const INK_DIM = "#7f8c9b";
/**
 * An arc-pair ellipse (a circle when rx === ry), wound CLOCKWISE. Winding
 * only matters once a path has a second subpath — see masks/path-mask.
 */
function ellipsePathD(cx, cy, rx, ry) {
    return (`M ${cx - rx} ${cy} ` +
        `A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy} ` +
        `A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy} Z`);
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    shape: {
        type: "string",
        required: false,
        description: "\"circle\" (radius from the short side, stays round), \"ellipse\" (fills the cell on purpose), \"rounded-rect\" (roundedRectPathD with your corner), \"pill\" (the same helper at half the short side — not a separate shape).",
        meta: { constraints: { oneOf: [...SHAPES] }, ui: { label: "Shape" } },
    },
    cornerPct: {
        type: "number",
        required: false,
        description: "Corner radius for \"rounded-rect\", as a percent of the short side. At 50 it IS the pill — that is the point.",
        meta: {
            constraints: { min: 0, max: 50 },
            control: { step: 5 },
            ui: { label: "Corner %" },
        },
    },
    shapeColor: {
        type: "string",
        required: false,
        description: "Shape fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#EF7525" },
            ui: { label: "Shape color" },
        },
    },
});
exports.ShapeMasksV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "32 · Shape Masks",
    version: 1,
    description: "There are no shape primitives — every shape is a color tile wearing an SVG path. Circle, ellipse, rounded rect and pill, each authored against the cell's own box, with the caption printing the path the engine actually gets.",
    capabilities: { tier: "core" },
    tags: ["masks", "shapes", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Step through the four shapes, then push Corner % to 50 on rounded-rect.",
    },
    propsSchema,
    defaultProps: { shape: "circle", cornerPct: 15, shapeColor: "#EF7525" },
    async render(props, ctx) {
        var _a, _b, _c;
        const shape = (_a = props.shape) !== null && _a !== void 0 ? _a : "circle";
        const cornerPct = (_b = props.cornerPct) !== null && _b !== void 0 ? _b : 15;
        const shapeColor = (_c = props.shapeColor) !== null && _c !== void 0 ? _c : "#EF7525";
        const problems = [];
        if (!SHAPES.includes(shape)) {
            problems.push(`shape must be one of ${SHAPES.join(" | ")}, got ${JSON.stringify(shape)}`);
        }
        if (!Number.isFinite(cornerPct) || cornerPct < 0 || cornerPct > 50) {
            problems.push(`cornerPct must be 0-50, got ${JSON.stringify(cornerPct)}`);
        }
        if (!HEX.test(shapeColor)) {
            problems.push(`shapeColor ${JSON.stringify(shapeColor)} must be #rrggbb`);
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height } = ctx.target;
        // The shape's cell: the middle column of a 1:6:1 split, above a caption
        // band. Its box IS the mask's design space.
        //
        // The column is DELIBERATELY wide (¾ of the canvas). A pill is a rounded
        // rect whose radius is half the short side, so it only reads as a pill in
        // an elongated box — in a near-square cell the same maths draws a circle
        // and the lesson disappears. A landscape canvas gives 960×600 here, wide
        // enough that the capsule keeps real straight sides; portrait elongates
        // the other way and the pill stands up instead.
        const cell = {
            width: Math.round((width * 6) / 8),
            height: Math.round((height * 5) / 6),
        };
        const short = Math.min(cell.width, cell.height);
        const cx = cell.width / 2;
        const cy = cell.height / 2;
        const inset = Math.round(short * 0.06);
        let localPath;
        let note;
        switch (shape) {
            case "ellipse": {
                // rx and ry from their OWN axes — the shape is meant to be
                // cell-shaped here, which is the one time that's correct.
                localPath = ellipsePathD(cx, cy, cell.width / 2 - inset, cell.height / 2 - inset);
                note = `ellipse rx=${Math.round(cell.width / 2 - inset)} ry=${Math.round(cell.height / 2 - inset)} - fills the cell on purpose`;
                break;
            }
            case "rounded-rect": {
                const r = Math.round((short * cornerPct) / 100);
                localPath = (0, template_utils_1.roundedRectPathD)(inset, inset, cell.width - inset * 2, cell.height - inset * 2, r);
                note = `roundedRectPathD r=${r}px (${cornerPct}% of the ${short}px short side)`;
                break;
            }
            case "pill": {
                // The SAME helper. The radius is the only difference, and the helper
                // clamps it to the half-extents anyway.
                const r = Math.round((cell.height - inset * 2) / 2);
                localPath = (0, template_utils_1.roundedRectPathD)(inset, inset, cell.width - inset * 2, cell.height - inset * 2, r);
                note = `pill = roundedRectPathD at r=${r}px (half the short side) - not a separate shape`;
                break;
            }
            default: {
                // Radius from the SHORT side, so a circle in a rectangle stays round.
                const r = short / 2 - inset;
                localPath = ellipsePathD(cx, cy, r, r);
                note = `circle r=${Math.round(r)}px from the ${short}px short side - equal rx/ry keeps it round`;
                break;
            }
        }
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", {
            claimants: [
                String((0, dsl_stdlib_1.weightedSplit)([1, 6, 1], "col", { claimants: ["-", "1", "-"] })),
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
                (0, template_utils_1.makeColorTile)(shapeColor, {
                    mask: {
                        kind: "inline-mask",
                        localPath,
                        // The design space IS the cell — same aspect, no smear.
                        bounds: { x: 0, y: 0, width: cell.width, height: cell.height },
                    },
                }),
                (0, svg_text_1.svgLabel)(`${note} - in a ${cell.width}x${cell.height} cell`, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.03),
                    maxLines: 2,
                    color: INK_DIM,
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Shape Masks",
        lines: [
            "There are no shape primitives: every shape is a color tile plus an inline-mask whose localPath is an SVG path.",
            "CIRCLE takes its radius from the SHORT side so it stays round in a rectangle; ELLIPSE uses both axes on purpose.",
            "PILL is not a fifth shape - it is roundedRectPathD at half the short side, and the helper clamps anything larger.",
            "All four are authored against the CELL's box, which is what keeps them un-smeared.",
        ],
        explore: [
            "Step through the four shapes and read the caption's path math",
            "Push Corner % to 50 on rounded-rect - it becomes the pill",
            "Switch the Device to portrait: circle stays round, ellipse re-shapes",
            "Select the tile and open its MASK section",
        ],
    }),
});
exports.default = exports.ShapeMasksV1;
