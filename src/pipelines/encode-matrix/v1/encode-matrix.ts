import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicOutputEncode,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  bindProp,
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/pipelines/encode-matrix/v1` — one render, many
 * deliverables, WITHOUT a pipeline.
 *
 * ONE CONCEPT: `encodes` is a separate axis from geometry. The document
 * renders ONCE into a workspace master, and each `encodes` entry is a
 * post-render transcode pass off that master:
 *
 *   1 render → 1 master + N encodes
 *
 * That is the cheap way to ship the same picture as h264/mp4, VP9/webm and a
 * small mobile variant. Compare pipelines/fan-out, which re-renders each
 * variant because its LAYOUT changes.
 *
 * What an encode CAN change: codec, container, pixel format, encoder tuning,
 * audio, colour tagging, container metadata — and `size`, but only as an
 * ffmpeg `scale` pass, which STRETCHES. There is no re-layout and no
 * aspect-aware padding, so a 16:9 master scaled into a 1:1 encode is squashed,
 * not recomposed. When the shape changes, you want fan-out.
 *
 * What an encode CANNOT change: `fps`, `durationMs`, the `target` preset, or
 * the `emit` mode. Those belong to the master render.
 *
 * On a pipeline the same field applies per emitted file, so `emit:"multi"`
 * with 3 steps and 2 encodes writes 3 × 2 files.
 */

export type EncodeMatrixProps = {
  /** Add a VP9/WebM variant. */
  web?: boolean;
  /** Add a half-size h264 variant (a scale pass — it stretches). */
  mobile?: boolean;
  /** Title on the card. */
  title?: string;
};

const ID = "@m0saic-starter/pipelines/encode-matrix/v1";
const PANEL = "#17202a" as MosaicColor;
const BRAND = "#EF7525" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

/** Nearest even pixel count, never below 2 — what yuv420p requires. */
function even(n: number): number {
  return Math.max(2, Math.round(n / 2) * 2);
}

const propsSchema = definePropsSchema<EncodeMatrixProps>({
  web: {
    type: "boolean",
    required: false,
    description: "Add a VP9-in-WebM encode. Same master, different codec — no second render.",
    meta: { ui: { label: "WebM (VP9)" } },
  },
  mobile: {
    type: "boolean",
    required: false,
    description: "Add a half-size h264 encode. size on an encode is an ffmpeg scale pass: it STRETCHES, it does not re-lay out.",
    meta: { ui: { label: "Mobile (half size)" } },
  },
  title: {
    type: "string",
    required: false,
    description: "Title on the card, so every deliverable is visibly the same render.",
    meta: { control: { placeholder: "One render" }, ui: { label: "Title" } },
  },
});

export const EncodeMatrixV1 = defineMosaicTemplate<EncodeMatrixProps>({
  id: asTemplateId(ID),
  label: "58 · Encode Matrix",
  version: 1,
  description:
    "One render, many deliverables, no pipeline: `encodes` declares post-render transcode passes off a single workspace master. Codec, container and even size (as a stretching scale pass) — but never fps, duration or layout.",
  capabilities: { tier: "core" },
  tags: ["pipelines", "encodes", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 1000,
    format: { kind: "video", container: "mp4" },
    note: "Render it and count the files: one master plus one per encode entry.",
  },

  propsSchema,
  defaultProps: { web: true, mobile: true, title: "One render" },

  async render(
    props: EncodeMatrixProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const web = props.web ?? true;
    const mobile = props.mobile ?? true;
    const title = (props.title ?? "One render").trim();

    if (title.length < 1 || title.length > 24) {
      throw new Error(`${ID}: title must be 1-24 characters, got ${JSON.stringify(title)}.`);
    }

    const { width, height } = ctx.target;

    const encodes: Record<string, MosaicOutputEncode> = {};
    if (web) {
      // Codec + container only: the cheapest kind of variant.
      encodes.web = {
        format: { kind: "video", container: "webm", videoCodec: "libvpx-vp9" },
      };
    }
    if (mobile) {
      // `size` here is a scale pass on the master's pixels — same aspect on
      // purpose, because anything else would stretch. Rounded to EVEN: h264
      // in yuv420p subsamples chroma 2x2, so an odd dimension fails the
      // encode outright (a 480x270 master halves to 240x135 and dies).
      encodes.mobile = {
        size: { width: even(width / 2), height: even(height / 2) },
        format: { kind: "video", container: "mp4", videoCodec: "libx264" },
      };
    }

    const names = Object.keys(encodes);
    const caption =
      names.length > 0
        ? `master + ${names.length} encode(s): ${names.join(", ")} - one render, ${names.length + 1} files`
        : "no encodes declared - just the master render";

    const m0 = toM0String(
      String(weightedSplit([4, 1], "row", { claimants: ["1{1}", "1"] })),
      ID,
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: PANEL,
      // The whole lesson: a map of transcode passes, beside the geometry.
      ...(names.length > 0 ? { encodes } : {}),
      sources: [
        makeColorTile(BRAND),
        bindProp(svgLabel(title, width, Math.round((height * 4) / 5), {
          maxPx: Math.round(height * 0.14),
          maxLines: 1,
          color: PANEL,
        }), "title"),
        svgLabel(caption, width, Math.round(height / 5), {
          maxPx: Math.round(height * 0.03),
          maxLines: 2,
          color: INK_DIM,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Encode Matrix",
    lines: [
      "encodes is a separate axis from geometry: the document renders ONCE into a master, and each entry is a transcode pass off it.",
      "It can change codec, container, pixel format, audio and colour - and size, but only as a scale pass, which STRETCHES.",
      "It cannot change fps, durationMs, target or emit. Those belong to the master render.",
      "So: encodes when the picture is the same and the file differs; fan-out when the LAYOUT differs.",
    ],
    explore: [
      "Toggle the two encodes and re-render - count the files",
      "Compare with pipelines/fan-out: re-encode versus re-layout",
      "Select the tile: encodes never touch the geometry",
    ],
  }),
});

export default EncodeMatrixV1;
