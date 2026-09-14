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

import { fitSvgLines, svgTextSource } from "../../../_shared/svg-text";
import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/media/probe-card/v1` — read the probe, don't probe.
 *
 * ONE CONCEPT: `ctx.media` is the HOST's ffprobe registry. Templates do
 * no I/O and spawn no ffprobe — before render() runs, the host probes
 * every media path the props mention and keys the results by the RAW
 * prop string. This card just prints that entry for whatever file you
 * pick (image or video): kind, dimensions, duration for time-based
 * media — the facts every layout decision downstream is built on.
 */

export type ProbeCardProps = {
  /** Any image or video — the card prints its probe. */
  media?: string;
};

const ID = "@m0saic-starter/media/probe-card/v1";

const propsSchema = definePropsSchema<ProbeCardProps>({
  media: {
    type: "media",
    required: false,
    description: "Any image or video file. The card prints the host's probe of it.",
    meta: { control: { picker: "file", accept: ["image", "video"] }, ui: { label: "Media" } },
  },
});

export const ProbeCardV1 = defineMosaicTemplate<ProbeCardProps>({
  id: asTemplateId(ID),
  label: "34 · Probe Card",
  version: 1,
  description:
    "ctx.media is the host's ffprobe registry, keyed by the RAW prop string — templates read it, never probe. Pick any image or video and the card prints its entry: kind, dimensions, duration; the thumb renders beside the facts.",
  capabilities: { tier: "core" },
  tags: ["media", "probe", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Pick a video, then an image — watch the duration line appear and vanish.",
  },

  propsSchema,
  defaultProps: { media: "" },

  async render(
    props: ProbeCardProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const raw = (props.media ?? "").trim();
    const { width, height } = ctx.target;

    if (raw.length === 0) {
      return {
        kind: "mosaic_document",
        version: 1,
        m0: toM0String("1", ID),
        assets: {},
        backgroundColor: "#0b0e11" as MosaicColor,
        sources: [
          svgLabel("Pick any image or video (Media) - this card prints its probe", width, height, {
            maxPx: Math.round(height * 0.04),
            maxLines: 2,
            color: "#7f8c9b" as MosaicColor,
          }),
        ],
      };
    }

    const meta = ctx.media[asAssetId(raw)];
    if (!meta) {
      throw new Error(
        `${ID}: ctx.media has no entry for "${raw}" - the host probes every media path the props mention before render() runs. Check the path.`,
      );
    }

    const isVideo = meta.kind === "video";
    const durationMs = (meta as { durationMs?: number }).durationMs;
    const lines = [
      `path      ${raw}`,
      `kind      ${String(meta.kind ?? "unknown")}`,
      `size      ${meta.width}x${meta.height}px`,
      ...(isVideo && typeof durationMs === "number"
        ? [`duration  ${(durationMs / 1000).toFixed(2)}s`]
        : ["duration  (still - no timeline)"]),
    ];

    const key = String(slugifyAssetKeyFromPath(raw));
    const assets = {
      [key]: { kind: "file", path: raw, mediaType: isVideo ? "video" : "image" },
    } as unknown as MosaicAssetManifest;

    // Facts (left 2/3) beside the thumb (right 1/3).
    const m0 = toM0String(
      String(weightedSplit([2, 1], "col", { claimants: ["1", "1"] })),
      ID,
    );
    const sheet = fitSvgLines(lines, Math.round((width * 2) / 3), height, {
      maxPx: Math.round(height * 0.04),
      widthFrac: 0.7,
    });

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets,
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        svgTextSource([
          { text: sheet.text, fontSize: sheet.fontSize, color: "#c8d2dc" as MosaicColor },
        ]),
        {
          type: "media",
          mediaType: isVideo ? "video" : "image",
          assetId: key,
          placement: { fit: "contain" },
        } as never,
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Probe Card",
    lines: [
      "Templates do no I/O. The host probes every media path in the props first and keys the results by the RAW prop string.",
      "That registry is ctx.media, and every decision downstream - aspect branches, clip windows, fit - is built on it.",
      "A path with no entry fails fast: an empty registry means the host never saw your path.",
    ],
    explore: [
      "Pick a video, then an image - the duration line comes and goes",
      "The thumb beside the facts is an ordinary media source",
      "Feed the same file to image-card - same registry, same facts",
    ],
  }),
});

export default ProbeCardV1;
