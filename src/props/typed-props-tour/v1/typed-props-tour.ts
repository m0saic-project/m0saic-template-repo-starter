import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
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
 * `@m0saic-starter/props/typed-props-tour/v1` — one prop of each scalar
 * type, each visibly driving the render.
 *
 * ONE CONCEPT: the typed props surface. A template declares its knobs with
 * `definePropsSchema` — the TYPE picks the sidebar control (string → text
 * field, number → numeric input with min/max, boolean → toggle, oneOf →
 * enum select) — and every optional prop carries a deterministic default.
 * The schema is DOCUMENTATION for hosts; render() re-validates everything,
 * because the CLI (and any host) can call it with a raw props bag.
 *
 * Each prop maps to something you can SEE move:
 *   - `title`  (string)  — the header text.
 *   - `tiles`  (number)  — how many columns the middle band splits into.
 *   - `accent` (boolean) — whether the marker row renders at all.
 *   - `align`  (enum)    — which third of the marker row holds the marker.
 * The caption prints the exact values render() received — the receipt.
 */

export type TypedPropsTourProps = {
  /** Header text (ASCII, 1-40 chars). */
  title?: string;
  /** Columns in the middle band (1-8). */
  tiles?: number;
  /** Render the marker row at all? */
  accent?: boolean;
  /** Which third of the marker row holds the marker. */
  align?: "left" | "center" | "right";
};

const ID = "@m0saic-starter/props/typed-props-tour/v1";
const ALIGNS = ["left", "center", "right"] as const;

const propsSchema = definePropsSchema<TypedPropsTourProps>({
  title: {
    type: "string",
    required: false,
    description: "Header text (ASCII, 1-40 chars).",
    meta: { control: { placeholder: "Typed props" }, ui: { label: "Title" } },
  },
  tiles: {
    type: "number",
    required: false,
    description: "Columns in the middle band (1-8).",
    meta: { constraints: { min: 1, max: 8 }, control: { step: 1 }, ui: { label: "Tiles" } },
  },
  accent: {
    type: "boolean",
    required: false,
    description: "Render the marker row at all?",
    meta: { ui: { label: "Accent row" } },
  },
  align: {
    type: "string",
    required: false,
    description: "Which third of the marker row holds the marker.",
    meta: { constraints: { oneOf: [...ALIGNS] }, ui: { label: "Align" } },
  },
});

export const TypedPropsTourV1 = defineMosaicTemplate<TypedPropsTourProps>({
  id: asTemplateId(ID),
  label: "14 · Typed Props Tour",
  version: 1,
  description:
    "One prop of each scalar type — string, number, boolean, enum — each visibly driving the render, with the received values printed as a caption receipt. The schema picks the sidebar controls; render() is the gate.",
  capabilities: { tier: "core" },
  tags: ["props", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Change every prop in the sidebar and watch its band move.",
  },

  propsSchema,
  defaultProps: { title: "Typed props", tiles: 4, accent: true, align: "center" },

  async render(
    props: TypedPropsTourProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const title = props.title ?? "Typed props";
    const tiles = props.tiles ?? 4;
    const accent = props.accent ?? true;
    const align = props.align ?? "center";

    // The gate: the schema above is documentation; THIS is enforcement.
    if (title.length < 1 || title.length > 40 || !/^[\x20-\x7E]+$/.test(title)) {
      throw new Error(`${ID}: title must be 1-40 ASCII characters.`);
    }
    if (!Number.isInteger(tiles) || tiles < 1 || tiles > 8) {
      throw new Error(`${ID}: tiles must be an integer 1-8, got ${JSON.stringify(tiles)}.`);
    }
    if (typeof accent !== "boolean") {
      throw new Error(`${ID}: accent must be a boolean, got ${JSON.stringify(accent)}.`);
    }
    if (!(ALIGNS as readonly string[]).includes(align)) {
      throw new Error(`${ID}: align must be one of ${ALIGNS.join(" | ")}.`);
    }

    const { width, height } = ctx.target;

    // Rows: title / marker / tiles / caption. The boolean decides whether
    // the marker row claims a tile at all; the enum decides WHICH third.
    const markerRow = accent
      ? `3(${ALIGNS.map((a) => (a === align ? "1" : "-")).join(",")})`
      : "-";
    // Grammar: 1-count splits are illegal — one tile IS the row.
    const tilesRow =
      tiles === 1 ? "1" : `${tiles}(${new Array<string>(tiles).fill("1").join(",")})`;
    const rows = weightedSplit([2, 1, 3, 1], "row", {
      claimants: ["1", markerRow, tilesRow, "1"],
    });
    const m0 = toM0String(String(rows), ID);

    const FILLS: MosaicColor[] = [
      "#1a5276", "#2471a3", "#2e86c1", "#5499c7",
      "#1f618d", "#2980b9", "#3498db", "#21618c",
    ] as MosaicColor[];
    const tileSources: MosaicSource[] = new Array(tiles)
      .fill(null)
      .map((_, i) => makeColorTile(FILLS[i % FILLS.length]));

    const caption =
      `render() received: title "${title}", tiles ${tiles}, ` +
      `accent ${accent}, align "${align}"`;

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        svgLabel(title, width, Math.round((height * 2) / 7), {
          maxPx: Math.round(height * 0.07),
          maxLines: 1,
        }),
        ...(accent ? [makeColorTile("#EF7525" as MosaicColor)] : []),
        ...tileSources,
        svgLabel(caption, width, Math.round(height / 7), {
          maxPx: Math.round(height * 0.028),
          maxLines: 2,
          color: "#7f8c9b" as MosaicColor,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Typed Props Tour",
    lines: [
      "definePropsSchema declares one knob of each scalar type, and the TYPE picks the sidebar control.",
      "The schema is documentation for hosts; render() is the gate - the CLI can pass any raw props bag.",
      "Every optional prop carries a deterministic default, and the caption prints what render() received.",
    ],
    explore: [
      "Change every prop - each one moves a different band",
      "Toggle Accent row off - its m0 row becomes a null",
      "Set Tiles to 8, then 1 - the middle band resplits",
    ],
  }),
});

export default TypedPropsTourV1;
