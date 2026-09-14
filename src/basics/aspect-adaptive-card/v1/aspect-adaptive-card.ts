import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { weightedSplit } from "@m0saic/dsl-stdlib";
import {
  bindProp,
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { fitSvgText, svgTextSource, wrapMeasured } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

// Re-exported so the co-located test (and curious readers) can exercise the
// fitting primitives from this lesson's doorstep.
export { fitSvgText, wrapMeasured };

/**
 * `@m0saic-starter/basics/aspect-adaptive-card/v1` — size off `ctx.target`.
 *
 * ONE CONCEPT: `ctx.target` is the single source of truth for the canvas a
 * render fills — `{width, height, fps, durationMs}`. Branch on it and one
 * template serves every aspect: landscape lays the two panels side by side,
 * portrait stacks them. The caption on the card prints the decision live
 * (`1280×720 → columns`) so you can watch the branch flip as you resize.
 *
 * The rule that bites (worth memorizing):
 *
 *   SIZE OFF `ctx.target`, NEVER `ctx.output`.
 *
 * They often agree — until this template renders NESTED inside another
 * document. Then `ctx.target` carries the SLOT the parent gave you, while
 * `ctx.output` still describes the final deliverable. A nested template that
 * reads `ctx.output` builds geometry for the whole video inside a tile a
 * fraction of that size — the classic silent 5× bug.
 *
 * Second lesson, learned the moment any text overflows: NOTHING SOFT-WRAPS,
 * and different hosts draw fallback fonts differently. So static text here
 * uses `rasterizer: "svg"` — glyphs from the BUNDLED deterministic font,
 * baked to geometry, identical in the app preview and the CLI — and the copy
 * is fitted with `measureText` against that SAME font: greedy word-wrap,
 * largest font whose wrapped block fits the panel box. The full fitting
 * story gets its own lesson later in the curriculum (`text/fit-text`).
 */

export type AspectAdaptiveCardProps = {
  /** Headline, accent panel. */
  title?: string;
  /** Supporting line, body panel. */
  body?: string;
  /** Accent panel fill (#rrggbb). */
  accentColor?: string;
  /** Body panel fill (#rrggbb). */
  panelColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/basics/aspect-adaptive-card/v1";

const propsSchema = definePropsSchema<AspectAdaptiveCardProps>({
  title: {
    type: "string",
    required: false,
    description: "Headline, accent panel.",
    meta: { ui: { label: "Title", order: 1 } },
  },
  body: {
    type: "string",
    required: false,
    description: "Supporting line, body panel.",
    meta: { ui: { label: "Body", order: 2 } },
  },
  accentColor: {
    type: "string",
    required: false,
    description: "Accent panel fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#2471a3" },
      ui: { label: "Accent color", order: 3 },
    },
  },
  panelColor: {
    type: "string",
    required: false,
    description: "Body panel fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Panel color", order: 4 },
    },
  },
});

export const AspectAdaptiveCardV1 = defineMosaicTemplate<AspectAdaptiveCardProps>({
  id: asTemplateId(ID),
  label: "05 · Aspect-Adaptive Card",
  version: 1,
  description:
    "One template, every aspect: reads ctx.target, flips columns to rows on portrait, prints its decision live, and fits svg-rasterized text to the panels it computed. Teaches the rule that prevents the classic nested-render bug — size off ctx.target, never ctx.output.",
  capabilities: { tier: "core" },
  tags: ["basics", "ctx", "layout"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Try 1080x1920 too — the layout flips to a stack and the caption follows.",
  },

  propsSchema,
  defaultProps: {
    title: "Reads the room",
    body: "Same template, either way.",
    accentColor: "#2471a3",
    panelColor: "#1c2833",
  },

  async render(
    props: AspectAdaptiveCardProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    for (const [key, value] of [
      ["accentColor", props.accentColor],
      ["panelColor", props.panelColor],
    ] as const) {
      if (value !== undefined && !HEX.test(value)) {
        throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
      }
    }

    // THE lesson: the target slot decides the layout. Nested or top-level,
    // this is the canvas these pixels actually fill.
    const { width, height } = ctx.target;
    const landscape = width >= height;

    // Landscape: 1:2 columns. Portrait: 1:2 rows. Each panel is a BASE color
    // tile with its text attached as an overlay (`1{1}`): svg-rasterized text
    // carries no background of its own, and "fill underneath, content on the
    // attached overlay" is the standard pairing. Knowing our own weights
    // means we also know each panel's PIXEL box — which is what the text
    // must be fitted against (nothing soft-wraps).
    const m0 = weightedSplit([1, 2], landscape ? "col" : "row", {
      claimants: ["1{1}", "1{1}"],
    });
    const accentBox = landscape
      ? { w: width / 3, h: height }
      : { w: width, h: height / 3 };
    const bodyBox = landscape
      ? { w: (width * 2) / 3, h: height }
      : { w: width, h: (height * 2) / 3 };

    const title = props.title ?? "Reads the room";
    const body = props.body ?? "Same template, either way.";

    const titleFit = fitSvgText(title, accentBox.w, accentBox.h, {
      maxPx: Math.round(Math.min(accentBox.h * 0.12, accentBox.w * 0.14)),
      maxLines: 3,
    });
    const bodyFit = fitSvgText(body, bodyBox.w, bodyBox.h * 0.6, {
      maxPx: Math.round(bodyBox.h * 0.065),
      maxLines: 3,
    });

    // The decision, printed on the card — watch it flip with the canvas.
    // ASCII "->" on purpose: the bundled glyph font is lean, and exotic
    // codepoints (like U+2192) render as tofu. Keep card copy ASCII.
    const caption = `${width}x${height} -> ${landscape ? "columns" : "rows"}`;
    const captionFit = fitSvgText(caption, bodyBox.w, bodyBox.h * 0.2, {
      maxPx: Math.round(bodyBox.h * 0.038),
      maxLines: 1,
    });

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      // Paint order follows the DSL walk: base tile, then its attached
      // overlay, per panel — so sources bind [fillA, textA, fillB, textB].
      sources: [
        makeColorTile((props.accentColor ?? "#2471a3") as MosaicColor),
        svgTextSource([
          {
            text: titleFit.text,
            fontSize: titleFit.fontSize,
            color: "#ffffff" as MosaicColor,
          },
        ]),
        makeColorTile((props.panelColor ?? "#1c2833") as MosaicColor),
        bindProp(svgTextSource([
          {
            text: bodyFit.text,
            fontSize: bodyFit.fontSize,
            color: "#ffffff" as MosaicColor,
          },
          {
            text: captionFit.text,
            fontSize: captionFit.fontSize,
            color: "#7f8c9b" as MosaicColor,
            vAlign: "bottom",
            padding: { bottom: 0.06 },
          },
        ]), "body"),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Aspect-Adaptive Card",
    lines: [
      "ctx.target is the canvas your pixels actually fill - branch on it and one template serves every aspect.",
      "Size off ctx.target, NEVER ctx.output: nested, target is your slot while output still describes the final deliverable.",
      "Nothing soft-wraps - the copy is fitted with measureText against the font the renderer draws with.",
    ],
    explore: [
      "Switch Device to Portrait - the layout flips and the caption follows",
      "Feed a long Title - it wraps and shrinks to fit its panel",
    ],
  }),
});

export default AspectAdaptiveCardV1;
