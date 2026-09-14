"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PureAdapterV1 = void 0;
exports.summarize = summarize;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/data/pure-adapter/v1";
/** The committed chain that runs a producer, this adapter and a consumer in
 *  one render. Make invokes ONE template, so a lone adapter has no upstream
 *  by construction — this file is how the lesson is meant to be seen. */
const CHAIN_FILE = "examples/data-chain/starter-data-chain.mosaicx";
const PANEL = "#17202a";
const OK = "#27ae60";
const MISSING = "#c0392b";
const INK = "#ecf0f1";
const ALIAS_RE = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
/** The whole adapter: numbers in, stats out. Deterministic, dependency-free. */
function summarize(series) {
    const nums = series.filter((n) => Number.isFinite(n));
    if (nums.length === 0)
        return { count: 0, min: 0, max: 0, mean: 0, total: 0 };
    const total = nums.reduce((a, b) => a + b, 0);
    return {
        count: nums.length,
        min: Math.min(...nums),
        max: Math.max(...nums),
        // Rounded so the published payload is stable across platforms.
        mean: Math.round((total / nums.length) * 100) / 100,
        total,
    };
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    inputAlias: {
        type: "string",
        required: false,
        description: "Upstream channel to read. Must match what the producer published under — the alias is the contract between them.",
        meta: { control: { placeholder: "starterData" }, ui: { label: "Input alias" } },
    },
    outputAlias: {
        type: "string",
        required: false,
        description: "Channel this adapter publishes on. Keep it distinct from the input so both blocks stay readable downstream.",
        meta: { control: { placeholder: "seriesStats" }, ui: { label: "Output alias" } },
    },
    seriesKey: {
        type: "string",
        required: false,
        description: "Which key inside the upstream block holds the numbers. Naming it as a prop is what lets one adapter serve several producers.",
        meta: { control: { placeholder: "series" }, ui: { label: "Series key" } },
    },
});
exports.PureAdapterV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "64 · Pure Adapter",
    version: 1,
    description: "An adapter reads one data block and publishes another — a pure function between channels. Reshaping needs no capability tier and no network, so it stays core tier and testable with a plain object; a missing upstream degrades to an empty result rather than throwing.",
    capabilities: { tier: "core" },
    tags: ["data", "adapter", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Standalone it reports MISSING — that is the lesson. Chain it after data/fixture-fetcher.",
    },
    propsSchema,
    defaultProps: { inputAlias: "starterData", outputAlias: "seriesStats", seriesKey: "series" },
    // What this template EXPECTS to be handed. Optional keys throughout: the
    // adapter must still render when nothing upstream has run.
    upstreamDataSchema: {
        starterData: {
            description: "Payload published by @m0saic-starter/data/fixture-fetcher/v1.",
            variables: {
                dataset: { type: "string", required: false },
                series: { type: "number[]", required: false },
            },
        },
    },
    async render(props, ctx) {
        var _a, _b, _c, _d;
        const inputAlias = ((_a = props.inputAlias) !== null && _a !== void 0 ? _a : "starterData").trim();
        const outputAlias = ((_b = props.outputAlias) !== null && _b !== void 0 ? _b : "seriesStats").trim();
        const seriesKey = ((_c = props.seriesKey) !== null && _c !== void 0 ? _c : "series").trim();
        const problems = [];
        for (const [name, value] of [
            ["inputAlias", inputAlias],
            ["outputAlias", outputAlias],
        ]) {
            if (!ALIAS_RE.test(value)) {
                problems.push(`${name} ${JSON.stringify(value)} must start with a letter or _ and be alphanumeric (max 64)`);
            }
        }
        if (seriesKey.length === 0)
            problems.push("seriesKey must not be empty");
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height } = ctx.target;
        // The read. Everything about it is optional-chained: upstream absence is
        // a state to render, not an exception to raise.
        const block = (_d = ctx.upstreamData) === null || _d === void 0 ? void 0 : _d[inputAlias];
        const raw = block === null || block === void 0 ? void 0 : block[seriesKey];
        const series = Array.isArray(raw) ? raw : [];
        const arrived = block !== undefined;
        const stats = summarize(series);
        const headline = arrived
            ? `${inputAlias}.${seriesKey} -> ${outputAlias}`
            : `no upstream block "${inputAlias}" - publishing an empty ${outputAlias}`;
        const detail = arrived
            ? `count ${stats.count}   min ${stats.min}   max ${stats.max}   mean ${stats.mean}   total ${stats.total}`
            : `no producer ran first - load ${CHAIN_FILE} to see the whole chain`;
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([1, 2], "row", { claimants: ["1{1}", "1{1}"] })), ID),
            assets: {},
            backgroundColor: PANEL,
            sources: [
                (0, template_utils_1.makeColorTile)(arrived ? OK : MISSING),
                (0, template_utils_1.bindProps)((0, svg_text_1.svgLabel)(headline, width, Math.round(height / 3), {
                    maxPx: Math.round(height * 0.05),
                    maxLines: 2,
                    color: INK,
                }), [{ propKey: "inputAlias" }, { propKey: "seriesKey" }, { propKey: "outputAlias" }]),
                (0, template_utils_1.makeColorTile)(PANEL),
                (0, svg_text_1.svgLabel)(detail, width, Math.round((height * 2) / 3), {
                    maxPx: Math.round(height * 0.04),
                    maxLines: 3,
                    color: INK,
                }),
                // Publish the DERIVED block. Downstream never sees the raw input
                // through this template — that is what makes it an adapter and not
                // a passthrough.
                {
                    type: "data",
                    alias: (0, types_1.asAliasId)(outputAlias),
                    variables: { ...stats, sourceAlias: inputAlias, upstreamArrived: arrived },
                    editor: { owner: "template" },
                },
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Pure Adapter",
        lines: [
            "An adapter reads ctx.upstreamData[in] and publishes a new data source under [out]: a pure function between channels.",
            "Splitting fetch from shape keeps this core tier - no permission prompt, no secrets, testable with a plain object.",
            "Pure means pure: same input, same output. No clock, no randomness, no fs - that is what makes a chain reproducible.",
            "Missing upstream is normal in the editor. Publish an empty well-shaped result and say so; never throw.",
        ],
        explore: [
            "Render standalone: MISSING, and still a valid block",
            "Point Series key at another key in the payload",
            "Load examples/data-chain/starter-data-chain.mosaicx",
        ],
    }),
});
exports.default = exports.PureAdapterV1;
