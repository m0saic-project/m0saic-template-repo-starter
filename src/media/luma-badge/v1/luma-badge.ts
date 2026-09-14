import type {
  MosaicAssetManifest,
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asAssetId, asTemplateId } from "@m0saic/types";
import { toM0String } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  slugifyAssetKeyFromPath,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/media/luma-badge/v1` — content-aware, with a fallback.
 *
 * ONE CONCEPT: `ctx.analysis` + GRACEFUL DEGRADATION. The analysis
 * surface lets a template ASK about the pixels ("how bright is the
 * bottom-right corner of this image?") without doing any I/O itself —
 * `regionLuminance` runs host-side (ffmpeg crop + signalstats) and
 * returns an average luma 0-255. The badge picks dark-on-light or
 * light-on-dark from the answer.
 *
 * THE LAW: `ctx.analysis` is OPTIONAL. Design mode (and lite hosts)
 * hand render() no analysis at all — a template that requires it is
 * broken in the editor. Degrade to a stated default and SAY SO on the
 * caption, so the fallback is visible, not silent.
 */

export type LumaBadgeProps = {
  /** The image the badge sits on. */
  image?: string;
  /** Badge text (ASCII, 1-16 chars). */
  badge?: string;
};

const ID = "@m0saic-starter/media/luma-badge/v1";

const propsSchema = definePropsSchema<LumaBadgeProps>({
  image: {
    type: "media",
    required: false,
    description: "The image the corner badge sits on.",
    meta: { control: { picker: "file", accept: ["image"] }, ui: { label: "Image" } },
  },
  badge: {
    type: "string",
    required: false,
    description: "Badge text (ASCII, 1-16 chars).",
    meta: { control: { placeholder: "PREVIEW" }, ui: { label: "Badge" } },
  },
});

export const LumaBadgeV1 = defineMosaicTemplate<LumaBadgeProps>({
  id: asTemplateId(ID),
  label: "37 · Luma Badge",
  version: 1,
  description:
    "Content-aware with a fallback: ctx.analysis.regionLuminance asks the host how bright the badge corner is, and the badge flips dark-on-light / light-on-dark to stay readable. Analysis is OPTIONAL — no-analysis hosts degrade to a stated default, printed on the caption.",
  capabilities: { tier: "core" },
  tags: ["media", "analysis", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "The corner badge picks its contrast from the pixels under it — or says it couldn't.",
  },

  propsSchema,
  defaultProps: { image: "", badge: "PREVIEW" },

  async render(
    props: LumaBadgeProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const raw = (props.image ?? "").trim();
    const badge = props.badge ?? "PREVIEW";
    const { width, height } = ctx.target;

    if (badge.length < 1 || badge.length > 16 || !/^[\x20-\x7E]+$/.test(badge)) {
      throw new Error(`${ID}: badge must be 1-16 ASCII characters.`);
    }
    if (raw.length === 0) {
      return {
        kind: "mosaic_document",
        version: 1,
        m0: toM0String("1", ID),
        assets: {},
        backgroundColor: "#0b0e11" as MosaicColor,
        sources: [
          svgLabel("Pick an image (Image) - the badge reads the pixels under it", width, height, {
            maxPx: Math.round(height * 0.04),
            maxLines: 2,
            color: "#7f8c9b" as MosaicColor,
          }),
        ],
      };
    }
    const meta = ctx.media[asAssetId(raw)];
    if (!meta || meta.kind !== "image") {
      throw new Error(`${ID}: "${raw}" must be a probed image.`);
    }

    // Ask the host about the badge corner (bottom-right 25% x 15%) — and
    // DEGRADE when the surface isn't there. Analysis is optional by
    // contract: design mode hands render() none at all.
    const REGION = { xPct: 0.75, yPct: 0.85, wPct: 0.25, hPct: 0.15 };
    let luma: number | null = null;
    if (ctx.analysis) {
      try {
        const result = await ctx.analysis.regionLuminance(raw, REGION);
        luma = result.overallAvgLuma;
      } catch {
        luma = null; // degraded — stated on the caption below
      }
    }
    const brightCorner = luma !== null && luma >= 128;
    const badgeBg = brightCorner ? "#101418" : "#ecf0f1";
    const badgeInk = brightCorner ? "#ecf0f1" : "#101418";

    const key = String(slugifyAssetKeyFromPath(raw));
    const assets = {
      [key]: { kind: "file", path: raw, mediaType: "image" },
    } as unknown as MosaicAssetManifest;

    // Image full-bleed; overlay: caption row on top, badge in the
    // bottom-right cell of a 4x coarse lattice.
    const m0 = toM0String("1{5[1,-,-,-,4(-,-,-,1{1})]}", ID);

    const caption =
      luma !== null
        ? `regionLuminance(bottom-right) = ${Math.round(luma)} -> ${brightCorner ? "dark badge on bright pixels" : "light badge on dark pixels"}`
        : "analysis unavailable on this host - defaulting to a light badge (stated, not silent)";

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets,
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        {
          type: "media",
          mediaType: "image",
          assetId: key,
          placement: { fit: "cover" },
        } as never,
        svgLabel(caption, width, Math.round(height / 5), {
          maxPx: Math.round(height * 0.024),
          maxLines: 1,
          color: "#c8d2dc" as MosaicColor,
        }),
        makeColorTile(badgeBg as MosaicColor),
        svgLabel(badge, Math.round(width / 4), Math.round(height / 5), {
          maxPx: Math.round(height * 0.045),
          maxLines: 1,
          color: badgeInk as MosaicColor,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Luma Badge",
    lines: [
      "ctx.analysis asks about the PIXELS without doing I/O: regionLuminance returns an average luma for a fractional rect.",
      "THE LAW: analysis is OPTIONAL. Design mode hands render() none, so degrade to a stated default and SAY SO.",
      "A silent fallback is a lie - the caption prints the measured luma or the degradation notice.",
    ],
    explore: [
      "Pick a bright photo, then a dark one - the badge flips",
      "The caption prints the measured corner luma",
    ],
  }),
});

export default LumaBadgeV1;
