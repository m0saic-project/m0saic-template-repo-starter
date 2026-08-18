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
 * `@m0saic-starter/connections/multi-select/v1` — cards of chips, each chip
 * a rich pick from the connection.
 *
 * ONE CONCEPT: the `connectionMultiSelect` CELL. A `json` prop with
 * `flavor: "cardList"` renders as a repeating card editor; a column of
 * `kind: "connectionMultiSelect"` gives every card a chips row backed by
 * the SAME options machinery as lessons 72/73 — plus one new knob:
 * `groupByKey: "group"` sections the picker modal by an option field, so
 * the 12 catalog items arrive grouped under Shorts / Features / Loops
 * (options without the key fall into "Other").
 *
 * The VALUE is boring on purpose: `Array<{ label, itemIds }>` — plain JSON.
 * The editor machinery (cards, chips, grouped modal, live options) exists
 * entirely at EDIT time; render parses the same JSON it would get from a
 * text editor, validates it, and draws. A template never knows whether its
 * props were picked from a rich modal or typed by hand — that symmetry is
 * what keeps CLI renders and app renders identical.
 */

export type MixEntry = { label: string; itemIds: string[] };

export type MultiSelectProps = {
  /** Which configured connection profile the chip pickers read. */
  connectionId?: string;
  /** The mixes: each card a label + connection-picked item chips. */
  mixes?: MixEntry[] | string;
  /** Accent fill (#rrggbb). */
  bandColor?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9-]+$/;
const ID = "@m0saic-starter/connections/multi-select/v1";
const MAX_MIXES = 4;
const MAX_CHIPS = 6;

const DEFAULT_MIXES: MixEntry[] = [
  { label: "Opening", itemIds: ["sunrise-timelapse", "big-buck-bunny"] },
  { label: "Ambient", itemIds: ["ember-glow", "soft-gradient", "ink-in-water"] },
];

