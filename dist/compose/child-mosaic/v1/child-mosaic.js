"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildMosaicV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/compose/child-mosaic/v1";
const CHILD_REF = "grid";
const PANEL = "#17202a";
const CHILD_A = "#EF7525";
const CHILD_B = "#2e86c1";
const INK_DIM = "#7f8c9b";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    childGrid: {
        type: "number",
        required: false,
        description: "The child document's grid (N×N). Raise it and watch the PARENT's m0 stay exactly the same length — that is the point.",
        meta: {
            constraints: { min: 2, max: 5 },
            control: { step: 1 },
            ui: { label: "Child grid" },
        },
    },
    declareChildSize: {
        type: "boolean",
        required: false,
        description: "Declare a square `size` on the child. A procedural child has no media to measure, so this is its ONLY aspect signal — without it the child renders at the parent tile's shape and its square cells stretch.",
        meta: { ui: { label: "Declare child size" } },
    },
});
exports.ChildMosaicV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "38 · Child Mosaic",
    version: 1,
    description: "A complete document rendered inside one tile: children + a {type:\"mosaic\", ref} source, evaluated bottom-up. The child's grid grows while the parent's m0 stays two cells — and a procedural child keeps its aspect only if it declares its own size.",
    capabilities: { tier: "core" },
    tags: ["compose", "children", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Drag Child grid 2→5: the parent's m0 never changes. Then flip Declare child size.",
    },
    propsSchema,
    defaultProps: { childGrid: 3, declareChildSize: true },
    async render(props, ctx) {
        var _a, _b;
        const childGrid = (_a = props.childGrid) !== null && _a !== void 0 ? _a : 3;
        const declareChildSize = (_b = props.declareChildSize) !== null && _b !== void 0 ? _b : true;
        if (!Number.isInteger(childGrid) || childGrid < 2 || childGrid > 5) {
            throw new Error(`${ID}: childGrid must be a whole number 2-5, got ${JSON.stringify(childGrid)}.`);
        }
        const { width, height } = ctx.target;
        /* ── The child: a complete document of its own ─────────── */
        const ones = new Array(childGrid).fill(1);
        const row = String((0, dsl_stdlib_1.weightedSplit)(ones, "col", { claimants: new Array(childGrid).fill("1") }));
        const childM0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)(ones, "row", { claimants: new Array(childGrid).fill(row) })), `${ID}:child`);
        // Checkerboard, so a stretched cell is obvious at a glance.
        const childSources = [];
        for (let r = 0; r < childGrid; r++) {
            for (let c = 0; c < childGrid; c++) {
                childSources.push((0, template_utils_1.makeColorTile)((r + c) % 2 === 0 ? CHILD_A : CHILD_B));
            }
        }
        // A SQUARE declared size against a portrait-ish tile, so the difference
        // the flag makes is visible rather than theoretical.
        const childSquare = Math.min(width, height);
        const child = {
            kind: "mosaic_document",
            version: 1,
            m0: childM0,
            assets: {},
            backgroundColor: "#101418",
            ...(declareChildSize
                ? { size: { width: childSquare, height: childSquare } }
                : {}),
            sources: childSources,
        };
        /* ── The parent: two cells. Always two cells. ──────────── */
        const parentM0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([1, 1], "col", { claimants: ["1{1}", "1"] })), ID);
        const caption = `parent m0 "${parentM0}" (${parentM0.length} chars, 2 cells) - ` +
            `child m0 "${childM0}" (${childGrid * childGrid} cells) - ` +
            (declareChildSize
                ? `child declares ${childSquare}x${childSquare}, so it keeps its square cells and letterboxes`
                : `child declares NO size, so it renders at the tile's shape and its cells stretch`);
        return {
            kind: "mosaic_document",
            version: 1,
            m0: parentM0,
            assets: {},
            backgroundColor: "#0b0e11",
            children: { [CHILD_REF]: child },
            sources: [
                (0, template_utils_1.makeColorTile)(PANEL),
                (0, svg_text_1.svgLabel)(caption, Math.round(width / 2), height, {
                    maxPx: Math.round(height * 0.032),
                    maxLines: 8,
                    color: INK_DIM,
                }),
                // The whole nested document, as one tile's content.
                { type: "mosaic", ref: CHILD_REF, placement: { fit: "contain" } },
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Child Mosaic",
        lines: [
            "children is a map of complete documents, and a {type:\"mosaic\", ref} source says \"this tile is that document\".",
            "Evaluation is bottom-up: each child renders into its own framebuffer first, and the parent treats the result as media.",
            "So the parent's m0 never grows - the DSL is shape, children is content. A finite framebuffer also CLIPS by construction.",
            "A procedural child has nothing to measure, so declare size or it inherits the parent tile's shape.",
        ],
        explore: [
            "Drag Child grid 2 to 5 - the parent's m0 never moves",
            "Flip Declare child size off: the square cells stretch",
            "Open the structure dock - the child is a document, one level in",
            "Switch the Device aspect and watch which mode keeps its squares",
        ],
    }),
});
exports.default = exports.ChildMosaicV1;
