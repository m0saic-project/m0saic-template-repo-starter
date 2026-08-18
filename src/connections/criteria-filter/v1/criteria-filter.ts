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
import { COLLECTIONS_KIND } from "../../fetchers";

/**
 * `@m0saic-starter/connections/criteria-filter/v1` — a QUERY as a prop: the
 * rich filter builder.
 *
 * ONE CONCEPT: `flavor: "criteriaFilter"` + the `criteria` CATALOG. Some
 * templates don't want a hand-picked list — they want a QUERY the upstream
 * can answer ("shorts under a minute mentioning drones"). The catalog
 * declares which criteria exist and what kind each is (search / text /
 * number / date / boolean / idSet), which modifiers each allows, and — for
 * idSet — where its options come from: the SAME `optionsFromConnection`
 * machinery as every other picker in this chapter, resolved through the
 * `connectionId` sibling wire.
 *
 * The editor renders entries by KIND only; keys and labels are opaque
 * strings, so the control works for ANY catalog. The VALUE is a flat
 * object, one entry per criterion the user set — absent key means unset
 * (never write empty placeholders) — and every set criterion ANDs
 * together: no nesting, no OR, no groups, by design.
 *
 * Value shapes, per kind (the parse below is the reference):
 *   search  → "drone"
 *   number  → { modifier, value, value2? }   (value2 rides BETWEEN only)
 *   idSet   → { modifier, value: ["shorts"], excludes?, depth? }
 *   boolean → true | false
 *
 * Render draws the saved-search card the value IS — one row per set
 * criterion, in catalog order, with the empty query as the working base
 * case ("matching everything"). Whether anything EXECUTES the query is a
 * data-chapter concern; the prop's job is carrying intent precisely.
 */

export type CriteriaFilterValue = {
  search?: string;
  collections?: { modifier: string; value: string[]; excludes?: string[]; depth?: number };
  duration?: { modifier: string; value: number; value2?: number };
  featured?: boolean;
};

export type CriteriaFilterProps = {
  /** Which configured connection profile the idSet picker reads. */
  connectionId?: string;
  /** The query — a flat AND of set criteria. */
  filter?: CriteriaFilterValue | string;
  /** Accent fill (#rrggbb). */
  bandColor?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9-]+$/;
const ID = "@m0saic-starter/connections/criteria-filter/v1";

const NUMBER_MODIFIERS = ["GREATER_THAN", "LESS_THAN", "BETWEEN"];
const IDSET_MODIFIERS = ["INCLUDES", "EXCLUDES"];

const DEFAULT_FILTER: CriteriaFilterValue = {
  search: "drone",
  collections: { modifier: "INCLUDES", value: ["shorts"] },
  duration: { modifier: "LESS_THAN", value: 60 },
};

/** Validate the flat AND-object; absent keys are UNSET, never placeholders. */
export function parseFilter(raw: CriteriaFilterProps["filter"]): CriteriaFilterValue {
  const value = typeof raw === "string" ? (JSON.parse(raw) as unknown) : (raw ?? DEFAULT_FILTER);
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${ID}: filter must be a flat object of set criteria.`);
  }
  const v = value as Record<string, unknown>;
  const known = new Set(["search", "collections", "duration", "featured"]);
  for (const key of Object.keys(v)) {
    if (!known.has(key)) {
      throw new Error(`${ID}: filter.${key} is not in this template's criteria catalog.`);
    }
  }
  const out: CriteriaFilterValue = {};
  if (v.search !== undefined) {
    if (typeof v.search !== "string" || v.search.length === 0 || v.search.length > 60) {
      throw new Error(`${ID}: filter.search must be a 1-60 char string.`);
    }
    out.search = v.search;
  }
  if (v.collections !== undefined) {
    const c = v.collections as Partial<NonNullable<CriteriaFilterValue["collections"]>>;
    if (typeof c !== "object" || c === null || !IDSET_MODIFIERS.includes(c.modifier as string)) {
      throw new Error(`${ID}: filter.collections.modifier must be one of ${IDSET_MODIFIERS.join(", ")}.`);
    }
    if (!Array.isArray(c.value) || c.value.length === 0 || !c.value.every((s) => typeof s === "string" && SLUG.test(s))) {
      throw new Error(`${ID}: filter.collections.value must be a non-empty array of slugs.`);
    }
    out.collections = { modifier: c.modifier as string, value: [...(c.value as string[])] };
  }
  if (v.duration !== undefined) {
    const d = v.duration as Partial<NonNullable<CriteriaFilterValue["duration"]>>;
    if (typeof d !== "object" || d === null || !NUMBER_MODIFIERS.includes(d.modifier as string)) {
      throw new Error(`${ID}: filter.duration.modifier must be one of ${NUMBER_MODIFIERS.join(", ")}.`);
    }
    if (typeof d.value !== "number" || !Number.isFinite(d.value) || d.value < 0 || d.value > 600) {
      throw new Error(`${ID}: filter.duration.value must be a number in [0, 600].`);
    }
    if (d.modifier === "BETWEEN") {
      if (typeof d.value2 !== "number" || !Number.isFinite(d.value2) || d.value2 < d.value || d.value2 > 600) {
        throw new Error(`${ID}: filter.duration.value2 must be a number in [value, 600] for BETWEEN.`);
      }
      out.duration = { modifier: d.modifier, value: d.value, value2: d.value2 };
    } else {
      if (d.value2 !== undefined) {
        throw new Error(`${ID}: filter.duration.value2 only rides BETWEEN.`);
      }
      out.duration = { modifier: d.modifier as string, value: d.value };
    }
  }
  if (v.featured !== undefined) {
    if (typeof v.featured !== "boolean") {
      throw new Error(`${ID}: filter.featured must be a boolean.`);
    }
    out.featured = v.featured;
  }
  return out;
}

