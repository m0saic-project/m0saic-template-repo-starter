import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
  MosaicTextSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String } from "@m0saic/dsl-stdlib";
import {
  animateNumbersInText,
  defineMosaicTemplate,
  definePropsSchema,
  fitSvgText,
  makeColorTile,
  solidBackground,
  svgTextSource,
  textToPath,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/text/text-three-ways/v1` — the same word, three text
 * pipelines. All valid; different promises.
 *
 * ONE CONCEPT: m0saic has THREE ways to put glyphs on screen, and choosing
 * is an engineering decision:
 *
 *   1. DRAWTEXT (the default `type:"text"` path): ffmpeg's text filter,
 *      rendered at encode time with the HOST's font. The only path that can
 *      run EXPRESSIONS — `content.kind:"expr"` counters, `xExpr`/`yExpr`
 *      motion — because ffmpeg evaluates them per frame. This column
 *      carries a second, expr layer (a % count-up over the clip) to prove
 *      it: `animateNumbersInText` compiles "100%" into a drawtext
 *      `%{eif:...}` expansion, `eval:"frame"` + `renderMode:"video"` make
 *      it re-evaluate every frame. Trade-off: host fonts vary, nothing
 *      wraps, and preview/render can disagree.
 *   2. SVG RASTERIZER (`rasterizer:"svg"`): glyph outlines from the BUNDLED
 *      deterministic font, baked to a masked color tile — pure geometry.
 *      Identical in app preview and CLI, fast (no drawtext spawn), fit it
 *      with measureText. Static literals only.
 *   3. MASK-CARVED (`textToPath` → inline-mask): the text becomes the MASK
 *      of an ordinary source. The most powerful: because the glyphs are
 *      just a mask, ANY source can wear them — a color, a gradient, video
 *      playing through the letters. Also the most manual (you own the
 *      design canvas and the sizing).
 *
 * Three columns render the same word through each pipeline. Select each
 * tile: the first two are `text` sources whose new `rasterizer` row reads
 * drawtext vs svg; the third is a `lavfi` color tile whose MASK section
 * carries the glyph paths.
 */

export type TextThreeWaysProps = {
  /** The word rendered three ways (ASCII, 1-12 chars). */
  word?: string;
  /** Ink color (#rrggbb). */
  inkColor?: string;
};

const ID = "@m0saic-starter/text/text-three-ways/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const PANEL = "#17202a" as MosaicColor;

const propsSchema = definePropsSchema<TextThreeWaysProps>({
  word: {
    type: "string",
    required: false,
    description: "The word rendered three ways (ASCII, 1-12 chars).",
    meta: { control: { placeholder: "M0saic" }, ui: { label: "Word" } },
  },
  inkColor: {
    type: "string",
    required: false,
    description: "Ink color as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#ecf0f1" },
      ui: { label: "Ink" },
    },
  },
});

export const TextThreeWaysV1 = defineMosaicTemplate<TextThreeWaysProps>({
  id: asTemplateId(ID),
  label: "Text, Three Ways",
  version: 1,
  description:
    "The same word through all three text pipelines, side by side: drawtext (ffmpeg, expr-capable, host fonts), the svg rasterizer (bundled font baked to geometry — identical app/CLI), and mask-carved glyphs (text as a mask any source can wear). All valid; different promises.",
  capabilities: { tier: "core" },
  tags: ["text", "rasterizer", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Select each column's tile — the rasterizer row and the MASK section tell the three apart.",
  },

  propsSchema,
  defaultProps: { word: "M0saic", inkColor: "#ecf0f1" },

  async render(
    props: TextThreeWaysProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const word = props.word ?? "M0saic";
    const inkColor = props.inkColor ?? "#ecf0f1";
    if (word.length < 1 || word.length > 12 || !/^[\x20-\x7E]+$/.test(word)) {
      throw new Error(`${ID}: word must be 1-12 ASCII characters, got ${JSON.stringify(word)}.`);
    }
    if (!HEX.test(inkColor)) {
      throw new Error(`${ID}: inkColor ${JSON.stringify(inkColor)} must be #rrggbb.`);
    }
    const ink = inkColor as MosaicColor;

    const { width, height } = ctx.target;
    const cellW = Math.round(width / 3);

    // One size for all three, measured against the bundled font so the svg
    // and mask columns match exactly (drawtext draws the HOST font at the
    // same number — the small visual drift IS part of the lesson).
    const fit = fitSvgText(word, cellW, height * 0.5, {
      maxPx: Math.round(height * 0.12),
      maxLines: 1,
    });

    // 1) DRAWTEXT: the plain text source. No `rasterizer` — ffmpeg draws it.
    // One more asymmetry: a drawtext frame paints an OPAQUE background
    // (black unless told otherwise), while svg/mask text bakes to
    // transparent geometry — so this source carries the panel fill itself.
    //
    // The second layer is the expr beat: a % count-up ffmpeg re-evaluates
    // per frame (`renderMode:"video"`, not "image" — a still would freeze
    // the counter at frame 0). Only THIS pipeline can do this; an svg
    // source with an expr layer silently falls back to drawtext.
    const durationSec = ctx.target.durationMs / 1000;
    const drawtextCol: MosaicSource = {
      type: "text",
      renderMode: { kind: "video" },
      visual: { backgroundColor: solidBackground(PANEL) },
      layers: [
        {
          content: { kind: "literal", text: word },
          style: { fontSize: fit.fontSize, fontColor: ink },
        },
        {
          content: {
            kind: "expr",
            expr: animateNumbersInText("100%", { durationSec }),
            eval: "frame",
          },
          style: {
            fontSize: Math.max(14, Math.round(fit.fontSize * 0.4)),
            fontColor: "#7f8c9b" as MosaicColor,
          },
          placement: { hAlign: "center", vAlign: "bottom", padding: { bottom: 0.12 } },
        },
      ],
    } as MosaicTextSource;

    // 2) SVG RASTERIZER: same word, bundled font, baked to geometry.
    const svgCol = svgTextSource([
      { text: word, fontSize: fit.fontSize, color: ink },
    ]);

    // 3) MASK-CARVED: the word becomes an inline-mask on an ordinary color
    // tile. Design canvas = this column's box, so bounds match the cell
    // aspect (see geometry/mask-in-a-cell) and nothing smears.
    const maskCanvas = { width: cellW, height };
    const maskCol = makeColorTile(ink, {
      mask: {
        kind: "inline-mask",
        localPath: textToPath(word, { fontSize: fit.fontSize }, maskCanvas),
        bounds: { x: 0, y: 0, width: maskCanvas.width, height: maskCanvas.height },
      },
    });

    // Three panel columns, each content on its attached overlay; captions
    // bound to a bottom band split per column (tight text binding).
    const m0 = toM0String("3(1{1},1{1},1{1}){6[-,-,-,-,-,3(1,1,1)]}", ID);

    const caption = (text: string): MosaicSource =>
      svgLabel(text, cellW, Math.round(height / 6), {
        maxPx: Math.round(height * 0.028),
        maxLines: 2,
        color: "#7f8c9b" as MosaicColor,
      });

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        makeColorTile(PANEL),
        drawtextCol,
        makeColorTile(PANEL),
        svgCol,
        makeColorTile(PANEL),
        maskCol,
        caption("drawtext: ffmpeg filter, host font - the counter is an expr"),
        caption("svg rasterizer: bundled font, baked, app == CLI"),
        caption("mask-carved: text AS a mask - any source can wear it"),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Text, Three Ways",
    lines: [
      "DRAWTEXT is ffmpeg's text filter: rendered at encode time with the HOST's font. It is the only path that runs expressions - the % count-up under column one is an expr layer (animateNumbersInText compiles \"100%\" to a %{eif:...} expansion; renderMode \"video\" makes ffmpeg re-evaluate it every frame).",
      "The SVG RASTERIZER (rasterizer: \"svg\") bakes the bundled font's outlines to geometry: identical in app and CLI, fast, measurable with measureText. Static literals only - give it an expr layer and it silently falls back to drawtext.",
      "MASK-CARVED text (textToPath -> inline-mask) turns the word into a mask an ordinary source wears - a color today, a gradient or video playing through the letters tomorrow. Most powerful, most manual.",
      "One asymmetry to remember: drawtext frames paint an OPAQUE background (black unless set); svg and mask text bake to transparent geometry.",
    ],
    explore: [
      "Press play: only column one's counter ticks - svg and mask text are baked geometry",
      "Select column one: its rasterizer row is LOCKED (expr layers need ffmpeg); column two's stays editable",
      "Flip column two's layer content.kind literal -> expr in the panel and watch its lock appear too",
      "Column three is a lavfi tile - the word lives in its MASK section",
    ],
  }),
});

export default TextThreeWaysV1;
