import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
  MosaicThemeTokens,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  applyTheme,
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  readTheme,
  renderNestedTemplate,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";
import { publishedTokensOf } from "../../theme-provider/v1/theme-provider";

/**
 * `@m0saic-starter/compose/theme-tokens/v1` — the CONSUMER half of theming,
 * and the three places tokens can come from.
 *
 * ONE CONCEPT: theming is data flow that happens to carry colors. A consumer
 * overlays whatever arrived onto its own constants — `applyTheme(LOCAL, ctx)`
 * — so it is never coupled to a specific producer, only to the token SHAPE
 * and an alias string.
 *
 * `source` walks the three ways that data reaches you:
 *
 *   - "local" — nothing arrived. `applyTheme` returns the fallback untouched,
 *     so an un-themed render is byte-identical to a template that never heard
 *     of theming. This is the path you ship.
 *   - "upstream" — the REAL one: a producer ran earlier in the pipeline and
 *     its tokens are sitting on `ctx.upstreamData[alias]`. Standalone in the
 *     editor there is no pipeline, so this path honestly reports finding
 *     nothing and falls back.
 *   - "provider" — the TUTORIAL shortcut: this template renders a producer BY
 *     ID itself and reads what it published. You would not normally write
 *     this; a pipeline step publishes and the channel does the delivering. It
 *     is here so the merge is visible with one template open.
 *
 * The provider is late-bound by id — paste `@m0saic/theming/v1` (the built-in
 * m0saic palette) or the starter's own `compose/theme-provider/v1` and the
 * swatches re-skin. Nothing is imported: the lookup goes through the host's
 * registry, which is exactly why an id is enough.
 *
 * `mode` rides along to the provider (dark | light | high-contrast). The merge
 * itself is per KEY, so a producer that publishes only `accent` overrides only
 * `accent` — everything else stays local.
 */

export type ThemeTokensProps = {
  /** Where the tokens come from. */
  source?: "local" | "upstream" | "provider";
  /** Provider template id, used when source is "provider". */
  providerId?: string;
  /** Palette to ask the provider for. */
  mode?: "dark" | "light" | "high-contrast";
  /** Upstream channel name — both halves must agree on it. */
  alias?: string;
  /** The template's OWN accent — used for every key nobody published. */
  accentFallback?: string;
};

const ID = "@m0saic-starter/compose/theme-tokens/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const SOURCES = ["local", "upstream", "provider"] as const;
const MODES = ["dark", "light", "high-contrast"] as const;
const STARTER_PROVIDER = "@m0saic-starter/compose/theme-provider/v1";
const INK_DIM = "#7f8c9b" as MosaicColor;

/** The swatches this card draws, in order. */
const SHOWN_KEYS = ["accent", "accentSoft", "surface", "surfaceRaised", "positive", "negative"] as const;

/**
 * The template's OWN palette. Every field is a real fallback — this is what
 * renders when nothing arrived, which is most of the time.
 */
function localTokens(accent: string): MosaicThemeTokens {
  return {
    surfaceApp: "#0b0e11" as MosaicColor,
    surface: "#17202a" as MosaicColor,
    surfaceRaised: "#1c2733" as MosaicColor,
    surfaceInset: "#0f141a" as MosaicColor,
    border: "#232f3b" as MosaicColor,
    borderStrong: "#33465a" as MosaicColor,
    textPrimary: "#ecf0f1" as MosaicColor,
    textSecondary: "#b7c2cc" as MosaicColor,
    textMuted: "#7f8c9b" as MosaicColor,
    eyebrow: "#8e9aa6" as MosaicColor,
    accent: accent as MosaicColor,
    accentSoft: "#f0a15e" as MosaicColor,
    accentGlow: "#ffd2a8" as MosaicColor,
    positive: "#27ae60" as MosaicColor,
    negative: "#c0392b" as MosaicColor,
    grid: "#233140" as MosaicColor,
    gridAlpha: 0.6,
    axis: "#3d5266" as MosaicColor,
    axisAlpha: 0.9,
    radius: 0.04,
    dataPalette: ["#EF7525", "#2e86c1", "#27ae60"] as MosaicColor[],
  };
}