/** A darker twin of a #rrggbb colour. */
function shade(hex: string): MosaicColor {
  const n = parseInt(hex.slice(1), 16);
  const dim = (v: number) => Math.max(0, Math.round(v * 0.62));
  const hh = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}` as MosaicColor;
}

const titleCase = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/** Parse + validate the prop (editors may deliver a JSON string). */
export function parseMixes(raw: MultiSelectProps["mixes"]): MixEntry[] {
  const value = typeof raw === "string" ? (JSON.parse(raw) as unknown) : (raw ?? DEFAULT_MIXES);
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_MIXES) {
    throw new Error(`${ID}: mixes must hold 1-${MAX_MIXES} entries.`);
  }
  return value.map((entry, i) => {
    const e = entry as Partial<MixEntry>;
    if (typeof e.label !== "string" || e.label.length === 0 || e.label.length > 24) {
      throw new Error(`${ID}: mixes[${i}].label must be a 1-24 char string.`);
    }
    if (!Array.isArray(e.itemIds) || e.itemIds.length < 1 || e.itemIds.length > MAX_CHIPS) {
      throw new Error(`${ID}: mixes[${i}].itemIds must hold 1-${MAX_CHIPS} ids.`);
    }
    for (const id of e.itemIds) {
      if (typeof id !== "string" || !SLUG.test(id)) {
        throw new Error(`${ID}: mixes[${i}] id ${JSON.stringify(id)} must be a lowercase slug.`);
      }
    }
    return { label: e.label, itemIds: [...e.itemIds] };
  });
}

const propsSchema = definePropsSchema<MultiSelectProps>({
  connectionId: {
    type: "string",
    required: false,
    description:
      "The sibling wire (lesson 72): which configured connection profile every card's chip picker resolves against.",
    meta: {
      ui: { label: "Connection", order: 1 },
    },
  },
  mixes: {
    type: "json",
    required: false,
    description:
      "The mixes: repeating cards, each a label plus catalog items picked as chips from the grouped connection modal. Plain JSON at render — Array<{label, itemIds}>.",
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
                items: { type: "string", pattern: "^[a-z0-9-]+$" },
              },
            },
          },
        },
      },
      control: {
        flavor: "cardList",
        columns: [
          { key: "label", kind: "text", label: "Mix", placeholder: "Opening" },
          {
            key: "itemIds",
            kind: "connectionMultiSelect",
            label: "Items",
            optionsFromConnection: { kind: ITEMS_KIND, connectionFromProp: "connectionId" },
            groupByKey: "group",
          },
        ],
      },
      ui: { label: "Mixes", order: 2 },
    },
  },
  bandColor: {
    type: "string",
    required: false,
    description: "Accent fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#2e86c1" },
      ui: { label: "Band color", order: 3 },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 4 },
    },
  },
});

export const MultiSelectV1 = defineMosaicTemplate<MultiSelectProps>({
  id: asTemplateId(ID),
  label: "74 · Connection Multi-Select",
  version: 1,
  description:
    "Cards of chips, each chip a rich pick: a json prop with flavor cardList renders as a repeating card editor, and a connectionMultiSelect column gives every card a chips row backed by the connection's options — with groupByKey sectioning the picker modal by an option field (the catalog's collections). The value stays boring on purpose: plain Array<{label, itemIds}> JSON, identical whether it was picked from the modal or typed by hand — which is exactly why CLI and app renders agree.",
  capabilities: { tier: "core" },
  tags: ["connections", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Edit Mixes: add a card, open its Items chips — the modal arrives sectioned Shorts / Features / Loops via groupByKey.",
  },

  propsSchema,
  defaultProps: {
    connectionId: "starter-catalog@default",
    mixes: DEFAULT_MIXES,
    bandColor: "#2e86c1",
    pageColor: "#1c2833",
  },

  async render(
    props: MultiSelectProps,
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
    const mixes = parseMixes(props.mixes);
    const { width, height } = ctx.target;
    const bandHex = props.bandColor ?? "#2e86c1";
    const band = bandHex as MosaicColor;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // One row per mix: label plate, then a chip per picked item.
    const mixRow = (m: MixEntry) => {
      // 4 pad + 20 label + 4 gap = 28; the chips share the remaining 72,
      // each chip followed by a 2-slot gap.
      const chips = m.itemIds;
      const chipW = Math.floor(72 / chips.length) - 2;
      const weights = [4, 20, 4, ...chips.flatMap(() => [chipW, 2])];
      const claimants = ["-", "1{1}", "-", ...chips.flatMap(() => ["1{1}", "-"])];
      const rem = 100 - weights.reduce((a, b) => a + b, 0);
      if (rem > 0) {
        weights.push(rem);
        claimants.push("-");
      }
      return String(weightedSplit(weights, "col", { mode: "literal", claimants }));
    };
    const bandWeights = [8, ...mixes.flatMap(() => [Math.floor(64 / mixes.length), 6])];
    const bandClaimants = ["-", ...mixes.flatMap((m) => [mixRow(m), "-"])];
    bandWeights.push(100 - bandWeights.reduce((a, b) => a + b, 0));
    bandClaimants.push("-");
    const rows = String(weightedSplit(bandWeights, "row", { mode: "literal", claimants: bandClaimants }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const rowH = (height * 0.64) / mixes.length;
    const sources: MosaicSource[] = [];
    for (const m of mixes) {
      sources.push(makeColorTile(band));
      sources.push(
        svgLabel(m.label, width * 0.18, rowH, {
          color: "#eaeef2" as MosaicColor,
          maxPx: Math.round(height * 0.036),
          vAlign: "middle",
        }),
      );
      for (const id of m.itemIds) {
        sources.push(makeColorTile(shade(bandHex)));
        sources.push(
          svgLabel(titleCase(id), width * 0.1, rowH, {
            color: "#b9c4cf" as MosaicColor,
            maxPx: Math.round(height * 0.02),
            maxLines: 3,
            vAlign: "middle",
          }),
        );
      }
    }

    const chipCount = mixes.reduce((a, m) => a + m.itemIds.length, 0);
    const heading = fitSvgText(
      `CONNECTION MULTI-SELECT - ${mixes.length} card${mixes.length === 1 ? "" : "s"}, ${chipCount} chips, one boring JSON value`,
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.034), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        `flavor cardList + a connectionMultiSelect column (kind "${ITEMS_KIND}") - groupByKey "group" sections the modal by collection`,
        "render parses the same JSON a text editor would produce - rich picking is edit-time sugar, not a render dependency",
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
    title: "Connection Multi-Select",
    lines: [
      "flavor cardList renders a json prop as repeating cards; a connectionMultiSelect column gives each card chips backed by the connection's options.",
      "groupByKey names an option field to section the picker modal by - the catalog's items arrive grouped under their collections.",
      "The value is plain Array<{label, itemIds}> JSON either way. Rich picking is edit-time sugar; render sees what a text editor would send.",
    ],
    explore: [
      "Add a card, open its chips - the modal is sectioned by collection",
      "Paste the same JSON by hand - identical render",
    ],
  }),
});

export default MultiSelectV1;
