import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
  MosaicTextSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  animateNumbersInText,
  defineMosaicTemplate,
  definePropsSchema,
  solidBackground,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/text/count-up/v1` — a number that ticks, and the three
 * things that have to line up for it to.
 *
 * ONE CONCEPT: `content.kind: "expr"` hands ffmpeg an EXPRESSION instead of a
 * string, and ffmpeg evaluates it while encoding. That is the only way to get
 * text that changes over time — the svg rasterizer bakes glyphs to geometry
 * before the first frame exists, so a baked source can only ever show one
 * value.
 *
 * Three fields have to agree, and getting any one wrong fails QUIETLY:
 *
 *   1. `content: { kind: "expr", expr, eval: "frame" }` — `eval: "frame"`
 *      re-evaluates per frame. Without it ffmpeg evaluates once at init and
 *      draws a constant.
 *   2. `renderMode: { kind: "video" }` — a still is ONE frame, so an
 *      animated counter on an image source freezes at whatever t=0 says
 *      (usually 0). Flip `Freeze as a still` to watch exactly that.
 *   3. No `rasterizer: "svg"` on this source — svg is the baked path.
 *
 * `animateNumbersInText("1200", { durationSec })` writes the expression for
 * you: it finds every number in the string and replaces it with an eased
 * `%{eif:…:d}` ramp from 0 to that number over `durationSec`, leaving the
 * surrounding literal text alone. So "1200 stars" counts the 1200 and keeps
 * the word.
 *
 * The label under the counter is an ordinary svg source — the mix is the
 * lesson: reach for drawtext where you need time, and stay baked everywhere
 * else.
 */

export type CountUpProps = {
  /** The number to count up to. */
  value?: number;
  /** Text after the number (kept literal — only digits animate). */
  suffix?: string;
  /** The static label under the counter. */
  label?: string;
  /** Render as a still: the counter freezes at frame 0 (the trap). */
  freezeAsStill?: boolean;
};

const ID = "@m0saic-starter/text/count-up/v1";
const PANEL = "#17202a" as MosaicColor;
const INK = "#ecf0f1" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;
const MAX_VALUE = 1_000_000_000;

const propsSchema = definePropsSchema<CountUpProps>({
  value: {
    type: "number",
    required: false,
    description: "The number the counter ramps up to over the clip's duration.",
    meta: {
      constraints: { min: 0, max: MAX_VALUE },
      control: { step: 1 },
      ui: { label: "Value" },
    },
  },
  suffix: {
    type: "string",
    required: false,
    description: "Text drawn after the number. Kept literal — animateNumbersInText only animates digit runs, so \"stars\" stays \"stars\".",
    meta: { control: { placeholder: "stars" }, ui: { label: "Suffix" } },
  },
  label: {
    type: "string",
    required: false,
    description: "Static label under the counter — an svg source, because it never changes.",
    meta: { control: { placeholder: "since launch" }, ui: { label: "Label" } },
  },
  freezeAsStill: {
    type: "boolean",
    required: false,
    description: "Render the counter as an image instead of video. The expression still compiles — it just never gets a second frame to evaluate on.",
    meta: { ui: { label: "Freeze as a still" } },
  },
});

export const CountUpV1 = defineMosaicTemplate<CountUpProps>({
  id: asTemplateId(ID),
  label: "43 · Count Up",
  version: 1,
  description:
    "A drawtext counter that ramps 0 → value over the clip: content.kind \"expr\" + eval \"frame\" + renderMode \"video\", the three fields that must agree. Flip Freeze as a still to see the quiet failure when one of them doesn't.",
  capabilities: { tier: "core" },
  tags: ["text", "expr", "animation", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 3000,
    format: { kind: "video", container: "mp4" },
    note: "Press play — the number ramps over the whole clip. Then flip Freeze as a still.",
  },

  propsSchema,
  defaultProps: {
    value: 1200,
    suffix: "stars",
    label: "since launch",
    freezeAsStill: false,
  },

  async render(
    props: CountUpProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const value = props.value ?? 1200;
    const suffix = (props.suffix ?? "stars").trim();
    const label = (props.label ?? "since launch").trim();
    const freezeAsStill = props.freezeAsStill ?? false;

    const problems: string[] = [];
    if (!Number.isFinite(value) || value < 0 || value > MAX_VALUE) {
      problems.push(`value must be 0-${MAX_VALUE}, got ${JSON.stringify(value)}`);
    } else if (!Number.isInteger(value)) {
      // %{eif:…:d} prints an integer — a fractional target would count up to
      // a number the counter can never show.
      problems.push(`value must be a whole number (the eif expansion prints integers), got ${value}`);
    }
    if (suffix.length > 24) problems.push("suffix must be 24 characters or fewer");
    if (label.length > 32) problems.push("label must be 32 characters or fewer");
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;
    const durationSec = ctx.target.durationMs / 1000;

    // The whole animation, in one call: digits become an eased ramp, the
    // literal words around them are escaped and left alone.
    const counterText = suffix.length > 0 ? `${value} ${suffix}` : `${value}`;
    const expr = animateNumbersInText(counterText, { durationSec });

    // A drawtext source paints an OPAQUE background (black unless told
    // otherwise), so it carries the panel fill itself instead of sitting on
    // a color tile — one source, not two.
    const counter: MosaicSource = {
      type: "text",
      renderMode: { kind: freezeAsStill ? "image" : "video" },
      visual: { backgroundColor: solidBackground(PANEL) },
      layers: [
        {
          content: { kind: "expr", expr, eval: "frame" },
          style: { fontSize: Math.round(height * 0.22), fontColor: INK },
        },
      ],
    } as MosaicTextSource;

    const caption = freezeAsStill
      ? `renderMode "image": one frame, so the counter is frozen at t=0 - the expr never ticks`
      : `renderMode "video": eval "frame" re-evaluates the expr every frame over ${durationSec}s`;

    const m0 = toM0String(
      String(weightedSplit([4, 1, 1], "row", { claimants: ["1", "1", "1"] })),
      ID,
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        counter,
        svgLabel(label, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.06),
          maxLines: 1,
          color: INK,
        }),
        svgLabel(caption, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.03),
          maxLines: 2,
          color: freezeAsStill ? ("#e67e22" as MosaicColor) : INK_DIM,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Count Up",
    lines: [
      "content.kind \"expr\" hands ffmpeg an expression instead of a string - the only way to get text that changes over time.",
      "Three fields must agree: eval \"frame\", renderMode \"video\", and no svg rasterizer. Each fails quietly on its own.",
      "animateNumbersInText turns every digit run into an eased ramp and leaves the words around it alone.",
      "The label under it is an ordinary svg source: reach for drawtext where you need time, stay baked elsewhere.",
    ],
    explore: [
      "Press play and watch the ramp ease out",
      "Flip Freeze as a still - same expression, frozen at frame 0",
      "Type a suffix with its own number and both count",
      "Change the Device duration - the ramp still lands on time",
    ],
  }),
});

export default CountUpV1;
