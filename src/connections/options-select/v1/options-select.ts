import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  bindProp,
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  svgLabel,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";
import { CATALOG_CONNECTION_ID } from "../../connection";
import { COLLECTIONS_KIND } from "../../fetchers";

/**
 * `@m0saic-starter/connections/options-select/v1` — a picker whose values
 * live in someone else's backend, and the WIRE that connects them.
 *
 * ONE CONCEPT: `optionsFromConnection` + the `connectionId` sibling prop.
 * The `collections` prop's valid values aren't known at publish time — they
 * are whatever the configured catalog holds. Two declarations close the
 * circuit:
 *
 *   optionsFromConnection: { kind: "starter-catalog-collections",
 *                            connectionFromProp: "connectionId" }
 *   connectionId: "starter-catalog@default"     // a plain sibling prop
 *
 * At edit time the control reads the connection id FROM THE SIBLING PROP,
 * calls the host's fetchOptions IPC with `{ kind, connectionId }`, and the
 * host runs the pack-registered fetcher with that connection's values and
 * secrets. The sibling wire is the whole resolution story — no id in the
 * sibling, no fetch, and the control tells you so. It is a normal prop:
 * users with several profiles of the same backend switch by editing it,
 * and it travels inside saved .mosaic files like everything else.
 *
 * Scope honesty, measured against the app (2026-08-17): connection-backed
 * options dispatch for `string[]` props, cardList columns, and criteria
 * filters — a lone `string` single-select does not fetch, and the static
 * `options` list is not yet swapped in when a fetch fails (the control
 * surfaces its error instead). The type docs describe both as intended;
 * the drift is filed as a monorepo candidate. This lesson teaches the
 * surface that exists.
 *
 * RENDER NEVER FETCHES. By render time `collections` is a plain string[]
 * like any other — the connection only made PICKING it richer.
 */

export type OptionsSelectProps = {
  /** Which configured connection profile the picker reads. */
  connectionId?: string;
  /** Catalog collection ids — options fetched from the connection at edit time. */
  collections?: string[];
  /** Accent fill (#rrggbb). */
  bandColor?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9-]+$/;
const CONNECTION_ID = /^[a-z0-9-]+@[a-z0-9-]+$/;
const ID = "@m0saic-starter/connections/options-select/v1";
const MAX_PICKS = 3;

