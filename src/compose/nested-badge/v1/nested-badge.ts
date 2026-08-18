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
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/compose/nested-badge/v1` — the CHILD half of
 * compose/nested-template. A badge that lays itself out for whatever box it
 * is handed.
 *
 * ONE CONCEPT (from the child's side): a nested template is an ordinary
 * template. It reads `ctx.target` and knows nothing about who called it —
 * which is exactly why the parent must hand it a `slot`, and why this file
 * has no idea it is usually 30% of someone else's canvas.
 *
 * `internal: true` says it is not meant as a top-level pick: hosts keep it
 * out of the main picker while leaving it available for nested rendering.
 * It still renders perfectly well on its own — internal is about INTENT, not
 * capability, and being able to open a child directly is how you debug one.
 *
 * Everything here is sized off `ctx.target`, never a constant: the accent
 * rail is a share of the width, the label is fitted to its own band. Hand it
 * a 384×720 slot and it fills that; hand it 1280×720 and it fills that too.
 */

export type NestedBadgeProps = {
  /** The badge's line of text. */
  text?: string;
  /** Accent rail color (#rrggbb). */
  accent?: string;
};

const ID = "@m0saic-starter/compose/nested-badge/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const PANEL = "#17202a" as MosaicColor;
const INK = "#ecf0f1" as MosaicColor;

const propsSchema = definePropsSchema<NestedBadgeProps>({
  text: {
    type: "string",
    required: false,
    description: "The badge's line of text — fitted to whatever box the caller hands over.",
    meta: { control: { placeholder: "nested" }, ui: { label: "Text" } },
  },
  accent: {
    type: "string",
    required: false,
    description: "Accent rail color as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#EF7525" },
      ui: { label: "Accent" },
    },
  },
});

export const NestedBadgeV1 = defineMosaicTemplate<NestedBadgeProps>({
  id: asTemplateId(ID),
  label: "49 · Nested Badge",
  version: 1,
  description:
    "The child half of compose/nested-template: a badge that sizes everything off ctx.target, so it fills whatever slot the caller gives it. Marked internal — not a top-level pick, but it renders standalone, which is how you debug a child.",
  capabilities: { tier: "core" },
  tags: ["compose", "internal", "lesson"],
  internal: true,

  outputHints: {
    width: 384,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Usually rendered as a child. Opening it directly is the way to debug one.",
  },

  propsSchema,
  defaultProps: { text: "nested", accent: "#EF7525" },

  async render(
    props: NestedBadgeProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const text = (props.text ?? "nested").trim();
    const accent = props.accent ?? "#EF7525";

    const problems: string[] = [];
    if (text.length < 1 || text.length > 24) {
      problems.push(`text must be 1-24 characters, got ${JSON.stringify(text)}`);
    }
    if (!HEX.test(accent)) problems.push(`accent ${JSON.stringify(accent)} must be #rrggbb`);
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    // ctx.target is the SLOT when a parent passes one — every number below
    // is a share of it, so the same code fills a sliver or a full canvas.
    const { width, height } = ctx.target;
    const railWeight = 6; // ~6% of the width
    const labelBoxW = Math.round((width * (100 - railWeight)) / 100);

    const m0 = toM0String(
      String(
        weightedSplit([railWeight, 100 - railWeight], "col", { claimants: ["1", "1{1}"] }),
      ),
      ID,
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: PANEL,
      sources: [
        makeColorTile(accent as MosaicColor),
        makeColorTile(PANEL),
        svgLabel(text, labelBoxW, height, {
          maxPx: Math.round(Math.min(labelBoxW, height) * 0.2),
          maxLines: 3,
          color: INK,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Nested Badge",
    lines: [
      "The CHILD half of compose/nested-template, and the point is how ordinary it is.",
      "A nested template reads ctx.target and knows nothing about who called it - which is why the parent must hand it a slot.",
      "internal: true means \"not a top-level pick\", not \"cannot run\" - opening a child directly is how you debug one.",
    ],
    explore: [
      "Open compose/nested-template and change Slot % - this file doesn't",
      "Render this one directly at a wide aspect",
      "Change Text and watch the fit react to its box",
    ],
  }),
});

export default NestedBadgeV1;
