import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asAliasId, asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/data/pure-adapter/v1` — the middle link.
 *
 * ONE CONCEPT: an adapter reads one data block and publishes another. It is a
 * pure function between channels: `ctx.upstreamData[inputAlias]` in, a new
 * `type: "data"` source out, nothing else touched.
 *
 * WHY SPLIT FETCH FROM SHAPE. Fetching needs a capability tier and a network;
 * reshaping needs neither. Keeping them apart means the adapter stays
 * CORE TIER — no permission prompt, no secrets, testable with a plain object
 * — and one fetcher can feed many adapters, or one adapter can sit under
 * several fetchers that all speak the same shape.
 *
 * PURE MEANS PURE. Same input, same output, always: no clock, no randomness,
 * no fs. That is what makes a data chain reproducible, and it is why
 * `ctx` hands you no `Date.now()` equivalent to reach for.
 *
 * DEGRADE, DON'T THROW. A missing upstream block is the normal state while
 * someone is still wiring a chain (and in the editor, where nothing upstream
 * has run). Publish an empty-but-well-shaped result and SAY SO on the tile —
 * a template that throws here is unusable in the editor.
 */

export type PureAdapterProps = {
  /** Channel this adapter reads. */
  inputAlias?: string;
  /** Channel this adapter publishes. */
  outputAlias?: string;
  /** Key inside the input block holding the numbers. */
  seriesKey?: string;
};

const ID = "@m0saic-starter/data/pure-adapter/v1";
/** The committed chain that runs a producer, this adapter and a consumer in
 *  one render. Make invokes ONE template, so a lone adapter has no upstream
 *  by construction — this file is how the lesson is meant to be seen. */
const CHAIN_FILE = "examples/data-chain/starter-data-chain.mosaicx";
const PANEL = "#17202a" as MosaicColor;
const OK = "#27ae60" as MosaicColor;
const MISSING = "#c0392b" as MosaicColor;
const INK = "#ecf0f1" as MosaicColor;
const ALIAS_RE = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;

/** The derived shape this adapter promises downstream. */
export type SeriesStats = {
  count: number;
  min: number;
  max: number;
  mean: number;
  total: number;
};

/** The whole adapter: numbers in, stats out. Deterministic, dependency-free. */
export function summarize(series: readonly number[]): SeriesStats {
  const nums = series.filter((n) => Number.isFinite(n));
  if (nums.length === 0) return { count: 0, min: 0, max: 0, mean: 0, total: 0 };
  const total = nums.reduce((a, b) => a + b, 0);
  return {
    count: nums.length,
    min: Math.min(...nums),
    max: Math.max(...nums),
    // Rounded so the published payload is stable across platforms.
    mean: Math.round((total / nums.length) * 100) / 100,
    total,
  };
}

const propsSchema = definePropsSchema<PureAdapterProps>({
  inputAlias: {
    type: "string",
    required: false,
    description:
      "Upstream channel to read. Must match what the producer published under — the alias is the contract between them.",
    meta: { control: { placeholder: "starterData" }, ui: { label: "Input alias" } },
  },
  outputAlias: {
    type: "string",
    required: false,
    description:
      "Channel this adapter publishes on. Keep it distinct from the input so both blocks stay readable downstream.",
    meta: { control: { placeholder: "seriesStats" }, ui: { label: "Output alias" } },
  },
  seriesKey: {
    type: "string",
    required: false,
    description:
      "Which key inside the upstream block holds the numbers. Naming it as a prop is what lets one adapter serve several producers.",
    meta: { control: { placeholder: "series" }, ui: { label: "Series key" } },
  },
});

export const PureAdapterV1 = defineMosaicTemplate<PureAdapterProps>({
  id: asTemplateId(ID),
  label: "63 · Pure Adapter",
  version: 1,
  description:
    "An adapter reads one data block and publishes another — a pure function between channels. Reshaping needs no capability tier and no network, so it stays core tier and testable with a plain object; a missing upstream degrades to an empty result rather than throwing.",
  capabilities: { tier: "core" },
  tags: ["data", "adapter", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Standalone it reports MISSING — that is the lesson. Chain it after data/fixture-fetcher.",
  },

  propsSchema,
  defaultProps: { inputAlias: "starterData", outputAlias: "seriesStats", seriesKey: "series" },

  // What this template EXPECTS to be handed. Optional keys throughout: the
  // adapter must still render when nothing upstream has run.
  upstreamDataSchema: {
    starterData: {
      description: "Payload published by @m0saic-starter/data/fixture-fetcher/v1.",
      variables: {
        dataset: { type: "string", required: false },
        series: { type: "number[]", required: false },
      },
    },
  },

  async render(
    props: PureAdapterProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const inputAlias = (props.inputAlias ?? "starterData").trim();
    const outputAlias = (props.outputAlias ?? "seriesStats").trim();
    const seriesKey = (props.seriesKey ?? "series").trim();

    const problems: string[] = [];
    for (const [name, value] of [
      ["inputAlias", inputAlias],
      ["outputAlias", outputAlias],
    ] as const) {
      if (!ALIAS_RE.test(value)) {
        problems.push(`${name} ${JSON.stringify(value)} must start with a letter or _ and be alphanumeric (max 64)`);
      }
    }
    if (seriesKey.length === 0) problems.push("seriesKey must not be empty");
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;

    // The read. Everything about it is optional-chained: upstream absence is
    // a state to render, not an exception to raise.
    const block = ctx.upstreamData?.[inputAlias] as Record<string, unknown> | undefined;
    const raw = block?.[seriesKey];
    const series = Array.isArray(raw) ? (raw as number[]) : [];
    const arrived = block !== undefined;

    const stats = summarize(series);
    const headline = arrived
      ? `${inputAlias}.${seriesKey} -> ${outputAlias}`
      : `no upstream block "${inputAlias}" - publishing an empty ${outputAlias}`;
    const detail = arrived
      ? `count ${stats.count}   min ${stats.min}   max ${stats.max}   mean ${stats.mean}   total ${stats.total}`
      : `no producer ran first - load ${CHAIN_FILE} to see the whole chain`;

    return {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String(
        String(weightedSplit([1, 2], "row", { claimants: ["1{1}", "1{1}"] })),
        ID,
      ),
      assets: {},
      backgroundColor: PANEL,
      sources: [
        makeColorTile(arrived ? OK : MISSING),
        svgLabel(headline, width, Math.round(height / 3), {
          maxPx: Math.round(height * 0.05),
          maxLines: 2,
          color: INK,
        }),
        makeColorTile(PANEL),
        svgLabel(detail, width, Math.round((height * 2) / 3), {
          maxPx: Math.round(height * 0.04),
          maxLines: 3,
          color: INK,
        }),
        // Publish the DERIVED block. Downstream never sees the raw input
        // through this template — that is what makes it an adapter and not
        // a passthrough.
        {
          type: "data",
          alias: asAliasId(outputAlias),
          variables: { ...stats, sourceAlias: inputAlias, upstreamArrived: arrived },
          editor: { owner: "template" },
        } as unknown as MosaicSource,
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Pure Adapter",
    lines: [
      "An adapter reads ctx.upstreamData[in] and publishes a new data source under [out]: a pure function between channels.",
      "Splitting fetch from shape keeps this core tier - no permission prompt, no secrets, testable with a plain object.",
      "Pure means pure: same input, same output. No clock, no randomness, no fs - that is what makes a chain reproducible.",
      "Missing upstream is normal in the editor. Publish an empty well-shaped result and say so; never throw.",
    ],
    explore: [
      "Render standalone: MISSING, and still a valid block",
      "Point Series key at another key in the payload",
      "Load examples/data-chain/starter-data-chain.mosaicx",
    ],
  }),
});

export default PureAdapterV1;
