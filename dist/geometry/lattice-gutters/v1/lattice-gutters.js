"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LatticeGuttersV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const geometry_1 = require("../../../_shared/geometry");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/geometry/lattice-gutters/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    rows: {
        type: "number",
        required: false,
        description: "Grid rows (2-4).",
        meta: { constraints: { min: 2, max: 4 }, control: { step: 1 }, ui: { label: "Rows" } },
    },
    cols: {
        type: "number",
        required: false,
        description: "Grid columns (2-6).",
        meta: { constraints: { min: 2, max: 6 }, control: { step: 1 }, ui: { label: "Columns" } },
    },
    gutterPx: {
        type: "number",
        required: false,
        description: "Gutter between cells in pixels (2-48) — exact at every canvas.",
        meta: { constraints: { min: 2, max: 48 }, control: { step: 1 }, ui: { label: "Gutter" } },
    },
    marginPx: {
        type: "number",
        required: false,
        description: "Outer margin in pixels (0-64).",
        meta: { constraints: { min: 0, max: 64 }, control: { step: 1 }, ui: { label: "Margin" } },
    },
    gutterMode: {
        type: "string",
        required: false,
        description: "Same lattice, two spellings: \"inset\" keeps a tiny grid string with gutters as leaf-private insets; \"split\" spells gutters/margins as real cells at pixel precision — watch chars and the precision floor balloon.",
        meta: {
            constraints: { oneOf: ["inset", "split"] },
            ui: { label: "Gutter mode" },
        },
    },
    tileColor: {
        type: "string",
        required: false,
        description: "Tile fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#21618c" },
            ui: { label: "Tile color" },
        },
    },
});
/**
 * Axis segments [margin, cell, gutter, cell, ..., margin] in raw px, with
 * matching claimants (`"-"` for air, the provided claimant for cells).
 * Zero-width segments are dropped (weightedSplit needs positive weights).
 */
