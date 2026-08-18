import type {
  MosaicColor,
  MosaicDocument,
  MosaicDocumentPipeline,
  MosaicEngineContext,
  MosaicSource,
  MosaicTextSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { findStableKeys, toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  solidBackground,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/pipelines/ref-across-steps/v1` — reach BACK to a cell an
 * earlier step already rendered.
 *
 * ONE CONCEPT: a ref carries `stepIndex` as well as a key, and that turns it
 * into a back-edge across the pipeline. Step 3 can show step 0's exact
 * pixels without re-rendering them — the engine reuses the earlier step's
 * intermediate.
 *
 * BACK-EDGES ONLY: `stepIndex` must be strictly earlier than the consuming
 * step, and a forward reference is `MOSAIC_REF_FORWARD_REFERENCE`. That is
 * what keeps a pipeline a sequence and not a graph with cycles.
 *
 * WHY IT MATTERS BEYOND PIXEL REUSE. In a long generated sequence — each step
 * producing a scene — consistency is the hard part. A back-edge lets step Y
 * point at a specific cell from step X and get *that* frame back, rather than
 * describing it again and hoping for the same result. The reference is the
 * thing that was actually rendered, so it cannot drift.
 *
 * THE HANDOFF IDIOM. Across steps the consumer usually can't know the
 * producer's stableKeys, so the PRODUCER self-stamps a pointer into its
 * `variables` and the consumer spreads it:
 *
 *   // producer (it owns the geometry, so the key is right by construction):
 *   variables: { hero: { stepIndex: ctx.pipelineStep!.index,
 *                        flattenedStableKey: "r/fc0" } }
 *   // consumer:
 *   sources: [{ type: "ref", ...ctx.upstreamVariables!.hero }]
 *
 * This template publishes that handle even though it also hardcodes the key —
 * a lesson can see both ends at once, which a real pair of templates cannot.
 *
 * The producer step is `intermediate: true`: it renders (the ref needs its
 * pixels) but never ships. At least one step must NOT be intermediate, or the
 * pipeline has no output at all.
 *
 * That also changes the arithmetic. A pipeline must stitch to
 * `ctx.target.durationMs`, and the stitch counts OUTPUT steps only — so with
 * the producer intermediate the consumer carries the whole clip, and shipping
 * the producer makes the two split it.
 */

export type RefAcrossStepsProps = {
  /** Word rendered in the producer step and echoed later. */
  word?: string;
  /** Ship the producer step as its own file too. */
  keepProducer?: boolean;
};

const ID = "@m0saic-starter/pipelines/ref-across-steps/v1";
const HERO_BG = "#EF7525" as MosaicColor;
const PANEL = "#17202a" as MosaicColor;
const INK = "#17202a" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

const propsSchema = definePropsSchema<RefAcrossStepsProps>({
  word: {
    type: "string",
    required: false,
    description: "Rendered ONCE in the producer step. The consumer step mirrors those pixels back instead of drawing them again.",
    meta: { control: { placeholder: "STEP 0" }, ui: { label: "Word" } },
  },
  keepProducer: {
    type: "boolean",
    required: false,
    description: "Ship the producer step as a file too. Off, it is intermediate: it renders (the ref needs it) but never reaches the deliverable.",
    meta: { ui: { label: "Keep producer output" } },
  },
});

/** Step 0 — renders the hero and publishes a pointer to it. */
function producerStep(
  word: string,
  width: number,
  height: number,
  fps: number,
  stepIndex: number,
  durationMs: number,
): MosaicDocument {
  const hero: MosaicSource = {
    type: "text",
    renderMode: { kind: "image" },
    visual: { backgroundColor: solidBackground(HERO_BG) },
    layers: [
      {
        content: { kind: "literal", text: word },
        style: { fontSize: Math.round(height * 0.18), fontColor: INK },
      },
    ],
  } as MosaicTextSource;

  const m0 = toM0String(
    String(weightedSplit([4, 1], "row", { claimants: ["1", "1"] })),
    `${ID}:producer`,
  );
  // The producer ASKS its own m0 which cell the hero landed in — the first
  // painted frame in walk order — so the handle stays right even if this
  // layout changes underneath it.
  const heroKey = findStableKeys(m0, (f) => f.kind === "frame", { width, height })[0];

  return {
    kind: "mosaic_document",
    version: 1,
    m0,
    assets: {},
    size: { width, height },
    fps,
    durationMs,
    backgroundColor: PANEL,
    // THE HANDOFF: the producer stamps its own coordinates, so a consumer
    // never has to guess (and a v2 can move the cell without breaking it).
    variables: {
      hero: { stepIndex, flattenedStableKey: heroKey },
    },
    sources: [
      hero,
      svgLabel("step 0 - rendered here", width, Math.round(height / 5), {
        maxPx: Math.round(height * 0.04),
        maxLines: 1,
        color: INK_DIM,
      }),
    ],
  };
}

/** Step 1 — mirrors step 0's hero beside a fresh tile. */
function consumerStep(
  width: number,
  height: number,
  fps: number,
  producerIndex: number,
  durationMs: number,
  heroKey: string,
): MosaicDocument {
  const top = String(weightedSplit([1, 1], "col", { claimants: ["1", "1"] }));
  return {
    kind: "mosaic_document",
    version: 1,
    m0: toM0String(String(weightedSplit([5, 1], "row", { claimants: [top, "1"] })), `${ID}:consumer`),
    assets: {},
    size: { width, height },
    fps,
    durationMs,
    backgroundColor: PANEL,
    sources: [
      // The back-edge. stepIndex must be strictly earlier than this step.
      {
        type: "ref",
        flattenedStableKey: heroKey,
        stepIndex: producerIndex,
        placement: { fit: "contain" },
      } as unknown as MosaicSource,
      makeColorTile("#2e86c1" as MosaicColor),
      svgLabel(
        `step 1 - left cell is step ${producerIndex}'s ${heroKey}, mirrored (not re-rendered)`,
        width,
        Math.round(height / 6),
        { maxPx: Math.round(height * 0.028), maxLines: 2, color: INK_DIM },
      ),
    ],
  };
}

