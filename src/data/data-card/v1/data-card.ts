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
 * `@m0saic-starter/data/data-card/v1` — the end of the chain: pixels.
 *
 * ONE CONCEPT: a consumer reads `ctx.upstreamData[alias]` and draws it.
 * Producer, adapter and consumer never mention each other's ids — they agree
 * on an ALIAS and a SHAPE, which is why any of the three can be swapped.
 *
 * DECLARE WHAT YOU READ. `upstreamDataSchema` documents the blocks and keys
 * this template consumes; the resolver checks a chain against it and warns on
 * a mismatch instead of silently drawing zeroes. It is documentation the
 * machine can read — and the only place a consumer's expectations are
 * written down.
 *
 * SELF-EVIDENCING. The card says which alias it read and whether the block
 * arrived. When a chain misbehaves, the picture should tell you where it
 * broke without a debugger — the same reason `props/error-mosaic` renders its
 * complaints instead of throwing them into a log.
 *
 * FALLBACKS ARE PART OF THE DESIGN. `sampleData` renders the card with no
 * chain at all, which is how it earns a preview image and how you lay out the
 * card before any data exists.
 */

export type DataCardProps = {
  /** Which upstream block to draw. */
  alias?: string;
  /** Headline above the values. */
  title?: string;
  /** Draw a built-in sample when nothing upstream arrived. */
  sampleData?: boolean;
};

const ID = "@m0saic-starter/data/data-card/v1";
const PANEL = "#17202a" as MosaicColor;
const ACCENT = "#EF7525" as MosaicColor;
const MISSING = "#c0392b" as MosaicColor;
const INK = "#ecf0f1" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

/** Stands in for a real block so the card is drawable with no chain. */
const SAMPLE = { count: 5, min: 3, max: 21, mean: 10, total: 50 };

/** Which keys the card shows, in order. Unknown keys are ignored — a card is
 *  a VIEW of a block, not a dump of it. */
const FIELDS = ["count", "min", "max", "mean", "total"] as const;

const propsSchema = definePropsSchema<DataCardProps>({
  alias: {
    type: "string",
    required: false,
    description:
      "Upstream block to draw. Matches what the adapter published — the alias is the whole coupling between them.",
    meta: { control: { placeholder: "seriesStats" }, ui: { label: "Alias" } },
  },
  title: {
    type: "string",
    required: false,
    description: "Headline above the values.",
    meta: { control: { placeholder: "Series" }, ui: { label: "Title" } },
  },
  sampleData: {
    type: "boolean",
    required: false,
    description:
      "Draw built-in numbers when no upstream block arrived, so the card is layoutable before the chain exists. Off, it reports the gap instead.",
    meta: { ui: { label: "Sample data" } },
  },
});

export const DataCardV1 = defineMosaicTemplate<DataCardProps>({
  id: asTemplateId(ID),
  label: "64 · Data Card",
  version: 1,
  description:
    "The consumer end of a data chain: read ctx.upstreamData[alias] and draw it. Producer, adapter and consumer agree on an alias and a shape — never on each other's ids — and the card says which alias it read so a broken chain is visible in the picture.",
  capabilities: { tier: "core" },
  tags: ["data", "consumer", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Standalone it draws the sample. Chain it after data/pure-adapter for real numbers.",
  },

  propsSchema,
  defaultProps: { alias: "seriesStats", title: "Series", sampleData: true },

  // The consumer's contract, machine-readable. Every key optional: the card
  // must render before anything upstream has run.
  upstreamDataSchema: {
    seriesStats: {
      description: "Stats block published by @m0saic-starter/data/pure-adapter/v1.",
      variables: {
        count: { type: "number", required: false },
        min: { type: "number", required: false },
        max: { type: "number", required: false },
        mean: { type: "number", required: false },
        total: { type: "number", required: false },
      },
    },
  },

  async render(props: DataCardProps, ctx: MosaicEngineContext): Promise<MosaicDocument> {
    const alias = (props.alias ?? "seriesStats").trim();
    const title = (props.title ?? "Series").trim();
    const sampleData = props.sampleData ?? true;

    const problems: string[] = [];
    if (alias.length === 0) problems.push("alias must not be empty");
    if (title.length > 40) problems.push(`title must be 40 characters or fewer, got ${title.length}`);
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;

    const block = ctx.upstreamData?.[alias] as Record<string, unknown> | undefined;
    const arrived = block !== undefined;
    const values = arrived ? block : sampleData ? SAMPLE : undefined;

    const cells = FIELDS.map((key) => {
      const raw = values?.[key];
      return { key, text: typeof raw === "number" ? String(raw) : "-" };
    });

    const status = arrived
      ? `ctx.upstreamData["${alias}"]`
      : sampleData
        ? `no "${alias}" upstream - drawing sample numbers`
        : `no "${alias}" upstream`;

    // Title band, a row of value columns, status footer. Each column is
    // itself a split — an overlay `{}` carries exactly ONE node, so a value
    // and its key are two cells, not two layers on one.
    const column = String(weightedSplit([3, 1], "row", { claimants: ["1{1}", "1{1}"] }));
    const valueRow = String(
      weightedSplit(
        cells.map(() => 1),
        "col",
        { claimants: cells.map(() => column) },
      ),
    );
    const m0 = toM0String(
      String(weightedSplit([2, 5, 1], "row", { claimants: ["1{1}", valueRow, "1{1}"] })),
      ID,
    );

    const cellW = Math.round(width / cells.length);
    const valueH = Math.round((height * 5) / 8 * 0.75);
    const keyH = Math.round((height * 5) / 8 * 0.25);
    const sources: MosaicSource[] = [
      makeColorTile(arrived ? ACCENT : sampleData ? INK_DIM : MISSING),
      svgLabel(title, width, Math.round(height / 4), {
        maxPx: Math.round(height * 0.09),
        maxLines: 1,
        color: PANEL,
      }),
    ];
    for (const cell of cells) {
      sources.push(makeColorTile(PANEL));
      sources.push(
        svgLabel(cell.text, cellW, valueH, {
          maxPx: Math.round(height * 0.11),
          maxLines: 1,
          color: INK,
          vAlign: "middle",
        }),
      );
      sources.push(makeColorTile(PANEL));
      sources.push(
        svgLabel(cell.key, cellW, keyH, {
          maxPx: Math.round(height * 0.03),
          maxLines: 1,
          color: INK_DIM,
          vAlign: "middle",
        }),
      );
    }
    sources.push(makeColorTile(PANEL));
    sources.push(
      svgLabel(status, width, Math.round(height / 8), {
        maxPx: Math.round(height * 0.03),
        maxLines: 1,
        color: INK_DIM,
      }),
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: PANEL,
      sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Data Card",
    lines: [
      "A consumer reads ctx.upstreamData[alias] and draws it - the end of the chain, where data becomes pixels.",
      "The three links agree on an ALIAS and a SHAPE, never on each other's ids, so any of them can be swapped.",
      "upstreamDataSchema declares what you read: machine-readable, and the only written record of a consumer's expectations.",
      "Say what you read on the card. A broken chain should be visible in the picture, not only in a log.",
    ],
    explore: [
      "Turn Sample data off with no chain: the gap is named",
      "Chain it after data/pure-adapter for real numbers",
      "Change Alias to a name nobody publishes",
    ],
  }),
});

export default DataCardV1;
