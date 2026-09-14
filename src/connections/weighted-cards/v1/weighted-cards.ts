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
  svgLabel,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";
import { ITEMS_KIND } from "../../fetchers";

/**
 * `@m0saic-starter/connections/weighted-cards/v1` — weights at BOTH depths:
 * chips against chips inside a card, and cards against each other.
 *
 * ONE CONCEPT: the weighted `cardList`. Two declarations extend lesson 78's
 * card editor into a proportion instrument:
 *
 *  - a `weights` COLUMN sharing the multi-select's key ("itemIds") — two
 *    cells, one array. The chips picker owns membership; the slider group
 *    beside it owns shares. The VALUE SHAPE follows the interaction: an
 *    even, untouched set round-trips as plain `string[]`; a customized one
 *    as `{ id, weight }[]`. Render must accept both — that duality is the
 *    contract, not an accident.
 *  - `interWeightProp: "mixWeights"` — a SIBLING `number[]` prop the card
 *    strip drags to weigh the CARDS against each other. Same sibling-wire
 *    idea as the connections chapter's `connectionId`, pointed at numbers.
 *
 * Render is the honest visualization again: row heights come from
 * `mixWeights`, chip widths from each card's item weights — the entire
 * layout is the prop values wearing rectangles.
 */

export type WeightedItem = { id: string; weight: number };
export type WeightedMix = { label: string; itemIds: string[] | WeightedItem[] };

export type WeightedCardsProps = {
  /** Which configured connection profile the chip pickers read. */
  connectionId?: string;
  /** The mixes: cards of connection-picked chips with per-chip weights. */
  mixes?: WeightedMix[] | string;
  /** Inter-card weights — the sibling the card strip drags. */
  mixWeights?: number[];
  /** Accent fill (#rrggbb). */
  bandColor?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9-]+$/;
const ID = "@m0saic-starter/connections/weighted-cards/v1";
const MAX_MIXES = 3;
const MAX_CHIPS = 5;

const DEFAULT_MIXES: WeightedMix[] = [
  {
    label: "Feature",
    // Customized shares -> the {id, weight}[] shape.
    itemIds: [
      { id: "big-buck-bunny", weight: 0.6 },
      { id: "glacier-flight", weight: 0.25 },
      { id: "desert-night-sky", weight: 0.15 },
    ],
  },
  // Untouched even set -> the plain string[] shape. Both defaults on
  // purpose: the render must prove it accepts each.
  { label: "Loops", itemIds: ["ember-glow", "soft-gradient"] },
];

const DEFAULT_MIX_WEIGHTS = [2, 1];
/** Slot budget the mix rows share — bounds the row split's precision floor
 *  (≈ (10 + budget + 4·cards) · 1.28 slots ≈ 110 at 2 cards) regardless of
 *  the scale the sliders write. */
const MIX_ROW_BUDGET = 60;

/** Normalize a card's items to `{id, weight}[]` — both shapes arrive. */
function normalizeItems(raw: unknown, at: string): WeightedItem[] {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > MAX_CHIPS) {
    throw new Error(`${ID}: ${at} must hold 1-${MAX_CHIPS} items.`);
  }
  const items = raw.map((it, i) => {
    if (typeof it === "string") return { id: it, weight: NaN };
    const o = it as Partial<WeightedItem>;
    if (typeof o.id !== "string" || typeof o.weight !== "number" || !Number.isFinite(o.weight) || o.weight < 0) {
      throw new Error(`${ID}: ${at}[${i}] must be an id string or {id, weight>=0}.`);
    }
    return { id: o.id, weight: o.weight };
  });
  for (const [i, it] of items.entries()) {
    if (!SLUG.test(it.id)) {
      throw new Error(`${ID}: ${at}[${i}].id ${JSON.stringify(it.id)} must be a lowercase slug.`);
    }
  }
  const even = items.some((it) => !Number.isFinite(it.weight));
  if (even) return items.map((it) => ({ id: it.id, weight: 1 / items.length }));
  const total = items.reduce((a, it) => a + it.weight, 0);
  if (total <= 0) return items.map((it) => ({ id: it.id, weight: 1 / items.length }));
  return items.map((it) => ({ id: it.id, weight: it.weight / total }));
}

