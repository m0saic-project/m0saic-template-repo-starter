"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonDataPropV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/props/json-data-prop/v1";
const DEFAULT_DATA = [
    { label: "alpha", value: 30 },
    { label: "beta", value: 80 },
    { label: "gamma", value: 55 },
];
const BAR = "#2e86c1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    data: {
        type: "json",
        required: false,
        description: "Records to chart: an array of 1-6 objects shaped {label: 1-12 ASCII chars, value: 1-100}.",
        meta: { ui: { label: "Data" } },
    },
});
exports.JsonDataPropV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "16 · JSON Data Prop",
    version: 1,
    description: "Structured data through one type:\"json\" prop — the host hands render() the parsed value, render() collects EVERY shape problem into one remedy-bearing error, and the records become geometry: one proportional bar per row.",
    capabilities: { tier: "core" },
    tags: ["props", "data", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Edit the Data prop's JSON — rows and bars follow the records.",
    },
    propsSchema,
    defaultProps: { data: DEFAULT_DATA },
    async render(props, ctx) {
        var _a;
        const data = (_a = props.data) !== null && _a !== void 0 ? _a : DEFAULT_DATA;
        // Collect ALL problems, then throw once with remedies — a structure
        // prop can be wrong in several places at the same time.
        const problems = [];
        if (!Array.isArray(data) || data.length < 1 || data.length > 6) {
            problems.push("data must be an array of 1-6 records");
        }
        else {
            data.forEach((rec, i) => {
                if (typeof rec !== "object" || rec === null) {
                    problems.push(`data[${i}] must be an object {label, value}`);
                    return;
                }
                const { label, value } = rec;
                if (typeof label !== "string" ||
                    label.length < 1 ||
                    label.length > 12 ||
                    !/^[\x20-\x7E]+$/.test(label)) {
                    problems.push(`data[${i}].label must be 1-12 ASCII chars`);
                }
                if (typeof value !== "number" || !Number.isFinite(value) || value < 1 || value > 100) {
                    problems.push(`data[${i}].value must be a number 1-100`);
                }
            });
        }
        if (problems.length > 0) {
            throw new Error(`${ID}: invalid data prop:\n- ${problems.join("\n- ")}`);
        }
        const { width, height } = ctx.target;
        const max = Math.max(...data.map((d) => d.value));
        // One row per record: a label cell (fixed weight) beside a bar area
        // where the value claims its share against the max — data as geometry.
        const rowM0 = (rec) => {
            const v = Math.round(rec.value);
            const rest = Math.max(0, Math.round(max) - v);
            const bar = rest > 0
                ? String((0, dsl_stdlib_1.weightedSplit)([v, rest], "col", { claimants: ["1", "-"] }))
                : "1";
            return String((0, dsl_stdlib_1.weightedSplit)([1, 3], "col", { claimants: ["1", bar] }));
        };
        const rows = String((0, dsl_stdlib_1.weightedSplit)([...data.map(() => 3), 1], "row", { claimants: [...data.map(rowM0), "1"] }));
        const m0 = (0, dsl_stdlib_1.toM0String)(rows, ID);
        const rowH = Math.round((height * 3) / (data.length * 3 + 1));
        const sources = data.flatMap((rec) => [
            (0, svg_text_1.svgLabel)(rec.label, Math.round(width / 4), rowH, {
                maxPx: Math.round(height * 0.04),
                maxLines: 1,
            }),
            (0, template_utils_1.makeColorTile)(BAR),
        ]);
        const caption = `type:"json" - ${data.length} records, max ${max} - ` +
            data.map((d) => `${d.label}:${d.value}`).join(" ");
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                ...sources,
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / (data.length * 3 + 1)), {
                    maxPx: Math.round(height * 0.024),
                    maxLines: 1,
                    color: "#7f8c9b",
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "JSON Data Prop",
        lines: [
            "When a knob is a STRUCTURE, declare it type:\"json\" - the host hands render() the parsed value.",
            "render() still owns the shape, collecting EVERY problem into one remedy-bearing error.",
            "The data becomes geometry: each record claims a weightedSplit share - a bar chart with no chart library.",
        ],
        explore: [
            "Edit Data: add a record, watch a row appear",
            "Set two values equal - their bars match to the pixel",
            "Break two fields at once: both problems, one message",
        ],
    }),
});
exports.default = exports.JsonDataPropV1;
