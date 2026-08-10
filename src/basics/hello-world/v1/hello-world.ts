import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String } from "@m0saic/dsl-stdlib";
import {
  BRAND_ORANGE,
  HEADER_M_GLYPH,
  brandGlyphTile,
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  placeInsetPieces,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/basics/hello-world/v1` — the smallest correct template,
 * wearing the brand.
 *
 * ONE CONCEPT: the anatomy of a m0saic template. Everything else in this
 * repo is a variation on the five parts you see here:
 *
 *   1. A typed props surface (`definePropsSchema`) where every optional prop
 *      has a deterministic default — same inputs, same output, always.
 *   2. An id, minted with `asTemplateId`, that encodes repo/pack/slug/version.
 *   3. `outputHints` — the SUGGESTED canvas. The host may render any size;
 *      hints are what the app preselects, not a promise you can rely on.
 *   4. A `render(props, ctx)` that returns a `MosaicDocument`: an `m0` layout
 *      string plus `sources[]` that fill its tiles in order.
 *   5. The m0 string branded through `toM0String(...)` — it canonicalizes
 *      and VALIDATES, throwing on a malformed string instead of failing
 *      later, mysteriously, at render time.
 *
 * This is the repo's smoke render, so it says hello the way the brand
 * does: the pixel-M (a color tile wearing the baked glyph as an
 * inline-mask — see geometry/mask-in-a-cell for why any source can wear
 * a mask) over the greeting. The M's cell must be SQUARE — mask bounds
 * scale onto their cell per axis, so a stretched cell would smear the
 * glyph — and "square" is a pixel fact the canvas decides. That is why
 * even hello world reads `ctx.target` and places its three rects with one
 * `placeInsetPieces` call: exact pixels, coarse string, the same layout
 * doctrine the whole curriculum runs on.
 *
 * (Trivia the test locks in: the simplest possible m0 is one full-canvas
 * rect, spelled `F` — and `toM0String("F")` canonicalizes it to `"1"`.)
 */

export type HelloWorldProps = {
  /** The greeting under the M. */
  text?: string;
  /** Canvas fill (#rrggbb). */
  backgroundColor?: string;
};

const ID = "@m0saic-starter/basics/hello-world/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const INK = "#ecf0f1" as MosaicColor;

const propsSchema = definePropsSchema<HelloWorldProps>({
  text: {
    type: "string",
    required: false,
    description: "The greeting rendered under the M.",
    meta: { control: { placeholder: "Hello, m0saic" } },
  },
  backgroundColor: {
    type: "string",
    required: false,
    description: "Canvas fill as #rrggbb.",
    // Color props declare themselves: `isColor` + `colorPicker` gives the
    // app a real swatch control instead of a bare text field.
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#0d1117" },
      ui: { label: "Background" },
    },
  },
});

export const HelloWorldV1 = defineMosaicTemplate<HelloWorldProps>({
  id: asTemplateId(ID),
  label: "Hello World",
  version: 1,
  description:
    "The smallest correct template, wearing the brand: the pixel-M in a square cell over a greeting, placed with one placeInsetPieces call. A typed props surface, deterministic defaults, and a validated m0 string. Start here — this is the smoke render.",
  capabilities: { tier: "core" },
  tags: ["basics", "starter", "brand"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Static content — any canvas and any duration render cleanly.",
  },

  propsSchema,
  defaultProps: {
    text: "Hello, m0saic",
    backgroundColor: "#0d1117",
  },

  async render(
    props: HelloWorldProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    // Fail fast on bad input rather than rendering something misleading.
    // The props schema above is DOCUMENTATION — hosts can (and the CLI does)
    // call render() directly with a raw props bag, so render() is the gate.
    if (
      props.backgroundColor !== undefined &&
      !HEX.test(props.backgroundColor)
    ) {
      throw new Error(
        `${ID}: backgroundColor ` +
          `${JSON.stringify(props.backgroundColor)} must be a #rrggbb hex color.`,
      );
    }

    const text = props.text ?? "Hello, m0saic";
    const fill = (props.backgroundColor ?? "#0d1117") as MosaicColor;
    const { width, height } = ctx.target;

    // The brand square: a pixel size the CANVAS decides (ratios can't
    // promise squareness — that's ctx.target's job).
    const side = Math.round(Math.min(width, height) * 0.32);
    const gx = Math.round((width - side) / 2);
    const gy = Math.round(height * 0.42 - side / 2);

    const label = {
      x: Math.round(width * 0.08),
      y: gy + side + Math.round(height * 0.05),
      w: Math.round(width * 0.84),
      h: Math.round(height * 0.12),
    };

    const placed = placeInsetPieces({
      rootW: width,
      rootH: height,
      pieces: [
        {
          // Backdrop — the old `F`, now the page the brand sits on.
          rect: { x: 0, y: 0, w: width, h: height, importance: 0 },
          source: makeColorTile(fill),
        },
        {
          rect: { x: gx, y: gy, w: side, h: side, importance: 2 },
          source: brandGlyphTile(HEADER_M_GLYPH, BRAND_ORANGE),
        },
        {
          rect: { x: label.x, y: label.y, w: label.w, h: label.h, importance: 1 },
          source: svgLabel(text, label.w, label.h, {
            maxPx: Math.round(height * 0.055),
            maxLines: 1,
            color: INK,
          }),
        },
      ],
    });

    return {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String(placed.m0, ID),
      assets: {},
      backgroundColor: fill,
      sources: placed.sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Hello World",
    lines: [
      "The smallest correct template: an id, a typed props schema with deterministic defaults, outputHints, and a render() returning an m0 string plus the sources that fill its tiles in order.",
      "The m0 goes through toM0String - it canonicalizes and validates, so a bad layout fails at build time, not mid-render. (The simplest m0 is one full-canvas rect: \"F\", which canonicalizes to \"1\".)",
      "The M is the brand saying hello: a color tile wearing the baked glyph as an inline-mask, in a SQUARE cell - mask bounds scale onto their cell per axis, and square is a pixel fact only ctx.target can decide. One placeInsetPieces call places all three rects.",
      "Everything else in this repo is a variation of these parts.",
    ],
    explore: [
      "Edit Text and Background in the props panel",
      "Switch to the Geometry view - a backdrop, a square, a text band",
      "Select the M: rect is the coarse cell, effective is the exact square the inset recovers (Eye menu > Show inset boxes draws it dashed) - and the MASK's 272x272 bounds are the glyph's own design space, scaled onto that square",
      "Read the source: src/basics/hello-world/",
    ],
  }),
});

export default HelloWorldV1;
