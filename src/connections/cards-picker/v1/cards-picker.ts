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
 * `@m0saic-starter/connections/cards-picker/v1` — pick upstream results by
 * their ARTWORK, not their ids.
 *
 * ONE CONCEPT: `picker: "cards"`. A `string[]` prop with
 * `optionsFromConnection` gets, instead of a text multi-select, an expanded
 * picker modal that renders each option as an image card. Three declarations
 * make it work, all on the template side:
 *
 *  - `picker: "cards"` — ask for the artwork grid. The modal falls back to
 *    the text list when options carry no images, so it is always safe.
 *  - `cardAspect` / `cardFit` — the card SHAPE and object-fit are properties
 *    of the CONNECTION KIND being queried (catalog stills are wide 16:9 and
 *    crop-tolerant, so "wide" + "cover"; a portrait or logo source would
 *    declare "tall" or "square" + "contain").
 *  - the pack registers a companion IMAGES fetcher
 *    (`registerConnectionOptionImagesFetcher`) for the same kind: heavy art
 *    never rides the options list — the editor resolves it LAZILY, one
 *    visible page at a time, by option value, as data URIs.
 *
 * RENDER NEVER FETCHES ART. At render this prop is a plain `string[]`; the
 * posters drawn here are deterministic stand-ins keyed by id. The real
 * artwork's only job was making the PICK rich.
 */

export type CardsPickerProps = {
  /** Which configured connection profile the picker reads. */
  connectionId?: string;
  /** Catalog item ids — picked from the artwork grid at edit time. */
  itemIds?: string[];
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9-]+$/;
const ID = "@m0saic-starter/connections/cards-picker/v1";
const MAX_ITEMS = 6;

/** Deterministic poster palette — id hash picks a stable pair. */
const POSTERS: ReadonlyArray<[MosaicColor, MosaicColor]> = [
  ["#2e86c1" as MosaicColor, "#1b4f72" as MosaicColor],
  ["#28b463" as MosaicColor, "#186a3b" as MosaicColor],
  ["#ca6f1e" as MosaicColor, "#784212" as MosaicColor],
  ["#884ea0" as MosaicColor, "#4a235a" as MosaicColor],
  ["#c0392b" as MosaicColor, "#641e16" as MosaicColor],
  ["#17a589" as MosaicColor, "#0b5345" as MosaicColor],
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const titleCase = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const propsSchema = definePropsSchema<CardsPickerProps>({
  connectionId: {
    type: "string",
    required: false,
    description:
      "The sibling wire (lesson 76): which configured connection profile the artwork picker resolves against.",
    meta: {
      ui: { label: "Connection", order: 1 },
    },
  },
  itemIds: {
    type: "string[]",
    required: false,
    description:
      "Catalog items to feature, picked by artwork. The expanded picker renders wide cover-fit cards with art resolved lazily from the connection; without images it degrades to a text list.",
    meta: {
      constraints: { minItems: 1, maxItems: MAX_ITEMS },
      control: {
        picker: "cards",
        cardAspect: "wide",
        cardFit: "cover",
        optionsFromConnection: { kind: ITEMS_KIND, connectionFromProp: "connectionId" },
      },
      ui: { label: "Items", order: 2 },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 3 },
    },
  },
});

export const CardsPickerV1 = defineMosaicTemplate<CardsPickerProps>({
  id: asTemplateId(ID),
  label: "77 · Cards Picker",
  version: 1,
  description:
    "Pick upstream results by their artwork: picker \"cards\" turns a string[] prop's connection-backed multi-select into an image-card grid. cardAspect and cardFit are declared by the template because they are properties of the connection kind being queried (wide cover-fit for catalog stills); the heavy art itself rides a companion images fetcher, resolved lazily per visible page as data URIs, never inlined into the options list. At render the prop is a plain string[] — the artwork's only job was making the pick rich.",
  capabilities: { tier: "core" },
  tags: ["connections", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Open the Items picker with the example server running — an artwork grid, sectioned and searchable. Kill the server: same picker, text rows.",
  },

  propsSchema,
  defaultProps: {
    connectionId: "starter-catalog@default",
    itemIds: ["big-buck-bunny", "sunrise-timelapse", "ember-glow"],
    pageColor: "#1c2833",
  },

  async render(
    props: CardsPickerProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
    }
    const itemIds = props.itemIds ?? ["big-buck-bunny", "sunrise-timelapse", "ember-glow"];
    if (!Array.isArray(itemIds) || itemIds.length < 1 || itemIds.length > MAX_ITEMS) {
      throw new Error(`${ID}: itemIds must hold 1-${MAX_ITEMS} ids.`);
    }
    for (const id of itemIds) {
      if (typeof id !== "string" || !SLUG.test(id)) {
        throw new Error(`${ID}: itemIds entry ${JSON.stringify(id)} must be a lowercase slug.`);
      }
    }
    const { width, height } = ctx.target;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // A shelf of wide poster cards — one per picked id, deterministic
    // stand-in art (hash -> palette pair), title strip on each card.
    const n = itemIds.length;
    const cardW = Math.floor((100 - 4 * (n + 1)) / n);
    const pad = Math.floor((100 - n * cardW - 4 * (n - 1)) / 2);
    const card = String(weightedSplit([72, 28], "row", {
      mode: "literal",
      claimants: ["1", "1{1}"],
    }));
    const weights = [pad, ...Array.from({ length: n - 1 }, () => [cardW, 4]).flat(), cardW, 100 - pad - n * cardW - 4 * (n - 1)];
    const claimants = ["-", ...Array.from({ length: n - 1 }, () => [card, "-"]).flat(), card, "-"];
    const shelf = String(weightedSplit(weights, "col", { mode: "literal", claimants }));
    const rows = String(weightedSplit([16, 48, 36], "row", {
      mode: "literal",
      claimants: ["-", shelf, "-"],
    }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const sources: MosaicSource[] = [];
    for (const id of itemIds) {
      const [art, strip] = POSTERS[hash(id) % POSTERS.length];
      sources.push(makeColorTile(art), makeColorTile(strip));
      sources.push(
        svgLabel(titleCase(id), (width * 0.86) / n, height * 0.12, {
          color: "#eaeef2" as MosaicColor,
          maxPx: Math.round(height * 0.026),
          maxLines: 2,
          vAlign: "middle",
        }),
      );
    }

    const heading = fitSvgText(
      `CARDS PICKER - ${n} item${n === 1 ? "" : "s"} picked by artwork, rendered from plain ids`,
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.034), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        `picker "cards" + cardAspect "wide" + cardFit "cover" - shape and fit belong to the CONNECTION KIND (${ITEMS_KIND})`,
        "art rides the companion images fetcher: lazy, per visible page, data URIs - options stay light; no images -> text list",
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
    title: "Cards Picker",
    lines: [
      "picker \"cards\" turns a connection-backed string[] multi-select into an artwork grid; without images it degrades to the text list.",
      "cardAspect and cardFit are the template's call because they describe the CONNECTION KIND: wide cover-fit stills here; logos would be contain.",
      "Heavy art never rides the options list - a companion images fetcher resolves it lazily, per visible page, as data URIs keyed by value.",
    ],
    explore: [
      "Open the Items picker with the server on - artwork grid",
      "Pick 6, pick 1 - the shelf re-lays out from the plain ids",
    ],
  }),
});

export default CardsPickerV1;