const propsSchema = definePropsSchema<ThemeTokensProps>({
  source: {
    type: "string",
    required: false,
    description:
      "\"local\": nothing arrived, the template's own constants render (the path you ship). \"upstream\": read whatever a pipeline producer published on ctx.upstreamData — standalone there is none, and it says so. \"provider\": render a producer by id right here and read it, a TUTORIAL shortcut so the merge is visible with one template open.",
    meta: { constraints: { oneOf: [...SOURCES] }, ui: { label: "Token source" } },
  },
  providerId: {
    type: "string",
    required: false,
    description:
      "Template id of the producer to call when source is \"provider\". Paste @m0saic/theming/v1 for the built-in m0saic palette, or any conforming producer — the lookup is by id against the host's registry, so nothing is imported.",
    meta: {
      control: { placeholder: STARTER_PROVIDER },
      ui: { label: "Provider id" },
    },
  },
  mode: {
    type: "string",
    required: false,
    description: "Palette to ask the provider for. The other two sources ignore it — a pipeline producer carries its own mode.",
    meta: { constraints: { oneOf: [...MODES] }, ui: { label: "Mode" } },
  },
  alias: {
    type: "string",
    required: false,
    description: "The upstream channel name. Producer and consumer must agree on it — that, plus the token shape, IS the whole contract.",
    meta: { control: { placeholder: "theme" }, ui: { label: "Alias" } },
  },
  accentFallback: {
    type: "string",
    required: false,
    description: "This template's OWN accent, as #rrggbb. A producer's accent wins over it — per key, and per key only.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#EF7525" },
      ui: { label: "Accent (local)" },
    },
  },
});

