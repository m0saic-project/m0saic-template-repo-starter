import type { MosaicColor, MosaicDocument, MosaicEngineContext } from "@m0saic/types";
import {
  BRAND_ORANGE,
  HEADER_M_GLYPH,
  brandGlyphTile,
  fitSvgLines,
  fitSvgParagraphs,
  fitSvgText,
  makeColorTile,
  placeInsetPieces,
} from "@m0saic/template-utils";

import { svgTextSource } from "./svg-text";

/**
 * The curriculum's standard `renderTutorial` page.
 *
 * Make has no prose surface, so the tutorial IS how a lesson talks to its
 * user: press the "?" pill, read what this template teaches and which knobs
 * to go poke, close it, mutate props. One consistent page for every lesson —
 * m0saic M top-left (dsl-tutorial chrome style), the lesson title, the
 * teaching, a "try" list, and the hand-off line.
 *
 * renderTutorial contract notes (the parts that bite):
 *   - EDITOR-ONLY: hosts call it behind an explicit affordance; it never
 *     runs on the CLI render path.
 *   - It receives the template's own defaultProps and owns its OWN duration
 *     (never derive length from ctx.target.durationMs — geometry from
 *     ctx.target is fine, and is exactly what we do).
 *   - ctx.media is empty — a tutorial may not depend on media.
 *
 * (Every template in this repo uses this standard page, except the
 * `surfaces/render-tutorial` lesson itself — building a bespoke tutorial is
 * that template's whole point.)
 */

export type LessonTutorialSpec = {
  /** The lesson title (usually the template's label). */
  title: string;
  /** Teaching paragraphs — each entry is one line/paragraph, ASCII only. */
  lines: string[];
  /** "Try:" hints — the UI the user should go poke after closing this. */
  explore: string[];
};

const PAGE_DURATION_MS = 12000;

const INK = "#ecf0f1" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;
const PAGE_BG = "#0d1117" as MosaicColor;
const HEADER_BG = "#161b22" as MosaicColor;

/**
 * Build a standard tutorial page renderer. Assign the result directly:
 * `renderTutorial: lessonTutorial({ title, lines, explore })`.
 */
export function lessonTutorial(spec: LessonTutorialSpec) {
  return async function renderTutorial(
    _props: unknown,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const { width, height } = ctx.target;

    const headerH = Math.round(height * 0.13);
    const logoSide = Math.round(headerH * 0.56);
    const logoX = Math.round(width * 0.03);
    const logoY = Math.round((headerH - logoSide) / 2);

    // Every text block is fitted against ITS OWN piece box with generous
    // interior margins (~30% of the piece). Hosts may preview with a wider
    // font than the bundled render font — the safety margin means a ~1.3x
    // glyph width still lands inside the box instead of clipping.
    //
    // The title rect starts a full logo-margin AFTER the glyph cell (and
    // mirrors that inset on the right, staying canvas-centered). Starting
    // flush at the glyph's edge let lattice snapping expand the title rect
    // over the M — paint was fine, but the overlapping rects made tile
    // selection in the viewer ambiguous.
    const titleX = logoX + logoSide + logoX;
    const titleBoxW = width - titleX * 2;
    const titleFit = fitSvgText(spec.title, titleBoxW, headerH, {
      maxPx: Math.round(headerH * 0.42),
      maxLines: 1,
      widthFrac: 0.6,
    });

    const bodyBox = {
      x: Math.round(width * 0.08),
      y: Math.round(height * 0.18),
      w: Math.round(width * 0.84),
      h: Math.round(height * 0.42),
    };
    // Paragraphs WRAP at the fitted size (readable), never one-line-shrink.
    // heightFrac 0.6: the measured block uses at most 60% of the body box,
    // so a host preview font that wraps/stacks ~1.5x taller still stays
    // clear of the Try list below.
    const bodyFit = fitSvgParagraphs(spec.lines, bodyBox.w, bodyBox.h, {
      maxPx: Math.round(height * 0.038),
      widthFrac: 0.7,
      heightFrac: 0.6,
    });

    const tryBox = {
      x: Math.round(width * 0.08),
      y: Math.round(height * 0.62),
      w: Math.round(width * 0.84),
      h: Math.round(height * 0.24),
    };
    const tryFit = fitSvgLines(
      ["Try:", ...spec.explore.map((hint) => `- ${hint}`)],
      tryBox.w,
      tryBox.h,
      { maxPx: Math.round(height * 0.032), widthFrac: 0.7 },
    );

    const footerFit = fitSvgText(
      "Close this tutorial, then explore the props on the right.",
      width * 0.84,
      height * 0.08,
      { maxPx: Math.round(height * 0.026), maxLines: 1, widthFrac: 0.7 },
    );

    // One placeInsetPieces call owns the whole page: header bar, square logo
    // cell, title, body, try-list, footer. Exact rects, coarse string —
    // the page dogfoods the repo's own layout doctrine.
    const placed = placeInsetPieces({
      rootW: width,
      rootH: height,
      pieces: [
        {
          // Header band: a plain fill; the glyph gets its own square cell.
          rect: { x: 0, y: 0, w: width, h: headerH, importance: 0 },
          source: makeColorTile(HEADER_BG),
        },
        {
          rect: { x: logoX, y: logoY, w: logoSide, h: logoSide, importance: 2 },
          source: brandGlyphTile(HEADER_M_GLYPH, BRAND_ORANGE),
        },
        {
          rect: { x: titleX, y: 0, w: titleBoxW, h: headerH, importance: 1 },
          source: svgTextSource([
            { text: titleFit.text, fontSize: titleFit.fontSize, color: INK },
          ]),
        },
        {
          rect: { x: bodyBox.x, y: bodyBox.y, w: bodyBox.w, h: bodyBox.h, importance: 1 },
          source: svgTextSource([
            { text: bodyFit.text, fontSize: bodyFit.fontSize, color: INK, vAlign: "top" },
          ]),
        },
        {
          rect: { x: tryBox.x, y: tryBox.y, w: tryBox.w, h: tryBox.h, importance: 1 },
          source: svgTextSource([
            { text: tryFit.text, fontSize: tryFit.fontSize, color: INK_DIM, vAlign: "top" },
          ]),
        },
        {
          rect: {
            x: Math.round(width * 0.08),
            y: Math.round(height * 0.9),
            w: Math.round(width * 0.84),
            h: Math.round(height * 0.08),
            importance: 1,
          },
          source: svgTextSource([
            { text: footerFit.text, fontSize: footerFit.fontSize, color: INK_DIM },
          ]),
        },
      ],
    });

    return {
      kind: "mosaic_document",
      version: 1,
      m0: placed.m0,
      assets: {},
      backgroundColor: PAGE_BG,
      size: { width, height },
      fps: ctx.target.fps,
      // The tutorial owns its duration — never ctx.target.durationMs.
      durationMs: PAGE_DURATION_MS,
      sources: placed.sources,
    };
  };
}
