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
 * `@m0saic-starter/data/sidecar-json/v1` — a second deliverable, in JSON.
 *
 * ONE CONCEPT: `doc.sidecars` writes FILES next to the render. Each key
 * becomes `{output-basename}.{key}.json`, so a template can ship machine-
 * readable facts alongside the pixels without a second render.
 *
 * TWO HALVES, BOTH REQUIRED:
 *
 *   - `sidecarsSchema` on the TEMPLATE declares which sidecars exist and
 *     what they mean. It is the contract a host reads.
 *   - `sidecars` on the DOCUMENT carries the values for this render.
 *
 * Declare without attaching and no file appears; attach without declaring and
 * nobody knows the file was coming.
 *
 * SIDECARS ARE NOT `variables`. A data source is an IN-MEMORY channel for the
 * next template in a chain; a sidecar is a file on disk for whatever comes
 * after m0saic — a build step, a CMS, a person. The same payload often goes
 * both ways, which is exactly what `data/fixture-fetcher` does.
 *
 * NOT IN DESIGN MODE. Sidecars are suppressed while the editor is drawing
 * previews — they belong to a real render with a real output path. That is
 * why a sidecar must never be the only place a fact lives.
 */

export type SidecarJsonProps = {
  /** Free-text note stored in the sidecar. */
  note?: string;
  /** Include per-cell geometry in the sidecar. */
  includeGeometry?: boolean;
};

const ID = "@m0saic-starter/data/sidecar-json/v1";
const PANEL = "#17202a" as MosaicColor;
const ACCENT = "#EF7525" as MosaicColor;
const INK = "#ecf0f1" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

const propsSchema = definePropsSchema<SidecarJsonProps>({
  note: {
    type: "string",
    required: false,
    description: "Free text carried into the sidecar file — stands in for whatever a real template would record.",
    meta: { control: { placeholder: "rendered by the starter repo" }, ui: { label: "Note" } },
  },
  includeGeometry: {
    type: "boolean",
    required: false,
    description:
      "Add the canvas and timing to the sidecar. Useful downstream: a build step can lay out a page without opening the video.",
    meta: { ui: { label: "Include geometry" } },
  },
});

export const SidecarJsonV1 = defineMosaicTemplate<SidecarJsonProps>({
  id: asTemplateId(ID),
  label: "66 · Sidecar JSON",
  version: 1,
  description:
    "doc.sidecars writes files beside the render: each key becomes {output-basename}.{key}.json. sidecarsSchema on the template declares them, doc.sidecars carries the values — a sidecar is a file for what comes after m0saic, where a data source is an in-memory channel for the next template.",
  capabilities: { tier: "core" },
  tags: ["data", "sidecars", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Render to out.mp4 and look for out.renderFacts.json beside it.",
  },

  propsSchema,
  defaultProps: { note: "rendered by the starter repo", includeGeometry: true },

  // HALF ONE: the declaration. A host reads this to know what to expect.
  sidecarsSchema: {
    renderFacts: {
      type: "object",
      required: false,
      description:
        "Facts about this render, written as {output-basename}.renderFacts.json next to the deliverable.",
    },
  },

  async render(props: SidecarJsonProps, ctx: MosaicEngineContext): Promise<MosaicDocument> {
    const note = (props.note ?? "rendered by the starter repo").trim();
    const includeGeometry = props.includeGeometry ?? true;

    if (note.length > 120) {
      throw new Error(`${ID}: note must be 120 characters or fewer, got ${note.length}.`);
    }

    const { width, height, fps, durationMs } = ctx.target;

    // Everything here is derived from props and ctx — a sidecar written from
    // a clock or a counter would make the same render produce different files.
    const facts: Record<string, unknown> = { templateId: ID, note };
    if (includeGeometry) {
      facts.canvas = { width, height };
      facts.timing = { fps, durationMs, frames: Math.round((durationMs / 1000) * fps) };
    }

    const lines = Object.keys(facts).map((k) => `${k}: ${JSON.stringify(facts[k])}`);

    return {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String(
        String(weightedSplit([1, 3], "row", { claimants: ["1{1}", "1{1}"] })),
        ID,
      ),
      assets: {},
      backgroundColor: PANEL,
      sources: [
        makeColorTile(ACCENT),
        svgLabel("out.renderFacts.json", width, Math.round(height / 4), {
          maxPx: Math.round(height * 0.06),
          maxLines: 1,
          color: PANEL,
        }),
        makeColorTile(PANEL),
        svgLabel(lines.join("   "), width, Math.round((height * 3) / 4), {
          maxPx: Math.round(height * 0.032),
          maxLines: 5,
          color: lines.length > 1 ? INK : INK_DIM,
        }),
      ],
      // HALF TWO: the values for THIS render.
      sidecars: { renderFacts: facts },
    };
  },

  renderTutorial: lessonTutorial({
    title: "Sidecar JSON",
    lines: [
      "doc.sidecars writes files beside the render: each key lands as {output-basename}.{key}.json.",
      "Two halves: sidecarsSchema on the template declares them, doc.sidecars carries this render's values. Both required.",
      "A sidecar is not a data source: one is a file for what comes AFTER m0saic, the other an in-memory channel for the next template.",
      "Suppressed in design mode - so a fact that lives only in a sidecar is a fact the editor cannot see.",
    ],
    explore: [
      "Render to a file and open the .renderFacts.json beside it",
      "Turn Include geometry off - the file shrinks",
      "Render at another size: the facts follow ctx.target",
    ],
  }),
});

export default SidecarJsonV1;
