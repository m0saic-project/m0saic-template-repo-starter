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
 * `@m0saic-starter/pipelines/two-scenes/v1` — the smallest pipeline: two
 * documents, one file.
 *
 * ONE CONCEPT: a template may return a `MosaicDocumentPipeline` instead of a
 * document. A pipeline is a SEQUENCE of documents, each with its own m0, its
 * own sources, and its own `durationMs` — because one document means one
 * geometry, and time is the thing a single m0 cannot express.
 *
 * `emit: "single"` (the default) renders every step and concatenates them
 * into ONE file. `emit: "multi"` writes one file per step — that is
 * pipelines/fan-out, next door.
 *
 * THE OVERLAP RULE is the part that surprises people. A transition of
 * `durationMs` d does not sit BETWEEN the steps; it overlaps the last d of
 * the earlier step with the first d of the later one. So the stitched output
 * is:
 *
 *   A + B − d      (not A + B)
 *
 * Which is why the scene lengths are DERIVED, not chosen: a pipeline must
 * stitch to `ctx.target.durationMs`, so each scene carries half the overlap
 * on top of its visible time. Time comes from ctx.target exactly the way
 * size does — pick your own numbers and the render comes out short.
 *
 * Steps rendered at DIFFERENT canvas sizes fall back to a hard cut with a
 * diagnostic — xfade needs matching dimensions. Every step here shares the
 * pipeline's canvas, which is the ordinary case.
 */

export type TwoScenesProps = {
  /** How the two scenes meet. */
  transition?: "cut" | "fade";
  /** Overlap length in ms — the amount the stitched output LOSES. */
  transitionMs?: number;
};

const ID = "@m0saic-starter/pipelines/two-scenes/v1";
const TRANSITIONS = ["cut", "fade"] as const;
const SCENE_A = "#EF7525" as MosaicColor;
const SCENE_B = "#2e86c1" as MosaicColor;
const INK = "#0b0e11" as MosaicColor;

const propsSchema = definePropsSchema<TwoScenesProps>({
  transition: {
    type: "string",
    required: false,
    description:
      "\"cut\": a hard boundary, and the output is exactly A + B. \"fade\": a crossfade that OVERLAPS the two scenes, so the output is A + B minus the overlap.",
    meta: { constraints: { oneOf: [...TRANSITIONS] }, ui: { label: "Transition" } },
  },
  transitionMs: {
    type: "number",
    required: false,
    description: "Overlap length in ms. This is time the stitched output LOSES — the planner clamps it to the shorter scene.",
    meta: {
      constraints: { min: 0, max: 2000 },
      control: { step: 100 },
      ui: { label: "Overlap ms" },
    },
  },
});

/** One scene: a colour field with its name on it. */
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
    m0: toM0String(String(weightedSplit([4, 1], "row", { claimants: ["1", "1"] })), ID),
    assets: {},
    // A step is a whole document: it declares its own canvas and length.
    size: { width, height },
    fps,
    durationMs,
    backgroundColor: color,
    sources: [
      makeColorTile(color),
      svgLabel(label, width, Math.round(height / 5), {
        maxPx: Math.round(height * 0.09),
        maxLines: 1,
        color: INK,
      }),
    ],
  };
}

export const TwoScenesV1 = defineMosaicTemplate<TwoScenesProps>({
  id: asTemplateId(ID),
  label: "55 · Two Scenes",
  version: 1,
  description:
    "The smallest pipeline: two documents concatenated into one file. Shows that a step IS a document (own m0, own canvas, own exact durationMs) and the transition OVERLAP rule — a d-ms crossfade makes the output A + B − d, not A + B.",
  capabilities: { tier: "core" },
  tags: ["pipelines", "time", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Render it: two scenes, one file. Raise Overlap ms and the output gets SHORTER.",
  },

  propsSchema,
  defaultProps: { transition: "fade", transitionMs: 300 },

  async render(
    props: TwoScenesProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocumentPipeline> {
    const transition = props.transition ?? "fade";
    const transitionMs = props.transitionMs ?? 300;

    const { width, height, fps } = ctx.target;
    // TIME COMES FROM ctx.target, exactly like size does. A pipeline must
    // STITCH TO ctx.target.durationMs, and the stitch is
    // `Σ output-step durations − Σ overlap` — so the scenes are derived,
    // never chosen. Pick your own numbers and the render is short.
    const total = ctx.target.durationMs;
    const overlap = transition === "fade" ? transitionMs : 0;

    const problems: string[] = [];
    if (!TRANSITIONS.includes(transition as (typeof TRANSITIONS)[number])) {
      problems.push(`transition must be one of ${TRANSITIONS.join(" | ")}, got ${JSON.stringify(transition)}`);
    }
    if (!Number.isFinite(transitionMs) || transitionMs < 0 || transitionMs > 2000) {
      problems.push(`transitionMs must be 0-2000, got ${JSON.stringify(transitionMs)}`);
    } else if (overlap >= total) {
      problems.push(
        `transitionMs ${transitionMs} must be shorter than the clip (${total}ms) - the overlap would eat both scenes`,
      );
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    // Each scene carries half the overlap on top of its visible time, so the
    // two of them stitch back down to exactly `total`.
    const sceneA = Math.ceil((total + overlap) / 2);
    const sceneB = total + overlap - sceneA;

    const captionA = `scene A - renders ${sceneA}ms`;
    const captionB =
      overlap > 0
        ? `scene B - renders ${sceneB}ms - stitched ${sceneA}+${sceneB}-${overlap} = ${total}ms`
        : `scene B - renders ${sceneB}ms - cut, so stitched = ${total}ms`;

    return {
      kind: "mosaic_pipeline",
      version: 1,
      // "single" is the default; spelled out because it is half the lesson.
      emit: "single",
      size: { width, height },
      fps,
      steps: [
        {
          name: "scene-a",
          durationMs: sceneA,
          transitionToNext:
            transition === "fade"
              ? { type: "fade", durationMs: transitionMs }
              : { type: "cut" },
          file: scene(captionA, SCENE_A, width, height, sceneA, fps),
        },
        {
          name: "scene-b",
          durationMs: sceneB,
          file: scene(captionB, SCENE_B, width, height, sceneB, fps),
        },
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Two Scenes",
    lines: [
      "A template may return a PIPELINE: a sequence of documents, each with its own m0, sources and exact durationMs.",
      "That is how time enters. One document is one geometry, so anything that changes over the clip needs a second document.",
      "emit \"single\" concatenates the steps. THE OVERLAP RULE: a d-ms transition overlaps them, so the output is A + B - d.",
      "Steps at different canvas sizes fall back to a hard cut - xfade needs matching dimensions.",
    ],
    explore: [
      "Raise Overlap ms - the rendered file gets SHORTER",
      "Switch Transition to cut: output is exactly A + B",
      "Set Overlap past Scene ms and read the refusal",
    ],
  }),
});

export default TwoScenesV1;
