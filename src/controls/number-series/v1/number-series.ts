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
  makeColorTile,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/controls/number-series/v1` — chart data edited as tabs of
 * rows, shaped one way when simple and another when not.
 *
 * ONE CONCEPT: `flavor: "numberSeries"`. A `json` prop holding chart values
 * gets a tabbed multi-series editor — one tab per series (+ to add, x to
 * remove), each tab a numeric row list. The SHAPE CONTRACT is the teachable
 * part: a single series round-trips as a flat `number[]`, multiple series as
 * `number[][]`. Render must accept BOTH — normalize first, then draw — and
 * that same tolerance is what keeps hand-authored files working.
 *
 * (Its little sibling `flavor: "numberList"` is the single-series-only
 * version of the same idea — a flat numeric row list for props like a
 * chart's xValues. Same contract minus the tabs; it doesn't need its own
 * lesson once you've seen this one.)
 *
 * Render draws the shape this prop family exists for: grouped bars, one
 * band of bars per series, heights proportional to the shared maximum so
 * series stay comparable.
 */

export type NumberSeriesProps = {
  /** Chart values: number[] (one series) or number[][] (several). */
  values?: number[] | number[][] | string;
  /** Accent fill (#rrggbb). */
  bandColor?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/number-series/v1";
const MAX_SERIES = 3;
const MAX_POINTS = 12;

const DEFAULT_VALUES: number[][] = [
  [12, 28, 22, 40, 34, 52],
  [8, 14, 30, 26, 44, 38],
];

/** Normalize the round-trip contract: number[] and number[][] both arrive. */
export function parseSeries(raw: NumberSeriesProps["values"]): number[][] {
  const value = typeof raw === "string" ? (JSON.parse(raw) as unknown) : (raw ?? DEFAULT_VALUES);
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${ID}: values must be a non-empty array.`);
  }
  const series: number[][] = typeof value[0] === "number"
    ? [value as number[]]
    : (value as number[][]);
  if (series.length < 1 || series.length > MAX_SERIES) {
    throw new Error(`${ID}: values must hold 1-${MAX_SERIES} series.`);
  }
  for (const [i, s] of series.entries()) {
    if (!Array.isArray(s) || s.length < 2 || s.length > MAX_POINTS) {
      throw new Error(`${ID}: series[${i}] must hold 2-${MAX_POINTS} points.`);
    }
    for (const v of s) {
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 9999) {
        throw new Error(`${ID}: series[${i}] point ${JSON.stringify(v)} must be a number in [0, 9999].`);
      }
    }
  }
  return series;
}

const propsSchema = definePropsSchema<NumberSeriesProps>({
  values: {
    type: "json",
    required: false,
    description:
      "Chart values. flavor numberSeries renders a tabbed multi-series editor; the value round-trips as flat number[] for one series and number[][] for several — render normalizes both.",
    meta: {
      constraints: {
        jsonSchema: {
          oneOf: [
            { type: "array", minItems: 2, maxItems: MAX_POINTS, items: { type: "number", minimum: 0 } },
            {
              type: "array",
              minItems: 1,
              maxItems: MAX_SERIES,
              items: {
                type: "array",
                minItems: 2,
                maxItems: MAX_POINTS,
                items: { type: "number", minimum: 0 },
              },
            },
          ],
        },
      },
      control: { flavor: "numberSeries" },
      ui: { label: "Values", order: 1 },
    },
  },
  bandColor: {
    type: "string",
    required: false,
    description: "Accent fill as #rrggbb.",
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

/** A darker twin of a #rrggbb colour. */
function shade(hex: string): MosaicColor {
  const n = parseInt(hex.slice(1), 16);
  const dim = (v: number) => Math.max(0, Math.round(v * 0.62));
  const hh = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}` as MosaicColor;
}

export const NumberSeriesV1 = defineMosaicTemplate<NumberSeriesProps>({
  id: asTemplateId(ID),
  label: "21 · Number Series",
  version: 1,
  description:
    "Chart data edited as tabs of numeric rows: flavor numberSeries gives a json prop one tab per series, and the value round-trips flat (number[]) for one series and nested (number[][]) for several — so render normalizes both shapes before drawing, the same tolerance that keeps hand-authored files working. Renders grouped bars against the shared maximum. numberList is the single-series sibling: same contract minus the tabs.",
  capabilities: { tier: "core" },
  tags: ["controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Edit Values: tabs, one per series. Remove down to one series and save — the file now carries a flat number[]; the render doesn't care.",
  },

  propsSchema,
  defaultProps: {
    values: DEFAULT_VALUES,
    bandColor: "#2e86c1",
    pageColor: "#1c2833",
  },

  async render(
    props: NumberSeriesProps,
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
    const series = parseSeries(props.values);
    const { width, height } = ctx.target;
    const bandHex = props.bandColor ?? "#2e86c1";
    const band = bandHex as MosaicColor;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // Grouped bars: one band per series, bars proportional to the SHARED
    // max (comparability is the point of series). A bar is a column cell
    // split into [air, bar] rows; zero values keep a 1-unit stub so the
    // slot never vanishes.
    const max = Math.max(...series.flat(), 1);
    const barBand = (s: number[]) => {
      const cells = s.map((v) => {
        const h = Math.max(2, Math.round((v / max) * 92));
        return String(weightedSplit([100 - h, h], "row", { mode: "literal", claimants: ["-", "1"] }));
      });
      const weights = [3, ...s.flatMap(() => [Math.max(2, Math.floor(90 / s.length) - 2), 2])];
      const claimants = ["-", ...cells.flatMap((c) => [c, "-"])];
      return String(weightedSplit(weights, "col", { mode: "literal", claimants }));
    };
    const bandH = Math.floor(64 / series.length);
    const rowsWeights = [8, ...series.flatMap(() => [bandH, 6])];
    const rowsClaimants = ["-", ...series.flatMap((s) => [barBand(s), "-"])];
    const rows = String(weightedSplit(rowsWeights, "row", { mode: "literal", claimants: rowsClaimants }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const sources: MosaicSource[] = [];
    for (const [i, s] of series.entries()) {
      for (let k = 0; k < s.length; k++) {
        sources.push(makeColorTile(i % 2 === 0 ? band : shade(bandHex)));
      }
    }

    const flatShape = series.length === 1 ? "flat number[]" : `number[][] x ${series.length}`;
    const heading = fitSvgText(
      `NUMBER SERIES - ${series.length} series, ${series[0].length} points, shipped as ${flatShape}`,
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.034), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        "flavor numberSeries: tabs in the editor - flat number[] for one series, number[][] for several, render accepts both",
        `bars share one maximum (${max}) so series stay comparable - numberList is the tab-less single-series sibling`,
      ],
      width * 0.9,
      height * 0.09,
      { maxPx: Math.round(height * 0.026), widthFrac: 0.92 },
    );
    sources.push(
      svgTextSource([
        {
          text: heading.text,
          fontSize: heading.fontSize,
          color: "#eaeef2" as MosaicColor,
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
    title: "Number Series",
    lines: [
      "flavor numberSeries: a json prop edits as tabs, one per series, each a numeric row list with add and remove.",
      "The shape contract: ONE series round-trips flat as number[]; several as number[][]. Render normalizes both - hand-authored files stay welcome.",
      "numberList is the single-series sibling (a chart's xValues); same contract minus the tabs.",
    ],
    explore: [
      "Add a third series - the file shape goes nested",
      "Delete down to one and save - flat again; same render",
    ],
  }),
});

export default NumberSeriesV1;
