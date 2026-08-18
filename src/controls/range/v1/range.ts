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
 * `@m0saic-starter/controls/range/v1` — a number that is allowed to be a
 * RANGE, and the three intents the value can carry.
 *
 * ONE CONCEPT: `flavor: "range"`. Some knobs aren't one number — "hold each
 * slide 4 seconds" sometimes wants to be "hold each slide 3 to 6 seconds,
 * vary it". The range flavor gives ONE prop three user intents, readable
 * off the value shape:
 *
 *   4                        — flat: use exactly this value
 *   { low: 3, high: 6 }      — range: sample fresh per use
 *   { low: 3, high: 6,
 *     once: true }           — range, picked once: sample ONE value, reuse it
 *
 * `collapsible: true` renders the flat/range toggle; `allowOnce: true` adds
 * the pick-once toggle, labeled by `onceLabel`. The control records INTENT
 * only — what a "use" means (per slide? per render? per beat?) belongs to
 * the template, and `once: false` is never written (the key is simply
 * absent).
 *
 * This render VISUALIZES the intent rather than sampling it — a
 * deterministic template with no seed prop must not roll dice (the
 * seeded-shuffle lesson owns that move). A consumer that samples would
 * combine this control with a seed prop and derive per-use values from
 * (seed, use-index).
 */

export type HoldValue = number | { low: number; high: number; once?: true };

export type RangeProps = {
  /** Seconds each slide holds — flat, range, or range-picked-once. */
  hold?: HoldValue;
  /** Accent fill (#rrggbb). */
  bandColor?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/range/v1";
const MIN_S = 1;
const MAX_S = 10;

export type ParsedHold =
  | { intent: "flat"; value: number }
  | { intent: "range"; low: number; high: number; once: boolean };

/** Normalize the three legal shapes; reject everything else loudly. */
export function parseHold(raw: RangeProps["hold"]): ParsedHold {
  const value = raw ?? 4;
  const num = (v: unknown, at: string): number => {
    if (typeof v !== "number" || !Number.isFinite(v) || v < MIN_S || v > MAX_S) {
      throw new Error(`${ID}: ${at} must be a number in [${MIN_S}, ${MAX_S}].`);
    }
    return v;
  };
  if (typeof value === "number") {
    return { intent: "flat", value: num(value, "hold") };
  }
  if (typeof value === "object" && value !== null) {
    const r = value as { low?: unknown; high?: unknown; once?: unknown };
    const low = num(r.low, "hold.low");
    const high = num(r.high, "hold.high");
    if (low > high) {
      throw new Error(`${ID}: hold.low must not exceed hold.high.`);
    }
    if (r.once !== undefined && r.once !== true) {
      throw new Error(`${ID}: hold.once is either true or absent — never false.`);
    }
    return { intent: "range", low, high, once: r.once === true };
  }
  throw new Error(`${ID}: hold must be a number or { low, high, once? }.`);
}

const propsSchema = definePropsSchema<RangeProps>({
  hold: {
    type: "json",
    required: false,
    description:
      "Seconds each slide holds. Flat number = exactly this; { low, high } = vary per slide; add once: true = pick one value and keep it. The control records intent; the template owns what a 'use' means.",
    meta: {
      constraints: { min: MIN_S, max: MAX_S },
      control: {
        flavor: "range",
        range: {
          collapsible: true,
          allowOnce: true,
          onceLabel: "Pick once per render",
          min: MIN_S,
          max: MAX_S,
        },
        step: 0.5,
      },
      ui: { label: "Hold", order: 1 },
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

export const RangeV1 = defineMosaicTemplate<RangeProps>({
  id: asTemplateId(ID),
  label: "24 · Range",
  version: 1,
  description:
    "A number allowed to be a range: flavor range gives one prop three intents, readable off the value shape — a flat number (use exactly this), { low, high } (sample fresh per use), or { low, high, once: true } (sample one value, reuse it; once is never written false). collapsible renders the flat/range toggle, allowOnce the pick-once toggle with its onceLabel. The control records intent only; this render VISUALIZES it on a scale instead of sampling, because dice belong to templates with a seed prop.",
  capabilities: { tier: "core" },
  tags: ["controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Toggle Hold between flat and range, then flip Pick once — the value shape changes in the saved file, and the scale re-draws the intent.",
  },

  propsSchema,
  defaultProps: {
    hold: { low: 3, high: 6 },
    bandColor: "#2e86c1",
    pageColor: "#1c2833",
  },

  async render(
    props: RangeProps,
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
    const hold = parseHold(props.hold);
    const { width, height } = ctx.target;
    const bandHex = props.bandColor ?? "#2e86c1";
    const band = bandHex as MosaicColor;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // The scale: MIN..MAX seconds across a 90-slot band. Flat = a thin
    // marker at the value; range = a lit span low..high.
    const slot = (v: number) => Math.round(((v - MIN_S) / (MAX_S - MIN_S)) * 90);
    const lo = hold.intent === "flat" ? slot(hold.value) : slot(hold.low);
    const hi = hold.intent === "flat" ? Math.min(90, lo + 2) : Math.max(slot(hold.high), lo + 1);
    const scale = String(weightedSplit(
      [5, Math.max(1, lo), Math.max(1, hi - lo), Math.max(1, 90 - hi), 5].map((w) => Math.max(1, w)),
      "col",
      { mode: "literal", claimants: ["-", "1", "1", "1", "-"] },
    ));
    const labelText =
      hold.intent === "flat"
        ? `hold exactly ${hold.value}s`
        : `hold ${hold.low}s to ${hold.high}s${hold.once ? " - picked once, then reused" : " - fresh per slide"}`;
    const labelRow = String(weightedSplit([5, 90, 5], "col", {
      mode: "literal",
      claimants: ["-", "1", "-"],
    }));
    const rows = String(weightedSplit([16, 18, 8, 12, 46], "row", {
      mode: "literal",
      claimants: ["-", scale, "-", labelRow, "-"],
    }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const dim = shade(bandHex);
    const sources: MosaicSource[] = [
      makeColorTile(dim),
      makeColorTile(band),
      makeColorTile(dim),
      svgLabel(labelText, width * 0.8, height * 0.1, {
        color: "#eaeef2" as MosaicColor,
        maxPx: Math.round(height * 0.036),
        vAlign: "middle",
      }),
    ];

    const shapeText =
      hold.intent === "flat"
        ? `${hold.intent === "flat" ? hold.value : ""}`
        : `{ low: ${hold.low}, high: ${hold.high}${hold.once ? ", once: true" : ""} }`;
    const heading = fitSvgText(
      `RANGE - one prop, three intents (this file carries: ${hold.intent === "flat" ? "a flat number" : shapeText})`,
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.032), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        "flat number = exactly this; { low, high } = fresh per use; add once: true = pick one and keep it (never written false)",
        "the control records INTENT - what a use means belongs to the template; sampling needs a seed prop (see seeded-shuffle)",
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
    title: "Range",
    lines: [
      "flavor range: one prop, three intents by value shape - a flat number, { low, high }, or { low, high, once: true }. once is never written false.",
      "collapsible renders the flat/range toggle; allowOnce adds pick-once with its onceLabel. The control records intent only.",
      "What a 'use' means belongs to the template - and sampling belongs to templates with a seed prop. This one visualizes instead.",
    ],
    explore: [
      "Toggle flat vs range, then Pick once - watch the value shape",
      "Save and read the file - three different shapes, one prop",
    ],
  }),
});

export default RangeV1;
