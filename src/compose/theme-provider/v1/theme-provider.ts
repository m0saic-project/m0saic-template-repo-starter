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
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  publishTheme,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/compose/theme-provider/v1` — the PRODUCER half of theming.
 *
 * ONE CONCEPT: a producer publishes a token set onto the upstream channel and
 * that is its entire job. `publishTheme(tokens, { alias })` returns a
 * `type: "data"` source; drop it in `sources` and every downstream template
 * reading that alias sees the tokens as `ctx.upstreamData[alias]`.
 *
 * Two things make this composable rather than a coupling:
 *
 *   - THE CONTRACT IS THE SHAPE, NOT THE TEMPLATE. Producer and consumer
 *     agree on `MosaicThemeTokens` and an alias string — never on each
 *     other's id — so any conforming producer swaps under any consumer.
 *   - A DATA SOURCE PAINTS NOTHING. It occupies a cell and renders a
 *     degenerate carrier, which is why a real pipeline marks a pure producer
 *     step `intermediate: true` and pays no render cost at all. This one also
 *     draws its swatches, so you can see what it is publishing.
 *
 * `mode` is the whole point of a producer being a TEMPLATE instead of a
 * constant: one prop re-skins every consumer downstream. The built-in
 * `@m0saic/theming/v1` is the same idea with the full m0saic palette.
 */

export type ThemeProviderProps = {
  /** Which palette to publish. */
  mode?: "dark" | "light" | "high-contrast";
  /** Upstream alias the tokens appear under (consumers read this name). */
  alias?: string;
};

const ID = "@m0saic-starter/compose/theme-provider/v1";
const MODES = ["dark", "light", "high-contrast"] as const;
const INK_DIM = "#7f8c9b" as MosaicColor;

/** The three palettes, as complete token sets — a partial one is legal too:
 *  the merge is per key, so a producer may publish only what it cares about. */
const PALETTES: Record<(typeof MODES)[number], MosaicThemeTokens> = {
  dark: {
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
    accent: "#EF7525" as MosaicColor,
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
  },
  light: {
    surfaceApp: "#f4f6f8" as MosaicColor,
    surface: "#ffffff" as MosaicColor,
    surfaceRaised: "#eef1f5" as MosaicColor,
    surfaceInset: "#e3e8ee" as MosaicColor,
    border: "#d3dae2" as MosaicColor,
    borderStrong: "#aab6c2" as MosaicColor,
    textPrimary: "#16202a" as MosaicColor,
    textSecondary: "#3f4d5a" as MosaicColor,
    textMuted: "#6b7a88" as MosaicColor,
    eyebrow: "#7b8894" as MosaicColor,
    accent: "#d35f12" as MosaicColor,
    accentSoft: "#f0a15e" as MosaicColor,
    accentGlow: "#ffe3c8" as MosaicColor,
    positive: "#1e8a4c" as MosaicColor,
    negative: "#a5301f" as MosaicColor,
    grid: "#dde3ea" as MosaicColor,
    gridAlpha: 0.8,
    axis: "#9aa8b5" as MosaicColor,
    axisAlpha: 1,
    radius: 0.04,
    dataPalette: ["#d35f12", "#1f6fb2", "#1e8a4c"] as MosaicColor[],
  },
  "high-contrast": {
    surfaceApp: "#000000" as MosaicColor,
    surface: "#000000" as MosaicColor,
    surfaceRaised: "#141414" as MosaicColor,
    surfaceInset: "#000000" as MosaicColor,
    border: "#ffffff" as MosaicColor,
    borderStrong: "#ffffff" as MosaicColor,
    textPrimary: "#ffffff" as MosaicColor,
    textSecondary: "#f2f2f2" as MosaicColor,
    textMuted: "#d9d9d9" as MosaicColor,
    eyebrow: "#ffffff" as MosaicColor,
    accent: "#ff8c1a" as MosaicColor,
    accentSoft: "#ffb266" as MosaicColor,
    accentGlow: "#ffe0bf" as MosaicColor,
    positive: "#00e05a" as MosaicColor,
    negative: "#ff4d3d" as MosaicColor,
    grid: "#ffffff" as MosaicColor,
    gridAlpha: 1,
    axis: "#ffffff" as MosaicColor,
    axisAlpha: 1,
    radius: 0,
    dataPalette: ["#ff8c1a", "#4dc3ff", "#00e05a"] as MosaicColor[],
  },
};

/** Read a producer's published tokens back out of its rendered document —
 *  what a consumer does when it calls a provider itself instead of waiting
 *  for a pipeline to thread the channel. */
export function publishedTokensOf(
  doc: { sources?: unknown[] } | null | undefined,
  alias = "theme",
): MosaicThemeTokens | undefined {
  for (const source of doc?.sources ?? []) {
    const s = source as { type?: string; alias?: string; variables?: unknown };
    if (s?.type === "data" && String(s.alias) === alias) {
      return s.variables as MosaicThemeTokens;
    }
  }
  return undefined;
}

const propsSchema = definePropsSchema<ThemeProviderProps>({
  mode: {
    type: "string",
    required: false,
    description:
      "Which palette to publish. This one prop re-skins every consumer downstream — the reason a producer is a TEMPLATE and not a constant.",
    meta: { constraints: { oneOf: [...MODES] }, ui: { label: "Mode" } },
  },
  alias: {
    type: "string",
    required: false,
    description:
      "The upstream channel name consumers read. Default \"theme\" — change it only when two producers would otherwise collide.",
    meta: { control: { placeholder: "theme" }, ui: { label: "Alias" } },
  },
});

export const ThemeProviderV1 = defineMosaicTemplate<ThemeProviderProps>({
  id: asTemplateId(ID),
  label: "39 · Theme Provider",
  version: 1,
  description:
    "The PRODUCER half of theming: publishTheme(tokens, { alias }) emits a data source carrying a token set, and every downstream template reading that alias picks it up. One mode prop re-skins the whole chain; the swatches show what is being published.",
  capabilities: { tier: "core" },
  tags: ["compose", "theming", "producer", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Switch Mode and watch the published palette change — then point compose/theme-tokens at this id.",
  },

  propsSchema,
  defaultProps: { mode: "dark", alias: "theme" },

  async render(
    props: ThemeProviderProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const mode = props.mode ?? "dark";
    const alias = (props.alias ?? "theme").trim();

    const problems: string[] = [];
    if (!MODES.includes(mode as (typeof MODES)[number])) {
      problems.push(`mode must be one of ${MODES.join(" | ")}, got ${JSON.stringify(mode)}`);
    }
    if (!/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(alias)) {
      problems.push(
        `alias ${JSON.stringify(alias)} must start with a letter or _ and be alphanumeric (max 64)`,
      );
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;
    const tokens = PALETTES[mode as (typeof MODES)[number]];

    // The swatches are a courtesy; THE PAYLOAD is the data source below.
    const shown = ["accent", "accentSoft", "surface", "textPrimary", "positive", "negative"] as const;
    const swatchRow = String(
      weightedSplit(shown.map(() => 1), "col", { claimants: shown.map(() => "1{1}") }),
    );
    const m0 = toM0String(
      String(weightedSplit([4, 1], "row", { claimants: [swatchRow, "1"] })),
      ID,
    );

    const swatchW = Math.round(width / shown.length);
    const swatchH = Math.round((height * 4) / 5);
    const sources: MosaicSource[] = [];
    for (const key of shown) {
      sources.push(makeColorTile(tokens[key] as MosaicColor));
      sources.push(
        svgLabel(key, swatchW, swatchH, {
          maxPx: Math.round(height * 0.026),
          maxLines: 2,
          color: tokens.textPrimary,
          vAlign: "bottom",
          padding: { bottom: 0.06 },
        }),
      );
    }
    sources.push(
      svgLabel(
        `publishing ${mode} tokens on alias "${alias}" - consumers read ctx.upstreamData["${alias}"]`,
        width,
        Math.round(height / 5),
        { maxPx: Math.round(height * 0.03), maxLines: 2, color: INK_DIM },
      ),
    );
    // THE payload. A data source paints nothing AND claims no frame: the
    // planner filters data sources out before it assigns cells, so the m0
    // above covers only the visual tiles. Giving it a frame is the classic
    // first mistake — "expects N sources but found N-1" at plan time.
    sources.push(publishTheme(tokens, { alias }) as unknown as MosaicSource);

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: tokens.surfaceApp,
      sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "Theme Provider",
    lines: [
      "A producer publishes a token set and that is its whole job: publishTheme(tokens, { alias }) returns a data source consumers read as ctx.upstreamData[alias].",
      "Producer and consumer agree on the token SHAPE and the alias - never on each other's id - so any conforming producer swaps under any consumer.",
      "A data source paints nothing, which is why a real pipeline marks a pure producer step intermediate: true and pays no render cost for it.",
    ],
    explore: [
      "Switch Mode - the published palette changes with one prop",
      "Point compose/theme-tokens' Provider id at this template",
      "Compare with the built-in @m0saic/theming/v1 producer",
    ],
  }),
});

export default ThemeProviderV1;
