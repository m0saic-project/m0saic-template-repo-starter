import type {
  MosaicAssetManifest,
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asAssetId, asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  bindProp,
  defineMosaicTemplate,
  definePropsSchema,
  slugifyAssetKeyFromPath,
} from "@m0saic/template-utils";

import { formatFor, hasMedia } from "../../../_shared/output-kind";
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
 *
 * Two satellites this lesson declares nothing for, but you should know
 * exist on `picker: "time-range"` props: `targetDurationMsFromProp` names a
 * sibling prop holding the intended render duration, and the picker then
 * overlays a target band so the user can aim their selection at the render
 * envelope; `markersProvider` (today: `kind: "subtitles"`, resolved from a
 * sibling video prop) draws semantic tick marks above the scrubber. Both
 * need richer fixtures than this lesson ships — declare them when your
 * template has a duration prop or subtitle-bearing sources.
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
    meta: { control: { picker: "file", accept: ["video"] }, },
  },
  clipStartMs: {
    type: "number",
    required: false,
    meta: {
      control: { picker: "time-range", videoFromProp: "video" },
    },
  },
  clipEndMs: {
    type: "number",
    required: false,
    meta: {
      control: { picker: "time-range", videoFromProp: "video" },
    },
  },
});

export const TimeRangeClipV1 = defineMosaicTemplate<TimeRangeClipProps>({
  id: asTemplateId(ID),
  capabilities: { tier: "core" },

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Pick a video, then drag the scrubber's two handles — the render plays only that window.",
  },

  // ⭐ This template's kind depends on its INPUT: a clip makes a video; the empty slot draws a still placeholder.
  // A fixed declaration would be wrong for half its inputs, and the host would
  // have to guess (see _shared/output-kind.ts). Pure and prop-only.
  resolveOutputHints(props: TimeRangeClipProps) {
    return formatFor(hasMedia(props.video));
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
          // Bound while EMPTY — "bind even when the value is empty": this rect is
          // the ADD handle, so dropping a file on the canvas fills the slot.
          bindProp(
            svgLabel("Pick a video (Video), then set the window with the scrubber", width, height, {
              maxPx: Math.round(height * 0.04),
              maxLines: 2,
              color: "#7f8c9b" as MosaicColor,
            }),
            "video",
          ),
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
      "Two number props whose names end in StartMs and EndMs, both with picker:\"time-range\", render as ONE scrubber with two handles.",
      "On the wire they stay two flat numbers - the editor pairs them by that name suffix.",
      "The window lands on the source as clipStartMs + clipDurationMs: start plus LENGTH, not start plus end.",
      "Need several windows? That is one json prop with picker:\"time-ranges\" - see media/time-ranges-medley.",
    ],
    explore: [
      "Pick a video and drag both handles",
      "Drag the end past the source's duration and read the remedy",
      "Select the tile: PLAYBACK carries clipStartMs/clipDurationMs",
    ],
  }),
});

export default TimeRangeClipV1;
