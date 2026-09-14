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
 * `@m0saic-starter/controls/dual-props/v1` — one knob for humans, one truth
 * for everyone.
 *
 * ONE CONCEPT: `ui.consumer` + `control.syncsTo` — the dual-prop pattern.
 * Sometimes the CANONICAL prop is the wrong control: `holdSec` (how long a
 * card holds) is what render needs, but people think "speed"; `reduceMotion`
 * is the precise flag, but people think "animate". Declare BOTH:
 *
 *  - the canonical props carry `ui.consumer: "agent"` — they are the hard
 *    form, pulled out of the human view into the panel's "Agent props"
 *    escape (raw, exact, still fully editable there);
 *  - the friendly props carry `ui.consumer: "human"` plus
 *    `control.syncsTo: [{ prop, map }]` — the editor shows the friendly
 *    dial, reads its position by INVERSE-mapping the canonical value, and
 *    writes changes back THROUGH the map. Maps: `linear` (ranges may
 *    invert — higher speed IS lower hold), `boolInvert`, `identity`.
 *
 * THE HUMAN KEY NEVER REACHES RENDER. `speed` and `animate` below are
 * editor-only: this render reads `holdSec` and `reduceMotion` and nothing
 * else — asserted in the test by passing bogus human values and getting an
 * identical document. One knob for humans, one truth for everyone: agents
 * and saved files speak canonical, dials stay friendly, and the two can
 * never disagree because only one of them is real.
 */

export type DualPropsProps = {
  /** CANONICAL: seconds each card holds. What render actually reads. */
  holdSec?: number;
  /** CANONICAL: precise motion flag. */
  reduceMotion?: boolean;
  /** HUMAN DIAL: speed 1-10, a derived view of holdSec. Never rendered. */
  speed?: number;
  /** HUMAN TOGGLE: animate, a derived view of !reduceMotion. Never rendered. */
  animate?: boolean;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/dual-props/v1";
const HOLD_MIN = 1.2;
const HOLD_MAX = 12;

const propsSchema = definePropsSchema<DualPropsProps>({
  holdSec: {
    type: "number",
    required: false,
    description:
      "CANONICAL hold, in seconds — what render reads and files carry. Lives under Agent props; humans drive it through Speed.",
    meta: {
      constraints: { min: HOLD_MIN, max: HOLD_MAX },
      ui: { label: "holdSec", order: 1, consumer: "agent" },
    },
  },
  reduceMotion: {
    type: "boolean",
    required: false,
    description: "CANONICAL motion flag — precise, agent-facing.",
    meta: {
      ui: { label: "reduceMotion", order: 2, consumer: "agent" },
    },
  },
  speed: {
    type: "number",
    required: false,
    description:
      "The human dial: 1 (leisurely) to 10 (brisk). A derived view of holdSec through an INVERTED linear map — this key never reaches render.",
    meta: {
      constraints: { min: 1, max: 10 },
      control: {
        flavor: "slider",
        step: 1,
        syncsTo: [
          {
            prop: "holdSec",
            map: { kind: "linear", humanMin: 1, humanMax: 10, propMin: HOLD_MAX, propMax: HOLD_MIN },
          },
        ],
      },
      ui: { label: "Speed", order: 3, consumer: "human" },
    },
  },
  animate: {
    type: "boolean",
    required: false,
    description:
      "The human toggle: a boolInvert view of reduceMotion — on means motion. Never reaches render either.",
    meta: {
      control: {
        syncsTo: [{ prop: "reduceMotion", map: { kind: "boolInvert" } }],
      },
      ui: { label: "Animate", order: 4, consumer: "human" },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 5 },
    },
  },
});

