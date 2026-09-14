"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedPropsTourV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/props/typed-props-tour/v1";
const ALIGNS = ["left", "center", "right"];
const propsSchema = (0, template_utils_1.definePropsSchema)({
    title: {
        type: "string",
        required: false,
        description: "Header text (ASCII, 1-40 chars).",
        meta: { control: { placeholder: "Typed props" }, ui: { label: "Title" } },
    },
    tiles: {
        type: "number",
        required: false,
        description: "Columns in the middle band (1-8).",
        meta: { constraints: { min: 1, max: 8 }, control: { step: 1 }, ui: { label: "Tiles" } },
    },
    accent: {
        type: "boolean",
        required: false,
        description: "Render the marker row at all?",
        meta: { ui: { label: "Accent row" } },
    },
    align: {
        type: "string",
        required: false,
        description: "Which third of the marker row holds the marker.",
        meta: { constraints: { oneOf: [...ALIGNS] }, ui: { label: "Align" } },
    },
});
exports.TypedPropsTourV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "14 · Typed Props Tour",
    version: 1,
    description: "One prop of each scalar type — string, number, boolean, enum — each visibly driving the render, with the received values printed as a caption receipt. The schema picks the sidebar controls; render() is the gate.",
    capabilities: { tier: "core" },
    tags: ["props", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Change every prop in the sidebar and watch its band move.",
    },
    propsSchema,
    defaultProps: { title: "Typed props", tiles: 4, accent: true, align: "center" },
    async render(props, ctx) {
        var _a, _b, _c, _d;
        const title = (_a = props.title) !== null && _a !== void 0 ? _a : "Typed props";
        const tiles = (_b = props.tiles) !== null && _b !== void 0 ? _b : 4;
        const accent = (_c = props.accent) !== null && _c !== void 0 ? _c : true;
        const align = (_d = props.align) !== null && _d !== void 0 ? _d : "center";
        // The gate: the schema above is documentation; THIS is enforcement.
        if (title.length < 1 || title.length > 40 || !/^[\x20-\x7E]+$/.test(title)) {
            throw new Error(`${ID}: title must be 1-40 ASCII characters.`);
        }
        if (!Number.isInteger(tiles) || tiles < 1 || tiles > 8) {
            throw new Error(`${ID}: tiles must be an integer 1-8, got ${JSON.stringify(tiles)}.`);
        }
        if (typeof accent !== "boolean") {
            throw new Error(`${ID}: accent must be a boolean, got ${JSON.stringify(accent)}.`);
        }
        if (!ALIGNS.includes(align)) {
            throw new Error(`${ID}: align must be one of ${ALIGNS.join(" | ")}.`);
        }
        const { width, height } = ctx.target;
        // Rows: title / marker / tiles / caption. The boolean decides whether
        // the marker row claims a tile at all; the enum decides WHICH third.
        const markerRow = accent
            ? `3(${ALIGNS.map((a) => (a === align ? "1" : "-")).join(",")})`
            : "-";
        // Grammar: 1-count splits are illegal — one tile IS the row.
        const tilesRow = tiles === 1 ? "1" : `${tiles}(${new Array(tiles).fill("1").join(",")})`;
        const rows = (0, dsl_stdlib_1.weightedSplit)([2, 1, 3, 1], "row", {
            claimants: ["1", markerRow, tilesRow, "1"],
        });
        const m0 = (0, dsl_stdlib_1.toM0String)(String(rows), ID);
        const FILLS = [
            "#1a5276", "#2471a3", "#2e86c1", "#5499c7",
            "#1f618d", "#2980b9", "#3498db", "#21618c",
        ];
        const tileSources = new Array(tiles)
            .fill(null)
            .map((_, i) => (0, template_utils_1.makeColorTile)(FILLS[i % FILLS.length]));
        const caption = `render() received: title "${title}", tiles ${tiles}, ` +
            `accent ${accent}, align "${align}"`;
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                (0, template_utils_1.bindProp)((0, svg_text_1.svgLabel)(title, width, Math.round((height * 2) / 7), {
                    maxPx: Math.round(height * 0.07),
                    maxLines: 1,
                }), "title"),
                ...(accent ? [(0, template_utils_1.makeColorTile)("#EF7525")] : []),
                ...tileSources,
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 7), {
                    maxPx: Math.round(height * 0.028),
                    maxLines: 2,
                    color: "#7f8c9b",
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Typed Props Tour",
        lines: [
            "definePropsSchema declares one knob of each scalar type, and the TYPE picks the sidebar control.",
            "The schema is documentation for hosts; render() is the gate - the CLI can pass any raw props bag.",
            "Every optional prop carries a deterministic default, and the caption prints what render() received.",
        ],
        explore: [
            "Change every prop - each one moves a different band",
            "Toggle Accent row off - its m0 row becomes a null",
            "Set Tiles to 8, then 1 - the middle band resplits",
        ],
    }),
});
exports.default = exports.TypedPropsTourV1;
