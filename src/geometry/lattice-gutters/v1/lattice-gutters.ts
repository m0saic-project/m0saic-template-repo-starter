import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { evaluateM0, toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
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
 * `@m0saic-starter/geometry/lattice-gutters/v1` — pixel-exact gutters at
 * ZERO string cost, with the expensive spelling one toggle away.
 *
 * ONE CONCEPT: base × fiber. The BASE m0 stays a plain gutterless grid —
 * tiny, composable, quantization-friendly. The gutters live entirely in the
 * FIBER: `latticeCellInset` computes, per cell, a `placement.inset` that
 * shrinks the painted content onto a target lattice with EXACTLY `g` px
 * between neighbors and exactly `m` px of outer margin — at every canvas.
 *
 * How the exactness survives rounding: each lattice line fits a feasible
 * window derived from the raw cells beside it (`[rawStart, rawEnd + g]`) —
 * and a gutter is exactly `g` wherever its line lands, because one span
 * ends at `X - g` and the next starts at `X`. So the raw split's +-1px
 * jitter lands in CELL WIDTHS (which equal grids carry anyway), never in
 * the gutters. The library still reports `maxClampPx`/`clampedEdges` for
 * degenerate hand-fed lattices, and this template prints it if it ever
 * fires — for any real grid it reads zero.
 *
 * The `gutterMode` toggle renders the SAME target lattice both ways:
 *
 *   - "inset" (default): base = plain grid, gutters as leaf-private insets.
 *     The string stays a handful of characters; precision stays at the
 *     grid's own tiny floor.
 *   - "split": gutters and margins spelled INTO the split as real `-`
 *     cells, weighted in raw pixels. Same pixels on screen — but now the
 *     string carries THIS canvas's numbers, its length balloons, and its
 *     precision floor jumps to near-canvas scale. Precision is hereditary,
 *     so any parent that nests the split spelling inherits that floor.
 *
 * The caption band prints the receipts for the current mode: character
 * count and measured precision floor. Flip the toggle and watch both move.
 *
 * (The deprecated `gridCellInset` did the inset approach approximately —
 * ideal-vs-real cells, no half-pixel centering — and wobbled.
 * `latticeCellInset` is the replacement; don't reach for the old one.)
 */

export type LatticeGuttersProps = {
  /** Grid rows (2-4). */
  rows?: number;
  /** Grid columns (2-6). */
  cols?: number;
  /** Gutter between cells, px (2-48). */
  gutterPx?: number;
  /** Outer margin, px (0-64). */
  marginPx?: number;
  /** How the gutters are spelled: leaf-private insets vs real split cells. */
  gutterMode?: "inset" | "split";
  /** Tile fill (#rrggbb). */
  tileColor?: string;
};

const ID = "@m0saic-starter/geometry/lattice-gutters/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;

const propsSchema = definePropsSchema<LatticeGuttersProps>({
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
    description:
      "Same lattice, two spellings: \"inset\" keeps a tiny grid string with gutters as leaf-private insets; \"split\" spells gutters/margins as real cells at pixel precision — watch chars and the precision floor balloon.",
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

type Rect = { x: number; y: number; w: number; h: number };

/**
 * Axis segments [margin, cell, gutter, cell, ..., margin] in raw px, with
 * matching claimants (`"-"` for air, the provided claimant for cells).
 * Zero-width segments are dropped (weightedSplit needs positive weights).
 */
function axisSegments(
  cellStarts: number[],
  cellSizes: number[],
  axisLen: number,
  cellClaimants: string[],
): { weights: number[]; claimants: string[] } {
  const weights: number[] = [];
  const claimants: string[] = [];
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

export const LatticeGuttersV1 = defineMosaicTemplate<LatticeGuttersProps>({
  id: asTemplateId(ID),
  label: "09 · Lattice Gutters",
  version: 1,
  description:
    "Base × fiber: a plain gutterless grid with pixel-exact gutters as per-cell placement insets (latticeCellInset) — or flip Gutter mode to spell the SAME lattice as real split cells and watch the string length and precision floor balloon. The caption prints the receipts.",
  capabilities: { tier: "core" },
  tags: ["geometry", "gutters", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
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

  async render(
    props: LatticeGuttersProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const rows = props.rows ?? 2;
    const cols = props.cols ?? 3;
    const gutterPx = props.gutterPx ?? 16;
    const marginPx = props.marginPx ?? 24;
    const gutterMode = props.gutterMode ?? "inset";
    const tileColor = props.tileColor ?? "#21618c";

    for (const [name, v, lo, hi] of [
      ["rows", rows, 2, 4],
      ["cols", cols, 2, 6],
      ["gutterPx", gutterPx, 2, 48],
      ["marginPx", marginPx, 0, 64],
    ] as const) {
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
    const xs = outsideInSizes(width, cols);
    const ys = outsideInSizes(height, rows);
    const xOff: number[] = [0];
    const yOff: number[] = [0];
    for (const w of xs) xOff.push(xOff[xOff.length - 1] + w);
    for (const h of ys) yOff.push(yOff[yOff.length - 1] + h);

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
    const lattice = latticeCellInset({
      cols,
      rows,
      canvasW: width,
      canvasH: height,
      gutterXPx: gutterPx,
      gutterYPx: gutterPx,
      marginPx,
      cells,
    });
    const targets: Rect[] = lattice.targets;

    let baseM0: string;
    let sources: MosaicSource[];

    if (gutterMode === "inset") {
      // BASE: the plain gutterless grid. FIBER: per-cell recovery insets.
      const rowM0 = `${cols}(${new Array<string>(cols).fill("1").join(",")})`;
      baseM0 = `${rows}[${new Array<string>(rows).fill(rowM0).join(",")}]`;
      sources = cells.map((_, i) => {
        const inset = lattice.insetAt(i);
        return makeColorTile(
          tileColor as MosaicColor,
          inset ? { placement: { inset } } : undefined,
        );
      });
    } else {
      // SPLIT: the SAME targets spelled as real cells — margins and gutters
      // become `-` tiles weighted in raw pixels. Rows first, each content
      // row nesting a column split; every number below is THIS canvas's.
      const row0 = targets.slice(0, cols);
      const colSplit = axisSegments(
        row0.map((t) => t.x),
        row0.map((t) => t.w),
        width,
        new Array<string>(cols).fill("1"),
      );
      const colM0 = weightedSplit(colSplit.weights, "col", {
        claimants: colSplit.claimants,
      });

      const rowRects = new Array(rows)
        .fill(null)
        .map((_, r) => targets[r * cols]);
      const rowSplit = axisSegments(
        rowRects.map((t) => t.y),
        rowRects.map((t) => t.h),
        height,
        new Array<string>(rows).fill(String(colM0)),
      );
      baseM0 = String(
        weightedSplit(rowSplit.weights, "row", { claimants: rowSplit.claimants }),
      );
      sources = cells.map(() => makeColorTile(tileColor as MosaicColor));
    }

    // The receipts, measured on the BASE spelling (before the caption
    // overlay): character count + precision floor at this canvas — and the
    // honest edge case: when tiny gutters on fine grids leave less slack
    // than the raw split's +-1px jitter, targets get CLAMPED back to their
    // raw cells and some gutters narrow by that amount. The library reports
    // it (maxClampPx / clampedEdges); a lesson template prints it.
    const prec = evaluateM0(baseM0, { width, height }).precision;
    const clampNote =
      gutterMode === "inset" && lattice.maxClampPx > 0
        ? `, clamped ${lattice.clampedEdges} edge${lattice.clampedEdges === 1 ? "" : "s"} by <=${lattice.maxClampPx}px (slack < jitter)`
        : "";
    const caption = `gutterMode "${gutterMode}": ${baseM0.length} chars, precision ${prec.maxSplitX}x${prec.maxSplitY}${clampNote}`;

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
          maxPx: Math.round(height * 0.032),
          maxLines: 1,
          color: "#7f8c9b" as MosaicColor,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
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

export default LatticeGuttersV1;
