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
  makeColorTile,
  makeErrorMosaic,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";
import { KPI_OVERVIEW_REAL } from "./real/kpi-overview.m0";
import { THEMING_REAL } from "./real/theming.m0";

/**
 * `@m0saic-starter/quality/why-the-floors-cross/v1` — which floor runs high
 * for the layouts people actually build, shown twice: once with synthetic
 * shapes where the numbers are legible, and once with REAL production m0.
 *
 * ONE CONCEPT: lesson 60 showed the two floors and how each fails. This one
 * shows which number is the one to watch — and that ordinary, non-math
 * design decisions push it into the hundreds. Five layouts, two registers:
 *
 * SYNTHETIC (the mechanism, with a burned caption):
 *
 *   DASHBOARD      a title bar and six stat cards — card background, icon,
 *                  label, value, delta, with pads and gutters. One card
 *                  ALONE is precision-high (prec 100 vs feas 89). Six in a
 *                  strip and feasibility multiplies straight past it:
 *                  680x100 safe minimum. THE FLOORS CROSS AT THE NESTING
 *                  STEP — the anatomy that was a precision problem alone
 *                  becomes a feasibility problem in a strip.
 *
 *   SIDEBAR PAGE   a sidebar speced the way designers spec it: in DESIGN
 *                  PIXELS, 320 of a 1440 frame, carried into weights as-is.
 *                  Ratio-from-pixels bakes the design resolution into the
 *                  ruler: precision 1440, renders at 641 — a 1280 canvas is
 *                  already silently off. Nothing about "320 of 1440" was a
 *                  math decision; the floor came anyway.
 *
 *   EVEN GRID      a twelve-column wall. Floors stay at 12 — even splits
 *                  are the only shape that stays cheap.
 *
 * REAL (captured production m0, shipped bare as a sidecar and rendered as a
 * wireframe — one color tile per claim; no caption is burned in, because
 * appending an overlay to these roots would be an illegal overlay chain.
 * Read the numbers in Make's safe-minimum callout, which measures the same
 * flattened string this template ships):
 *
 *   REAL KPI STRIP `@m0saic/hero/ffmpeg-pulse/kpi-overview/v1`, flattened
 *                  at its 1920x1080 defaults: 22,988 chars, 74 claims.
 *                  Feasibility 934x117 vs precision 193x121 — the dashboard
 *                  rule at production scale. Each KPI tile is fine alone at
 *                  193x38; nested into the strip its needs multiply.
 *
 *   REAL THEMING   `@m0saic/theming/v1`, flattened: 14,676 chars, 45
 *                  claims. Precision 1920x1080 vs feasibility 663x313 — a
 *                  design positioned at full canvas resolution renders at a
 *                  third of it and is only pixel-true at 1920. On a 1280
 *                  canvas it is already silently off.
 *
 * THE FLOORS BELONG TO THE SHAPE, NOT THE CANVAS — resize and the numbers
 * hold still. And they are the floors of the FLATTENED layout, the form
 * render actually runs: the real sidecars ARE flattened output (their
 * nested children already merged), and the synthetic strings are authored
 * in that same form. A top-level m0 with unflattened children understates
 * its floors until flattening surfaces them.
 *
 * (Why they differ, in one breath: feasibility is set by the smallest
 * detail on screen and multiplies as widgets nest into slots; precision is
 * set by the finest ruler any single split measures with, however little it
 * draws. Neither bounds the other — take the per-axis max, `recommendedMin`.)
 *
 * DON'T GUESS — MEASURE. Every number above is `evaluateM0` on the shipped
 * string, asserted in this template's tests so the citations cannot drift.
 */

export type FloorsCrossLayout =
  | "dashboard"
  | "sidebar-page"
  | "even-grid"
  | "real-kpi-strip"
  | "real-theming";