/** Parse + validate the whole prop pair. */
export function parseWeighted(
  rawMixes: WeightedCardsProps["mixes"],
  rawWeights: WeightedCardsProps["mixWeights"],
): { mixes: Array<{ label: string; items: WeightedItem[] }>; mixWeights: number[] } {
  const value = typeof rawMixes === "string" ? (JSON.parse(rawMixes) as unknown) : (rawMixes ?? DEFAULT_MIXES);
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_MIXES) {
    throw new Error(`${ID}: mixes must hold 1-${MAX_MIXES} cards.`);
  }
  const mixes = value.map((entry, i) => {
    const e = entry as Partial<WeightedMix>;
    if (typeof e.label !== "string" || e.label.length === 0 || e.label.length > 24) {
      throw new Error(`${ID}: mixes[${i}].label must be a 1-24 char string.`);
    }
    return { label: e.label, items: normalizeItems(e.itemIds, `mixes[${i}].itemIds`) };
  });
  const weights = rawWeights ?? DEFAULT_MIX_WEIGHTS;
  if (!Array.isArray(weights) || weights.length !== mixes.length) {
    throw new Error(`${ID}: mixWeights must hold one weight per mix (${mixes.length}).`);
  }
  for (const [i, w] of weights.entries()) {
    if (typeof w !== "number" || !Number.isFinite(w) || w <= 0) {
      throw new Error(`${ID}: mixWeights[${i}] must be a positive number.`);
    }
  }
  return { mixes, mixWeights: weights };
}

