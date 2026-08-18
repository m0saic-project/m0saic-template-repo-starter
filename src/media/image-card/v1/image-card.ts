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
 * `@m0saic-starter/media/image-card/v1` — one image, the whole media
 * pipeline.
 *
 * ONE CONCEPT: how a media prop becomes pixels. The prop value is a RAW
 * PATH STRING (the `picker: "file"` control fills it). The template does
 * NO I/O — the HOST probes the file and hands the metadata to render()
 * as `ctx.media[rawPath]`. The template then:
 *
 *   1. checks the probe (exists? is an image?),
 *   2. mints an asset key (`slugifyAssetKeyFromPath`),
 *   3. writes the manifest entry `{ kind: "file", path, mediaType }`,
 *   4. emits a `type: "media"` source pointing at that assetId.
 *
 * The `fit` prop shows the one placement decision every image needs:
 * "contain" letterboxes (whole image visible), "cover" fills (crops).
 * With no image picked, the card renders a friendly prompt — never a
 * dead preview.
 */

export type ImageCardProps = {
  /** The image file (picked in the sidebar; value = raw path). */
  image?: string;
  /** How the image meets its cell: contain (letterbox) or cover (crop). */
  fit?: "contain" | "cover";
};

const ID = "@m0saic-starter/media/image-card/v1";

const propsSchema = definePropsSchema<ImageCardProps>({
  image: {
    type: "media",
    required: false,
    description: "The image to frame. The value is a raw path; the host probes it.",
    meta: { control: { picker: "file", accept: ["image"] }, ui: { label: "Image" } },
  },
  fit: {
    type: "string",
    required: false,
    description: "contain letterboxes (whole image visible); cover fills the cell (crops).",
    meta: { constraints: { oneOf: ["contain", "cover"] }, ui: { label: "Fit" } },
  },
});

export const ImageCardV1 = defineMosaicTemplate<ImageCardProps>({
  id: asTemplateId(ID),
  label: "28 · Image Card",
  version: 1,
  description:
    "One image through the whole media pipeline: raw path prop, host-side probe via ctx.media, slugified asset key, {kind:\"file\"} manifest entry, and a media source — with the contain-vs-cover fit decision on a knob.",
  capabilities: { tier: "core" },
  tags: ["media", "image", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Pick an image, then flip Fit between contain and cover.",
  },

  propsSchema,
  defaultProps: { image: "", fit: "contain" },

  async render(
    props: ImageCardProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const raw = (props.image ?? "").trim();
    const fit = props.fit ?? "contain";
    if (fit !== "contain" && fit !== "cover") {
      throw new Error(`${ID}: fit must be "contain" or "cover", got ${JSON.stringify(fit)}.`);
    }
    const { width, height } = ctx.target;

    // No image yet → a prompt card, not a dead preview.
    if (raw.length === 0) {
      return {
        kind: "mosaic_document",
        version: 1,
        m0: toM0String("1", ID),
        assets: {},
        backgroundColor: "#0b0e11" as MosaicColor,
        sources: [
          svgLabel("Pick an image in the sidebar (Image) to frame it here", width, height, {
            maxPx: Math.round(height * 0.04),
            maxLines: 2,
            color: "#7f8c9b" as MosaicColor,
          }),
        ],
      };
    }

    // The HOST probed the file; the template only reads the registry.
    const meta = ctx.media[asAssetId(raw)];
    if (!meta || !(meta.width > 0) || !(meta.height > 0)) {
      throw new Error(
        `${ID}: no probed dimensions for "${raw}" - the host's ctx.media registry has no entry. Check the path.`,
      );
    }
    if (meta.kind !== "image") {
      throw new Error(`${ID}: "${raw}" probed as ${meta.kind ?? "unknown"} - pick an image file.`);
    }

    const key = String(slugifyAssetKeyFromPath(raw));
    const assets = {
      [key]: { kind: "file", path: raw, mediaType: "image" },
    } as unknown as MosaicAssetManifest;

    // Image cell over a caption band.
    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: ["1", "1"] })),
      ID,
    );
    const caption = `probed ${meta.width}x${meta.height} - fit "${fit}" ` +
      (fit === "contain" ? "(letterboxes, whole image visible)" : "(fills the cell, crops)");

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
          placement: { fit },
        } as never,
        svgLabel(caption, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.026),
          maxLines: 1,
          color: "#7f8c9b" as MosaicColor,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Image Card",
    lines: [
      "A media prop's value is a RAW PATH STRING. The template does no I/O - the host probes the file and hands you ctx.media[rawPath].",
      "From there it's four moves: check the probe, mint an asset key, write the manifest entry, emit the media source.",
      "fit is the one placement decision every image needs: contain letterboxes, cover crops.",
      "No image picked renders a PROMPT card, never a dead preview.",
    ],
    explore: [
      "Pick an image with the Image file picker",
      "Flip Fit between contain and cover on a non-16:9 photo",
      "Select the tile: MEDIA shows the assetId the manifest carries",
    ],
  }),
});

export default ImageCardV1;
