import type {
  MosaicAssetManifest,
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asAssetId, asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  slugifyAssetKeyFromPath,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/media/play-speed/v1` — source time vs output time.
 *
 * ONE CONCEPT: `playback.playSpeed`. A speed of 2 plays the source at
 * double rate — every second of OUTPUT consumes TWO seconds of SOURCE.
 * The clip window (`clipDurationMs`) is measured in SOURCE time, so a
 * 2000ms window at playSpeed 2 fills only 1000ms of output; `loopMode`
 * decides what fills the rest.
 *
 * The template deliberately takes a SMALL sample (default 1s of source)
 * instead of the whole file: a short window ends well before the output
 * does, which is the only way `loopMode` becomes visible — loop repeats
 * it, freeze holds its last frame, cut goes black. Point this at a
 * ten-minute movie at 0.25x and you'd never reach the end of the window,
 * so you'd never see the mode do anything.
 */

export type PlaySpeedProps = {
  /** The video to re-time. */
  video?: string;
  /** Playback rate (0.25-4, steps of 0.25). 1 = realtime. */
  speed?: number;
  /** Source-time window length, ms — small on purpose (see loopMode). */
  sampleMs?: number;
  /** What fills the output after the re-timed window runs out. */
  loopMode?: "loop" | "cut" | "freeze";
};

const ID = "@m0saic-starter/media/play-speed/v1";
const LOOP_MODES = ["loop", "cut", "freeze"] as const;

const propsSchema = definePropsSchema<PlaySpeedProps>({
  video: {
    type: "media",
    required: false,
    description: "The video to re-time.",
    meta: { control: { picker: "file", accept: ["video"] }, ui: { label: "Video" } },
  },
  speed: {
    type: "number",
    required: false,
    description: "Playback rate: 0.25-4 in steps of 0.25. 1 is realtime.",
    meta: { constraints: { min: 0.25, max: 4 }, control: { step: 0.25 }, ui: { label: "Speed" } },
  },
  sampleMs: {
    type: "number",
    required: false,
    description:
      "How much SOURCE time to sample, ms (250-5000). Kept small so the window ends before the output does — that gap is where loopMode shows itself.",
    meta: {
      constraints: { min: 250, max: 5000 },
      control: { step: 250 },
      ui: { label: "Sample (source ms)" },
    },
  },
  loopMode: {
    type: "string",
    required: false,
    description:
      "What fills the output once the re-timed window runs out: loop repeats it, freeze holds the last frame, cut goes black.",
    meta: {
      constraints: { oneOf: [...LOOP_MODES] },
      ui: { label: "Loop mode" },
    },
  },
});

export const PlaySpeedV1 = defineMosaicTemplate<PlaySpeedProps>({
  id: asTemplateId(ID),
  label: "37 · Play Speed",
  version: 1,
  description:
    "playback.playSpeed: source time vs output time. A SMALL source window (1s by default) is re-timed by the speed knob, so it ends before the output does — and loopMode (loop / freeze / cut) visibly fills the rest. The caption does the arithmetic for the current knobs.",
  capabilities: { tier: "core" },
  tags: ["media", "playback", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 4000,
    note: "4s of output on purpose: a 1s sample at 1x loops four times, so loopMode is obvious.",
  },

  propsSchema,
  defaultProps: { video: "", speed: 1, sampleMs: 1000, loopMode: "loop" },

  async render(
    props: PlaySpeedProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const raw = (props.video ?? "").trim();
    const speed = props.speed ?? 1;
    const sampleMs = props.sampleMs ?? 1000;
    const loopMode = props.loopMode ?? "loop";
    const { width, height } = ctx.target;

    if (!Number.isFinite(speed) || speed < 0.25 || speed > 4 || Math.round(speed * 4) !== speed * 4) {
      throw new Error(`${ID}: speed must be 0.25-4 in steps of 0.25, got ${JSON.stringify(speed)}.`);
    }
    if (!Number.isInteger(sampleMs) || sampleMs < 250 || sampleMs > 5000) {
      throw new Error(
        `${ID}: sampleMs must be an integer 250-5000, got ${JSON.stringify(sampleMs)}.`,
      );
    }
    if (!(LOOP_MODES as readonly string[]).includes(loopMode)) {
      throw new Error(`${ID}: loopMode must be one of ${LOOP_MODES.join(" | ")}.`);
    }
    if (raw.length === 0) {
      return {
        kind: "mosaic_document",
        version: 1,
        m0: toM0String("1", ID),
        assets: {},
        backgroundColor: "#0b0e11" as MosaicColor,
        sources: [
          svgLabel("Pick a video (Video) - a 1s sample, re-timed, on repeat", width, height, {
            maxPx: Math.round(height * 0.04),
            maxLines: 2,
            color: "#7f8c9b" as MosaicColor,
          }),
        ],
      };
    }
    const meta = ctx.media[asAssetId(raw)];
    if (!meta || meta.kind !== "video") {
      throw new Error(`${ID}: "${raw}" must be a probed video.`);
    }
    const srcMs = (meta as { durationMs?: number }).durationMs;
    // The window can't outrun the source it samples.
    const windowMs =
      typeof srcMs === "number" ? Math.min(sampleMs, Math.max(250, srcMs)) : sampleMs;

    const key = String(slugifyAssetKeyFromPath(raw));
    const assets = {
      [key]: { kind: "file", path: raw, mediaType: "video" },
    } as unknown as MosaicAssetManifest;

    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: ["1", "1"] })),
      ID,
    );
    // The whole lesson in one line of arithmetic: a SOURCE-time window,
    // divided by the rate, becomes OUTPUT time — and whatever output time
    // is left over belongs to loopMode.
    const playedMs = Math.round(windowMs / speed);
    const targetMs = ctx.target.durationMs;
    const fills =
      playedMs > 0 ? (targetMs / playedMs).toFixed(1) : "?";
    const tail =
      loopMode === "loop"
        ? `repeats ~${fills}x to fill ${targetMs}ms`
        : loopMode === "freeze"
          ? `then FREEZES its last frame for the remaining ${Math.max(0, targetMs - playedMs)}ms`
          : `then CUTS to nothing for the remaining ${Math.max(0, targetMs - playedMs)}ms`;
    const caption =
      `${windowMs}ms of source / playSpeed ${speed} = ${playedMs}ms of output - ` +
      `loopMode "${loopMode}" ${tail}`;

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets,
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        {
          type: "media",
          mediaType: "video",
          assetId: key,
          placement: { fit: "contain" },
          // clipDurationMs is SOURCE time; playSpeed re-times it into
          // output time; loopMode owns whatever output time is left.
          playback: {
            clipStartMs: 0,
            clipDurationMs: windowMs,
            playSpeed: speed,
            loopMode,
          },
        } as never,
        svgLabel(caption, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.024),
          maxLines: 2,
          color: "#7f8c9b" as MosaicColor,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Play Speed",
    lines: [
      "playSpeed re-times the source: at 2, one second of output spends two seconds of source. Two different clocks.",
      "Clip windows are SOURCE time, so a window fills clipDurationMs / playSpeed of OUTPUT time.",
      "This one samples a small window on purpose so it runs out early - that leftover is where loopMode lives.",
      "loop repeats the window, freeze holds its last frame, cut goes black.",
    ],
    explore: [
      "Flip Loop mode: repeat, hold, or black",
      "Step Speed 0.25 to 4 and watch the loop count change",
      "Raise Sample past the render duration - the seam disappears",
      "Select the tile: PLAYBACK carries all three",
    ],
  }),
});

export default PlaySpeedV1;
