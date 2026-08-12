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
 * `@m0saic-starter/media/time-range-clip/v1` — a scrubbed window into a
 * video.
 *
 * ONE CONCEPT: the time-range picker pair. Declare TWO number props whose
 * names share a prefix and end in `StartMs` / `EndMs` (here `clipStartMs`
 * and `clipEndMs`), put `picker: "time-range"` on BOTH,
 * and point `control.videoFromProp` at the sibling media prop — the
 * editor matches the pair by name suffix and renders ONE video scrubber
 * with start/end handles. On the wire they stay two flat numbers.
 *
 * The window lands on the source as `playback.clipStartMs` +
 * `clipDurationMs` (start + LENGTH, not start + end), with
 * `loopMode: "loop"` filling whatever output time remains.
 */

export type TimeRangeClipProps = {
  /** The video to window. */
  video?: string;
  /** Window start, ms into the source. */
  clipStartMs?: number;
  /** Window end, ms into the source. */
  clipEndMs?: number;
};

const ID = "@m0saic-starter/media/time-range-clip/v1";

const propsSchema = definePropsSchema<TimeRangeClipProps>({
  video: {
    type: "media",
    required: false,
    description: "The video to window.",
    meta: { control: { picker: "file", accept: ["video"] }, ui: { label: "Video" } },
  },
  clipStartMs: {
    type: "number",
    required: false,
    description: "Window start (ms into the source). Half of the time-range pair.",
    meta: {
      control: { picker: "time-range", videoFromProp: "video" },
      ui: { label: "Clip start" },
    },
  },
  clipEndMs: {
    type: "number",
    required: false,
    description: "Window end (ms into the source). The other half of the pair.",
    meta: {
      control: { picker: "time-range", videoFromProp: "video" },
      ui: { label: "Clip end" },
    },
  },
});

export const TimeRangeClipV1 = defineMosaicTemplate<TimeRangeClipProps>({
  id: asTemplateId(ID),
  label: "Time-Range Clip",
  version: 1,
  description:
    "The time-range picker pair: two number props ending in StartMs/EndMs (here clipStartMs and clipEndMs) with picker:\"time-range\" + videoFromProp render ONE scrubber with two handles — and the window lands on the source as playback.clipStartMs + clipDurationMs (start + LENGTH).",
  capabilities: { tier: "core" },
  tags: ["media", "playback", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Pick a video, then drag the scrubber's two handles — the render plays only that window.",
  },

  propsSchema,
  defaultProps: { video: "", clipStartMs: 0, clipEndMs: 1000 },

  async render(
    props: TimeRangeClipProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const raw = (props.video ?? "").trim();
    const start = props.clipStartMs ?? 0;
    const end = props.clipEndMs ?? 1000;
    const { width, height } = ctx.target;

    if (raw.length === 0) {
      return {
        kind: "mosaic_document",
        version: 1,
        m0: toM0String("1", ID),
        assets: {},
        backgroundColor: "#0b0e11" as MosaicColor,
        sources: [
          svgLabel("Pick a video (Video), then set the window with the scrubber", width, height, {
            maxPx: Math.round(height * 0.04),
            maxLines: 2,
            color: "#7f8c9b" as MosaicColor,
          }),
        ],
      };
    }

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start) {
      throw new Error(
        `${ID}: the window must be integer ms with 0 <= start < end, got start ${JSON.stringify(start)} end ${JSON.stringify(end)}.`,
      );
    }
    const meta = ctx.media[asAssetId(raw)];
    if (!meta || meta.kind !== "video") {
      throw new Error(`${ID}: "${raw}" must be a probed video (ctx.media entry missing or not video).`);
    }
    const sourceDurationMs = (meta as { durationMs?: number }).durationMs;
    if (typeof sourceDurationMs === "number" && end > sourceDurationMs) {
      throw new Error(
        `${ID}: window end ${end}ms is past the source's ${sourceDurationMs}ms - drag the right handle back.`,
      );
    }

    const key = String(slugifyAssetKeyFromPath(raw));
    const assets = {
      [key]: { kind: "file", path: raw, mediaType: "video" },
    } as unknown as MosaicAssetManifest;

    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: ["1", "1"] })),
      ID,
    );
    const caption =
      `window ${start}ms -> ${end}ms (${end - start}ms of ` +
      `${typeof sourceDurationMs === "number" ? `${sourceDurationMs}ms` : "?"} source) - ` +
      `playback: clipStartMs ${start}, clipDurationMs ${end - start}, loop fills the rest`;

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
          // Start + LENGTH, not start + end — the one conversion this
          // template exists to teach.
          playback: {
            clipStartMs: start,
            clipDurationMs: end - start,
            loopMode: "loop",
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
    title: "Time-Range Clip",
    lines: [
      "Declare TWO number props whose names share a prefix and end in StartMs and EndMs - this template's clipStartMs and clipEndMs - put picker:\"time-range\" on BOTH, and point control.videoFromProp at the sibling video prop. The editor matches the pair by that name suffix and renders ONE scrubber with two handles - on the wire they stay two flat numbers.",
      "The window lands on the source as playback.clipStartMs + clipDurationMs - start plus LENGTH, not start plus end. That conversion (end - start) is the template's one line of real work.",
      "render() gates the window: start < end, and the end can't pass the probed source duration.",
      "Need SEVERAL windows? That's the sibling control: ONE json prop with picker:\"time-ranges\" carrying the whole array - see media/time-ranges-medley.",
    ],
    explore: [
      "Pick a video and drag both scrubber handles - the caption re-bakes the receipt",
      "Drag the end past the source's duration and read the remedy",
      "Select the video tile: PLAYBACK carries clipStartMs/clipDurationMs",
    ],
  }),
});

export default TimeRangeClipV1;