const propsSchema = definePropsSchema<CriteriaFilterProps>({
  connectionId: {
    type: "string",
    required: false,
    description:
      "The sibling wire (lesson 75): which configured connection profile the Collections idSet picker reads.",
    meta: {
      ui: { label: "Connection", order: 1 },
    },
  },
  filter: {
    type: "json",
    required: false,
    description:
      "The query: a flat AND of set criteria — absent key means unset. search (text), collections (idSet from the connection), duration in seconds (number with modifiers), featured (boolean).",
    meta: {
      control: {
        flavor: "criteriaFilter",
        criteria: [
          { key: "search", label: "Search", kind: "search" },
          {
            key: "collections",
            label: "Collections",
            kind: "idSet",
            modifiers: IDSET_MODIFIERS,
            optionsFromConnection: { kind: COLLECTIONS_KIND, connectionFromProp: "connectionId" },
          },
          {
            key: "duration",
            label: "Duration (s)",
            kind: "number",
            modifiers: NUMBER_MODIFIERS,
            min: 0,
            max: 600,
          },
          { key: "featured", label: "Featured", kind: "boolean" },
        ],
      },
      ui: { label: "Filter", order: 2 },
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

/** A darker twin of a #rrggbb colour. */
function shade(hex: string): MosaicColor {
  const n = parseInt(hex.slice(1), 16);
  const dim = (v: number) => Math.max(0, Math.round(v * 0.62));
  const hh = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}` as MosaicColor;
}

const titleCase = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/** One human-readable clause per SET criterion, in catalog order. */
export function describeFilter(f: CriteriaFilterValue): Array<{ label: string; clause: string }> {
  const rows: Array<{ label: string; clause: string }> = [];
  if (f.search !== undefined) rows.push({ label: "Search", clause: `"${f.search}"` });
  if (f.collections !== undefined) {
    rows.push({
      label: "Collections",
      clause: `${f.collections.modifier.toLowerCase()} ${f.collections.value.map(titleCase).join(", ")}`,
    });
  }
  if (f.duration !== undefined) {
    const d = f.duration;
    rows.push({
      label: "Duration",
      clause:
        d.modifier === "BETWEEN"
          ? `between ${d.value}s and ${d.value2}s`
          : `${d.modifier === "GREATER_THAN" ? "over" : "under"} ${d.value}s`,
    });
  }
  if (f.featured !== undefined) rows.push({ label: "Featured", clause: f.featured ? "yes" : "no" });
  return rows;
}

export const CriteriaFilterV1 = defineMosaicTemplate<CriteriaFilterProps>({
  id: asTemplateId(ID),
  label: "78 · Criteria Filter",
  version: 1,
  description:
    "A query as a prop: flavor criteriaFilter + a criteria catalog declares which criteria exist (search / number / boolean / idSet with modifiers), and the editor renders the filter builder by KIND — keys and labels stay opaque, so the control works for any catalog. The idSet's options ride the same optionsFromConnection machinery as the chapter's other pickers, through the connectionId wire. The value is a flat AND-object, absent key = unset, drawn here as the saved-search card it is — carrying intent precisely is the prop's whole job; executing the query belongs to the data chapter.",
  capabilities: { tier: "core" },
  tags: ["connections", "controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Open Filter: set Search, pick Collections from the live connection, give Duration a modifier. Unset everything — the card says 'matching everything'.",
  },

  propsSchema,
  defaultProps: {
    connectionId: "starter-catalog@default",
    filter: DEFAULT_FILTER,
    bandColor: "#2e86c1",
    pageColor: "#1c2833",
  },

  async render(
    props: CriteriaFilterProps,
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
    const filter = parseFilter(props.filter);
    const rows = describeFilter(filter);
    const { width, height } = ctx.target;
    const bandHex = props.bandColor ?? "#2e86c1";
    const band = bandHex as MosaicColor;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // The saved-search card: title, then one clause row per SET criterion
    // (chip + label + clause), or the base-case row for the empty query.
    const clauseRow = String(weightedSplit([5, 3, 2, 24, 2, 58, 6], "col", {
      mode: "literal",
      claimants: ["-", "1", "-", "1", "-", "1", "-"],
    }));
    const titleRow = String(weightedSplit([5, 90, 5], "col", {
      mode: "literal",
      claimants: ["-", "1", "-"],
    }));
    const shown = rows.length > 0 ? rows : [{ label: "No criteria set", clause: "matching everything" }];
    const rowH = 12;
    const cardRows = String(weightedSplit(
      [6, 12, 4, ...shown.flatMap(() => [rowH, 2]), 100 - 6 - 12 - 4 - shown.length * (rowH + 2)],
      "row",
      { mode: "literal", claimants: ["-", titleRow, "-", ...shown.flatMap(() => [clauseRow, "-"]), "-"] },
    ));
    const stage = String(weightedSplit([12, 76, 12], "col", {
      mode: "literal",
      claimants: ["-", `1{${cardRows}}`, "-"],
    }));
    const outer = String(weightedSplit([6, 68, 26], "row", {
      mode: "literal",
      claimants: ["-", stage, "-"],
    }));
    const m0 = toM0String(`${outer}{6[-,-,-,-,-,1]}`, ID);

    const sources: MosaicSource[] = [];
    sources.push(makeColorTile("#10161d" as MosaicColor)); // card bg
    sources.push(
      svgLabel(`CATALOG QUERY - ${rows.length} criteri${rows.length === 1 ? "on" : "a"} AND-ed`, width * 0.6, height * 0.07, {
        color: "#eaeef2" as MosaicColor,
        maxPx: Math.round(height * 0.028),
        vAlign: "middle",
      }),
    );
    for (const row of shown) {
      sources.push(makeColorTile(rows.length > 0 ? band : shade(bandHex)));
      sources.push(
        svgLabel(row.label, width * 0.17, height * 0.08, {
          color: "#b9c4cf" as MosaicColor,
          maxPx: Math.round(height * 0.024),
          vAlign: "middle",
        }),
      );
      sources.push(
        svgLabel(row.clause, width * 0.4, height * 0.08, {
          color: "#eaeef2" as MosaicColor,
          maxPx: Math.round(height * 0.026),
          vAlign: "middle",
        }),
      );
    }

    const heading = fitSvgText(
      "CRITERIA FILTER - a query the upstream can answer, carried as a flat AND",
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.032), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        "the catalog declares kinds + modifiers; the editor renders by KIND, so the control works for any catalog",
        "absent key = unset (never a placeholder); idSet options ride optionsFromConnection through the connectionId wire",
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
    title: "Criteria Filter",
    lines: [
      "flavor criteriaFilter + a criteria catalog: the template declares kinds and modifiers; the editor renders the query builder by KIND.",
      "The value is a flat AND - one entry per SET criterion, absent means unset, no nesting and no OR by design.",
      "idSet criteria fetch options through the same connectionId wire as every picker here. Executing the query is someone else's lesson.",
    ],
    explore: [
      "Set Search + Collections + a Duration modifier - read the card",
      "Unset everything - the empty query is a working state",
    ],
  }),
});

export default CriteriaFilterV1;
