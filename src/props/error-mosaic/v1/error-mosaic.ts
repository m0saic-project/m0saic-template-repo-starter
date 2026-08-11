import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  makeErrorMosaic,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/props/error-mosaic/v1` — failing on-canvas, usefully.
 *
 * ONE CONCEPT: `makeErrorMosaic`. A thrown error is right for headless
 * callers, but inside an editor a throw is a dead preview. The friendlier
 * pattern for user-facing validation:
 *
 *   1. Collect EVERY problem (structures are wrong in several places at
 *      once), each with a REMEDY — what to change, not just what's wrong.
 *   2. Return `makeErrorMosaic(problems, {...})` — a complete, renderable
 *      document that shows the report card on canvas. The preview stays
 *      alive; the user reads the remedies and fixes the props.
 *
 * This template's three knobs are deliberately breakable so you can watch
 * the report card appear and stack multiple remedies.
 */

export type ErrorMosaicProps = {
  /** Split ratio for the happy-path card (0.1-0.9). */
  ratio?: number;
  /** Accent color (#rrggbb). */
  accent?: string;
  /** Comma-separated tags (1-4 items, ASCII, 1-8 chars each). */
  tags?: string;
};

const ID = "@m0saic-starter/props/error-mosaic/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;

const propsSchema = definePropsSchema<ErrorMosaicProps>({
  ratio: {
    type: "number",
    required: false,
    description: "Split ratio for the card (0.1-0.9). Try 5 to break it.",
    meta: { constraints: { min: 0.1, max: 0.9 }, control: { step: 0.1 }, ui: { label: "Ratio" } },
  },
  accent: {
    type: "string",
    required: false,
    description: "Accent color as #rrggbb. Try \"orange\" to break it.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#EF7525" },
      ui: { label: "Accent" },
    },
  },
  tags: {
    type: "string",
    required: false,
    description: "Comma-separated tags, 1-4 items of 1-8 ASCII chars. Try five items.",
    meta: { control: { placeholder: "one,two,three" }, ui: { label: "Tags" } },
  },
});

export const ErrorMosaicV1 = defineMosaicTemplate<ErrorMosaicProps>({
  id: asTemplateId(ID),
  label: "Error Mosaic",
  version: 1,
  description:
    "Failing on-canvas, usefully: collect EVERY problem with a remedy, then return makeErrorMosaic — a renderable report card instead of a dead preview. Three deliberately breakable knobs to practice on.",
  capabilities: { tier: "core" },
  tags: ["props", "errors", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Break a prop (Ratio 5, Accent \"orange\") and the canvas becomes the report card.",
  },

  propsSchema,
  defaultProps: { ratio: 0.618, accent: "#EF7525", tags: "one,two,three" },

  async render(
    props: ErrorMosaicProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const ratio = props.ratio ?? 0.618;
    const accent = props.accent ?? "#EF7525";
    const tags = props.tags ?? "one,two,three";
    const { width, height } = ctx.target;

    // 1) Collect EVERY problem, each with its remedy.
    const problems: string[] = [];
    if (!Number.isFinite(ratio) || ratio < 0.1 || ratio > 0.9) {
      problems.push(`ratio ${JSON.stringify(ratio)} - use a number between 0.1 and 0.9`);
    }
    if (!HEX.test(accent)) {
      problems.push(`accent ${JSON.stringify(accent)} - use a #rrggbb hex color`);
    }
    const items = tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    if (items.length < 1 || items.length > 4) {
      problems.push(`tags has ${items.length} items - use 1 to 4, comma-separated`);
    }
    for (const t of items) {
      if (t.length > 8 || !/^[\x20-\x7E]+$/.test(t)) {
        problems.push(`tag "${t}" - keep each tag 1-8 ASCII chars`);
      }
    }

    // 2) Problems render, they don't throw: the report card IS the document.
    if (problems.length > 0) {
      return makeErrorMosaic(problems.map((p) => `- ${p}`).join("\n"), {
        width,
        height,
        title: "Fix these props",
        errorCode: "STARTER_PROPS_INVALID",
      });
    }

    // Happy path: a two-cell card at the ratio, tags as caption.
    const a = Math.round(ratio * 100);
    const card = String(weightedSplit([a, 100 - a], "col"));
    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: [card, "1"] })),
      ID,
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        makeColorTile(accent as MosaicColor),
        makeColorTile("#1c2833" as MosaicColor),
        svgLabel(`ratio ${ratio} - tags: ${items.join(" / ")}`, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.026),
          maxLines: 1,
          color: "#7f8c9b" as MosaicColor,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Error Mosaic",
    lines: [
      "A thrown error is right for headless callers - but in an editor a throw is a dead preview. The friendlier pattern: collect EVERY problem, each with a REMEDY, then return makeErrorMosaic - a complete renderable document that shows the report card on canvas.",
      "Collect-all matters because props are wrong in several places at once. One fix-everything list beats five one-at-a-time errors.",
      "Write remedies, not accusations: 'use a number between 0.1 and 0.9' tells the user what to DO.",
    ],
    explore: [
      "Set Ratio to 5 - the canvas becomes the report card, the preview never dies",
      "Also type \"orange\" into Accent - BOTH remedies stack on one card",
      "Fix them and the card gives way to the render",
    ],
  }),
});

export default ErrorMosaicV1;
