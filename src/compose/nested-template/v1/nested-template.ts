import type {
  MosaicColor,
  MosaicDocument,
  MosaicDocumentPipeline,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  renderNestedTemplate,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/compose/nested-template/v1` — call another TEMPLATE, not
 * another document.
 *
 * ONE CONCEPT: `renderNestedTemplate(id, props, ctx, { slot })` looks the
 * template up in the host's registry, renders it, and hands back a document
 * you drop straight into `children`. Where compose/child-mosaic BUILDS its
 * child inline, this one CALLS one — the difference between a subroutine and
 * a copy-paste.
 *
 * `slot` is the part everyone forgets. Without it the child renders against
 * the PARENT's `ctx.target`: text fitted for a 1280px canvas, then squeezed
 * into a 384px cell. Pass the slot's real pixel box and the child's own
 * `ctx.target` becomes that box, so it lays itself out for the space it will
 * actually occupy. (`fps` and `durationMs` default to the parent's — pass
 * them only when the slot's timing differs.)
 *
 * Two contracts come with the call:
 *
 *   - THE CHILD MUST BE REGISTERED. The lookup is by id against the host's
 *     registry, which is what makes this composition late-bound. In this
 *     repo the host registers everything the entry module exports, so the
 *     badge is available exactly because it ships in `templates[]` — not
 *     because this file imports it. (It doesn't.)
 *   - The child may legally return a PIPELINE, and `children` accepts one —
 *     it renders first and the parent consumes its stitched output.
 */

export type NestedTemplateProps = {
  /** Text handed down to the badge child. */
  badgeText?: string;
  /** Badge slot width, as a percent of the canvas (20-50). */
  slotPct?: number;
};

const ID = "@m0saic-starter/compose/nested-template/v1";
const BADGE_ID = "@m0saic-starter/compose/nested-badge/v1";
const CHILD_REF = "badge";
const PANEL = "#17202a" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

const propsSchema = definePropsSchema<NestedTemplateProps>({
  badgeText: {
    type: "string",
    required: false,
    description: "Text handed down to the badge child as its own prop. Parent props in, child props out — nothing shared but the call.",
    meta: { control: { placeholder: "nested" }, ui: { label: "Badge text" } },
  },
  slotPct: {
    type: "number",
    required: false,
    description: "Badge slot width as a percent of the canvas. This number becomes the child's ctx.target.width — watch the badge re-fit itself, not stretch.",
    meta: {
      constraints: { min: 20, max: 50 },
      control: { step: 5 },
      ui: { label: "Slot %" },
    },
  },
});

export const NestedTemplateV1 = defineMosaicTemplate<NestedTemplateProps>({
  id: asTemplateId(ID),
  label: "49 · Nested Template",
  version: 1,
  description:
    "renderNestedTemplate calls another registered template and returns a document to drop into children. The slot option is the lesson: hand the child its real pixel box and it lays itself out for that box instead of for your canvas.",
  capabilities: { tier: "core" },
  tags: ["compose", "children", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Drag Slot % and watch the badge re-fit — it is re-rendering, not re-scaling.",
  },

  propsSchema,
  defaultProps: { badgeText: "nested", slotPct: 30 },

  async render(
    props: NestedTemplateProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const badgeText = (props.badgeText ?? "nested").trim();
    const slotPct = props.slotPct ?? 30;

    const problems: string[] = [];
    if (badgeText.length < 1 || badgeText.length > 24) {
      problems.push(`badgeText must be 1-24 characters, got ${JSON.stringify(badgeText)}`);
    }
    if (!Number.isFinite(slotPct) || slotPct < 20 || slotPct > 50) {
      problems.push(`slotPct must be 20-50, got ${JSON.stringify(slotPct)}`);
    } else if (slotPct % 5 !== 0) {
      problems.push(`slotPct steps by 5 (the split weights are integers), got ${slotPct}`);
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;

    // The slot's REAL pixel box — the same arithmetic the split will do.
    const slot = { width: Math.round((width * slotPct) / 100), height };

    // The call. Registry lookup by id, the child's own props, and the slot
    // that becomes its ctx.target. A missing registration throws here with
    // the id in the message — a good error, and worth reading once.
    const badge = (await renderNestedTemplate(
      BADGE_ID,
      { text: badgeText },
      ctx,
      { slot },
    )) as MosaicDocument | MosaicDocumentPipeline;

    const m0 = toM0String(
      String(
        weightedSplit([100 - slotPct, slotPct], "col", { claimants: ["1{1}", "1"] }),
      ),
      ID,
    );

    const caption =
      `child rendered against a ${slot.width}x${slot.height} slot (${slotPct}% of ${width}) - ` +
      `it fitted its own text for THAT box, then the parent placed the result`;

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      children: { [CHILD_REF]: badge },
      sources: [
        makeColorTile(PANEL),
        svgLabel(caption, Math.round((width * (100 - slotPct)) / 100), height, {
          maxPx: Math.round(height * 0.036),
          maxLines: 6,
          color: INK_DIM,
        }),
        { type: "mosaic", ref: CHILD_REF, placement: { fit: "contain" } } as MosaicSource,
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Nested Template",
    lines: [
      "renderNestedTemplate looks a template up in the registry, renders it, and hands back a document for children.",
      "Where child-mosaic BUILDS its child inline, this one CALLS one - subroutine versus copy-paste.",
      "slot is the part everyone forgets: pass the slot's real pixel box and the child lays itself out for that box.",
      "The lookup is by id, so the child works because the host registered it - this file never imports it.",
    ],
    explore: [
      "Drag Slot % and watch the badge re-FIT, not re-scale",
      "Change Badge text - parent props in, child props out",
      "Open compose/nested-badge directly: same template, standalone",
      "Structure dock: the badge is a whole document under one tile",
    ],
  }),
});

export default NestedTemplateV1;
