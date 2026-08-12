"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeProviderV1 = void 0;
exports.publishedTokensOf = publishedTokensOf;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/compose/theme-provider/v1";
const MODES = ["dark", "light", "high-contrast"];
const INK_DIM = "#7f8c9b";
/** The three palettes, as complete token sets — a partial one is legal too:
 *  the merge is per key, so a producer may publish only what it cares about. */
const PALETTES = {
    dark: {
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
        accent: "#EF7525",
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
    },
    light: {
        surfaceApp: "#f4f6f8",
        surface: "#ffffff",
        surfaceRaised: "#eef1f5",
        surfaceInset: "#e3e8ee",
        border: "#d3dae2",
        borderStrong: "#aab6c2",
        textPrimary: "#16202a",
        textSecondary: "#3f4d5a",
        textMuted: "#6b7a88",
        eyebrow: "#7b8894",
        accent: "#d35f12",
        accentSoft: "#f0a15e",
        accentGlow: "#ffe3c8",
        positive: "#1e8a4c",
        negative: "#a5301f",
        grid: "#dde3ea",
        gridAlpha: 0.8,
        axis: "#9aa8b5",
        axisAlpha: 1,
        radius: 0.04,
        dataPalette: ["#d35f12", "#1f6fb2", "#1e8a4c"],
    },
    "high-contrast": {
        surfaceApp: "#000000",
        surface: "#000000",
        surfaceRaised: "#141414",
        surfaceInset: "#000000",
        border: "#ffffff",
        borderStrong: "#ffffff",
        textPrimary: "#ffffff",
        textSecondary: "#f2f2f2",
        textMuted: "#d9d9d9",
        eyebrow: "#ffffff",
        accent: "#ff8c1a",
        accentSoft: "#ffb266",
        accentGlow: "#ffe0bf",
        positive: "#00e05a",
        negative: "#ff4d3d",
        grid: "#ffffff",
        gridAlpha: 1,
        axis: "#ffffff",
        axisAlpha: 1,
        radius: 0,
        dataPalette: ["#ff8c1a", "#4dc3ff", "#00e05a"],
    },
};
/** Read a producer's published tokens back out of its rendered document —
 *  what a consumer does when it calls a provider itself instead of waiting
 *  for a pipeline to thread the channel. */
function publishedTokensOf(doc, alias = "theme") {
    var _a;
    for (const source of (_a = doc === null || doc === void 0 ? void 0 : doc.sources) !== null && _a !== void 0 ? _a : []) {
        const s = source;
        if ((s === null || s === void 0 ? void 0 : s.type) === "data" && String(s.alias) === alias) {
            return s.variables;
        }
    }
    return undefined;
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    mode: {
        type: "string",
        required: false,
        description: "Which palette to publish. This one prop re-skins every consumer downstream — the reason a producer is a TEMPLATE and not a constant.",
        meta: { constraints: { oneOf: [...MODES] }, ui: { label: "Mode" } },
    },
    alias: {
        type: "string",
        required: false,
        description: "The upstream channel name consumers read. Default \"theme\" — change it only when two producers would otherwise collide.",
        meta: { control: { placeholder: "theme" }, ui: { label: "Alias" } },
    },
});
exports.ThemeProviderV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "39 · Theme Provider",
    version: 1,
    description: "The PRODUCER half of theming: publishTheme(tokens, { alias }) emits a data source carrying a token set, and every downstream template reading that alias picks it up. One mode prop re-skins the whole chain; the swatches show what is being published.",
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
    async render(props, ctx) {
        var _a, _b;
        const mode = (_a = props.mode) !== null && _a !== void 0 ? _a : "dark";
        const alias = ((_b = props.alias) !== null && _b !== void 0 ? _b : "theme").trim();
        const problems = [];
        if (!MODES.includes(mode)) {
            problems.push(`mode must be one of ${MODES.join(" | ")}, got ${JSON.stringify(mode)}`);
        }
        if (!/^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(alias)) {
            problems.push(`alias ${JSON.stringify(alias)} must start with a letter or _ and be alphanumeric (max 64)`);
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height } = ctx.target;
        const tokens = PALETTES[mode];
        // The swatches are a courtesy; THE PAYLOAD is the data source below.
        const shown = ["accent", "accentSoft", "surface", "textPrimary", "positive", "negative"];
        const swatchRow = String((0, dsl_stdlib_1.weightedSplit)(shown.map(() => 1), "col", { claimants: shown.map(() => "1{1}") }));
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([4, 1], "row", { claimants: [swatchRow, "1"] })), ID);
        const swatchW = Math.round(width / shown.length);
        const swatchH = Math.round((height * 4) / 5);
        const sources = [];
        for (const key of shown) {
            sources.push((0, template_utils_1.makeColorTile)(tokens[key]));
            sources.push((0, svg_text_1.svgLabel)(key, swatchW, swatchH, {
                maxPx: Math.round(height * 0.026),
                maxLines: 2,
                color: tokens.textPrimary,
                vAlign: "bottom",
                padding: { bottom: 0.06 },
            }));
        }
        sources.push((0, svg_text_1.svgLabel)(`publishing ${mode} tokens on alias "${alias}" - consumers read ctx.upstreamData["${alias}"]`, width, Math.round(height / 5), { maxPx: Math.round(height * 0.03), maxLines: 2, color: INK_DIM }));
        // THE payload. A data source paints nothing AND claims no frame: the
        // planner filters data sources out before it assigns cells, so the m0
        // above covers only the visual tiles. Giving it a frame is the classic
        // first mistake — "expects N sources but found N-1" at plan time.
        sources.push((0, template_utils_1.publishTheme)(tokens, { alias }));
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: tokens.surfaceApp,
            sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
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
exports.default = exports.ThemeProviderV1;
