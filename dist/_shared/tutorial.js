"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lessonTutorial = lessonTutorial;
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("./svg-text");
const PAGE_DURATION_MS = 12000;
const INK = "#ecf0f1";
const INK_DIM = "#7f8c9b";
const PAGE_BG = "#0d1117";
const HEADER_BG = "#161b22";
/**
 * Build a standard tutorial page renderer. Assign the result directly:
 * `renderTutorial: lessonTutorial({ title, lines, explore })`.
 */
function lessonTutorial(spec) {
    return async function renderTutorial(_props, ctx) {
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
        const titleFit = (0, template_utils_1.fitSvgText)(spec.title, titleBoxW, headerH, {
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
        const bodyFit = (0, template_utils_1.fitSvgParagraphs)(spec.lines, bodyBox.w, bodyBox.h, {
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
        const tryFit = (0, template_utils_1.fitSvgLines)(["Try:", ...spec.explore.map((hint) => `- ${hint}`)], tryBox.w, tryBox.h, { maxPx: Math.round(height * 0.032), widthFrac: 0.7 });
        const footerFit = (0, template_utils_1.fitSvgText)("Close this tutorial, then explore the props on the right.", width * 0.84, height * 0.08, { maxPx: Math.round(height * 0.026), maxLines: 1, widthFrac: 0.7 });
        // One placeInsetPieces call owns the whole page: header bar, square logo
        // cell, title, body, try-list, footer. Exact rects, coarse string —
        // the page dogfoods the repo's own layout doctrine.
        const placed = (0, template_utils_1.placeInsetPieces)({
            rootW: width,
            rootH: height,
            pieces: [
                {
                    // Header band: a plain fill; the glyph gets its own square cell.
                    rect: { x: 0, y: 0, w: width, h: headerH, importance: 0 },
                    source: (0, template_utils_1.makeColorTile)(HEADER_BG),
                },
                {
                    rect: { x: logoX, y: logoY, w: logoSide, h: logoSide, importance: 2 },
                    source: (0, template_utils_1.brandGlyphTile)(template_utils_1.HEADER_M_GLYPH, template_utils_1.BRAND_ORANGE),
                },
                {
                    rect: { x: titleX, y: 0, w: titleBoxW, h: headerH, importance: 1 },
                    source: (0, svg_text_1.svgTextSource)([
                        { text: titleFit.text, fontSize: titleFit.fontSize, color: INK },
                    ]),
                },
                {
                    rect: { x: bodyBox.x, y: bodyBox.y, w: bodyBox.w, h: bodyBox.h, importance: 1 },
                    source: (0, svg_text_1.svgTextSource)([
                        { text: bodyFit.text, fontSize: bodyFit.fontSize, color: INK, vAlign: "top" },
                    ]),
                },
                {
                    rect: { x: tryBox.x, y: tryBox.y, w: tryBox.w, h: tryBox.h, importance: 1 },
                    source: (0, svg_text_1.svgTextSource)([
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
                    source: (0, svg_text_1.svgTextSource)([
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
