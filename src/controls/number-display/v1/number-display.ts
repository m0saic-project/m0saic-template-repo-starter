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
 * `@m0saic-starter/controls/number-display/v1` — the stored unit and the
 * shown unit are different decisions.
 *
 * ONE CONCEPT: the number-display family — `unit`, `displayUnit`,
 * `lockDisplayUnit`, `step`. A duration prop stores milliseconds because
 * the engine thinks in ms; a human reads seconds. Declaring both keeps
 * each side honest:
 *
 *  - `unit: "ms"` names the CANONICAL unit — the number in props, files,
 *    and render is always this;
 *  - `displayUnit: "s"` makes the editor SHOW the converted value (2400
 *    stored renders as 2.4 in the field), with a unit chip the user can
 *    cycle through the family;
 *  - `lockDisplayUnit: true` (on `fadeMs` below) freezes that chip when a
 *    unit swap could silently rescale a small step into a giant value —
 *    the chip still shows the unit, it just stops being a toggle;
 *  - `step` is authored in the CANONICAL unit (step: 100 on an ms prop is
 *    a tenth-of-a-second arrow click, whatever the display shows).
 *
 * Render reads canonical ms and says so on the card — the display
 * conversion never leaks into values, which is the entire point: unit
 * presentation is editor UX; unit MEANING lives in the schema and the
 * stored number.
 */

export type NumberDisplayProps = {
  /** Hold per slide, stored in ms, displayed in seconds. */
  holdMs?: number;
  /** Crossfade, stored in ms, display LOCKED to ms. */
  fadeMs?: number;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/number-display/v1";
const HOLD_MIN = 500;
const HOLD_MAX = 10000;
const FADE_MIN = 0;
const FADE_MAX = 1000;

const propsSchema = definePropsSchema<NumberDisplayProps>({
  holdMs: {
    type: "number",
    required: false,
    description:
      "Hold per slide. Stored in ms (the canonical unit render reads); the editor shows seconds by default and the unit chip cycles the family.",
    meta: {
      constraints: { min: HOLD_MIN, max: HOLD_MAX },
      control: { unit: "ms", displayUnit: "s", step: 100 },
      ui: { label: "Hold", order: 1 },
    },
  },
  fadeMs: {
    type: "number",
    required: false,
    description:
      "Crossfade between slides. Also stored in ms — but the display is LOCKED to ms, because cycling this tiny value's chip to hours would be a silent catastrophe.",
    meta: {
      constraints: { min: FADE_MIN, max: FADE_MAX },
      control: { unit: "ms", displayUnit: "ms", lockDisplayUnit: true, step: 50 },
      ui: { label: "Fade", order: 2 },
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

export const NumberDisplayV1 = defineMosaicTemplate<NumberDisplayProps>({
  id: asTemplateId(ID),
  label: "31 · Number Display",
  version: 1,
  description:
    "The stored unit and the shown unit are different decisions: unit names the canonical scale (ms here — what props, files, and render carry), displayUnit converts only the editor's field (2400 shows as 2.4 s), lockDisplayUnit freezes the unit chip where a swap could silently rescale a value, and step is authored in the canonical unit. Render reads canonical ms and prints it — presentation never leaks into meaning.",
  capabilities: { tier: "core" },
  tags: ["controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Hold shows seconds — cycle its unit chip. Fade's chip won't cycle (locked). Save the file: both stored in plain ms either way.",
  },

  propsSchema,
  defaultProps: {
    holdMs: 2400,
    fadeMs: 250,
    pageColor: "#1c2833",
  },

  async render(
    props: NumberDisplayProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
    }
    const holdMs = props.holdMs ?? 2400;
    if (typeof holdMs !== "number" || !Number.isFinite(holdMs) || holdMs < HOLD_MIN || holdMs > HOLD_MAX) {
      throw new Error(`${ID}: holdMs must be a number in [${HOLD_MIN}, ${HOLD_MAX}].`);
    }
    const fadeMs = props.fadeMs ?? 250;
    if (typeof fadeMs !== "number" || !Number.isFinite(fadeMs) || fadeMs < FADE_MIN || fadeMs > FADE_MAX) {
      throw new Error(`${ID}: fadeMs must be a number in [${FADE_MIN}, ${FADE_MAX}].`);
    }
    const { width, height } = ctx.target;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // A slide-timing strip: hold band + fade band, proportional in ms —
    // canonical values drawn as canonical geometry.
    const total = holdMs + fadeMs;
    const holdW = Math.max(2, Math.round((holdMs / total) * 88));
    const fadeW = Math.max(1, 88 - holdW);
    const strip = String(weightedSplit([6, holdW, fadeW, 6], "col", {
      mode: "literal",
      claimants: ["-", "1{1}", "1{1}", "-"],
    }));
    const rows = String(weightedSplit([18, 20, 62], "row", {
      mode: "literal",
      claimants: ["-", strip, "-"],
    }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const sources: MosaicSource[] = [
      makeColorTile("#2e86c1" as MosaicColor),
      svgLabel(`hold ${holdMs}ms`, width * 0.4, height * 0.14, {
        color: "#eaeef2" as MosaicColor,
        maxPx: Math.round(height * 0.032),
        vAlign: "middle",
      }),
      makeColorTile("#1d5378" as MosaicColor),
      svgLabel(`fade ${fadeMs}ms`, width * 0.2, height * 0.14, {
        color: "#b9c4cf" as MosaicColor,
        maxPx: Math.round(height * 0.024),
        maxLines: 2,
        vAlign: "middle",
      }),
    ];

    const heading = fitSvgText(
      "NUMBER DISPLAY - stored in ms, shown in seconds, meaning never leaks",
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.032), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        'unit "ms" = the canonical scale; displayUnit "s" converts only the FIELD; step is authored canonical (100ms per click)',
        "fade locks its unit chip - a swap to hours on a 250ms value would be a silent catastrophe; the chip shows, but won't cycle",
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
    title: "Number Display",
    lines: [
      "unit names the canonical scale - props, files, and render always carry it. displayUnit converts only the editor's field.",
      "lockDisplayUnit freezes the unit chip where a swap could silently rescale a value - it shows the unit but stops being a toggle.",
      "step is authored in the CANONICAL unit: step 100 on an ms prop is a tenth-of-a-second click, whatever the display shows.",
    ],
    explore: [
      "Cycle Hold's unit chip; try Fade's - locked",
      "Save the file - both numbers are plain ms",
    ],
  }),
});

export default NumberDisplayV1;
