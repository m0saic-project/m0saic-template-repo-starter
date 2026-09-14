import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  fitSvgText,
  makeColorTile,
  measureText,
} from "@m0saic/template-utils";

import { svgLabel, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/text/fit-text/v1` — nothing soft-wraps. Fitting is YOUR
 * job, and it is a measurement, not a guess.
 *
 * ONE CONCEPT: a text source draws exactly the glyphs you hand it, at
 * exactly the size you name, on a canvas that will not reflow. There is no
 * CSS box here — no auto-wrap, no ellipsis, no shrink-to-fit. Copy that is
 * too wide for its tile is CLIPPED, silently.
 *
 * The cure is to measure before you commit. `measureText` runs the BUNDLED
 * font's real glyph metrics (the same file the svg rasterizer draws with),
 * so the helpers built on it are exact rather than heuristic:
 *
 *   - `wrapMeasured(text, fontSize, maxWidthPx)` — greedy word-wrap at a
 *     KNOWN size; returns the lines.
 *   - `fitSvgText(text, boxW, boxH, { maxPx, maxLines })` — binary-searches
 *     the largest size (12..maxPx) whose wrapped block fits BOTH axes.
 *   - `fitSvgLines` / `fitSvgParagraphs` — same search when the line breaks
 *     are yours to keep.
 *
 * Three modes on one box, so the trade is visible: fit the block (wraps,
 * stays big), force one line (fits, goes small), or skip fitting entirely
 * (stays big, gets clipped). Narrow the box and watch each mode react.
 *
 * The caption prints the receipts — chosen size, line count, measured width
 * against the box — because "it looked fine on my canvas" is how clipped
 * copy ships.
 */

export type FitTextProps = {
  /** The copy to fit. */
  copy?: string;
  /** How to fit it: wrap the block, force one line, or don't fit at all. */
  mode?: "fit-block" | "one-line" | "unfitted";
  /** Box width as a percent of the canvas (40-100, steps of 10). */
  boxWidthPct?: number;
};

const ID = "@m0saic-starter/text/fit-text/v1";
const MODES = ["fit-block", "one-line", "unfitted"] as const;
const PANEL = "#17202a" as MosaicColor;
const INK = "#ecf0f1" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

const DEFAULT_COPY =
  "Nothing soft-wraps: measure the glyphs, then choose the size.";

const propsSchema = definePropsSchema<FitTextProps>({
  copy: {
    type: "string",
    required: false,
    description: "The copy to fit into the box. Keep it ASCII — the bundled font renders exotic codepoints as tofu.",
    meta: { control: { placeholder: DEFAULT_COPY }, ui: { label: "Copy" } },
  },
  mode: {
    type: "string",
    required: false,
    description:
      "\"fit-block\": wrap and shrink until the block fits (stays readable). \"one-line\": refuse to wrap, shrink until it fits on one line (goes small fast). \"unfitted\": draw at the max size with no measurement — the clipping this lesson exists to show.",
    meta: { constraints: { oneOf: [...MODES] }, ui: { label: "Mode" } },
  },
  boxWidthPct: {
    type: "number",
    required: false,
    description: "Box width as a percent of the canvas. Narrow it and watch each mode react differently.",
    meta: {
      constraints: { min: 40, max: 100 },
      control: { step: 10 },
      ui: { label: "Box width %" },
    },
  },
});

export const FitTextV1 = defineMosaicTemplate<FitTextProps>({
  id: asTemplateId(ID),
  label: "42 · Fit Text",
  version: 1,
  description:
    "Nothing soft-wraps — fitting is the template's job. One box, three fitting strategies (wrap the block, force one line, skip fitting and clip), and a caption printing the measured width against the box so the trade is arithmetic instead of vibes.",
  capabilities: { tier: "core" },
  tags: ["text", "layout", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Drag Box width % down to 40 and step through the three modes.",
  },

  propsSchema,
  defaultProps: { copy: DEFAULT_COPY, mode: "fit-block", boxWidthPct: 70 },

  async render(
    props: FitTextProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const copy = (props.copy ?? DEFAULT_COPY).trim();
    const mode = props.mode ?? "fit-block";
    const boxWidthPct = props.boxWidthPct ?? 70;

    // Collect every problem, then report once — a props panel that fixes one
    // error only to meet the next is a bad afternoon.
    const problems: string[] = [];
    if (copy.length === 0) problems.push("copy must not be empty");
    if (!MODES.includes(mode as (typeof MODES)[number])) {
      problems.push(`mode must be one of ${MODES.join(" | ")}, got ${JSON.stringify(mode)}`);
    }
    if (!Number.isFinite(boxWidthPct) || boxWidthPct < 40 || boxWidthPct > 100) {
      problems.push(`boxWidthPct must be 40-100, got ${JSON.stringify(boxWidthPct)}`);
    } else if (boxWidthPct % 10 !== 0) {
      problems.push(`boxWidthPct steps by 10 (the side gutters are integer weights), got ${boxWidthPct}`);
    }
    if (problems.length > 0) {
      throw new Error(`${ID}: ${problems.join("; ")}.`);
    }

    const { width, height } = ctx.target;

    // The box: a percent-wide column in a 5:1 row split (box over caption).
    // Weights ARE the percents, so the box's pixel width is the canvas times
    // the percent — near enough to predict, and the caption prints it.
    const boxW = Math.round((width * boxWidthPct) / 100);
    const boxH = Math.round((height * 5) / 6);
    const sideWeight = (100 - boxWidthPct) / 2;
    const boxRow =
      sideWeight <= 0
        ? "1{1}"
        : String(
            weightedSplit([sideWeight, boxWidthPct, sideWeight], "col", {
              claimants: ["-", "1{1}", "-"],
            }),
          );
    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: [boxRow, "1"] })),
      ID,
    );

    // `maxPx` is the ceiling all three modes share — the difference is what
    // each is willing to trade to stay under the box.
    const maxPx = Math.round(height * 0.1);

    let text: string;
    let fontSize: number;
    let lineCount: number;
    if (mode === "unfitted") {
      // No measurement, no wrap: draw the whole line at the ceiling size and
      // let the rasterizer clip whatever leaves the tile.
      text = copy;
      fontSize = maxPx;
      lineCount = 1;
    } else {
      // Same search, one knob apart: maxLines is what "one-line" refuses to
      // spend, so it pays in font size instead.
      const fit = fitSvgText(copy, boxW, boxH, {
        maxPx,
        maxLines: mode === "one-line" ? 1 : 6,
        widthFrac: 0.86,
        heightFrac: 0.7,
      });
      text = fit.text;
      fontSize = fit.fontSize;
      lineCount = fit.lineCount;
    }

    // The receipt: the widest rendered line against the usable box.
    const widest = Math.max(
      ...text.split("\n").map((line) => measureText(line, { fontSize }).width),
    );
    const usableW = Math.round(boxW * 0.86);
    const overflow = widest > usableW;
    const caption =
      `${mode}: ${fontSize}px, ${lineCount} line${lineCount === 1 ? "" : "s"}, ` +
      `widest ${Math.round(widest)}px into a ${usableW}px box` +
      (overflow ? " - CLIPPED" : " - fits");

    const sources: MosaicSource[] = [
      makeColorTile(PANEL),
      svgTextSource([{ text, fontSize, color: INK }]),
      svgLabel(caption, width, Math.round(height / 6), {
        maxPx: Math.round(height * 0.03),
        maxLines: 1,
        color: overflow ? ("#e67e22" as MosaicColor) : INK_DIM,
      }),
    ];

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Fit Text",
    lines: [
      "Nothing soft-wraps. A text source draws what you hand it at the size you name, and copy too wide is CLIPPED, silently.",
      "So fitting is a measurement: measureText reads the same bundled font the rasterizer draws with.",
      "fit-block spends LINES to stay big, one-line spends SIZE, unfitted spends nothing and pays in clipped pixels.",
    ],
    explore: [
      "Drag Box width % to 40 and compare the three modes",
      "Switch to unfitted and watch the caption turn orange",
      "Paste a much longer sentence into Copy",
      "Change the Device aspect - the fit is recomputed",
    ],
  }),
});

export default FitTextV1;
