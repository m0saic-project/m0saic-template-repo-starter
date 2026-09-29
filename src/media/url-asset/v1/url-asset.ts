import type {
  MosaicAssetManifest,
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  bindProp,
  defineMosaicTemplate,
  definePropsSchema,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/media/url-asset/v1` — remote media, honestly labeled.
 *
 * ONE CONCEPT: the `{ kind: "url" }` asset. A manifest entry can point at
 * a remote file instead of a local path — the HOST fetches it at render
 * time (the template still does no I/O). The trade is reproducibility:
 * a URL render depends on the network, the server, and whatever bytes
 * live there TODAY. The caveats, which this template states on canvas:
 *
 *   - offline hosts FAIL the render (no fetch, no pixels);
 *   - the bytes can change under you — same doc, different output;
 *   - prefer `{ kind: "file" }` for anything you need reproducible;
 *     URLs are for genuinely remote, genuinely current sources.
 *
 * There is no probe for an unfetched URL, so the template declares the
 * media's kind itself and cannot print probed dimensions — one more cost
 * of going remote, stated on the caption.
 */

export type UrlAssetProps = {
  /** Remote image URL (https). Empty renders the explainer card. */
  url?: string;
};

const ID = "@m0saic-starter/media/url-asset/v1";

const propsSchema = definePropsSchema<UrlAssetProps>({
  url: {
    type: "string",
    required: false,
    meta: {
      control: { flavor: "url", },
    },
  },
});

export const UrlAssetV1 = defineMosaicTemplate<UrlAssetProps>({
  id: asTemplateId(ID),
  capabilities: { tier: "core" },

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Renders offline as the explainer card; paste an https image URL to fetch one at render time.",
  },

  propsSchema,
  defaultProps: { url: "" },

  async render(
    props: UrlAssetProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const url = (props.url ?? "").trim();
    const { width, height } = ctx.target;

    if (url.length === 0) {
      const lines =
        "The {kind:\"url\"} asset points the manifest at REMOTE media - the host fetches it at render time.\n" +
        "Costs: offline hosts fail the render; the bytes can change under you; there is no probe before the fetch.\n" +
        "Prefer {kind:\"file\"} for anything you need reproducible. Paste an https image URL above to try it.";
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
            svgLabel(lines, width, height, {
              maxPx: Math.round(height * 0.034),
              maxLines: 6,
              color: "#c8d2dc" as MosaicColor,
            }),
            "url",
          ),
        ],
      };
    }

    if (!/^https:\/\/[\x21-\x7E]+$/.test(url)) {
      throw new Error(`${ID}: url must be an https URL, got ${JSON.stringify(url)}.`);
    }

    // No probe exists for an unfetched URL — the template declares the
    // media kind itself. That asymmetry is part of the lesson.
    const key = "remote_image";
    const assets = {
      [key]: { kind: "url", url },
    } as unknown as MosaicAssetManifest;

    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: ["1", "1"] })),
      ID,
    );
    const caption =
      `{kind:"url"} - fetched by the HOST at render time - no probe, offline fails, bytes may drift - ${url}`;

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets,
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        // `url` is a plain string prop the host fetches — the rect that SHOWS the
        // fetched image is still its handle, so a double-click edits the URL.
        bindProp(
          {
            type: "media",
            mediaType: "image",
            assetId: key,
            placement: { fit: "contain" },
          } as never,
          "url",
        ),
        svgLabel(caption, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.022),
          maxLines: 2,
          color: "#7f8c9b" as MosaicColor,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "URL Asset",
    lines: [
      "A manifest entry can be {kind:\"url\"} instead of {kind:\"file\"} - the host fetches the bytes; the template still does no I/O.",
      "The trade is reproducibility: offline hosts fail, the bytes can change, and there is no probe before the fetch.",
      "Prefer files for anything you need byte-stable. Reach for URLs only when the source is genuinely remote.",
    ],
    explore: [
      "Paste an https image URL and render - the host fetches it",
      "Go offline and render again - read the failure, that's the cost",
      "Compare with image-card: same shape, opposite promise",
    ],
  }),
});

export default UrlAssetV1;
