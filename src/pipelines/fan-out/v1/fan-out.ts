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
 * `@m0saic-starter/pipelines/fan-out/v1` — one render, several deliverables
 * at DIFFERENT shapes.
 *
 * ONE CONCEPT: `emit: "multi"` stops concatenating and writes one file per
 * output step, each at its OWN step canvas. That is the only way to get
 * several geometries out of one template — a document has one m0, therefore
 * one geometry, and no amount of output config changes that.
 *
 * Three rules travel with it:
 *
 *   - EACH STEP IS A FILE, named from `step.name`: `{base}-{name}.{ext}`
 *     (`step-{index}` when unnamed, and two steps may not share a name).
 *   - MULTI IS TOP-LEVEL ONLY. A pipeline nested inside another document's
 *     `children` silently downgrades to `"single"`.
 *   - `intermediate: true` steps render but never ship. They exist to back
 *     ref sources and shared work; at least one step must be non-intermediate
 *     or the pipeline has no output at all.
 *
 * The lesson deliberately re-lays out per shape rather than scaling one
 * canvas: the landscape step stacks its label beside the mark, the portrait
 * step stacks it underneath. Re-layout is the reason to fan out at all — if
 * a plain resize would do, one render plus an `encodes` entry is cheaper
 * (pipelines/encode-matrix).
 */

export type FanOutProps = {
  /** Text on every variant. */
  title?: string;
  /** Also emit a square variant. */
  includeSquare?: boolean;
  /** Length of each variant, ms. */
  variantMs?: number;
};

const ID = "@m0saic-starter/pipelines/fan-out/v1";
const BRAND = "#EF7525" as MosaicColor;
const PANEL = "#17202a" as MosaicColor;
const INK = "#ecf0f1" as MosaicColor;

const propsSchema = definePropsSchema<FanOutProps>({
  title: {
    type: "string",
    required: false,
    description: "Text drawn on every variant — one source of truth, laid out differently per shape.",
    meta: { control: { placeholder: "Ship it" }, ui: { label: "Title" } },
  },
  includeSquare: {
    type: "boolean",
    required: false,
    description: "Add a third output step at 1:1. Each step becomes its own file, named from step.name.",
    meta: { ui: { label: "Include square" } },
  },
  variantMs: {
    type: "number",
    required: false,
    description: "How long each variant renders. Steps are independent documents, so they could differ — this one keeps them equal.",
    meta: {
      constraints: { min: 200, max: 5000 },
      control: { step: 100 },
      ui: { label: "Variant ms" },
    },
  },
});

/** One variant: a mark and a title, laid out for THIS shape. */
function variant(
  title: string,
  width: number,
  height: number,
  durationMs: number,
  fps: number,
): MosaicDocument {
  const portrait = height > width;
  // The point of fanning out: the layout CHANGES, it doesn't just scale.
  const m0 = portrait
    ? String(weightedSplit([3, 2], "row", { claimants: ["1", "1"] }))
    : String(weightedSplit([2, 3], "col", { claimants: ["1", "1"] }));
  const titleBox = portrait
    ? { w: width, h: Math.round((height * 2) / 5) }
    : { w: Math.round((width * 3) / 5), h: height };

  return {
    kind: "mosaic_document",
    version: 1,
    m0: toM0String(m0, ID),
    assets: {},
    // Each step declares its OWN canvas — this is what emit:"multi" honors.
    size: { width, height },
    fps,
    durationMs,
    backgroundColor: PANEL,
    sources: [
      makeColorTile(BRAND),
      svgLabel(`${title}\n${width}x${height}`, titleBox.w, titleBox.h, {
        maxPx: Math.round(Math.min(titleBox.w, titleBox.h) * 0.16),
        maxLines: 2,
        color: INK,
      }),
    ],
  };
}

export const FanOutV1 = defineMosaicTemplate<FanOutProps>({
  id: asTemplateId(ID),
  label: "52 · Fan Out",
  version: 1,
  description:
    "emit:\"multi\" writes one file per output step, each at its own canvas — the only way one template delivers several geometries. Landscape and portrait re-LAY OUT rather than scaling, which is the reason to fan out instead of adding an encode.",
  capabilities: { tier: "core" },
  tags: ["pipelines", "multi-output", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 1000,
    note: "Render it and look at the output folder: one file per step, named from step.name.",
  },

  propsSchema,
  defaultProps: { title: "Ship it", includeSquare: false, variantMs: 1000 },

  async render(
    props: FanOutProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocumentPipeline> {
    const title = (props.title ?? "Ship it").trim();
    const includeSquare = props.includeSquare ?? false;
    const variantMs = props.variantMs ?? 1000;

    const problems: string[] = [];
    if (title.length < 1 || title.length > 24) {
      problems.push(`title must be 1-24 characters, got ${JSON.stringify(title)}`);
    }
    if (!Number.isFinite(variantMs) || variantMs < 200 || variantMs > 5000) {
      problems.push(`variantMs must be 200-5000, got ${JSON.stringify(variantMs)}`);
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height, fps } = ctx.target;
    // Derive the variants from the CANVAS, so the shapes follow ctx.target
    // instead of hardcoding 1920x1080 the way a fixture would.
    const long = Math.max(width, height);
    const short = Math.min(width, height);

    const steps = [
      {
        name: "landscape",
        label: title,
        durationMs: variantMs,
        file: variant(title, long, short, variantMs, fps),
      },
      {
        name: "portrait",
        label: title,
        durationMs: variantMs,
        file: variant(title, short, long, variantMs, fps),
      },
    ];
    if (includeSquare) {
      steps.push({
        name: "square",
        label: title,
        durationMs: variantMs,
        file: variant(title, short, short, variantMs, fps),
      });
    }

    return {
      kind: "mosaic_pipeline",
      version: 1,
      // The whole lesson. Without this the steps concatenate into one file.
      emit: "multi",
      fps,
      steps,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Fan Out",
    lines: [
      "emit \"multi\" stops concatenating and writes ONE FILE PER STEP, each at its own canvas.",
      "Each file is named from step.name: {base}-{name}.{ext}. Names must be unique; unnamed steps fall back to step-{index}.",
      "Multi is TOP-LEVEL only - nested in another document's children it silently downgrades to single.",
      "These variants re-LAY OUT per shape. If a resize would do, one render plus an encodes entry is cheaper.",
    ],
    explore: [
      "Render it and look at the output folder - one file per step",
      "Turn Include square on: a third file appears",
      "Compare with encode-matrix: re-layout versus re-encode",
    ],
  }),
});

export default FanOutV1;