export const DualPropsV1 = defineMosaicTemplate<DualPropsProps>({
  id: asTemplateId(ID),
  label: "30 · Dual Props",
  version: 1,
  description:
    "One knob for humans, one truth for everyone: canonical props marked ui.consumer \"agent\" hold the exact values render reads (surfaced under the panel's Agent props escape), while friendly props marked \"human\" + control.syncsTo are derived views — the editor inverse-maps the canonical value to position the dial and writes changes back through the map (linear with invertible ranges, boolInvert, identity). The human key never reaches render, so dials and files can never disagree: only one of them is real.",
  capabilities: { tier: "core" },
  tags: ["controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Drag Speed and watch holdSec move inversely under Agent props. Flip Animate — reduceMotion flips the other way. Render only ever saw the canonical pair.",
  },

  propsSchema,
  defaultProps: {
    holdSec: 4.8,
    reduceMotion: false,
    pageColor: "#1c2833",
  },

  async render(
    props: DualPropsProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
    }
    // THE POINT: only the canonical pair is read. `speed` and `animate`
    // are deliberately never touched here.
    const holdSec = props.holdSec ?? 4.8;
    if (typeof holdSec !== "number" || !Number.isFinite(holdSec) || holdSec < HOLD_MIN || holdSec > HOLD_MAX) {
      throw new Error(`${ID}: holdSec must be a number in [${HOLD_MIN}, ${HOLD_MAX}].`);
    }
    const reduceMotion = props.reduceMotion ?? false;
    if (typeof reduceMotion !== "boolean") {
      throw new Error(`${ID}: reduceMotion must be a boolean.`);
    }
    const { width, height } = ctx.target;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // The hold visualized: a track with the fill proportional to holdSec,
    // plus the motion flag as a state chip.
    const fill = Math.max(2, Math.round(((holdSec - HOLD_MIN) / (HOLD_MAX - HOLD_MIN)) * 88));
    const track = String(weightedSplit([6, fill, Math.max(1, 88 - fill), 6], "col", {
      mode: "literal",
      claimants: ["-", "1", "1", "-"],
    }));
    const chipRow = String(weightedSplit([6, 30, 2, 40, 22], "col", {
      mode: "literal",
      claimants: ["-", "1{1}", "-", "1", "-"],
    }));
    const rows = String(weightedSplit([16, 16, 8, 12, 48], "row", {
      mode: "literal",
      claimants: ["-", track, "-", chipRow, "-"],
    }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const sources: MosaicSource[] = [
      makeColorTile("#2e86c1" as MosaicColor),
      makeColorTile("#1b3a52" as MosaicColor),
      makeColorTile((reduceMotion ? "#5d6d7e" : "#27ae60") as MosaicColor),
      svgLabel(reduceMotion ? "motion reduced" : "motion on", width * 0.28, height * 0.1, {
        color: "#eaeef2" as MosaicColor,
        maxPx: Math.round(height * 0.028),
        vAlign: "middle",
      }),
      svgLabel(`holdSec = ${holdSec}`, width * 0.36, height * 0.1, {
        color: "#b9c4cf" as MosaicColor,
        maxPx: Math.round(height * 0.03),
        vAlign: "middle",
      }),
    ];

    const heading = fitSvgText(
      "DUAL PROPS - the dial is a view; the canonical value is the only truth",
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.032), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        'consumer "agent" = the hard form, in the Agent props escape; consumer "human" + syncsTo = the friendly derived view',
        "the human key never reaches render - this document was drawn from holdSec and reduceMotion alone",
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
    title: "Dual Props",
    lines: [
      'Canonical props (consumer "agent") hold what render reads, surfaced raw under Agent props. Friendly props (consumer "human") are derived views.',
      "syncsTo binds a human control to canonical props through a map - linear with invertible ranges, boolInvert, or identity.",
      "The human key never reaches render. Dials stay friendly, files stay exact, and the two can never disagree: only one is real.",
    ],
    explore: [
      "Drag Speed - holdSec moves inversely under Agent props",
      "Flip Animate - reduceMotion flips the other way",
    ],
  }),
});

export default DualPropsV1;
