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
  svgLabel,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/controls/weights/v1` — a distribution the user drags, not
 * a set of numbers the user types.
 *
 * ONE CONCEPT: `flavor: "weights"`. A `number[]` prop plus
 * `control.weights.labels` (a FIXED, schema-declared label set) renders as
 * an auto-balancing slider group: drag one weight up and the others give
 * way, the group holding a constant total of 100. One weight per label,
 * same order — position IS the pairing, which is why the label set lives in
 * the SCHEMA, not the value.
 *
 * The value contract is forgiving by design: the field normalizes whatever
 * arrives (stale lengths, hand-typed numbers that don't sum to 100) into an
 * even-handed distribution rather than erroring. Render mirrors that
 * posture — normalize, then draw — because a template must treat a
 * hand-authored file exactly like a slider-dragged one.
 *
 * Render is the honest visualization: the weights ARE the layout. The bands
 * below are a weightedSplit fed directly by the prop — drag a slider, move
 * a wall.
 */

export type WeightsProps = {
  /** The mix: one weight per label, kept summing to 100 by the control. */
  mix?: number[];
  /** Accent fill (#rrggbb). */
  bandColor?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/weights/v1";

/** The fixed label set — schema-owned; the value never carries names. */
export const MIX_LABELS = ["Footage", "Titles", "Breaks"];

const DEFAULT_MIX = [62, 26, 12];

/** Normalize to one finite non-negative weight per label, summing to 100. */
export function parseMix(raw: WeightsProps["mix"]): number[] {
  const value = raw ?? DEFAULT_MIX;
  if (!Array.isArray(value) || value.length !== MIX_LABELS.length) {
    throw new Error(`${ID}: mix must hold exactly ${MIX_LABELS.length} weights (one per label).`);
  }
  const nums = value.map((v, i) => {
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
      throw new Error(`${ID}: mix[${i}] must be a finite non-negative number.`);
    }
    return v;
  });
  const total = nums.reduce((a, b) => a + b, 0);
  if (total <= 0) {
    // The field's own posture: a degenerate value becomes an even split.
    return MIX_LABELS.map(() => Math.round(100 / MIX_LABELS.length));
  }
  return nums.map((v) => (v / total) * 100);
}

const propsSchema = definePropsSchema<WeightsProps>({
  mix: {
    type: "number[]",
    required: false,
    description:
      "The timeline mix. flavor weights + the schema-declared labels render an auto-balancing slider group summing to 100; the value is one weight per label, order-paired.",
    meta: {
      constraints: { minItems: 3, maxItems: 3 },
      control: {
        flavor: "weights",
        weights: { labels: MIX_LABELS },
      },
      ui: { label: "Mix", order: 1 },
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

export const WeightsV1 = defineMosaicTemplate<WeightsProps>({
  id: asTemplateId(ID),
  label: "22 · Weights",
  version: 1,
  description:
    "A distribution the user drags, not numbers the user types: flavor weights plus a schema-declared label set renders a number[] prop as an auto-balancing slider group holding a constant 100. One weight per label, order-paired — the labels live in the schema so the value stays pure numbers. Both the field and this render normalize forgiving-ly (stale or hand-typed values become a sane distribution), and the bands below are a weightedSplit fed directly by the prop: drag a slider, move a wall.",
  capabilities: { tier: "core" },
  tags: ["controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Drag one Mix slider — the others give way, the bands move. Hand-type numbers that don't sum to 100 into a saved file: normalized, not refused.",
  },

  propsSchema,
  defaultProps: {
    mix: DEFAULT_MIX,
    bandColor: "#2e86c1",
    pageColor: "#1c2833",
  },

  async render(
    props: WeightsProps,
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
    const mix = parseMix(props.mix);
    const { width, height } = ctx.target;
    const bandHex = props.bandColor ?? "#2e86c1";
    const band = bandHex as MosaicColor;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // The weights ARE the layout: Hamilton-scale the normalized mix onto a
    // 100-slot band, and a legend row naming each share.
    const scaled = mix.map((v) => Math.max(1, Math.round(v)));
    const bar = String(weightedSplit(scaled, "col", {
      precision: 100,
      claimants: MIX_LABELS.map(() => "1"),
    }));
    const legendW = Math.floor(84 / MIX_LABELS.length) - 4;
    const legend = String(weightedSplit(
      [6, ...MIX_LABELS.flatMap(() => [3, 1, legendW])],
      "col",
      { mode: "literal", claimants: ["-", ...MIX_LABELS.flatMap(() => ["1", "-", "1"])] },
    ));
    const rows = String(weightedSplit([16, 26, 8, 14, 36], "row", {
      mode: "literal",
      claimants: ["-", bar, "-", legend, "-"],
    }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const palette = [band, shade(bandHex), "#5d6d7e" as MosaicColor];
    const sources: MosaicSource[] = [];
    for (let i = 0; i < MIX_LABELS.length; i++) {
      sources.push(makeColorTile(palette[i % palette.length]));
    }
    for (const [i, label] of MIX_LABELS.entries()) {
      sources.push(makeColorTile(palette[i % palette.length]));
      sources.push(
        svgLabel(`${label} ${Math.round(mix[i])}%`, (width * 0.8) / MIX_LABELS.length, height * 0.12, {
          color: "#b9c4cf" as MosaicColor,
          maxPx: Math.round(height * 0.024),
          vAlign: "middle",
        }),
      );
    }

    const heading = fitSvgText(
      "WEIGHTS - drag a slider, move a wall",
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.036), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        "flavor weights + schema-declared labels: an auto-balancing group summing to 100, one weight per label by ORDER",
        "both the field and render normalize forgiving-ly - hand-authored numbers become a sane distribution, never an error",
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
    title: "Weights",
    lines: [
      "flavor weights + control.weights.labels: a number[] renders as an auto-balancing slider group - drag one up, the others give way, total stays 100.",
      "One weight per label, paired by ORDER - the labels live in the schema so the value stays pure numbers.",
      "Normalize forgiving-ly at render: stale or hand-typed values become a sane distribution, exactly like the field itself does.",
    ],
    explore: [
      "Drag Footage up - Titles and Breaks give way, bands move",
      "Hand-type [3, 1, 1] into a saved file - normalized, not refused",
    ],
  }),
});

export default WeightsV1;
