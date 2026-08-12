import type {
  MosaicAssetManifest,
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
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
 * `@m0saic-starter/media/folder-contact-strip/v1` — a folder of images,
 * one prop.
 *
 * ONE CONCEPT: `type: "media[]"` + `picker: "folder"`. The control lets
 * the user pick a FOLDER; the prop arrives as an ARRAY of raw paths (the
 * host enumerates and probes each file). The template maps the array:
 * every path gets its own probe check, its own slugified asset key, its
 * own manifest entry, its own media source — and the layout resplits to
 * the count. A contact strip is the smallest honest shape for "N images
 * arrived".
 */

export type FolderContactStripProps = {
  /** Images from a folder (the host enumerates; value = raw paths). */
  images?: string[];
};

const ID = "@m0saic-starter/media/folder-contact-strip/v1";
const MAX_TILES = 8;

const propsSchema = definePropsSchema<FolderContactStripProps>({
  images: {
    type: "media[]",
    required: false,
    description:
      "Images from a folder. The folder picker fills the array with raw paths; the first 8 render.",
    meta: { control: { picker: "folder", accept: ["image"] }, ui: { label: "Images" } },
  },
});

export const FolderContactStripV1 = defineMosaicTemplate<FolderContactStripProps>({
  id: asTemplateId(ID),
  label: "20 · Folder Contact Strip",
  version: 1,
  description:
    "type:\"media[]\" + the folder picker: the prop arrives as an array of raw paths, each probed by the host — the template maps them to per-file asset entries and media sources, and the strip resplits to the count (first 8).",
  capabilities: { tier: "core" },
  tags: ["media", "folder", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Pick a folder of images — the strip resplits to however many arrive (first 8).",
  },

  propsSchema,
  defaultProps: { images: [] },

  async render(
    props: FolderContactStripProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const images = props.images ?? [];
    const { width, height } = ctx.target;

    if (!Array.isArray(images)) {
      throw new Error(`${ID}: images must be an array of paths, got ${JSON.stringify(images)}.`);
    }

    const picked = images.map((p) => String(p).trim()).filter((p) => p.length > 0);
    if (picked.length === 0) {
      return {
        kind: "mosaic_document",
        version: 1,
        m0: toM0String("1", ID),
        assets: {},
        backgroundColor: "#0b0e11" as MosaicColor,
        sources: [
          svgLabel("Pick a folder of images in the sidebar (Images)", width, height, {
            maxPx: Math.round(height * 0.04),
            maxLines: 2,
            color: "#7f8c9b" as MosaicColor,
          }),
        ],
      };
    }

    const shown = picked.slice(0, MAX_TILES);
    const assets = {} as Record<string, unknown>;
    const tiles: MosaicSource[] = shown.map((raw) => {
      const meta = ctx.media[asAssetId(raw)];
      if (!meta || meta.kind !== "image" || !(meta.width > 0)) {
        throw new Error(
          `${ID}: "${raw}" has no image probe in ctx.media - every array entry is probed by the host; check the folder's contents.`,
        );
      }
      const key = String(slugifyAssetKeyFromPath(raw));
      assets[key] = { kind: "file", path: raw, mediaType: "image" };
      return {
        type: "media",
        mediaType: "image",
        assetId: key,
        placement: { fit: "cover" },
      } as never;
    });

    // Grammar: 1-count splits are illegal — one image IS the band.
    const strip =
      shown.length === 1
        ? "1"
        : `${shown.length}(${new Array<string>(shown.length).fill("1").join(",")})`;
    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: [strip, "1"] })),
      ID,
    );
    const caption =
      `media[] delivered ${picked.length} path(s)` +
      (picked.length > MAX_TILES ? ` - showing the first ${MAX_TILES}` : "") +
      ` - one asset entry + one source each`;

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: assets as unknown as MosaicAssetManifest,
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        ...tiles,
        svgLabel(caption, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.026),
          maxLines: 1,
          color: "#7f8c9b" as MosaicColor,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Folder Contact Strip",
    lines: [
      "picker:\"folder\" hands the prop an ARRAY of raw paths, each already enumerated and probed by the host.",
      "The template just maps it: probe check, asset key, manifest entry, media source - per path.",
      "The strip's split count IS the array length, and a path with no probe fails fast by name.",
    ],
    explore: [
      "Pick a folder with a few images - the strip resplits",
      "Select any tile: each one carries its OWN assetId",
      "The caption prints how many paths media[] delivered",
    ],
  }),
});

export default FolderContactStripV1;
