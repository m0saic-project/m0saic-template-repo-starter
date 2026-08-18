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
import {
  CATALOG_CONNECTION_ID,
  CATALOG_CONNECTION_SCHEMA,
  CATALOG_DEFAULT_BASE_URL,
} from "../../connection";

/**
 * `@m0saic-starter/connections/host-connection/v1` — a template pack can
 * teach the HOST a new kind of backend.
 *
 * ONE CONCEPT: `registerHostConnection`. The pack declares a connection
 * SCHEMA (what the user fills in under Settings → Integrations: here a base
 * URL plus an optional keychain-stored API key) and a PROBE (the "Test
 * connection" button: reachable / authenticated, or a named failure). The
 * host stays generic — it renders the form and calls the probe; the pack
 * owns the protocol. `src/connections/connection.ts` is the whole
 * implementation, and this template renders that REAL schema, not a mockup.
 *
 * Three things worth internalizing:
 *
 *  - REGISTRATION IS A MODULE-EVAL SIDE EFFECT. Importing the chapter makes
 *    `starter-catalog@default` exist in the app and the CLI. This is the one
 *    deliberate exception to the repo's "no self-registration" rule — and
 *    it is why loading a repo that registers connections is part of the
 *    Add-source consent surface (docs/security.md).
 *  - THE PUBLISHER HALF OF THE ID IS LAW. `starter-catalog@default` must
 *    have `schema.publisher === "starter-catalog"` or registration throws.
 *    Forks change the publisher; never squat another's.
 *  - SECRETS NEVER TRAVEL. The key is a `secret`-kind field stored in the
 *    OS keychain; fetchers read it back through a scoped resolver, and the
 *    host never ships cleartext into documents or option values.
 *
 * Render is PURE: it draws the schema constant. The probe runs in Settings,
 * never here. Start the example upstream and test it live:
 *
 *   node examples/http-orchestrator/server.cjs
 */

