import type {
  MosaicAssetManifest,
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
  MosaicSourceMask,
} from "@m0saic/types";
import { asAssetId, asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  bindProps,
  bindProp,
  defineMosaicTemplate,
  definePropsSchema,
  fitSvgText,
  makeColorTile,
  slugifyAssetKeyFromPath,
  textToPath,
} from "@m0saic/template-utils";

import { formatFor, mediaLooksLikeVideo } from "../../../_shared/output-kind";
import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/text/carved-type/v1` — the word is the MASK; the picture
 * plays through it.
 *
 * ONE CONCEPT: `textToPath` turns a string into an SVG path, and a path is
 * exactly what an `inline-mask` wants. So text stops being a kind of source
 * and becomes a SHAPE that any source can wear — a color today, a photo or a
 * video tomorrow, with nothing about the source changing except the mask
 * hanging off it.
 *
 * That is the whole trick, and it is why this pipeline is the most powerful
 * of the three (see text/text-three-ways for the map): drawtext and the svg
 * rasterizer both decide the pixels INSIDE the glyphs. A mask decides only
 * the silhouette, and leaves the pixels to whatever is underneath.
 *
 * Two rules carry over from geometry/mask-in-a-cell, and both bite here:
 *
 *   - The mask's `bounds` scale onto the tile PER AXIS. Author the path
 *     against the tile's own box (this template computes it from ctx.target
 *     and its own split) or the letters stretch.
 *   - `fit: "cover"` on the media, not "contain". Contain letterboxes, and
 *     letterboxed bars inside a glyph are just holes in your word.
 *
 * With no file picked the same mask rides a plain color tile — the lesson
 * works with zero setup, and proves the mask is independent of what wears it.
 */

export type CarvedTypeProps = {
  /** The word to carve (ASCII, 1-10 chars). */
  word?: string;
  /** Image or video to play through the letters. Empty = a flat color. */
  media?: string;
  /** Fill used when no media is picked (#rrggbb). */
  fallbackColor?: string;
};

const ID = "@m0saic-starter/text/carved-type/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const INK_DIM = "#7f8c9b" as MosaicColor;

const propsSchema = definePropsSchema<CarvedTypeProps>({
  word: {
    type: "string",
    required: false,
  },
  media: {
    type: "media",
    required: false,
    meta: {
      control: { picker: "file", accept: ["image", "video"] },
    },
  },
  fallbackColor: {
    type: "string",
    required: false,
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#EF7525" },
    },
  },
});

export const CarvedTypeV1 = defineMosaicTemplate<CarvedTypeProps>({
  id: asTemplateId(ID),
  capabilities: { tier: "core" },

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    // The DEFAULT answer: with an empty Media slot this paints a flat colour
    // through the mask — a still. `resolveOutputHints` below re-answers for the
    // props actually in hand, and `outputHintsResolve` (throw) checks the two
    // agree at `defaultProps`.
    format: { kind: "image", container: "png" },
    note: "Pick a video for Media and press play — the footage moves inside the letters.",
  },

  // ⭐ A template that accepts BOTH kinds must say which one it is FOR THE PROPS
  // IT HAS. A fixed declaration is wrong for half its inputs by construction:
  // this one declared video and, with no media, produced a still — so Make fell
  // back to guessing and the user had to override by hand (founder, 2026-09-26).
  // Pure and prop-only, as the contract requires: no probe, no clock, no I/O —
  // the path's extension is the evidence available at this moment.
  resolveOutputHints(props: CarvedTypeProps) {
    return formatFor(mediaLooksLikeVideo(props.media));
  },

  propsSchema,
  defaultProps: { word: "MOSAIC", media: "", fallbackColor: "#EF7525" },

  async render(
    props: CarvedTypeProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const word = (props.word ?? "MOSAIC").trim();
    const media = (props.media ?? "").trim();
    const fallbackColor = props.fallbackColor ?? "#EF7525";

    const problems: string[] = [];
    if (word.length < 1 || word.length > 10 || !/^[\x20-\x7E]+$/.test(word)) {
      problems.push(`word must be 1-10 ASCII characters, got ${JSON.stringify(word)}`);
    }
    if (!HEX.test(fallbackColor)) {
      problems.push(`fallbackColor ${JSON.stringify(fallbackColor)} must be #rrggbb`);
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;

    // The tile that wears the mask: everything above the caption band. The
    // mask is authored against THIS box, so its bounds and the tile share an
    // aspect and the glyphs keep their shape.
    const tile = { width, height: Math.round((height * 5) / 6) };

    const fit = fitSvgText(word, tile.width, tile.height, {
      maxPx: Math.round(tile.height * 0.62),
      maxLines: 1,
      widthFrac: 0.9,
      heightFrac: 0.8,
    });
    const mask: MosaicSourceMask = {
      kind: "inline-mask",
      localPath: textToPath(word, { fontSize: fit.fontSize }, tile),
      bounds: { x: 0, y: 0, width: tile.width, height: tile.height },
    };

    const assets: Record<string, unknown> = {};
    let carved: MosaicSource;
    let caption: string;

    if (media.length > 0) {
      // The host probed the file; the template only reads the registry.
      const meta = ctx.media[asAssetId(media)];
      if (!meta) {
        throw new Error(
          `${ID}: "${media}" has no ctx.media probe - the host found no such file.`,
        );
      }
      if (meta.kind !== "image" && meta.kind !== "video") {
        throw new Error(
          `${ID}: "${media}" probed as ${meta.kind ?? "unknown"} - pick an image or a video.`,
        );
      }
      const key = String(slugifyAssetKeyFromPath(media));
      assets[key] = { kind: "file", path: media, mediaType: meta.kind };
      // The cell showing the footage is the media prop's handle: drop a new file
      // on it, or open the media chip from its badge.
      carved = bindProp(
        {
          type: "media",
          mediaType: meta.kind,
          assetId: key,
          // COVER, not contain: letterbox bars inside a glyph are holes in
          // the word.
          placement: { fit: "cover" },
          mask,
        } as never,
        "media",
      );
      caption = `${meta.kind} playing through the word - the mask is the only thing that knows about text`;
    } else {
      // ⭐ ONE rect, TWO handles. This tile shows `fallbackColor` AND is the empty
      // media slot — so it carries both bindings via `bindProps`; a second
      // `bindProp` would replace the first. The media entry is what makes the
      // no-media card a DROP TARGET: drag a clip on and the letters fill.
      carved = bindProps(makeColorTile(fallbackColor as MosaicColor, { mask }), [
        { propKey: "fallbackColor" },
        { propKey: "media" },
      ]);
      caption = "no media: the same mask on a plain color tile - pick a file to fill the letters";
    }

    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: ["1", "1"] })),
      ID,
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: assets as unknown as MosaicAssetManifest,
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        carved,
        svgLabel(caption, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.03),
          maxLines: 2,
          color: INK_DIM,
        }),
      ],
    };
  },
  // `bindingsDeclared`: bound on the rect that shows it, or named here.
  bindings: {
    unbound: {
      word: "carved as the MASK's path, not drawn as text — there is no text rect to bind",
    },
  },

  renderTutorial: lessonTutorial({
    title: "Carved Type",
    lines: [
      "textToPath turns a string into a path, and a path is exactly what an inline-mask wants.",
      "So text becomes a SHAPE any source can wear - a color, a photo, a video - with only the mask changing.",
      "That is why it is the most powerful text pipeline: the mask decides the silhouette and leaves the pixels alone.",
      "Use fit \"cover\" - letterbox bars inside a glyph are just holes in your word.",
    ],
    explore: [
      "Pick a video for Media and press play",
      "Clear Media: the same mask rides a color tile",
      "Type a longer word and watch the fitted size shrink",
      "Select the tile: the word lives in its MASK section",
    ],
  }),
});

export default CarvedTypeV1;
