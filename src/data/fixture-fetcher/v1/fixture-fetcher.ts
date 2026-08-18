import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asAliasId, asTemplateId, mintConnectionSecretRef } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/data/fixture-fetcher/v1` — where data ENTERS the system.
 *
 * ONE CONCEPT: a fetcher publishes a JSON payload onto the upstream channel
 * as a `type: "data"` source, and downstream templates read it by alias as
 * `ctx.upstreamData[alias]`. Same mechanism as theming — theme tokens are
 * just a data block with an agreed shape.
 *
 * CAPABILITY TIER IS DEFAULT-DENY. `ctx.secrets` and `ctx.connections` are
 * stripped from a template unless it declares `capabilities: { tier:
 * "capability" }`. Declaring the tier is what makes the host ASK the user;
 * a core-tier template that reaches for `ctx.secrets` finds `undefined`, and
 * that is the gate working, not a bug.
 *
 * SECRETS GO IN, SECRETS DON'T COME OUT. `secretRef` names a secret
 * (`env:SOME_TOKEN`); `ctx.secrets.get()` resolves it inside `render` and
 * nothing derived from the cleartext may enter the document, the upstream
 * channel or a sidecar. This one publishes `{ secretResolved, secretLength }`
 * — enough to prove the wiring, useless to an attacker.
 *
 * THE CARRIER TILE. A data source claims no cell, so a doc holding ONLY data
 * has nothing to render. This lesson pairs the payload with one visible tile
 * (which also shows you what was published). In a real pipeline the fetcher
 * step is `intermediate: true` and that tile never reaches the deliverable.
 *
 * No network here on purpose: a lesson that depends on someone else's uptime
 * is a lesson that fails for the wrong reason. `examples/http-orchestrator`
 * does the real fetch, OUTSIDE the template, and hands the result in as props
 * — the pattern to copy, since `ctx` has no `fetch`.
 */

export type FixtureFetcherProps = {
  /** Channel name downstream templates read. */
  alias?: string;
  /** Payload to publish instead of the built-in fixture. */
  payload?: Record<string, unknown>;
  /** CLI path: a secret to resolve, e.g. `env:M0SAIC_STARTER_TOKEN`. */
  secretRef?: string;
  /** DESKTOP path: a connection id configured under Tools - Integrations. */
  connectionId?: string;
  /** Which field of that connection carries the secret. Defaults to "token". */
  secretField?: string;
};

const ID = "@m0saic-starter/data/fixture-fetcher/v1";
const PANEL = "#17202a" as MosaicColor;
const ACCENT = "#EF7525" as MosaicColor;
const INK = "#ecf0f1" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

/** The default payload. Deterministic — the whole chapter reads it. */
export const STARTER_FIXTURE_PAYLOAD = {
  dataset: "starter-fixture",
  version: 1,
  series: [3, 5, 8, 13, 21],
  label: "deterministic fixture payload",
} as const;

/** Alias rule, spelled out so the error message can quote it. */
const ALIAS_RE = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;

const propsSchema = definePropsSchema<FixtureFetcherProps>({
  alias: {
    type: "string",
    required: false,
    description:
      "Channel name the payload is published under. Consumers read ctx.upstreamData[alias] — this string IS the coupling, not this template's id.",
    meta: { control: { placeholder: "starterData" }, ui: { label: "Alias" } },
  },
  payload: {
    type: "json",
    required: false,
    description:
      "Plain JSON object to publish instead of the built-in fixture. Becomes the data source's variables verbatim.",
    meta: { ui: { label: "Payload" } },
  },
  connectionId: {
    type: "string",
    required: false,
    description:
      "DESKTOP path. Id of a connection configured under Tools - Integrations; its secret field is read from the OS keychain, and the connection MINTS the ref so you never type one. Any registered id works - \"github@default\" ships with the app, so set a token there and name it here to watch this resolve. A GUI has no shell, which is why env: is not the desktop answer.",
    meta: { control: { placeholder: "github@default" }, ui: { label: "Connection" } },
  },
  secretField: {
    type: "string",
    required: false,
    description:
      "Which field of that connection holds the secret. Defaults to \"token\".",
    meta: { ui: { label: "Connection field" } },
  },
  secretRef: {
    type: "string",
    required: false,
    description:
      "OPTIONAL - leave empty and the template skips the secret entirely. To try one, use \"env:NAME\" and set NAME in the environment of whatever process renders (both the CLI and the desktop app resolve it). Publishes { secretResolved, secretLength } - never the value itself.",
    meta: { control: { placeholder: "env:M0SAIC_STARTER_TOKEN" }, ui: { label: "Secret ref" } },
  },
});

export const FixtureFetcherV1 = defineMosaicTemplate<FixtureFetcherProps>({
  id: asTemplateId(ID),
  label: "59 · Fixture Fetcher",
  version: 1,
  description:
    "Where data enters: a fetcher publishes a JSON payload as a type:\"data\" source and downstream templates read it as ctx.upstreamData[alias]. Declares tier:\"capability\" so ctx.secrets exists at all, and publishes a derived marker rather than the secret.",
  // The tier is the ASK. Drop it and ctx.secrets is undefined — by design.
  capabilities: { tier: "capability", caps: {} },
  tags: ["data", "producer", "capability", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Publishes upstream data; the tile is a carrier so you can see the payload. Feed it to data/data-card.",
  },

  propsSchema,
  defaultProps: { alias: "starterData" },

  async render(
    props: FixtureFetcherProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const alias = (props.alias ?? "starterData").trim();
    const secretRef = (props.secretRef ?? "").trim();

    const problems: string[] = [];
    if (!ALIAS_RE.test(alias)) {
      problems.push(
        `alias ${JSON.stringify(alias)} must start with a letter or _ and be alphanumeric (max 64)`,
      );
    }
    if (
      props.payload !== undefined &&
      (props.payload === null || typeof props.payload !== "object" || Array.isArray(props.payload))
    ) {
      problems.push("payload must be a plain JSON object (it becomes the data source's variables)");
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const published: Record<string, unknown> = { ...(props.payload ?? STARTER_FIXTURE_PAYLOAD) };

    // TWO WAYS IN, and which one you have depends on the host.
    //
    //   CLI / headless — `secretRef: "env:NAME"`. The only channel a headless
    //   process has. Prepend it to the command: `NAME=... m0saic make ...`.
    //
    //   DESKTOP — a CONNECTION. A packaged GUI launched from Finder inherits
    //   almost no environment, so `env:` is a dead end there. Instead the user
    //   configures a connection under Tools - Integrations; its secret field
    //   is stored in the OS keychain and the template resolves the ref the
    //   connection MINTS (`keychain:<id>/<field>`). The user never types that
    //   ref — which is why there is no "keychain" prop here.
    //
    // secretRef wins when it resolves, then the connection, then neither.
    // Same order as the shipped github/repo-facts-fetcher.
    const connectionId = (props.connectionId ?? "").trim();
    const secretField = (props.secretField ?? "token").trim() || "token";

    if (secretRef !== "" || connectionId !== "") {
      // A secret that does not resolve is REPORTED, not thrown — almost nobody
      // arrives with either channel configured, and replacing the canvas with a
      // stack trace teaches nothing. `secretResolved: false` is a fact too.
      const attempts: string[] = [];
      let marker: Record<string, unknown> | null = null;

      if (!ctx.secrets) {
        marker = {
          secretResolved: false,
          reason: "ctx.secrets absent - host threads no resolver, or tier is not \"capability\"",
        };
      } else {
        if (secretRef !== "") {
          attempts.push(secretRef);
          if (await ctx.secrets.has(secretRef)) {
            const value = await ctx.secrets.get(secretRef);
            if (typeof value === "string" && value.length > 0) {
              // DERIVED, not the thing. The cleartext dies with this scope.
              marker = {
                secretResolved: true,
                via: "secretRef",
                secretRef,
                secretLength: value.length,
              };
            }
          }
        }
        if (marker === null && connectionId !== "") {
          // The connection MINTS the ref; the user configured the value in the
          // app and never saw this string.
          const ref = mintConnectionSecretRef(connectionId, secretField);
          attempts.push(ref);
          const known = ctx.connections ? await ctx.connections.has(connectionId) : false;
          if (known && (await ctx.secrets.has(ref))) {
            const value = await ctx.secrets.get(ref);
            if (typeof value === "string" && value.length > 0) {
              marker = {
                secretResolved: true,
                via: "connection",
                connectionId,
                secretField,
                secretLength: value.length,
              };
            }
          }
        }
        if (marker === null) {
          marker = {
            secretResolved: false,
            tried: attempts,
            reason:
              "not found - CLI: prepend NAME=... to the m0saic make command and use env:NAME. " +
              "Desktop: add a connection under Tools - Integrations, then name it here.",
          };
        }
      }
      published.secret = marker;
    }

    const { width, height } = ctx.target;
    const keys = Object.keys(published);
    const summary = keys.map((k) => `${k}: ${JSON.stringify(published[k])}`).join("   ");

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
        svgLabel(`publishing on alias "${alias}"`, width, Math.round(height / 4), {
          maxPx: Math.round(height * 0.06),
          maxLines: 1,
          color: PANEL,
        }),
        makeColorTile(PANEL),
        svgLabel(summary, width, Math.round((height * 3) / 4), {
          maxPx: Math.round(height * 0.032),
          maxLines: 6,
          color: keys.length > 0 ? INK : INK_DIM,
        }),
        // THE payload. No cell of its own — the planner filters data sources
        // out before assigning cells, so the m0 above covers the tiles only.
        {
          type: "data",
          alias: asAliasId(alias),
          variables: published,
          editor: { owner: "template" },
        } as unknown as MosaicSource,
      ],
      // The same payload as a FILE beside the deliverable. See data/sidecar-json.
      sidecars: { starterData: published },
    };
  },

  sidecarsSchema: {
    starterData: {
      type: "object",
      required: false,
      description:
        "The published payload, mirrored to {output-basename}.starterData.json next to the deliverable.",
    },
  },

  renderTutorial: lessonTutorial({
    title: "Fixture Fetcher",
    lines: [
      "A fetcher publishes a JSON payload as a type:\"data\" source; downstream templates read it as ctx.upstreamData[alias].",
      "capabilities.tier \"capability\" is what makes ctx.secrets exist at all - core tier has it stripped, by design.",
      "Secrets go in, secrets don't come out: publish { secretResolved, secretLength } - never the value.",
      "TWO WAYS IN: CLI prepends NAME=... to m0saic make and uses env:NAME. Desktop has no shell - add a connection under Tools, then name it here.",
    ],
    explore: [
      "Edit Payload - the card and the sidecar follow",
      "Rename Alias, then point data/data-card at the new name",
      "Fill Secret ref or Connection: watch via and secretResolved",
    ],
  }),
});

export default FixtureFetcherV1;