export const RefAcrossStepsV1 = defineMosaicTemplate<RefAcrossStepsProps>({
  id: asTemplateId(ID),
  label: "51 · Ref Across Steps",
  version: 1,
  description:
    "A ref with stepIndex is a BACK-EDGE: a later step shows an earlier step's exact rendered pixels, no re-render. Back-edges only (forward refs are an error), plus the handoff idiom where the producer self-stamps {stepIndex, flattenedStableKey} for the consumer to spread.",
  capabilities: { tier: "core" },
  tags: ["pipelines", "refs", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 1400,
    note: "Two steps: the second one's left cell IS the first one's pixels.",
  },

  propsSchema,
  defaultProps: { word: "STEP 0", keepProducer: false },

  async render(
    props: RefAcrossStepsProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocumentPipeline> {
    const word = (props.word ?? "STEP 0").trim();
    const keepProducer = props.keepProducer ?? false;

    if (word.length < 1 || word.length > 12) {
      throw new Error(`${ID}: word must be 1-12 characters, got ${JSON.stringify(word)}.`);
    }

    const { width, height, fps } = ctx.target;
    const producerIndex = 0;
    // The stitch invariant counts OUTPUT steps only, so an intermediate
    // producer is free: the consumer alone has to fill ctx.target.durationMs.
    // Ship the producer too and they split it — the same clip, two files'
    // worth of visible time.
    const total = ctx.target.durationMs;
    const consumerMs = keepProducer ? Math.ceil(total / 2) : total;
    const producerMs = keepProducer ? total - consumerMs : total;

    // Build the producer first, then READ the handle it published — exactly
    // what a downstream template does with ctx.upstreamVariables.
    const producer = producerStep(word, width, height, fps, producerIndex, producerMs);
    const heroKey = String(
      (producer.variables as { hero: { flattenedStableKey: string } }).hero.flattenedStableKey,
    );

    return {
      kind: "mosaic_pipeline",
      version: 1,
      emit: "single",
      size: { width, height },
      fps,
      steps: [
        {
          name: "producer",
          durationMs: producerMs,
          // Renders either way — the ref needs its pixels. The flag only
          // decides whether it also reaches the deliverable.
          intermediate: !keepProducer,
          file: producer,
        },
        {
          name: "consumer",
          durationMs: consumerMs,
          file: consumerStep(width, height, fps, producerIndex, consumerMs, heroKey),
        },
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Ref Across Steps",
    lines: [
      "A ref carrying stepIndex is a BACK-EDGE: a later step shows an earlier step's exact pixels, reusing its intermediate.",
      "Back-edges only - stepIndex must be strictly earlier, and a forward reference is an error.",
      "Why it matters: in a long generated sequence, pointing at what was actually rendered cannot drift; describing it again can.",
      "THE HANDOFF: the producer self-stamps {stepIndex, flattenedStableKey} and the consumer spreads it - only it knows its keys.",
    ],
    explore: [
      "Turn Keep producer output on - the intermediate becomes a file",
      "Change Word: both steps follow, from ONE render",
      "Read the producer's variables - that is the handle",
    ],
  }),
});

export default RefAcrossStepsV1;
