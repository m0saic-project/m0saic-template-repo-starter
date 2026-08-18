"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeTokensV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const theme_provider_1 = require("../../theme-provider/v1/theme-provider");
const ID = "@m0saic-starter/compose/theme-tokens/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const SOURCES = ["local", "upstream", "provider"];
const MODES = ["dark", "light", "high-contrast"];
const STARTER_PROVIDER = "@m0saic-starter/compose/theme-provider/v1";
const INK_DIM = "#7f8c9b";
/** The swatches this card draws, in order. */
const SHOWN_KEYS = ["accent", "accentSoft", "surface", "surfaceRaised", "positive", "negative"];
/**
 * The template's OWN palette. Every field is a real fallback — this is what
 * renders when nothing arrived, which is most of the time.
 */
function localTokens(accent) {
    return {
        surfaceApp: "#0b0e11",
        surface: "#17202a",
        surfaceRaised: "#1c2733",
        surfaceInset: "#0f141a",
        border: "#232f3b",
        borderStrong: "#33465a",
        textPrimary: "#ecf0f1",
        textSecondary: "#b7c2cc",
        textMuted: "#7f8c9b",
        eyebrow: "#8e9aa6",
        accent: accent,
        accentSoft: "#f0a15e",
        accentGlow: "#ffd2a8",
        positive: "#27ae60",
        negative: "#c0392b",
        grid: "#233140",
        gridAlpha: 0.6,
        axis: "#3d5266",
        axisAlpha: 0.9,
        radius: 0.04,
        dataPalette: ["#EF7525", "#2e86c1", "#27ae60"],
    };
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    source: {
        type: "string",
        required: false,
        description: "\"local\": nothing arrived, the template's own constants render (the path you ship). \"upstream\": read whatever a pipeline producer published on ctx.upstreamData — standalone there is none, and it says so. \"provider\": render a producer by id right here and read it, a TUTORIAL shortcut so the merge is visible with one template open.",
        meta: { constraints: { oneOf: [...SOURCES] }, ui: { label: "Token source" } },
    },
    providerId: {
        type: "string",
        required: false,
        description: "Template id of the producer to call when source is \"provider\". Paste @m0saic/theming/v1 for the built-in m0saic palette, or any conforming producer — the lookup is by id against the host's registry, so nothing is imported.",
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
exports.ThemeTokensV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "49 · Theme Tokens",
    version: 1,
    description: "The CONSUMER half of theming, and the three places tokens come from: local constants, a pipeline producer on ctx.upstreamData, or a provider called by id right here. applyTheme overlays whatever arrived onto the template's own values, per key — so an un-themed render is unchanged and any conforming producer swaps in.",
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
    async render(props, ctx) {
        var _a, _b, _c, _d, _e;
        const source = (_a = props.source) !== null && _a !== void 0 ? _a : "provider";
        const providerId = ((_b = props.providerId) !== null && _b !== void 0 ? _b : STARTER_PROVIDER).trim();
        const mode = (_c = props.mode) !== null && _c !== void 0 ? _c : "dark";
        const alias = ((_d = props.alias) !== null && _d !== void 0 ? _d : "theme").trim();
        const accentFallback = (_e = props.accentFallback) !== null && _e !== void 0 ? _e : "#EF7525";
        const problems = [];
        if (!SOURCES.includes(source)) {
            problems.push(`source must be one of ${SOURCES.join(" | ")}, got ${JSON.stringify(source)}`);
        }
        if (!MODES.includes(mode)) {
            problems.push(`mode must be one of ${MODES.join(" | ")}, got ${JSON.stringify(mode)}`);
        }
        if (!HEX.test(accentFallback)) {
            problems.push(`accentFallback ${JSON.stringify(accentFallback)} must be #rrggbb`);
        }
        if (source === "provider" && providerId.length === 0) {
            problems.push('providerId is required when source is "provider"');
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height } = ctx.target;
        const local = localTokens(accentFallback);
        /* ── Where do the tokens come from? ─────────────────────── */
        let published;
        let note;
        if (source === "upstream") {
            // The production path: a producer ran earlier in the pipeline and the
            // engine put its block on the channel. The consumer just reads it.
            published = (0, template_utils_1.readTheme)(ctx, { alias });
            note = published
                ? `upstream: a producer published on "${alias}" and this render merged it`
                : `upstream: nothing on "${alias}" - no pipeline here, so every swatch is local`;
        }
        else if (source === "provider") {
            // The tutorial shortcut: call the producer ourselves. In production a
            // pipeline step does this and you never write these three lines.
            // `preset` rides along beside `mode` so the built-in @m0saic/theming/v1
            // (whose prop is named preset) answers the same question.
            try {
                const doc = await (0, template_utils_1.renderNestedTemplate)(providerId, { mode, preset: mode, alias }, ctx);
                published = (0, theme_provider_1.publishedTokensOf)(doc, alias);
                note = published
                    ? `provider ${providerId} (${mode}) - called from here, which a pipeline would normally do for you`
                    : `provider ${providerId} rendered but published nothing on "${alias}" - check the alias`;
            }
            catch {
                // A provider that isn't registered in this host is the common case,
                // and it must degrade rather than kill the preview.
                published = undefined;
                note = `provider ${providerId} is not registered here - falling back to local tokens`;
            }
        }
        else {
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
        const theme = source === "local"
            ? local
            : published
                ? { ...local, ...published }
                : (0, template_utils_1.applyTheme)(local, ctx, { alias });
        const overridden = published
            ? SHOWN_KEYS.filter((k) => published[k] !== undefined)
            : [];
        /* ── The swatch sheet ───────────────────────────────────── */
        const swatchRow = String((0, dsl_stdlib_1.weightedSplit)(SHOWN_KEYS.map(() => 1), "col", { claimants: SHOWN_KEYS.map(() => "1{1}") }));
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([4, 1], "row", { claimants: [swatchRow, "1"] })), ID);
        const swatchW = Math.round(width / SHOWN_KEYS.length);
        const swatchH = Math.round((height * 4) / 5);
        const sources = [];
        for (const key of SHOWN_KEYS) {
            sources.push((0, template_utils_1.makeColorTile)(theme[key]));
            sources.push((0, svg_text_1.svgLabel)(overridden.includes(key) ? `${key} (themed)` : key, swatchW, swatchH, {
                maxPx: Math.round(height * 0.028),
                maxLines: 2,
                color: theme.textPrimary,
                vAlign: "bottom",
                padding: { bottom: 0.06 },
            }));
        }
        sources.push((0, svg_text_1.svgLabel)(`${note} - ${overridden.length}/${SHOWN_KEYS.length} shown keys came from the channel`, width, Math.round(height / 5), { maxPx: Math.round(height * 0.028), maxLines: 2, color: INK_DIM }));
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: theme.surfaceApp,
            sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
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
exports.default = exports.ThemeTokensV1;
