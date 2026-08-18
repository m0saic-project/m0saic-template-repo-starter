"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberSeriesV1 = void 0;
exports.parseSeries = parseSeries;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/number-series/v1";
const MAX_SERIES = 3;
const MAX_POINTS = 12;
const DEFAULT_VALUES = [
    [12, 28, 22, 40, 34, 52],
    [8, 14, 30, 26, 44, 38],
];
/** Normalize the round-trip contract: number[] and number[][] both arrive. */
function parseSeries(raw) {
    const value = typeof raw === "string" ? JSON.parse(raw) : (raw !== null && raw !== void 0 ? raw : DEFAULT_VALUES);
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`${ID}: values must be a non-empty array.`);
    }
    const series = typeof value[0] === "number"
        ? [value]
        : value;
    if (series.length < 1 || series.length > MAX_SERIES) {
        throw new Error(`${ID}: values must hold 1-${MAX_SERIES} series.`);
    }
    for (const [i, s] of series.entries()) {
        if (!Array.isArray(s) || s.length < 2 || s.length > MAX_POINTS) {
            throw new Error(`${ID}: series[${i}] must hold 2-${MAX_POINTS} points.`);
        }
        for (const v of s) {
            if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 9999) {
                throw new Error(`${ID}: series[${i}] point ${JSON.stringify(v)} must be a number in [0, 9999].`);
            }
        }
    }
    return series;
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    values: {
        type: "json",
        required: false,
        description: "Chart values. flavor numberSeries renders a tabbed multi-series editor; the value round-trips as flat number[] for one series and number[][] for several — render normalizes both.",
        meta: {
            constraints: {
                jsonSchema: {
                    oneOf: [
                        { type: "array", minItems: 2, maxItems: MAX_POINTS, items: { type: "number", minimum: 0 } },
                        {
                            type: "array",
                            minItems: 1,
                            maxItems: MAX_SERIES,
                            items: {
                                type: "array",
                                minItems: 2,
                                maxItems: MAX_POINTS,
                                items: { type: "number", minimum: 0 },
                            },
                        },
                    ],
                },
            },
            control: { flavor: "numberSeries" },
            ui: { label: "Values", order: 1 },
        },
    },
    bandColor: {
        type: "string",
        required: false,
        description: "Accent fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2e86c1" },
            ui: { label: "Band color", order: 2 },
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
/** A darker twin of a #rrggbb colour. */
function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const dim = (v) => Math.max(0, Math.round(v * 0.62));
    const hh = (v) => v.toString(16).padStart(2, "0");
    return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}`;
}
exports.NumberSeriesV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "21 · Number Series",
    version: 1,
    description: "Chart data edited as tabs of numeric rows: flavor numberSeries gives a json prop one tab per series, and the value round-trips flat (number[]) for one series and nested (number[][]) for several — so render normalizes both shapes before drawing, the same tolerance that keeps hand-authored files working. Renders grouped bars against the shared maximum. numberList is the single-series sibling: same contract minus the tabs.",
    capabilities: { tier: "core" },
    tags: ["controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Edit Values: tabs, one per series. Remove down to one series and save — the file now carries a flat number[]; the render doesn't care.",
    },
    propsSchema,
    defaultProps: {
        values: DEFAULT_VALUES,
        bandColor: "#2e86c1",
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b;
        for (const [key, value] of [
            ["bandColor", props.bandColor],
            ["pageColor", props.pageColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const series = parseSeries(props.values);
        const { width, height } = ctx.target;
        const bandHex = (_a = props.bandColor) !== null && _a !== void 0 ? _a : "#2e86c1";
        const band = bandHex;
        const page = ((_b = props.pageColor) !== null && _b !== void 0 ? _b : "#1c2833");
        // Grouped bars: one band per series, bars proportional to the SHARED
        // max (comparability is the point of series). A bar is a column cell
        // split into [air, bar] rows; zero values keep a 1-unit stub so the
        // slot never vanishes.
        const max = Math.max(...series.flat(), 1);
        const barBand = (s) => {
            const cells = s.map((v) => {
                const h = Math.max(2, Math.round((v / max) * 92));
                return String((0, dsl_stdlib_1.weightedSplit)([100 - h, h], "row", { mode: "literal", claimants: ["-", "1"] }));
            });
            const weights = [3, ...s.flatMap(() => [Math.max(2, Math.floor(90 / s.length) - 2), 2])];
            const claimants = ["-", ...cells.flatMap((c) => [c, "-"])];
            return String((0, dsl_stdlib_1.weightedSplit)(weights, "col", { mode: "literal", claimants }));
        };
        const bandH = Math.floor(64 / series.length);
        const rowsWeights = [8, ...series.flatMap(() => [bandH, 6])];
        const rowsClaimants = ["-", ...series.flatMap((s) => [barBand(s), "-"])];
        const rows = String((0, dsl_stdlib_1.weightedSplit)(rowsWeights, "row", { mode: "literal", claimants: rowsClaimants }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const sources = [];
        for (const [i, s] of series.entries()) {
            for (let k = 0; k < s.length; k++) {
                sources.push((0, template_utils_1.makeColorTile)(i % 2 === 0 ? band : shade(bandHex)));
            }
        }
        const flatShape = series.length === 1 ? "flat number[]" : `number[][] x ${series.length}`;
        const heading = (0, svg_text_1.fitSvgText)(`NUMBER SERIES - ${series.length} series, ${series[0].length} points, shipped as ${flatShape}`, width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.034), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            "flavor numberSeries: tabs in the editor - flat number[] for one series, number[][] for several, render accepts both",
            `bars share one maximum (${max}) so series stay comparable - numberList is the tab-less single-series sibling`,
        ], width * 0.9, height * 0.09, { maxPx: Math.round(height * 0.026), widthFrac: 0.92 });
        sources.push((0, svg_text_1.svgTextSource)([
            {
                text: heading.text,
                fontSize: heading.fontSize,
                color: "#eaeef2",
                vAlign: "top",
                padding: { top: 0.08 },
            },
            {
                text: readout.text,
                fontSize: readout.fontSize,
                color: "#7f8c9b",
                vAlign: "bottom",
                padding: { bottom: 0.12 },
            },
        ]));
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: page,
            sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Number Series",
        lines: [
            "flavor numberSeries: a json prop edits as tabs, one per series, each a numeric row list with add and remove.",
            "The shape contract: ONE series round-trips flat as number[]; several as number[][]. Render normalizes both - hand-authored files stay welcome.",
            "numberList is the single-series sibling (a chart's xValues); same contract minus the tabs.",
        ],
        explore: [
            "Add a third series - the file shape goes nested",
            "Delete down to one and save - flat again; same render",
        ],
    }),
});
exports.default = exports.NumberSeriesV1;
