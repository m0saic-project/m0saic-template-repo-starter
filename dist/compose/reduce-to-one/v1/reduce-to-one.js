"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReduceToOneV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/compose/reduce-to-one/v1";
const MODES = ["flat", "reduced"];
const CHILD_REF = "field";
const INK_DIM = "#7f8c9b";
const FIELD_A = "#1a5276";
const FIELD_B = "#2471a3";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    mode: {
        type: "string",
        required: false,
        description: "\"flat\": the grid is spelled inline, so the PARENT's m0 grows with the density. \"reduced\": the grid moves into a child and the parent collapses to one cell — same pixels, different string.",
        meta: { constraints: { oneOf: [...MODES] }, ui: { label: "Mode" } },
    },
    density: {
        type: "number",
        required: false,
        description: "Grid density (N×N cells). Raise it and watch only ONE of the two spellings get longer.",
        meta: {
            constraints: { min: 2, max: 12 },
            control: { step: 1 },
            ui: { label: "Density" },
        },
    },
});
exports.ReduceToOneV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "45 · Reduce to One",
    version: 1,
    description: "The same grid spelled two ways: inline (the parent's m0 grows with the density) or pushed into a child (the parent stays one cell). Identical pixels, and the caption prints both string lengths so the refactor's cost and benefit are numbers.",
    capabilities: { tier: "core" },
    tags: ["compose", "complexity", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Raise Density with mode \"flat\", then flip to \"reduced\" and compare the m0 lengths.",
    },
    propsSchema,
    defaultProps: { mode: "flat", density: 6 },
    async render(props, ctx) {
        var _a, _b;
        const mode = (_a = props.mode) !== null && _a !== void 0 ? _a : "flat";
        const density = (_b = props.density) !== null && _b !== void 0 ? _b : 6;
        const problems = [];
        if (!MODES.includes(mode)) {
            problems.push(`mode must be one of ${MODES.join(" | ")}, got ${JSON.stringify(mode)}`);
        }
        if (!Number.isInteger(density) || density < 2 || density > 12) {
            problems.push(`density must be a whole number 2-12, got ${JSON.stringify(density)}`);
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height } = ctx.target;
        // The dense part, as a string — identical in both modes. The only
        // question is WHO carries it.
        const ones = new Array(density).fill(1);
        const gridRow = String((0, dsl_stdlib_1.weightedSplit)(ones, "col", { claimants: new Array(density).fill("1") }));
        const grid = String((0, dsl_stdlib_1.weightedSplit)(ones, "row", { claimants: new Array(density).fill(gridRow) }));
        const cells = [];
        for (let r = 0; r < density; r++) {
            for (let c = 0; c < density; c++) {
                cells.push((0, template_utils_1.makeColorTile)((r + c) % 2 === 0 ? FIELD_A : FIELD_B));
            }
        }
        // Both modes: the field on top, a caption band underneath. Only the top
        // cell's spelling differs.
        const fieldBox = { width, height: Math.round((height * 5) / 6) };
        const children = {};
        let topCell;
        let sources;
        if (mode === "reduced") {
            children[CHILD_REF] = {
                kind: "mosaic_document",
                version: 1,
                m0: (0, dsl_stdlib_1.toM0String)(grid, `${ID}:child`),
                assets: {},
                size: fieldBox,
                sources: cells,
            };
            topCell = "1";
            sources = [{ type: "mosaic", ref: CHILD_REF, placement: { fit: "contain" } }];
        }
        else {
            topCell = grid;
            sources = [...cells];
        }
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: [topCell, "1"] })), ID);
        // The receipts. Same cell count, same picture; two very different
        // strings for the parent to carry.
        const flatLength = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: [grid, "1"] })), `${ID}:measure`).length;
        const caption = `${mode}: parent m0 ${m0.length} chars for ${density}x${density} = ${density * density} cells` +
            (mode === "reduced"
                ? ` (flat would be ${flatLength}) - the grid moved into a child with its own ${fieldBox.width}x${fieldBox.height} space`
                : ` - reduced would be ${(0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: ["1", "1"] })), `${ID}:measure`)
                    .length}, at the cost of one extra encode pass`);
        sources.push((0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
            maxPx: Math.round(height * 0.028),
            maxLines: 2,
            color: INK_DIM,
        }));
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            ...(mode === "reduced" ? { children } : {}),
            sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Reduce to One",
        lines: [
            "\"Reduce to 1\" is a refactor: move a dense subtree into a child and the parent collapses to one frame.",
            "The pixels do not change. What changes is the string the parent carries - and which precision tier each half lives in.",
            "Worth it for a dense, precision-hungry subtree; not for a cheap one, where you just bought an extra encode pass.",
            "The move after this one is baking: if the child never varies, pre-render it once and reference a flat asset.",
        ],
        explore: [
            "Raise Density to 12 in flat and watch the parent m0 climb",
            "Flip to reduced: same picture, parent m0 back to a few chars",
            "Structure dock: one deep tree versus two shallow ones",
            "Compare with compose/child-mosaic - same mechanism, other reason",
        ],
    }),
});
exports.default = exports.ReduceToOneV1;
