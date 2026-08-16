import type {
  MosaicColor,
  MosaicDocument,
  MosaicDocumentPipeline,
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

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/pipelines/nested-pipeline/v1` — time inside a tile.
 *
 * ONE CONCEPT: a `children` entry may be a PIPELINE, not just a document. It
 * renders first, and the parent consumes its stitched output as the tile's
 * content — scene-within-scene without putting time into the m0.
 *
 * Three rules govern the nesting, and each one is a trap if you meet it by
 * surprise:
 *
 *   - THE SLOT'S DURATION WINS. The nested pipeline must fill the parent
 *     slot's effective duration T. The engine sums its steps, trims the last
 *     one to fit, and — when the pipeline is SHORTER than T — falls back to
 *     the embedding source's `playback.loopMode` (loop / freeze / cut).
 *   - THE PARENT'S CANVAS WINS. Per-step canvases are overridden under
 *     nesting (`PIPELINE_NESTED_CANVAS_COLLAPSED`), so a nested step cannot
 *     keep its own shape.
 *   - `emit: "multi"` SILENTLY DOWNGRADES to "single". Multi is a top-level
 *     concept; there is no such thing as a nested fan-out.
 *
 * THE STAMP HAZARD: a nested pipeline should declare its own `size`, `fps`
 * and `durationMs` rather than inheriting whatever the parent's render
 * happened to stamp. A pipeline that leaves them undefined is at the mercy of
 * the slot it lands in — fine while it renders standalone, surprising the
 * first time it is embedded.
 */

export type NestedPipelineProps = {
  /** How long the inner pipeline runs, in ms — shorter than the slot on purpose. */
  innerMs?: number;
  /** What fills the slot when the inner pipeline is shorter. */
  loopMode?: "loop" | "freeze" | "cut";
};

const ID = "@m0saic-starter/pipelines/nested-pipeline/v1";
const LOOPS = ["loop", "freeze", "cut"] as const;
const CHILD_REF = "reel";
const PANEL = "#17202a" as MosaicColor;
const SCENE_A = "#EF7525" as MosaicColor;
const SCENE_B = "#2e86c1" as MosaicColor;
const INK = "#0b0e11" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

const propsSchema = definePropsSchema<NestedPipelineProps>({
  innerMs: {
    type: "number",
    required: false,
    description: "Total length of the nested pipeline (two scenes, split evenly). Shorter than the slot on purpose, so the fallback is visible.",
    meta: {
      constraints: { min: 200, max: 4000 },
      control: { step: 100 },
      ui: { label: "Inner ms" },
    },
  },
  loopMode: {
    type: "string",
    required: false,
    description: "What fills the gap when the inner pipeline is SHORTER than the slot: loop repeats it, freeze holds its last frame, cut goes black.",
    meta: { constraints: { oneOf: [...LOOPS] }, ui: { label: "Loop mode" } },
  },
});

/** One inner scene. */
function scene(
  label: string,
  color: MosaicColor,
  width: number,
  height: number,
  durationMs: number,
  fps: number,
): MosaicDocument {
  return {
    kind: "mosaic_document",
    version: 1,
    m0: toM0String(String(weightedSplit([4, 1], "row", { claimants: ["1", "1"] })), `${ID}:scene`),
    assets: {},
    size: { width, height },
    fps,
    durationMs,
    backgroundColor: color,
    sources: [
      makeColorTile(color),
      svgLabel(label, width, Math.round(height / 5), {
        maxPx: Math.round(height * 0.08),
        maxLines: 1,
        color: INK,
      }),
    ],
  };
}

export const NestedPipelineV1 = defineMosaicTemplate<NestedPipelineProps>({
  id: asTemplateId(ID),
  label: "49 · Nested Pipeline",
  version: 1,
  description:
    "A children entry may be a PIPELINE: it renders first and the parent consumes its stitched output as one tile — scene-within-scene without time in the m0. The slot's duration and canvas win, emit:\"multi\" downgrades, and loopMode fills any shortfall.",
  capabilities: { tier: "core" },
  tags: ["pipelines", "children", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "The left tile is a whole pipeline. Make Inner ms shorter than Slot ms and flip Loop mode.",
  },

  propsSchema,
  defaultProps: { innerMs: 1200, loopMode: "loop" },

  async render(
    props: NestedPipelineProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const innerMs = props.innerMs ?? 1200;
    const loopMode = props.loopMode ?? "loop";

    const problems: string[] = [];
    if (!Number.isFinite(innerMs) || innerMs < 200 || innerMs > 4000) {
      problems.push(`innerMs must be 200-4000, got ${JSON.stringify(innerMs)}`);
    }
    if (!LOOPS.includes(loopMode as (typeof LOOPS)[number])) {
      problems.push(`loopMode must be one of ${LOOPS.join(" | ")}, got ${JSON.stringify(loopMode)}`);
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height, fps } = ctx.target;
    // The SLOT is the render's own duration — a returned document must match
    // ctx.target exactly, so there is no slot length to invent.
    const slotMs = ctx.target.durationMs;
    const slotW = Math.round(width / 2);
    const sceneMs = Math.round(innerMs / 2);

    // The nested pipeline declares its OWN geometry triple rather than
    // inheriting whatever the parent stamped — the stamp hazard.
    const reel: MosaicDocumentPipeline = {
      kind: "mosaic_pipeline",
      version: 1,
      // Declared, and ignored under nesting: multi is top-level only. Saying
      // it out loud is the point — the downgrade is SILENT.
      emit: "single",
      size: { width: slotW, height },
      fps,
      durationMs: innerMs,
      steps: [
        {
          name: "reel-a",
          durationMs: sceneMs,
          transitionToNext: { type: "fade", durationMs: Math.min(200, Math.floor(sceneMs / 2)) },
          file: scene("inner A", SCENE_A, slotW, height, sceneMs, fps),
        },
        {
          name: "reel-b",
          durationMs: sceneMs,
          file: scene("inner B", SCENE_B, slotW, height, sceneMs, fps),
        },
      ],
    };

    const shortfall = Math.max(0, slotMs - innerMs);
    const caption =
      shortfall > 0
        ? `inner ${innerMs}ms in a ${slotMs}ms slot - "${loopMode}" fills the ${shortfall}ms remainder`
        : `inner ${innerMs}ms in a ${slotMs}ms slot - no remainder, so loopMode never fires`;

    return {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String(
        String(
          weightedSplit([5, 1], "row", {
            claimants: [String(weightedSplit([1, 1], "col", { claimants: ["1", "1"] })), "1"],
          }),
        ),
        ID,
      ),
      assets: {},
      backgroundColor: PANEL,
      children: { [CHILD_REF]: reel },
      sources: [
        // A pipeline behind one tile. The playback here is what fills any gap.
        {
          type: "mosaic",
          ref: CHILD_REF,
          placement: { fit: "contain" },
          playback: { loopMode },
        } as unknown as MosaicSource,
        makeColorTile("#101418" as MosaicColor),
        svgLabel(caption, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.028),
          maxLines: 2,
          color: INK_DIM,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Nested Pipeline",
    lines: [
      "A children entry may be a PIPELINE: it renders first and the parent consumes its stitched output as one tile.",
      "THE SLOT WINS on duration - steps are summed and trimmed, and playback.loopMode fills any shortfall.",
      "The slot wins on CANVAS too, and emit \"multi\" silently downgrades: multi is a top-level concept.",
      "The stamp hazard: declare the nested pipeline's own size, fps and durationMs, or it inherits whatever slot it lands in.",
    ],
    explore: [
      "Make Inner ms shorter than Slot ms, then flip Loop mode",
      "Match them exactly - loopMode stops mattering",
      "Open the structure dock: a whole pipeline under one tile",
    ],
  }),
});

export default NestedPipelineV1;
