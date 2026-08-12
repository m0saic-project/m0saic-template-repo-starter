"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMosaicV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/props/error-mosaic/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    ratio: {
        type: "number",
        required: false,
        description: "Split ratio for the card (0.1-0.9). Try 5 to break it.",
        meta: { constraints: { min: 0.1, max: 0.9 }, control: { step: 0.1 }, ui: { label: "Ratio" } },
    },
    accent: {
        type: "string",
        required: false,
        description: "Accent color as #rrggbb. Try \"orange\" to break it.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#EF7525" },
            ui: { label: "Accent" },
        },
    },
    tags: {
        type: "string",
        required: false,
        description: "Comma-separated tags, 1-4 items of 1-8 ASCII chars. Try five items.",
        meta: { control: { placeholder: "one,two,three" }, ui: { label: "Tags" } },
    },
});
exports.ErrorMosaicV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "18 · Error Mosaic",
    version: 1,
    description: "Failing on-canvas, usefully: collect EVERY problem with a remedy, then return makeErrorMosaic — a renderable report card instead of a dead preview. Three deliberately breakable knobs to practice on.",
    capabilities: { tier: "core" },
    tags: ["props", "errors", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Break a prop (Ratio 5, Accent \"orange\") and the canvas becomes the report card.",
    },
    propsSchema,
    defaultProps: { ratio: 0.618, accent: "#EF7525", tags: "one,two,three" },
    async render(props, ctx) {
        var _a, _b, _c;
        const ratio = (_a = props.ratio) !== null && _a !== void 0 ? _a : 0.618;
        const accent = (_b = props.accent) !== null && _b !== void 0 ? _b : "#EF7525";
        const tags = (_c = props.tags) !== null && _c !== void 0 ? _c : "one,two,three";
        const { width, height } = ctx.target;
        // 1) Collect EVERY problem, each with its remedy.
        const problems = [];
        if (!Number.isFinite(ratio) || ratio < 0.1 || ratio > 0.9) {
            problems.push(`ratio ${JSON.stringify(ratio)} - use a number between 0.1 and 0.9`);
        }
        if (!HEX.test(accent)) {
            problems.push(`accent ${JSON.stringify(accent)} - use a #rrggbb hex color`);
        }
        const items = tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
        if (items.length < 1 || items.length > 4) {
            problems.push(`tags has ${items.length} items - use 1 to 4, comma-separated`);
        }
        for (const t of items) {
            if (t.length > 8 || !/^[\x20-\x7E]+$/.test(t)) {
                problems.push(`tag "${t}" - keep each tag 1-8 ASCII chars`);
            }
        }
        // 2) Problems render, they don't throw: the report card IS the document.
        if (problems.length > 0) {
            return (0, template_utils_1.makeErrorMosaic)(problems.map((p) => `- ${p}`).join("\n"), {
                width,
                height,
                title: "Fix these props",
                errorCode: "STARTER_PROPS_INVALID",
            });
        }
        // Happy path: a two-cell card at the ratio, tags as caption.
        const a = Math.round(ratio * 100);
        const card = String((0, dsl_stdlib_1.weightedSplit)([a, 100 - a], "col"));
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: [card, "1"] })), ID);
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                (0, template_utils_1.makeColorTile)(accent),
                (0, template_utils_1.makeColorTile)("#1c2833"),
                (0, svg_text_1.svgLabel)(`ratio ${ratio} - tags: ${items.join(" / ")}`, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.026),
                    maxLines: 1,
                    color: "#7f8c9b",
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Error Mosaic",
        lines: [
            "In an editor a throw is a dead preview. Collect EVERY problem with a REMEDY and return makeErrorMosaic - a document that shows the report card.",
            "Collect-all matters because props are wrong in several places at once.",
            "Write remedies, not accusations: say what to DO.",
        ],
        explore: [
            "Set Ratio to 5 - the canvas becomes the report card",
            "Also type \"orange\" into Accent - both remedies stack",
            "Fix them and the card gives way to the render",
        ],
    }),
});
exports.default = exports.ErrorMosaicV1;
