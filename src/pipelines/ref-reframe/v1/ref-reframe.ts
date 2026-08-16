import type {
  MosaicColor,
  MosaicDocument,
  MosaicDocumentPipeline,
  MosaicEngineContext,
  MosaicSource,
  MosaicTextSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import type { M0String } from "@m0saic/dsl";
import { findStableKeys, toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  animateNumbersInText,
  defineMosaicTemplate,
  definePropsSchema,
  solidBackground,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/pipelines/ref-reframe/v1` — the same mirror, worn
 * differently.
 *
 * ONE CONCEPT: a ref does not have to match its target. When the mirror's
 * slot differs in SIZE, ASPECT, FPS or DURATION, the engine bridges the gap
 * and the ref's own decoration decides how:
 *
 *   - SHAPE — `placement.fit` (`contain` letterboxes, `cover` crops) plus
 *     alignment. The mirrored pixels are the same; the framing is yours.
 *   - TIME — `playback.loopMode`: `loop` repeats the target, `freeze` holds
 *     its last frame, `cut` goes black once it runs out. Plus
 *     `clipStartMs` / `clipDurationMs` to take a window of it.
 *
 * This is the case the matrix in the knowledge base calls 3c: cross-step,
 * different duration. The consumer step here is deliberately LONGER than the
 * producer, so the tail is real and `loopMode` is the only thing deciding
 * what fills it — exactly like media/play-speed, but for mirrored pixels.
 *
 * The pixels are never re-rendered. One decode, one intermediate, and every
 * consumer's decoration chain runs independently on top.
 */

export type RefReframeProps = {
  /** How the mirror frames a differently-shaped slot. */
  fit?: "contain" | "cover";
  /** What fills the tail when the mirror outlives its target. */
  loopMode?: "loop" | "freeze" | "cut";
  /** How much longer the consumer step runs, in ms. */
  tailMs?: number;
};

const ID = "@m0saic-starter/pipelines/ref-reframe/v1";
const FITS = ["contain", "cover"] as const;
const LOOPS = ["loop", "freeze", "cut"] as const;
const HERO_BG = "#EF7525" as MosaicColor;
const PANEL = "#17202a" as MosaicColor;
const INK = "#17202a" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;
const PRODUCER_MS = 600;

/** The producer's layout, built once so its key can be read off it. */
function producerM0(): M0String {
  return toM0String(
    String(weightedSplit([4, 1], "row", { claimants: ["1", "1"] })),
    `${ID}:producer`,
  );
}

const propsSchema = definePropsSchema<RefReframeProps>({
  fit: {
    type: "string",
    required: false,
    description: "How the mirror frames a slot with a different shape: contain letterboxes, cover crops. Same pixels either way.",
    meta: { constraints: { oneOf: [...FITS] }, ui: { label: "Fit" } },
  },
  loopMode: {
    type: "string",
    required: false,
    description: "What fills the tail once the mirrored pixels run out: loop repeats them, freeze holds the last frame, cut goes black.",
    meta: { constraints: { oneOf: [...LOOPS] }, ui: { label: "Loop mode" } },
  },
  tailMs: {
    type: "number",
    required: false,
    description: "How much LONGER the consumer step runs than the target. Without a tail there is nothing for loopMode to decide.",
    meta: {
      constraints: { min: 0, max: 3000 },
      control: { step: 100 },
      ui: { label: "Tail ms" },
    },
  },
});

function producerStep(
  m0: M0String,
  width: number,
  height: number,
  fps: number,
): MosaicDocument {
  const hero: MosaicSource = {
    type: "text",
    renderMode: { kind: "video" },
    visual: { backgroundColor: solidBackground(HERO_BG) },
    layers: [
      {
        content: { kind: "literal", text: "SOURCE" },
        style: { fontSize: Math.round(height * 0.16), fontColor: INK },
        placement: { hAlign: "center", vAlign: "middle" },
      },
      {
        // The tail is the whole point of this lesson, and a STILL mirror
        // cannot show it: loop, freeze and cut all look identical when the
        // mirrored pixels never change. So the target counts — the number IS
        // the readout. Past the producer's end, `loop` sends it back to 0,
        // `freeze` holds its last value, and `cut` goes black.
        content: {
          kind: "expr",
          expr: animateNumbersInText(PRODUCER_MS.toString(), {
            durationSec: PRODUCER_MS / 1000,
          }),
          eval: "frame",
        },
        style: {
          fontSize: Math.round(height * 0.09),
          fontColor: INK,
        },
        placement: { hAlign: "center", vAlign: "bottom", padding: { bottom: 0.08 } },
      },
    ],
  } as MosaicTextSource;

  return {
    kind: "mosaic_document",
    version: 1,
    m0,
    assets: {},
    // A WIDE producer: the consumer's slot is tall, so the mirror has a real
    // shape mismatch to resolve.
    size: { width, height: Math.round(height / 2) },
    fps,
    durationMs: PRODUCER_MS,
    backgroundColor: PANEL,
    sources: [
      hero,
      svgLabel(`${width}x${Math.round(height / 2)} - ${PRODUCER_MS}ms`, width, Math.round(height / 10), {
        maxPx: Math.round(height * 0.032),
        maxLines: 1,
        color: INK_DIM,
      }),
    ],
  };
}

export const RefReframeV1 = defineMosaicTemplate<RefReframeProps>({
  id: asTemplateId(ID),
  label: "48 · Ref Reframe",
  version: 1,
  description:
    "A mirror whose slot differs in shape and length: placement.fit reframes the pixels and playback.loopMode fills the tail (loop, freeze or cut). Nothing is re-rendered — one intermediate, per-consumer decoration.",
  capabilities: { tier: "core" },
  tags: ["pipelines", "refs", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 1600,
    note: "The second step outlives its target on purpose — loopMode decides what fills the tail.",
  },

  propsSchema,
  defaultProps: { fit: "contain", loopMode: "freeze", tailMs: 400 },

  async render(
    props: RefReframeProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocumentPipeline> {
    const fit = props.fit ?? "contain";
    const loopMode = props.loopMode ?? "freeze";
    const tailMs = props.tailMs ?? 400;

    const problems: string[] = [];
    if (!FITS.includes(fit as (typeof FITS)[number])) {
      problems.push(`fit must be one of ${FITS.join(" | ")}, got ${JSON.stringify(fit)}`);
    }
    if (!LOOPS.includes(loopMode as (typeof LOOPS)[number])) {
      problems.push(`loopMode must be one of ${LOOPS.join(" | ")}, got ${JSON.stringify(loopMode)}`);
    }
    if (!Number.isFinite(tailMs) || tailMs < 0 || tailMs > 3000) {
      problems.push(`tailMs must be 0-3000, got ${JSON.stringify(tailMs)}`);
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height, fps } = ctx.target;
    const consumerMs = PRODUCER_MS + tailMs;

    // The key is read off the PRODUCER's m0 at the PRODUCER's canvas — a key
    // is a coordinate in one document's flattened geometry, so it must be
    // asked of that document, not of the consumer doing the mirroring.
    const pm0 = producerM0();
    const producerHeight = Math.round(height / 2);
    const heroKey = findStableKeys(pm0, (f) => f.kind === "frame", {
      width,
      height: producerHeight,
    })[0];

    const caption =
      tailMs > 0
        ? `mirror of ${heroKey}: fit "${fit}", and ${tailMs}ms of tail filled by "${loopMode}"`
        : `mirror of ${heroKey}: fit "${fit}" - no tail, so loopMode has nothing to decide`;

    // A TALL slot for a wide target: the shape mismatch is the point.
    const consumer: MosaicDocument = {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String(String(weightedSplit([5, 1], "row", { claimants: ["1", "1"] })), `${ID}:consumer`),
      assets: {},
      size: { width: Math.round(width / 2), height },
      fps,
      durationMs: consumerMs,
      backgroundColor: PANEL,
      sources: [
        {
          type: "ref",
          flattenedStableKey: heroKey,
          stepIndex: 0,
          placement: { fit },
          playback: { loopMode },
        } as unknown as MosaicSource,
        svgLabel(caption, Math.round(width / 2), Math.round(height / 6), {
          maxPx: Math.round(height * 0.026),
          maxLines: 3,
          color: INK_DIM,
        }),
      ],
    };

    return {
      kind: "mosaic_pipeline",
      version: 1,
      emit: "multi",
      fps,
      steps: [
        { name: "source", durationMs: PRODUCER_MS, file: producerStep(pm0, width, height, fps) },
        { name: "reframed", durationMs: consumerMs, file: consumer },
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Ref Reframe",
    lines: [
      "A mirror need not match its target: when the slot differs in size, aspect, fps or duration, the ref's decoration decides.",
      "Shape is placement.fit - contain letterboxes, cover crops. The pixels are identical; only the framing is yours.",
      "Time is playback.loopMode: loop repeats, freeze holds the last frame, cut goes black. The target counts, so read the tail off the number.",
      "Nothing is re-rendered for any of it: one intermediate, one decode, decoration on top.",
    ],
    explore: [
      "Flip Loop mode: the counter repeats, holds, or cuts",
      "Set Tail ms to 0 - loopMode stops mattering",
      "Switch fit: the same pixels letterbox or crop",
    ],
  }),
});

export default RefReframeV1;