export const ThemeTokensV1 = defineMosaicTemplate<ThemeTokensProps>({
  id: asTemplateId(ID),
  label: "44 · Theme Tokens",
  version: 1,
  description:
    "The CONSUMER half of theming, and the three places tokens come from: local constants, a pipeline producer on ctx.upstreamData, or a provider called by id right here. applyTheme overlays whatever arrived onto the template's own values, per key — so an un-themed render is unchanged and any conforming producer swaps in.",
  capabilities: { tier: "core" },
  tags: ["compose", "theming", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Set Token source to \"provider\" and flip Mode — the swatches re-skin from another template.",
  },

  propsSchema,
  defaultProps: {
    source: "provider",
    providerId: STARTER_PROVIDER,
    mode: "dark",
    alias: "theme",
    accentFallback: "#EF7525",
  },

  async render(
    props: ThemeTokensProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const source = props.source ?? "provider";
    const providerId = (props.providerId ?? STARTER_PROVIDER).trim();
    const mode = props.mode ?? "dark";
    const alias = (props.alias ?? "theme").trim();
    const accentFallback = props.accentFallback ?? "#EF7525";

    const problems: string[] = [];
    if (!SOURCES.includes(source as (typeof SOURCES)[number])) {
      problems.push(`source must be one of ${SOURCES.join(" | ")}, got ${JSON.stringify(source)}`);
    }
    if (!MODES.includes(mode as (typeof MODES)[number])) {
      problems.push(`mode must be one of ${MODES.join(" | ")}, got ${JSON.stringify(mode)}`);
    }
    if (!HEX.test(accentFallback)) {
      problems.push(`accentFallback ${JSON.stringify(accentFallback)} must be #rrggbb`);
    }
    if (source === "provider" && providerId.length === 0) {
      problems.push('providerId is required when source is "provider"');
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;
    const local = localTokens(accentFallback);

    /* ── Where do the tokens come from? ─────────────────────── */

    let published: Partial<MosaicThemeTokens> | undefined;
    let note: string;

    if (source === "upstream") {
      // The production path: a producer ran earlier in the pipeline and the
      // engine put its block on the channel. The consumer just reads it.
      published = readTheme(ctx, { alias });
      note = published
        ? `upstream: a producer published on "${alias}" and this render merged it`
        : `upstream: nothing on "${alias}" - no pipeline here, so every swatch is local`;
    } else if (source === "provider") {
      // The tutorial shortcut: call the producer ourselves. In production a
      // pipeline step does this and you never write these three lines.
      // `preset` rides along beside `mode` so the built-in @m0saic/theming/v1
      // (whose prop is named preset) answers the same question.
      try {
        const doc = await renderNestedTemplate(providerId, { mode, preset: mode, alias }, ctx);
        published = publishedTokensOf(doc as { sources?: unknown[] }, alias);
        note = published
          ? `provider ${providerId} (${mode}) - called from here, which a pipeline would normally do for you`
          : `provider ${providerId} rendered but published nothing on "${alias}" - check the alias`;
      } catch {
        // A provider that isn't registered in this host is the common case,
        // and it must degrade rather than kill the preview.
        published = undefined;
        note = `provider ${providerId} is not registered here - falling back to local tokens`;
      }
    } else {
      published = undefined;
      note = "local: no channel consulted at all - the template's own constants";
    }

    // THE consumer contract: a per-key overlay onto the local set.
    //
    // `applyTheme` is the production one-liner — it READS the channel and
    // merges in a single call, which is exactly why "local" must not use it:
    // with a producer wired, applyTheme would pick those tokens up and
    // "local" would quietly stop being local. Each source gets the merge it
    // actually means.
    const theme =
      source === "local"
        ? local
        : published
          ? { ...local, ...published }
          : applyTheme(local, ctx, { alias });
    const overridden = published
      ? SHOWN_KEYS.filter((k) => (published as Record<string, unknown>)[k] !== undefined)
      : [];

    /* ── The swatch sheet ───────────────────────────────────── */

    const swatchRow = String(
      weightedSplit(
        SHOWN_KEYS.map(() => 1),
        "col",
        { claimants: SHOWN_KEYS.map(() => "1{1}") },
      ),
    );
    const m0 = toM0String(
      String(weightedSplit([4, 1], "row", { claimants: [swatchRow, "1"] })),
      ID,
    );

    const swatchW = Math.round(width / SHOWN_KEYS.length);
    const swatchH = Math.round((height * 4) / 5);
    const sources: MosaicSource[] = [];
    for (const key of SHOWN_KEYS) {
      sources.push(makeColorTile(theme[key] as MosaicColor));
      sources.push(
        svgLabel(overridden.includes(key) ? `${key} (themed)` : key, swatchW, swatchH, {
          maxPx: Math.round(height * 0.028),
          maxLines: 2,
          color: theme.textPrimary,
          vAlign: "bottom",
          padding: { bottom: 0.06 },
        }),
      );
    }
    sources.push(
      svgLabel(
        `${note} - ${overridden.length}/${SHOWN_KEYS.length} shown keys came from the channel`,
        width,
        Math.round(height / 5),
        { maxPx: Math.round(height * 0.028), maxLines: 2, color: INK_DIM },
      ),
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: theme.surfaceApp,
      sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Theme Tokens",
    lines: [
      "Theming is data flow that happens to carry colors: a consumer overlays whatever arrived onto its own constants.",
      "Token source walks the three ways it reaches you: local (nothing arrived), upstream (a pipeline published), provider (called by id here).",
      "That third one is a TUTORIAL shortcut - in production a pipeline publishes and you never write it.",
      "Late-bound by ID, and merged per KEY: paste @m0saic/theming/v1 to re-skin, and a producer publishing only accent changes only accent.",
    ],
    explore: [
      "Flip Mode with source \"provider\" - dark, light, high-contrast",
      "Paste @m0saic/theming/v1 into Provider id",
      "Set source to \"local\" - the local accent takes over again",
      "Set source to \"upstream\": no pipeline here, so it says so",
    ],
  }),
});

export default ThemeTokensV1;
