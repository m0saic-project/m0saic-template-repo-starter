"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorTilesV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
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
    gap: {
        type: "number",
        required: false,
        description: "Gap around and between the tiles, in weight units against a tile's 10 (0-6). The gaps are NULL cells — they paint nothing, so the document background shows through them. Set 0 for edge-to-edge tiles and the background disappears entirely.",
        meta: { constraints: { min: 0, max: 6 }, control: { step: 1 }, ui: { label: "Gap" } },
    },
});
exports.ColorTilesV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "04 · Color Tiles",
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
        gap: 1,
    },
    async render(props, _ctx) {
        var _a, _b, _c;
        const colors = (_a = props.colors) !== null && _a !== void 0 ? _a : ["#c0392b", "#1e8449", "#2471a3"];
        const backgroundColor = (_b = props.backgroundColor) !== null && _b !== void 0 ? _b : "#0b0e11";
        const gap = (_c = props.gap) !== null && _c !== void 0 ? _c : 1;
        if (!Number.isInteger(gap) || gap < 0 || gap > 6) {
            throw new Error(`${ID}: gap must be an integer 0-6, got ${JSON.stringify(gap)}.`);
        }
        if (colors.length < 2 || colors.length > 8) {
            throw new Error(`${ID}: colors needs 2-8 entries, got ${colors.length}.`);
        }
        for (const c of [...colors, backgroundColor]) {
            if (!HEX.test(c)) {
                throw new Error(`${ID}: ${JSON.stringify(c)} must be a #rrggbb hex color.`);
            }
        }
        // One weight per color → one column per color → one source per column.
        // With a gap, null cells (`-`) are woven around and between the tiles:
        // they claim width and paint nothing, so the document background shows
        // there — and they claim NO source, so `sources` still holds exactly
        // one entry per color.
        const TILE_WEIGHT = 10;
        const m0 = gap === 0
            ? (0, dsl_stdlib_1.weightedSplit)(colors.map(() => TILE_WEIGHT), "col")
            : (() => {
                // Columns with a null on each side and between each pair…
                const weights = [gap];
                const claimants = ["-"];
                for (const _ of colors) {
                    weights.push(TILE_WEIGHT, gap);
                    claimants.push("1", "-");
                }
                const row = String((0, dsl_stdlib_1.weightedSplit)(weights, "col", { claimants }));
                // …then a null band above and below, so the background frames
                // the tiles on all four sides instead of showing as slits.
                return (0, dsl_stdlib_1.weightedSplit)([gap, TILE_WEIGHT, gap], "row", {
                    claimants: ["-", row, "-"],
                });
            })();
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
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Color Tiles",
        lines: [
            "sources[] maps onto tiles in walk order: first weight, first source.",
            "Solid tiles are makeColorTile - a free lavfi color source that composes with masks, placement and timing.",
            "The Gap knob weaves NULL cells between them. A null paints nothing, so the background shows through - never burn a base layer to get one.",
            "Nulls claim space but never a source: widen the gap and sources stays one entry per color.",
        ],
        explore: [
            "Set Gap to 0 - edge to edge, and Background stops mattering",
            "Widen Gap, then change Background - that is the document fill",
            "Add a 4th color - the split follows the array",
            "Eye menu > Show dimensions for per-tile pixels",
        ],
    }),
});
exports.default = exports.ColorTilesV1;
