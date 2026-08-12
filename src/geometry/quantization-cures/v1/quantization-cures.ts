import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import {
  findFrames,
  placeRects,
  snapGridFit,
  toM0String,
  weightedSplit,
} from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  latticeCellInset,
  makeColorTile,
} from "@m0saic/template-utils";

import { outsideInSizes } from "../../../_shared/geometry";
import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/geometry/quantization-cures/v1` — the geometry chapter's
 * capstone: one 12×3 gridded design, the quantization disease, and every
 * cure in the toolbox, one enum flip apart.
 *
 * ONE CONCEPT: quantization SPREAD is what you get when a ratio string
 * meets a canvas that doesn't divide it — and each cure trades something
 * different to get exactness back.
 *
 *   - "naive" (the disease): gutters spelled as ratio weights (1 against
 *     24). Whatever the canvas, each gutter quantizes independently to N
 *     or N+1 px — and at 3-5px line weights a 1px wobble reads as a
 *     25-33% difference. Thin lines are quantization's magnifying glass.
 *   - "inset" (recover): the m0 stays a PLAIN grid; `latticeCellInset`
 *     carves exact G-px gutters as per-cell placement insets. The ±1px
 *     jitter moves into cell widths (where equal grids carry it anyway).
 *     String stays tiny; precision floor stays at the grid's own scale;
 *     survives nesting. (Deep dive: geometry/lattice-gutters.)
 *   - "snap" (refuse): `snapGridFit` snaps the whole grid into the largest
 *     quantization-FREE inner rect. Every cell identical, every gutter
 *     identical — the cost is coverage: a margin handed back to the
 *     canvas.
 *   - "rects" (bake): `placeRects` pins every cell at exact pixels for
 *     THIS canvas. Perfect today, meaningless nested tomorrow (see
 *     geometry/ratio-vs-absolute) — and the string carries every number.
 *
 * The caption prints each mode's receipts (measured gutter min-max, chars,
 * coverage); the Geometry view's m0 readout shows what each cure costs in
 * string form.
 */

export type QuantizationCuresProps = {
  /** Which spelling of the same design to render. */
  method?: "naive" | "inset" | "snap" | "rects";
  /** Checkerboard accent fill (#rrggbb). */
  checkerColor?: string;
};

const ID = "@m0saic-starter/geometry/quantization-cures/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const METHODS = ["naive", "inset", "snap", "rects"] as const;

const COLS = 12;
const ROWS = 3;
/** Target gutter for the exact cures, px. */
const GUTTER_PX = 4;
/** Naive ratio spelling: gutter weight 1 against cell weight… */
const NAIVE_CELL_WX = 24; // X: total 12·24 + 11 = 299 → ~4.3px gutters at 1280
const NAIVE_CELL_WY = 55; // Y: total 3·55 + 2 = 167 → ~4.3px gutters at 720
const BASE_FILL = "#1a5276" as MosaicColor;

const propsSchema = definePropsSchema<QuantizationCuresProps>({
  method: {
    type: "string",
    required: false,
    description:
      "The same 12x3 gridded design, four spellings: \"naive\" ratio-weight gutters (watch them wobble), \"inset\" recovery via latticeCellInset (exact gutters, tiny string), \"snap\" via snapGridFit (everything exact inside a quantization-free rect), \"rects\" via placeRects (exact pixels baked to THIS canvas).",
    meta: {
      constraints: { oneOf: [...METHODS] },
      ui: { label: "Method" },
    },
  },
  checkerColor: {
    type: "string",
    required: false,
    description: "Checkerboard accent fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#2471a3" },
      ui: { label: "Checker color" },
    },
  },
});

/** Interleave [cell, gutter, cell, …, cell] weights with claimants. */
function interleave(
  count: number,
  cellWeight: number,
  cellClaimants: string[],
): { weights: number[]; claimants: string[] } {
  const weights: number[] = [];
  const claimants: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i > 0) {
      weights.push(1);
      claimants.push("-");
    }
    weights.push(cellWeight);
    claimants.push(cellClaimants[i]);
  }
  return { weights, claimants };
}

export const QuantizationCuresV1 = defineMosaicTemplate<QuantizationCuresProps>({
  id: asTemplateId(ID),
  label: "12 · Quantization: Three Cures",
  version: 1,
  description:
    "The geometry capstone: one 12x3 gridded design through four spellings. Naive ratio gutters wobble N/N+1 px (thin lines magnify quantization); then the three cures - inset recovery (exact gutters, tiny string), snapGrid (everything exact inside a quantization-free rect, coverage given up), placeRects (exact pixels baked to this canvas). Flip the Method enum and read the receipts.",
  capabilities: { tier: "core" },
  tags: ["geometry", "quantization", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Flip Method and watch the gutter lines even out — then read the caption and the m0 readout.",
  },

  propsSchema,
  defaultProps: { method: "naive", checkerColor: "#2471a3" },

  async render(
    props: QuantizationCuresProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const method = props.method ?? "naive";
    const checkerColor = props.checkerColor ?? "#2471a3";
    if (!(METHODS as readonly string[]).includes(method)) {
      throw new Error(
        `${ID}: method must be one of ${METHODS.join(" | ")}, got ${JSON.stringify(method)}.`,
      );
    }
    if (!HEX.test(checkerColor)) {
      throw new Error(`${ID}: checkerColor ${JSON.stringify(checkerColor)} must be #rrggbb.`);
    }
    const { width, height } = ctx.target;
    if (width < 360 || height < 240) {
      throw new Error(
        `${ID}: the 12x3 grid needs at least 360x240, got ${width}x${height} — grow the canvas.`,
      );
    }

    const fillAt = (r: number, c: number): MosaicSource =>
      makeColorTile((r + c) % 2 === 0 ? BASE_FILL : (checkerColor as MosaicColor));

    // Row-major checkerboard — every method binds cells in this order.
    const cellFills: MosaicSource[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) cellFills.push(fillAt(r, c));
    }

    let baseM0: string;
    let sources: MosaicSource[];
    let caption: string;

    if (method === "naive") {
      // THE DISEASE: gutters as ratio weights. Each gutter quantizes
      // independently — measure what this canvas actually dealt.
      const col = interleave(COLS, NAIVE_CELL_WX, new Array<string>(COLS).fill("1"));
      const colM0 = String(weightedSplit(col.weights, "col", { claimants: col.claimants }));
      const row = interleave(ROWS, NAIVE_CELL_WY, new Array<string>(ROWS).fill(colM0));
      baseM0 = String(weightedSplit(row.weights, "row", { claimants: row.claimants }));
      sources = cellFills;

      const gutters = findFrames(
        baseM0,
        (f) => f.kind === "null" && f.width < NAIVE_CELL_WX,
        { width, height },
      ).map((f) => f.width);
      const minG = Math.min(...gutters);
      const maxG = Math.max(...gutters);
      const ideal = ((width * 1) / (COLS * NAIVE_CELL_WX + COLS - 1)).toFixed(2);
      caption =
        `naive ratio gutters: ${minG}-${maxG}px across the grid (ideal ${ideal}) - ` +
        `the split can't hold a px promise - ${baseM0.length} chars`;
    } else if (method === "inset") {
      // CURE 1: plain grid + exact gutters as per-cell recovery insets.
      const xs = outsideInSizes(width, COLS);
      const ys = outsideInSizes(height, ROWS);
      const xOff = [0];
      const yOff = [0];
      for (const w of xs) xOff.push(xOff[xOff.length - 1] + w);
      for (const h of ys) yOff.push(yOff[yOff.length - 1] + h);
      const cells = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          cells.push({
            unit: { c0: c, r0: r, cs: 1, rs: 1 },
            raw: { x: xOff[c], y: yOff[r], w: xs[c], h: ys[r] },
          });
        }
      }
      const lattice = latticeCellInset({
        cols: COLS,
        rows: ROWS,
        canvasW: width,
        canvasH: height,
        gutterXPx: GUTTER_PX,
        gutterYPx: GUTTER_PX,
        marginPx: 0,
        cells,
      });
      const rowM0 = `${COLS}(${new Array<string>(COLS).fill("1").join(",")})`;
      baseM0 = `${ROWS}[${new Array<string>(ROWS).fill(rowM0).join(",")}]`;
      sources = cells.map((_, i) => {
        const inset = lattice.insetAt(i);
        const fill =
          (Math.floor(i / COLS) + (i % COLS)) % 2 === 0
            ? BASE_FILL
            : (checkerColor as MosaicColor);
        return makeColorTile(fill, inset ? { placement: { inset } } : undefined);
      });
      caption =
        `inset recovery: gutters EXACT ${GUTTER_PX}px, jitter -> cell widths - ` +
        `${baseM0.length} chars, survives nesting`;
    } else if (method === "snap") {
      // CURE 2: refuse the hostile canvas — quantization-free inner rect.
      const snap = snapGridFit({
        rootW: width,
        rootH: height,
        rows: ROWS,
        cols: COLS,
        gutter: 0.04,
      });
      baseM0 = String(snap.m0);
      sources = cellFills;
      caption =
        `snapGrid: EVERYTHING exact (cells ${snap.cellW}x${snap.cellH}, gutters ${snap.gutterPxX}px) - ` +
        `coverage ${Math.round(snap.coverage * 100)}% (margin given back) - ${baseM0.length} chars`;
    } else {
      // CURE 3: bake exact pixels for THIS canvas.
      const cellW = Math.floor((width - (COLS - 1) * GUTTER_PX) / COLS);
      const cellH = Math.floor((height - (ROWS - 1) * GUTTER_PX) / ROWS);
      const mx = Math.floor((width - (COLS * cellW + (COLS - 1) * GUTTER_PX)) / 2);
      const my = Math.floor((height - (ROWS * cellH + (ROWS - 1) * GUTTER_PX)) / 2);
      const rects = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          rects.push({
            x: mx + c * (cellW + GUTTER_PX),
            y: my + r * (cellH + GUTTER_PX),
            w: cellW,
            h: cellH,
          });
        }
      }
      const placed = placeRects({ rootW: width, rootH: height, rects });
      baseM0 = String(placed.m0);
      // Non-overlapping rects pack one layer, walking left-to-right per row —
      // map bindings through rectIndices so the checkerboard stays row-major.
      const order = placed.layers.flatMap((layer) => layer.rectIndices);
      sources = order.map((rectIndex) => cellFills[rectIndex]);
      caption =
        `placeRects: exact ${GUTTER_PX}px, baked to ${width}x${height} - ` +
        `${baseM0.length} chars (head-only)`;
    }

    // Caption bound to its own bottom band (tight text binding).
    const m0 = toM0String(`${baseM0}{6[-,-,-,-,-,1]}`, ID);

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        ...sources,
        svgLabel(caption, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.03),
          maxLines: 2,
          color: "#c8d2dc" as MosaicColor,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Quantization: Three Cures",
    lines: [
      "Spell a grid's gutters as ratio weights and each quantizes to N or N+1 px on its own - at 4px lines that wobble is a 25% difference.",
      "Cure 1, INSET: the m0 stays a plain grid and exact gutters are carved as per-cell insets. Tiny string, survives nesting.",
      "Cure 2, SNAP: refuse the canvas - snap into the largest quantization-free rect. Everything exact; the cost is coverage.",
      "Cure 3, RECTS: bake exact pixels for THIS canvas. Perfect today, meaningless nested - a head-only move.",
    ],
    explore: [
      "Flip Method naive -> inset and watch the gutters even out",
      "Eye menu > Show dimensions to put numbers on the spread",
      "Read the m0 readout after each flip - four different strings",
      "Change the width in naive: the wobble re-deals",
    ],
  }),
});

export default QuantizationCuresV1;