export type HostConnectionProps = {
  /** Accent fill (#rrggbb). */
  bandColor?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/connections/host-connection/v1";

/** A darkened twin of a #rrggbb colour at the given brightness factor. */
function dim(hex: string, factor: number): MosaicColor {
  const n = parseInt(hex.slice(1), 16);
  const d = (v: number) => Math.max(0, Math.round(v * factor));
  const hh = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hh(d((n >> 16) & 0xff))}${hh(d((n >> 8) & 0xff))}${hh(d(n & 0xff))}` as MosaicColor;
}

const propsSchema = definePropsSchema<HostConnectionProps>({
  bandColor: {
    type: "string",
    required: false,
    description: "Accent fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#2e86c1" },
      ui: { label: "Band color", order: 1 },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 2 },
    },
  },
});

export const HostConnectionV1 = defineMosaicTemplate<HostConnectionProps>({
  id: asTemplateId(ID),
  label: "74 · Host Connection",
  version: 1,
  description:
    "A template pack can teach the host a new kind of backend: registerHostConnection declares the Settings → Integrations form (base URL + keychain secret) and the Test-connection probe (reachable / authenticated / named failure). Registration is a module-eval side effect — importing the chapter makes starter-catalog@default exist — and the publisher half of the id must match the schema or registration throws. This card renders the REAL registered schema, not a mockup.",
  capabilities: { tier: "core" },
  tags: ["connections", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Start the example upstream (node examples/http-orchestrator/server.cjs), then Settings → Integrations → Starter Catalog → Test connection.",
  },

  propsSchema,
  defaultProps: {
    bandColor: "#2e86c1",
    pageColor: "#1c2833",
  },

  async render(
    props: HostConnectionProps,
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
    const { width, height } = ctx.target;
    const bandHex = props.bandColor ?? "#2e86c1";
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // Render the Settings -> Integrations card this schema PRODUCES — the
    // same surface the user sees one screen away, derived from the real
    // registration constant: title + id + "configured" chip, one
    // input-looking row per declared field, and the green two-tick probe
    // banner. Recognizing the mapping IS the lesson.
    const fields = CATALOG_CONNECTION_SCHEMA.fields;

    const titleRow = String(weightedSplit([6, 62, 4, 22, 6], "col", {
      mode: "literal",
      claimants: ["-", "1", "-", "1{1}", "-"],
    }));
    const textRow = String(weightedSplit([8, 84, 8], "col", {
      mode: "literal",
      claimants: ["-", "1", "-"],
    }));
    const boxRow = String(weightedSplit([8, 84, 8], "col", {
      mode: "literal",
      claimants: ["-", "1{1}", "-"],
    }));
    const cardWeights = [
      4, 11, 7, 4,
      ...fields.flatMap(() => [5, 2, 12, 4]),
      2, 12,
    ];
    const cardClaimants = [
      "-", titleRow, textRow, "-",
      ...fields.flatMap(() => [textRow, "-", boxRow, "-"]),
      "-", boxRow,
    ];
    const spare = 100 - cardWeights.reduce((a, b) => a + b, 0);
    if (spare > 0) {
      cardWeights.push(spare);
      cardClaimants.push("-");
    }
    const cardContent = String(weightedSplit(cardWeights, "row", {
      mode: "literal",
      claimants: cardClaimants,
    }));
    const pageRow = String(weightedSplit([17, 66, 17], "col", {
      mode: "literal",
      claimants: ["-", `1{${cardContent}}`, "-"],
    }));
    const rows = String(weightedSplit([5, 76, 19], "row", {
      mode: "literal",
      claimants: ["-", pageRow, "-"],
    }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const cardW = width * 0.66;
    const green = "#7ce8a9" as MosaicColor;
    const sources: MosaicSource[] = [];
    // Card background, then its contents in claim order.
    sources.push(makeColorTile(dim(bandHex, 0.24)));
    sources.push(
      svgLabel(
        `${CATALOG_CONNECTION_SCHEMA.label}   ${String(CATALOG_CONNECTION_ID)}`,
        cardW * 0.6,
        height * 0.09,
        { color: "#eaeef2" as MosaicColor, maxPx: Math.round(height * 0.038), vAlign: "middle" },
      ),
    );
    sources.push(makeColorTile("#14432c" as MosaicColor));
    sources.push(
      svgLabel("configured", cardW * 0.2, height * 0.08, {
        color: green,
        maxPx: Math.round(height * 0.024),
        vAlign: "middle",
      }),
    );
    sources.push(
      svgLabel(
        "the Settings -> Integrations card this schema produces",
        cardW * 0.8,
        height * 0.06,
        { color: "#7f8c9b" as MosaicColor, maxPx: Math.round(height * 0.022), vAlign: "middle" },
      ),
    );
    for (const f of fields) {
      const secret = f.kind === "secret";
      sources.push(
        svgLabel(
          `${f.label.toUpperCase()}  -  ${f.kind}${f.required ? "" : "  -  optional"}${secret ? "  -  keychain" : ""}`,
          cardW * 0.8,
          height * 0.05,
          { color: "#b9c4cf" as MosaicColor, maxPx: Math.round(height * 0.02), vAlign: "middle" },
        ),
      );
      sources.push(makeColorTile(dim(bandHex, 0.14)));
      const placeholder = !secret && "placeholder" in f && f.placeholder
        ? f.placeholder
        : "<set - type to replace>";
      sources.push(
        svgLabel(placeholder, cardW * 0.8, height * 0.09, {
          color: "#7f8c9b" as MosaicColor,
          maxPx: Math.round(height * 0.026),
          vAlign: "middle",
        }),
      );
    }
    // The probe banner — Test connection's two ticks, as the real card shows them.
    sources.push(makeColorTile("#14432c" as MosaicColor));
    sources.push(
      svgLabel("reachable (v1)  +  authenticated - the probe's two ticks", cardW * 0.8, height * 0.09, {
        color: green,
        maxPx: Math.round(height * 0.026),
        vAlign: "middle",
      }),
    );

    const heading = fitSvgText(
      "REGISTERED ON IMPORT - a module-eval side effect",
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.036), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        `publisher "${CATALOG_CONNECTION_SCHEMA.publisher}" must match the id's publisher half - registration throws otherwise`,
        `render never probes and never sees the secret - Settings owns the probe; fetchers get a scoped keychain resolver - default upstream ${CATALOG_DEFAULT_BASE_URL}`,
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
    title: "Host Connection",
    lines: [
      "registerHostConnection teaches the host a backend: a schema (the Settings form - url + keychain secret) and a probe (Test connection's two ticks).",
      "Registration is a module-eval side effect: importing the chapter makes starter-catalog@default exist in the app and CLI. Consent covers it.",
      "The publisher half of the id must match schema.publisher or registration throws. Secrets stay in the keychain; render never sees them.",
    ],
    explore: [
      "node examples/http-orchestrator/server.cjs, then Test connection",
      "Add STARTER_CATALOG_KEY and watch the second tick appear",
    ],
  }),
});

export default HostConnectionV1;
