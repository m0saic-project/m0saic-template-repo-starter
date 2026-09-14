import type {
  MosaicColor,
  MosaicDocument,
  MosaicDocumentPipeline,
  MosaicEngineContext,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/pipelines/png-sequence/v1` — N numbered stills out of one
 * template.
 *
 * ONE CONCEPT: a frame sequence is just `emit: "multi"` where every step is
 * an IMAGE. Each step is a document with `format: { kind: "image", container:
 * "png" }`, so the engine writes one PNG per step instead of concatenating
 * anything.
 *
 * NAMING IS THE DELIVERABLE HERE. Files come out as `{base}-{step.name}.png`,
 * so a sequence wants zero-padded names — `frame-001`, `frame-002` — or
 * anything reading the folder sorts 10 before 2. The padding is the
 * template's job; the engine only guarantees the name it was given.
 *
 * `step.label` rides along for the CLI's `--output-pattern` `{{label}}`
 * token, which is how a batch render puts the source's own filename into
 * each output name.
 *
 * Sequences are the one case where step count is a REAL cost: N steps means N
 * renders and N files. Keep the count a prop, keep it small by default, and
 * let the caller opt into more.
 */

export type PngSequenceProps = {
  /** How many frames to emit. */
  frames?: number;
  /** Prefix for each step name — the filename basis. */
  prefix?: string;
};

const ID = "@m0saic-starter/pipelines/png-sequence/v1";
const PANEL = "#17202a" as MosaicColor;
const INK = "#ecf0f1" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;
/** A frame's own duration is irrelevant to a still, but a step needs one. */
const FRAME_MS = 100;

const propsSchema = definePropsSchema<PngSequenceProps>({
  frames: {
    type: "number",
    required: false,
    description: "How many PNGs to emit. Each frame is a whole step: N steps means N renders and N files, so this is a real cost knob.",
    meta: {
      constraints: { min: 1, max: 24 },
      control: { step: 1 },
      ui: { label: "Frames" },
    },
  },
  prefix: {
    type: "string",
    required: false,
    description: "Filename basis for each step. Names are zero-padded here — without padding a folder listing sorts frame-10 before frame-2.",
    meta: { control: { placeholder: "frame" }, ui: { label: "Name prefix" } },
  },
});

/** One frame: its index, big, on a ramped background. */
function frameDoc(
  index: number,
  total: number,
  width: number,
  height: number,
  fps: number,
): MosaicDocument {
  // A visible ramp across the sequence, so the files are distinguishable at
  // a glance in a folder.
  const t = total > 1 ? index / (total - 1) : 0;
  const channel = Math.round(40 + t * 180);
  const tint = `#${channel.toString(16).padStart(2, "0")}5c25` as MosaicColor;

  return {
    kind: "mosaic_document",
    version: 1,
    m0: toM0String(String(weightedSplit([4, 1], "row", { claimants: ["1{1}", "1"] })), `${ID}:frame`),
    assets: {},
    size: { width, height },
    fps,
    durationMs: FRAME_MS,
    backgroundColor: PANEL,
    // Per-step format: this is what makes the deliverable a PNG.
    format: { kind: "image", container: "png" },
    sources: [
      makeColorTile(tint),
      svgLabel(String(index + 1), width, Math.round((height * 4) / 5), {
        maxPx: Math.round(height * 0.4),
        maxLines: 1,
        color: INK,
      }),
      svgLabel(`frame ${index + 1} of ${total}`, width, Math.round(height / 5), {
        maxPx: Math.round(height * 0.06),
        maxLines: 1,
        color: INK_DIM,
      }),
    ],
  };
}

export const PngSequenceV1 = defineMosaicTemplate<PngSequenceProps>({
  id: asTemplateId(ID),
  label: "57 · PNG Sequence",
  version: 1,
  description:
    "A frame sequence is emit:\"multi\" where every step is an image: each step declares format {kind:\"image\", container:\"png\"} and the engine writes one PNG per step. Zero-padded step names are the template's job — the engine only guarantees the name it was given.",
  capabilities: { tier: "core" },
  tags: ["pipelines", "multi-output", "lesson"],

  outputHints: {
    width: 640,
    height: 360,
    fps: 30,
    durationMs: 600,
    format: { kind: "image", container: "png" },
    note: "Render it and read the folder: frame-001.png, frame-002.png, …",
  },

  propsSchema,
  defaultProps: { frames: 6, prefix: "frame" },

  async render(
    props: PngSequenceProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocumentPipeline> {
    const frames = props.frames ?? 6;
    const prefix = (props.prefix ?? "frame").trim();

    const problems: string[] = [];
    if (!Number.isInteger(frames) || frames < 1 || frames > 24) {
      problems.push(`frames must be a whole number 1-24, got ${JSON.stringify(frames)}`);
    }
    // The name becomes a filename, so it has to survive one.
    if (!/^[a-z0-9][a-z0-9-]{0,23}$/i.test(prefix)) {
      problems.push(
        `prefix ${JSON.stringify(prefix)} must be filename-safe (letters, digits, dashes; max 24)`,
      );
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height, fps } = ctx.target;
    // Pad to the width the LARGEST index needs, so the whole set sorts.
    const pad = String(frames).length;

    return {
      kind: "mosaic_pipeline",
      version: 1,
      emit: "multi",
      fps,
      steps: Array.from({ length: frames }, (_unused, i) => ({
        name: `${prefix}-${String(i + 1).padStart(pad, "0")}`,
        label: prefix,
        durationMs: FRAME_MS,
        file: frameDoc(i, frames, width, height, fps),
      })),
    };
  },

  renderTutorial: lessonTutorial({
    title: "PNG Sequence",
    lines: [
      "A frame sequence is emit \"multi\" where every step is an IMAGE: each declares format {kind:\"image\", container:\"png\"}.",
      "Naming IS the deliverable: files land as {base}-{step.name}.png, so pad the numbers or the folder sorts 10 before 2.",
      "step.label rides along to the CLI's --output-pattern {{label}} token for batch renders.",
      "Step count is a real cost: N steps means N renders and N files. Keep the default small.",
    ],
    explore: [
      "Render it and read the folder - the names sort correctly",
      "Set Frames to 12: twice the files, twice the renders",
      "Change the prefix and re-render",
    ],
  }),
});

export default PngSequenceV1;
