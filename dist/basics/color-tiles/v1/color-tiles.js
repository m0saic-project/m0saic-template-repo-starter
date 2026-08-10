"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorTilesV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/basics/color-tiles/v1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    colors: {
        type: "string[]",
        required: false,
        description: "Tile fills, left to right (#rrggbb each). 2-8 columns.",
        // A string[] with color meta is a color LIST: the app renders one
        // swatch row per entry (add/remove; empty list = unset → defaults).
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true },
            ui: { label: "Tile colors" },
        },
    },
    backgroundColor: {
        type: "string",
        required: false,
        description: "Document background fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#0b0e11" },
            ui: { label: "Background" },
        },
    },
});
exports.ColorTilesV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "Color Tiles",
    version: 1,
    description: "Three equal columns, one makeColorTile each — the sources[]-to-tiles mapping, the lavfi color-tile convention, and document.backgroundColor instead of a wasted base layer.",
    capabilities: { tier: "core" },
    tags: ["basics", "layout", "color"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Static tiles — any canvas and duration render cleanly.",
    },
    propsSchema,
    defaultProps: {
        colors: ["#c0392b", "#1e8449", "#2471a3"],
        backgroundColor: "#0b0e11",
    },
    async render(props, _ctx) {
        var _a, _b;
        const colors = (_a = props.colors) !== null && _a !== void 0 ? _a : ["#c0392b", "#1e8449", "#2471a3"];
        const backgroundColor = (_b = props.backgroundColor) !== null && _b !== void 0 ? _b : "#0b0e11";
        if (colors.length < 2 || colors.length > 8) {
            throw new Error(`${ID}: colors needs 2-8 entries, got ${colors.length}.`);
        }
        for (const c of [...colors, backgroundColor]) {
            if (!HEX.test(c)) {
                throw new Error(`${ID}: ${JSON.stringify(c)} must be a #rrggbb hex color.`);
            }
        }
        // One weight per color → one column per color → one source per column.
        const m0 = (0, dsl_stdlib_1.weightedSplit)(colors.map(() => 1), "col");
        const sources = colors.map((c) => (0, template_utils_1.makeColorTile)(c));
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: backgroundColor,
            sources,
        };
    },
});
exports.default = exports.ColorTilesV1;