function axisSegments(cellStarts, cellSizes, axisLen, cellClaimants) {
    const weights = [];
    const claimants = [];
    let cursor = 0;
    for (let i = 0; i < cellStarts.length; i++) {
        const air = cellStarts[i] - cursor;
        if (air > 0) {
            weights.push(air);
            claimants.push("-");
        }
        weights.push(cellSizes[i]);
        claimants.push(cellClaimants[i]);
        cursor = cellStarts[i] + cellSizes[i];
    }
    const tail = axisLen - cursor;
    if (tail > 0) {
        weights.push(tail);
        claimants.push("-");
    }
    return { weights, claimants };
}
exports.LatticeGuttersV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "09 · Lattice Gutters",
    version: 1,
    description: "Base × fiber: a plain gutterless grid with pixel-exact gutters as per-cell placement insets (latticeCellInset) — or flip Gutter mode to spell the SAME lattice as real split cells and watch the string length and precision floor balloon. The caption prints the receipts.",
    capabilities: { tier: "core" },
    tags: ["geometry", "gutters", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Flip Gutter mode and read the caption — same pixels, wildly different strings.",
    },
    propsSchema,
    defaultProps: {
        rows: 2,
        cols: 3,
        gutterPx: 16,
        marginPx: 24,
        gutterMode: "inset",
        tileColor: "#21618c",
    },
    async render(props, ctx) {
        var _a, _b, _c, _d, _e, _f;
        const rows = (_a = props.rows) !== null && _a !== void 0 ? _a : 2;
        const cols = (_b = props.cols) !== null && _b !== void 0 ? _b : 3;
        const gutterPx = (_c = props.gutterPx) !== null && _c !== void 0 ? _c : 16;
        const marginPx = (_d = props.marginPx) !== null && _d !== void 0 ? _d : 24;
        const gutterMode = (_e = props.gutterMode) !== null && _e !== void 0 ? _e : "inset";
        const tileColor = (_f = props.tileColor) !== null && _f !== void 0 ? _f : "#21618c";
        for (const [name, v, lo, hi] of [
            ["rows", rows, 2, 4],
            ["cols", cols, 2, 6],
            ["gutterPx", gutterPx, 2, 48],
            ["marginPx", marginPx, 0, 64],
        ]) {
            if (!Number.isInteger(v) || v < lo || v > hi) {
                throw new Error(`${ID}: ${name} must be an integer ${lo}-${hi}, got ${v}.`);
            }
        }
        if (gutterMode !== "inset" && gutterMode !== "split") {
            throw new Error(`${ID}: gutterMode must be "inset" or "split", got ${JSON.stringify(gutterMode)}.`);
        }
        if (!HEX.test(tileColor)) {
            throw new Error(`${ID}: tileColor ${JSON.stringify(tileColor)} must be #rrggbb.`);
        }
        const { width, height } = ctx.target;
        // The RAW cells a plain grid realizes at the target — equal splits
        // follow the outside-in remainder rule on each axis.
        const xs = (0, geometry_1.outsideInSizes)(width, cols);
        const ys = (0, geometry_1.outsideInSizes)(height, rows);
        const xOff = [0];
        const yOff = [0];
        for (const w of xs)
            xOff.push(xOff[xOff.length - 1] + w);
        for (const h of ys)
            yOff.push(yOff[yOff.length - 1] + h);
        const cells = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                cells.push({
                    unit: { c0: c, r0: r, cs: 1, rs: 1 },
                    raw: { x: xOff[c], y: yOff[r], w: xs[c], h: ys[r] },
                });
            }
        }
        // The shared TARGET lattice both modes render: exact g gutters, exact
        // m margins, integer lattice lines rounded independently.
        const lattice = (0, template_utils_1.latticeCellInset)({
            cols,
            rows,
            canvasW: width,
            canvasH: height,
            gutterXPx: gutterPx,
            gutterYPx: gutterPx,
            marginPx,
            cells,
        });
        const targets = lattice.targets;
        let baseM0;
        let sources;
        if (gutterMode === "inset") {
            // BASE: the plain gutterless grid. FIBER: per-cell recovery insets.
            const rowM0 = `${cols}(${new Array(cols).fill("1").join(",")})`;
            baseM0 = `${rows}[${new Array(rows).fill(rowM0).join(",")}]`;
            sources = cells.map((_, i) => {
                const inset = lattice.insetAt(i);
                return (0, template_utils_1.makeColorTile)(tileColor, inset ? { placement: { inset } } : undefined);
            });
        }
        else {
            // SPLIT: the SAME targets spelled as real cells — margins and gutters
            // become `-` tiles weighted in raw pixels. Rows first, each content
            // row nesting a column split; every number below is THIS canvas's.
            const row0 = targets.slice(0, cols);
            const colSplit = axisSegments(row0.map((t) => t.x), row0.map((t) => t.w), width, new Array(cols).fill("1"));
            const colM0 = (0, dsl_stdlib_1.weightedSplit)(colSplit.weights, "col", {
                claimants: colSplit.claimants,
            });
            const rowRects = new Array(rows)
                .fill(null)
                .map((_, r) => targets[r * cols]);
            const rowSplit = axisSegments(rowRects.map((t) => t.y), rowRects.map((t) => t.h), height, new Array(rows).fill(String(colM0)));
            baseM0 = String((0, dsl_stdlib_1.weightedSplit)(rowSplit.weights, "row", { claimants: rowSplit.claimants }));
            sources = cells.map(() => (0, template_utils_1.makeColorTile)(tileColor));
        }
        // The receipts, measured on the BASE spelling (before the caption
        // overlay): character count + precision floor at this canvas — and the
        // honest edge case: when tiny gutters on fine grids leave less slack
        // than the raw split's +-1px jitter, targets get CLAMPED back to their
        // raw cells and some gutters narrow by that amount. The library reports
        // it (maxClampPx / clampedEdges); a lesson template prints it.
        const prec = (0, dsl_stdlib_1.evaluateM0)(baseM0, { width, height }).precision;
        const clampNote = gutterMode === "inset" && lattice.maxClampPx > 0
            ? `, clamped ${lattice.clampedEdges} edge${lattice.clampedEdges === 1 ? "" : "s"} by <=${lattice.maxClampPx}px (slack < jitter)`
            : "";
        const caption = `gutterMode "${gutterMode}": ${baseM0.length} chars, precision ${prec.maxSplitX}x${prec.maxSplitY}${clampNote}`;
        // Caption bound to its own bottom band (tight text binding).
        const m0 = (0, dsl_stdlib_1.toM0String)(`${baseM0}{6[-,-,-,-,-,1]}`, ID);
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                ...sources,
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.032),
                    maxLines: 1,
                    color: "#7f8c9b",
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Lattice Gutters",
        lines: [
            "Base x fiber: the m0 stays a plain gutterless grid, and the gutters live in per-cell insets from latticeCellInset.",
            "Spell the same lattice as real cells and the string balloons while its precision floor jumps toward canvas scale.",
            "The +-1px rounding lands in CELL WIDTHS, never the gutters - a gutter is exactly g wherever its line falls.",
        ],
        explore: [
            "Flip Gutter mode and watch the caption's chars + precision move",
            "Set Gutter 6 with 6 columns - the gaps stay exact",
            "Select a tile in inset mode: rect vs effective",
        ],
    }),
});
exports.default = exports.LatticeGuttersV1;