const propsSchema = definePropsSchema<WeightedCardsProps>({
  connectionId: {
    type: "string",
    required: false,
    description:
      "The sibling wire (lesson 76): which configured connection profile the chip pickers read.",
    meta: {
      ui: { label: "Connection", order: 1 },
    },
  },
  mixes: {
    type: "json",
    required: false,
    description:
      "Cards of chips with per-chip shares: a connectionMultiSelect column owns membership and a weights column SHARING ITS KEY owns shares — two cells, one array. Even sets round-trip as string[], customized ones as {id, weight}[].",
    meta: {
      constraints: {
        jsonSchema: {
          type: "array",
          minItems: 1,
          maxItems: MAX_MIXES,
          items: {
            type: "object",
            required: ["label", "itemIds"],
            properties: {
              label: { type: "string", minLength: 1, maxLength: 24 },
              itemIds: {
                type: "array",
                minItems: 1,
                maxItems: MAX_CHIPS,
                items: {
                  oneOf: [
                    { type: "string", pattern: "^[a-z0-9-]+$" },
                    {
                      type: "object",
                      required: ["id", "weight"],
                      properties: {
                        id: { type: "string", pattern: "^[a-z0-9-]+$" },
                        weight: { type: "number", minimum: 0 },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      control: {
        flavor: "cardList",
        columns: [
          { key: "label", kind: "text", label: "Mix", placeholder: "Feature" },
          {
            key: "itemIds",
            kind: "connectionMultiSelect",
            label: "Items",
            optionsFromConnection: { kind: ITEMS_KIND, connectionFromProp: "connectionId" },
            groupByKey: "group",
          },
          { key: "itemIds", kind: "weights", label: "Shares" },
        ],
        interWeightProp: "mixWeights",
      },
      ui: { label: "Mixes", order: 2 },
    },
  },
  mixWeights: {
    type: "number[]",
    required: false,
    description:
      "How the mixes weigh against EACH OTHER — the sibling number[] the card strip's inter-card sliders write (interWeightProp).",
    meta: {
      ui: { label: "Mix weights", order: 3 },
    },
  },
  bandColor: {
    type: "string",
    required: false,
    description: "Accent fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#2e86c1" },
      ui: { label: "Band color", order: 4 },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 5 },
    },
  },
});

/** A darker twin of a #rrggbb colour. */
function shade(hex: string): MosaicColor {
  const n = parseInt(hex.slice(1), 16);
  const dim = (v: number) => Math.max(0, Math.round(v * 0.62));
  const hh = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}` as MosaicColor;
}

const titleCase = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export const WeightedCardsV1 = defineMosaicTemplate<WeightedCardsProps>({
  id: asTemplateId(ID),
  label: "80 · Weighted Cards",
  version: 1,
  description:
    "Weights at both depths: a weights column SHARING the multi-select's key gives every card an auto-balancing share group over its own chips (two cells, one array — even sets round-trip as string[], customized as {id,weight}[]), and interWeightProp names a sibling number[] the strip drags to weigh the CARDS against each other. Render is the values wearing rectangles: row heights from mixWeights, chip widths from item shares.",
  capabilities: { tier: "core" },
  tags: ["controls", "connections", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Drag a card's Shares — chips resize. Drag the inter-card strip — rows resize. The default carries BOTH value shapes on purpose.",
  },

  propsSchema,
  defaultProps: {
    connectionId: "starter-catalog@default",
    mixes: DEFAULT_MIXES,
    mixWeights: DEFAULT_MIX_WEIGHTS,
    bandColor: "#2e86c1",
    pageColor: "#1c2833",
  },

  async render(
    props: WeightedCardsProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    for (const [key, value] of [
      ["bandColor", props.bandColor],
      ["pageColor", props.pageColor],
    ] as const) {
      if (value !== undefined && !HEX.test(value)) {
        throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
      }
    }
    const { mixes, mixWeights } = parseWeighted(props.mixes, props.mixWeights);
    const { width, height } = ctx.target;
    const bandHex = props.bandColor ?? "#2e86c1";
    const band = bandHex as MosaicColor;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // Rows sized by mixWeights; within each row, a label plate then chips
    // sized by each item's normalized share (Hamilton onto 100 slots).
    const mixRow = (m: { label: string; items: WeightedItem[] }) => {
      const chips = String(weightedSplit(
        m.items.map((it) => Math.max(1, Math.round(it.weight * 100))),
        "col",
        { precision: 100, claimants: m.items.map(() => "1{1}") },
      ));
      return String(weightedSplit([4, 18, 2, 72, 4], "col", {
        mode: "literal",
        claimants: ["-", "1{1}", "-", chips, "-"],
      }));
    };
    // Rows sized by mixWeights — NORMALIZED onto a fixed slot budget. The
    // inter-card sliders write whatever scale they like (2:1, 58:42, 320:680);
    // scaling the raw numbers straight into slots made the row split's total
    // track the slider's scale, and a total like 1303 (a prime — no GCD
    // relief) pinned the layout's safe minimum to 1303px TALL: below it, at
    // the template's own 720p hint, cells fell under 1px and were culled.
    // A budget keeps the precision floor constant whatever the values are.
    const totalMixW = mixWeights.reduce((a, b) => a + b, 0);
    const rowWeights = [10, ...mixes.flatMap((_, i) => [Math.max(1, Math.round((mixWeights[i] / totalMixW) * MIX_ROW_BUDGET)), 4])];
    const rowClaimants = ["-", ...mixes.flatMap((m) => [mixRow(m), "-"])];
    // Reserve the caption strip's fifth: relative weights make the exact
    // remainder unimportant, only the reservation matters.
    rowWeights.push(Math.round(rowWeights.reduce((a, b) => a + b, 0) * 0.28));
    rowClaimants.push("-");
    const rows = String(weightedSplit(rowWeights, "row", { mode: "literal", claimants: rowClaimants }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const sources: MosaicSource[] = [];
    for (const [i, m] of mixes.entries()) {
      sources.push(makeColorTile(band));
      sources.push(
        svgLabel(`${m.label} ${Math.round((mixWeights[i] / totalMixW) * 100)}%`, width * 0.16, height * 0.16, {
          color: "#eaeef2" as MosaicColor,
          maxPx: Math.round(height * 0.026),
          maxLines: 2,
          vAlign: "middle",
        }),
      );
      for (const [j, it] of m.items.entries()) {
        // Alternate chip tones so adjacent shares stay tellable-apart.
        sources.push(makeColorTile(j % 2 === 0 ? shade(bandHex) : shade(String(shade(bandHex)))));
        sources.push(
          svgLabel(`${titleCase(it.id)} ${Math.round(it.weight * 100)}%`, width * 0.7 * it.weight, height * 0.16, {
            color: "#b9c4cf" as MosaicColor,
            maxPx: Math.round(height * 0.02),
            maxLines: 3,
            vAlign: "middle",
          }),
        );
      }
    }

    const heading = fitSvgText(
      "WEIGHTED CARDS - shares inside each card, and cards against each other",
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.032), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        'a weights column SHARES the multi-select\'s key - two cells, one array; even -> string[], customized -> {id, weight}[]',
        `interWeightProp "mixWeights" - a sibling number[] for the cards themselves; rows and chips here ARE those values`,
      ],
      width * 0.9,
      height * 0.09,
      { maxPx: Math.round(height * 0.026), widthFrac: 0.92 },
    );
    sources.push(
      svgTextSource([
        {
          text: heading.text,
          fontSize: heading.fontSize,
          color: "#eaeef2" as MosaicColor,
          vAlign: "top",
          padding: { top: 0.08 },
        },
        {
          text: readout.text,
          fontSize: readout.fontSize,
          color: "#7f8c9b" as MosaicColor,
          vAlign: "bottom",
          padding: { bottom: 0.12 },
        },
      ]),
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: page,
      sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Weighted Cards",
    lines: [
      "A weights column sharing the multi-select's key: two cells, one array. The picker owns membership, the sliders own shares.",
      "The value shape follows the interaction - even sets stay string[], customized ones become {id, weight}[]. Accept both at render.",
      "interWeightProp points at a sibling number[] weighing the CARDS against each other - the same sibling-wire idea as connectionId.",
    ],
    explore: [
      "Drag a card's Shares - chips resize below",
      "Drag the inter-card strip - whole rows resize",
    ],
  }),
});

export default WeightedCardsV1;