export type WhyTheFloorsCrossProps = {
  /** Which layout ships. */
  layout?: FloorsCrossLayout;
  /** Block fill (#rrggbb). */
  bandColor?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/quality/why-the-floors-cross/v1";
const LAYOUTS: FloorsCrossLayout[] = [
  "dashboard",
  "sidebar-page",
  "even-grid",
  "real-kpi-strip",
  "real-theming",
];

const GRID_COLS = 12;

const col = (w: number[], c: string[]) =>
  String(weightedSplit(w, "col", { mode: "literal", claimants: c }));
const row = (w: number[], c: string[]) =>
  String(weightedSplit(w, "row", { mode: "literal", claimants: c }));

/**
 * One stat card: background tile carrying the content as its overlay —
 * icon+label row, big value, delta chip, all with real pads. Claims 5
 * sources: bg, icon, label, value, delta.
 */
function cardM0(): string {
  const labelRow = col([8, 24, 8, 52, 8], ["-", "1", "-", "1", "-"]);
  const valueRow = col([8, 84, 8], ["-", "1", "-"]);
  const deltaRow = col([8, 36, 56], ["-", "1", "-"]);
  const content = row([10, 22, 8, 34, 10, 16], ["-", labelRow, "-", valueRow, "-", deltaRow]);
  return `1{${content}}`;
}

/**
 * The synthetic shapes. `mode: "literal"` is load-bearing: GCD reduction
 * would rewrite the card anatomy and collapse the sidebar's [320,1120]
 * design-pixel spec to [2,7] — swapping the 1440-slot ruler for 9 slots.
 */
function layoutM0(layout: FloorsCrossLayout): string {
  switch (layout) {
    case "dashboard": {
      const card = cardM0();
      const strip = col(
        [3, 14, 2, 14, 2, 14, 2, 14, 2, 14, 2, 14, 3],
        ["-", card, "-", card, "-", card, "-", card, "-", card, "-", card, "-"],
      );
      const titleBar = col([3, 22, 75], ["-", "1", "-"]);
      return row([10, 4, 86], [titleBar, "-", strip]);
    }
    case "sidebar-page":
      return col([320, 1120], ["1", "1"]);
    case "even-grid":
      return col(Array(GRID_COLS).fill(1), Array(GRID_COLS).fill("1"));
    case "real-kpi-strip":
      return KPI_OVERVIEW_REAL.m0;
    case "real-theming":
      return THEMING_REAL.m0;
  }
}

/** A darker twin of a #rrggbb colour so adjacent blocks stay tellable-apart. */
function shade(hex: string): MosaicColor {
  const n = parseInt(hex.slice(1), 16);
  const dim = (v: number) => Math.max(0, Math.round(v * 0.62));
  const hh = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}` as MosaicColor;
}

const propsSchema = definePropsSchema<WhyTheFloorsCrossProps>({
  layout: {
    type: "string",
    required: false,
    description:
      "dashboard: title bar + six stat cards — one card is precision-high alone, six nested cross to feasibility-high (safe minimum 680x100). sidebar-page: design-pixel spec (320 of 1440) — 1440-slot ruler, silently off at 1280. even-grid: floors stay at 12. real-kpi-strip / real-theming: captured production m0, flattened, rendered as a wireframe — read Make's safe-minimum callout.",
    meta: {
      constraints: { oneOf: LAYOUTS },
      ui: { label: "Layout", order: 1 },
    },
  },
  bandColor: {
    type: "string",
    required: false,
    description: "Block fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#2e86c1" },
      ui: { label: "Band color", order: 2 },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 3 },
    },
  },
});

export const WhyTheFloorsCrossV1 = defineMosaicTemplate<WhyTheFloorsCrossProps>({
  id: asTemplateId(ID),
  label: "61 · Why the Floors Cross",
  version: 1,
  description:
    "Which floor is the one to watch, for layouts people actually build? Synthetic shapes show the mechanism: one stat card is precision-high alone, six in a strip cross over to feasibility-high (safe minimum 680x100); a sidebar speced in design pixels (320 of 1440) bakes a 1440-slot ruler into the m0 and is silently off at 1280; an even grid stays at 12. Then the real thing: captured production m0, shipped bare and rendered as a wireframe — the kpi strip's flattened 22,988 chars measure 934x117 feasibility vs 193x121 precision, and theming measures 1920x1080 precision vs 663x313 feasibility. All floors are of the FLATTENED layout, the form render actually runs.",
  capabilities: { tier: "core" },
  tags: ["quality", "feasibility", "lesson"],

  /**
   * REQUIRED: compaction's GCD reduction would rewrite the card anatomy and
   * collapse [320,1120] to [2,7]; and the real-* layouts must ship the
   * captured string EXACTLY as production flattened it.
   */
  skipAutoCompact: true,

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Flip Layout and read Make's safe-minimum callout — it measures the same flattened string this template ships. real-kpi-strip jumps it to 934x117.",
  },

  propsSchema,
  defaultProps: {
    layout: "dashboard",
    bandColor: "#2e86c1",
    pageColor: "#1c2833",
  },

  async render(
    props: WhyTheFloorsCrossProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    for (const [key, value] of [
      ["bandColor", props.bandColor],
      ["pageColor", props.pageColor],
    ] as const) {
      if (value !== undefined && !HEX.test(value)) {
        throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
      }
    }
    const layout = (props.layout ?? "dashboard") as FloorsCrossLayout;
    if (!LAYOUTS.includes(layout)) {
      throw new Error(`${ID}: layout "${layout}" must be one of ${LAYOUTS.join(", ")}.`);
    }
    const { width, height } = ctx.target;
    const bandHex = props.bandColor ?? "#2e86c1";
    const band = bandHex as MosaicColor;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;
    const real = layout === "real-kpi-strip" || layout === "real-theming";

    // Synthetic shapes carry a burned caption strip; the real captures ship
    // BARE — appending an overlay to their roots is an illegal overlay
    // chain, and the captured string should not be edited anyway.
    const base = layoutM0(layout);
    const m0 = toM0String(real ? base : `${base}{6[-,-,-,-,-,1]}`, ID);
    const e = evaluateM0(String(m0), { width, height });
    const { feasibility, precision, recommendedMin } = e;

    if (!e.feasible) {
      return makeErrorMosaic(
        [
          `- this layout's safe minimum is ${recommendedMin.width}x${recommendedMin.height}; the canvas is ${width}x${height}`,
          `- fix: raise the canvas, or pick a layout with a lower floor`,
        ].join("\n"),
        { width, height, title: "Below this layout's floor", errorCode: "STARTER_BELOW_SHAPE_FLOOR" },
      );
    }

    const sources: MosaicSource[] = [];

    if (real) {
      // Wireframe of the real geometry: one alternating tile per claim.
      for (let i = 0; i < e.frameCount; i++) {
        sources.push(makeColorTile(i % 2 === 0 ? band : shade(bandHex)));
      }
      return {
        kind: "mosaic_document",
        version: 1,
        m0,
        assets: {},
        backgroundColor: page,
        sources,
      };
    }

    // One card measured ALONE, so the dashboard caption can SHOW the floors
    // crossing at the nesting step instead of asserting it.
    const cardAlone = evaluateM0(cardM0(), { width, height });

    const fx = feasibility.minWidthPx;
    const px = precision.maxSplitX;
    const heading =
      layout === "dashboard"
        ? "FEASIBILITY RUNS HIGH - nesting crossed the floors"
        : layout === "sidebar-page"
          ? e.meetsPrecision
            ? "PRECISION RUNS HIGH - true here, silently off below the design width"
            : "PRECISION RUNS HIGH - this canvas is already silently off"
          : "FLOORS EQUAL - even splits stay cheap";
    const why =
      layout === "dashboard"
        ? `one card: feas ${cardAlone.feasibility.minWidthPx}px wide, prec ${cardAlone.precision.maxSplitX} - six in a strip: feasibility ${fx}px, past precision ${px}`
        : layout === "sidebar-page"
          ? `sidebar speced 320px of a 1440 design frame - the ruler is now ${px} slots; renders at ${fx}px, pixel-true only at ${px}px and up`
          : `twelve equal columns - both floors sit at ${px} no matter how many you add`;

    const fitted = fitSvgText(heading, width * 0.9, height * 0.07, {
      maxPx: Math.round(height * 0.036),
      maxLines: 1,
    });
    const readout = fitSvgLines(
      [
        why,
        `flattened floors at ${width}x${height}: feasibility ${fx}x${feasibility.minHeightPx}   precision ${px}x${precision.maxSplitY}   safe minimum ${recommendedMin.width}x${recommendedMin.height}`,
      ],
      width * 0.9,
      height * 0.09,
      { maxPx: Math.round(height * 0.026), widthFrac: 0.92 },
    );

    // Blocks bind left to right / top to bottom, then the caption text.
    if (layout === "dashboard") {
      sources.push(makeColorTile(band)); // title chip
      for (let i = 0; i < 6; i++) {
        // card bg, then icon / label / value / delta on it
        sources.push(
          makeColorTile(shade(bandHex)),
          makeColorTile(band),
          makeColorTile(band),
          makeColorTile(band),
          makeColorTile(band),
        );
      }
    } else if (layout === "sidebar-page") {
      sources.push(makeColorTile(shade(bandHex)), makeColorTile(band));
    } else {
      for (let i = 0; i < GRID_COLS; i++) {
        sources.push(makeColorTile(i % 2 === 0 ? band : shade(bandHex)));
      }
    }
    sources.push(
      svgTextSource([
        {
          text: fitted.text,
          fontSize: fitted.fontSize,
          color: (layout === "sidebar-page" ? "#f2a03d" : "#eaeef2") as MosaicColor,
          vAlign: "top",
          padding: { top: 0.08 },
        },
        {
          text: readout.text,
          fontSize: readout.fontSize,
          color: "#7f8c9b" as MosaicColor,
          vAlign: "bottom",
          padding: { bottom: 0.12 },
        },
      ]),
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: page,
      sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Why the Floors Cross",
    lines: [
      "One card is precision-high alone; six in a strip cross to feasibility-high, safe minimum 680px wide. Ordinary design choices move floors by hundreds.",
      "Spec a sidebar in design pixels - 320 of 1440 - and the ruler is 1440 slots: pixel-true only at full design width, silently off below it.",
      "The real-* layouts ARE production m0, flattened as render runs it: the kpi strip measures 934x117 vs 193x121. Read Make's safe-minimum callout.",
    ],
    explore: [
      "Flip Layout - synthetic shapes, then the real captures",
      "real-kpi-strip: the app's callout jumps to 934x117",
    ],
  }),
});

export default WhyTheFloorsCrossV1;