/** A darker twin of a #rrggbb colour. */
function shade(hex: string): MosaicColor {
  const n = parseInt(hex.slice(1), 16);
  const dim = (v: number) => Math.max(0, Math.round(v * 0.62));
  const hh = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}` as MosaicColor;
}

const titleCase = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const propsSchema = definePropsSchema<OptionsSelectProps>({
  connectionId: {
    type: "string",
    required: false,
    description:
      "The sibling wire: which configured connection profile the picker resolves against. Every connection-backed control on this template reads it; switch profiles by editing one prop.",
    meta: {
      ui: { label: "Connection", order: 1 },
    },
  },
  collections: {
    type: "string[]",
    required: false,
    description:
      "Catalog collections to feature. Options are fetched live from the connection at edit time via the fetcher kind + the connectionId sibling; at render this is a plain string[].",
    meta: {
      constraints: { minItems: 1, maxItems: MAX_PICKS },
      control: {
        optionsFromConnection: {
          kind: COLLECTIONS_KIND,
          connectionFromProp: "connectionId",
        },
      },
      ui: { label: "Collections", order: 2 },
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

export const OptionsSelectV1 = defineMosaicTemplate<OptionsSelectProps>({
  id: asTemplateId(ID),
  label: "76 · Options From a Connection",
  version: 1,
  description:
    "A picker whose values live in the upstream backend, and the wire that connects them: optionsFromConnection names a registered fetcher kind, and connectionFromProp names the SIBLING PROP holding the connection id. The control reads the sibling, calls the host IPC, and fills with live rows — no id in the sibling, no fetch, and the control says so. The sibling is a normal prop: switch profiles by editing it, and it travels in saved files. Render never fetches: by then the value is a plain string[].",
  capabilities: { tier: "core" },
  tags: ["connections", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "With the example server running, open Collections — live rows with item counts, resolved through the connectionId sibling. Blank the Connection prop and watch the control explain itself.",
  },

  propsSchema,
  defaultProps: {
    connectionId: String(CATALOG_CONNECTION_ID),
    collections: ["shorts"],
    bandColor: "#2e86c1",
    pageColor: "#1c2833",
  },

  async render(
    props: OptionsSelectProps,
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
    const connectionId = props.connectionId ?? String(CATALOG_CONNECTION_ID);
    if (!CONNECTION_ID.test(connectionId)) {
      throw new Error(
        `${ID}: connectionId ${JSON.stringify(connectionId)} must be '<publisher>@<profile>'.`,
      );
    }
    const collections = props.collections ?? ["shorts"];
    if (!Array.isArray(collections) || collections.length < 1 || collections.length > MAX_PICKS) {
      throw new Error(`${ID}: collections must hold 1-${MAX_PICKS} ids.`);
    }
    for (const c of collections) {
      if (typeof c !== "string" || !SLUG.test(c)) {
        throw new Error(`${ID}: collections entry ${JSON.stringify(c)} must be a lowercase slug.`);
      }
    }
    const { width, height } = ctx.target;
    const bandHex = props.bandColor ?? "#2e86c1";
    const band = bandHex as MosaicColor;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // One featured band per picked collection, plus a small "wire" plate
    // naming the connection id the pick resolved through.
    const n = collections.length;
    const bandH = Math.floor(56 / n);
    const rowsWeights = [8, ...collections.flatMap(() => [bandH, 4]), 8];
    const rowsClaimants = [
      "-",
      ...collections.flatMap(() => [
        String(weightedSplit([4, 92, 4], "col", { mode: "literal", claimants: ["-", "1{1}", "-"] })),
        "-",
      ]),
      String(weightedSplit([4, 52, 44], "col", { mode: "literal", claimants: ["-", "1{1}", "-"] })),
    ];
    const spare = 100 - rowsWeights.reduce((a, b) => a + b, 0);
    if (spare > 0) {
      rowsWeights.push(spare);
      rowsClaimants.push("-");
    }
    const rows = String(weightedSplit(rowsWeights, "row", { mode: "literal", claimants: rowsClaimants }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const sources: MosaicSource[] = [];
    for (const [i, c] of collections.entries()) {
      sources.push(makeColorTile(i % 2 === 0 ? band : shade(bandHex)));
      sources.push(
        svgLabel(titleCase(c), width * 0.8, (height * 0.5) / n, {
          color: "#eaeef2" as MosaicColor,
          maxPx: Math.round((height * 0.14) / Math.max(1, n * 0.7)),
          vAlign: "middle",
        }),
      );
    }
    sources.push(makeColorTile(shade(bandHex)));
    sources.push(
      bindProp(svgLabel(`wire: connectionId = ${connectionId}`, width * 0.46, height * 0.08, {
        color: "#b9c4cf" as MosaicColor,
        maxPx: Math.round(height * 0.024),
        vAlign: "middle",
      }), "connectionId"),
    );

    const heading = fitSvgText(
      "OPTIONS FROM A CONNECTION - live rows through the connectionId sibling",
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.034), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        `optionsFromConnection { kind: "${COLLECTIONS_KIND}", connectionFromProp: "connectionId" } - the sibling holds the id`,
        "no id in the sibling, no fetch - and at render this is a plain string[] either way",
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
    title: "Options From a Connection",
    lines: [
      "optionsFromConnection names a fetcher kind; connectionFromProp names the SIBLING PROP holding the connection id. The sibling wire is the resolution.",
      "The control reads the sibling, calls the host IPC, and fills with live rows - no id, no fetch, and it says so. Switch profiles by editing one prop.",
      "Render never fetches. The value is a plain string[] either way - the connection only made picking it richer.",
    ],
    explore: [
      "Open Collections with the server on - live rows with counts",
      "Blank the Connection prop - the control explains itself",
    ],
  }),
});

export default OptionsSelectV1;
