"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorPropsV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/props/color-props/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const DEFAULT_PALETTE = ["#e74c3c", "#f1c40f", "#2ecc71", "#3498db"];
const propsSchema = (0, template_utils_1.definePropsSchema)({
    panelColor: {
        type: "string",
        required: false,
        description: "The big panel's fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#21618c" },
            ui: { label: "Panel" },
        },
    },
    palette: {
        type: "string[]",
        required: false,
        description: "The swatch column as #rrggbb entries (1-8).",
        meta: {
            constraints: { isColor: true, minItems: 1, maxItems: 8 },
            control: { colorPicker: true },
            ui: { label: "Palette" },
        },
    },
});
exports.ColorPropsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "16 · Color Props",
    version: 1,
    description: "Color props declare themselves: isColor + colorPicker turns a string prop into a real swatch control, and the same declaration on a string[] prop gets the color-list control. A scalar panel beside a palette column, receipts on the caption.",
    capabilities: { tier: "core" },
    tags: ["props", "color", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Open both controls in the sidebar — a swatch for the scalar, swatch ROWS for the list.",
    },
    propsSchema,
    defaultProps: { panelColor: "#21618c", palette: DEFAULT_PALETTE },
    async render(props, ctx) {
        var _a, _b;
        const panelColor = (_a = props.panelColor) !== null && _a !== void 0 ? _a : "#21618c";
        const palette = (_b = props.palette) !== null && _b !== void 0 ? _b : DEFAULT_PALETTE;
        if (!HEX.test(panelColor)) {
            throw new Error(`${ID}: panelColor ${JSON.stringify(panelColor)} must be #rrggbb.`);
        }
        if (!Array.isArray(palette) || palette.length < 1 || palette.length > 8) {
            throw new Error(`${ID}: palette must hold 1-8 colors, got ${JSON.stringify(palette)}.`);
        }
        for (const c of palette) {
            if (typeof c !== "string" || !HEX.test(c)) {
                throw new Error(`${ID}: palette entry ${JSON.stringify(c)} must be #rrggbb.`);
            }
        }
        const { width, height } = ctx.target;
        // Panel (2/3) beside the palette column (1/3), caption band below.
        // Grammar: 1-count splits are illegal — one swatch IS the column.
        const column = palette.length === 1
            ? "1"
            : `${palette.length}[${new Array(palette.length).fill("1").join(",")}]`;
        const mainRow = String((0, dsl_stdlib_1.weightedSplit)([2, 1], "col", { claimants: ["1", column] }));
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: [mainRow, "1"] })), ID);
        const caption = `scalar panel ${panelColor} - list of ${palette.length}: ${palette.join(" ")}`;
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                (0, template_utils_1.makeColorTile)(panelColor),
                ...palette.map((c) => (0, template_utils_1.makeColorTile)(c)),
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.026),
                    maxLines: 2,
                    color: "#7f8c9b",
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Color Props",
        lines: [
            "A color prop is a string that DECLARES itself: constraints.isColor plus control.colorPicker.",
            "Without the declaration you get a bare text field; with it, a real swatch - and on a string[] prop, a swatch list.",
            "A conventions test enforces it here, because undeclared color props are the #1 cause of clunky forms.",
        ],
        explore: [
            "Open Panel in the sidebar - a single swatch control",
            "Open Palette - add a fifth color and the column resplits",
            "The caption prints every value render() received",
        ],
    }),
});
exports.default = exports.ColorPropsV1;
