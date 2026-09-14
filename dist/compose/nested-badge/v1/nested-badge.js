"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestedBadgeV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/compose/nested-badge/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const PANEL = "#17202a";
const INK = "#ecf0f1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    text: {
        type: "string",
        required: false,
        description: "The badge's line of text — fitted to whatever box the caller hands over.",
        meta: { control: { placeholder: "nested" }, ui: { label: "Text" } },
    },
    accent: {
        type: "string",
        required: false,
        description: "Accent rail color as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#EF7525" },
            ui: { label: "Accent" },
        },
    },
});
exports.NestedBadgeV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "50 · Nested Badge",
    version: 1,
    description: "The child half of compose/nested-template: a badge that sizes everything off ctx.target, so it fills whatever slot the caller gives it. Marked internal — not a top-level pick, but it renders standalone, which is how you debug a child.",
    capabilities: { tier: "core" },
    tags: ["compose", "internal", "lesson"],
    internal: true,
    outputHints: {
        width: 384,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Usually rendered as a child. Opening it directly is the way to debug one.",
    },
    propsSchema,
    defaultProps: { text: "nested", accent: "#EF7525" },
    async render(props, ctx) {
        var _a, _b;
        const text = ((_a = props.text) !== null && _a !== void 0 ? _a : "nested").trim();
        const accent = (_b = props.accent) !== null && _b !== void 0 ? _b : "#EF7525";
        const problems = [];
        if (text.length < 1 || text.length > 24) {
            problems.push(`text must be 1-24 characters, got ${JSON.stringify(text)}`);
        }
        if (!HEX.test(accent))
            problems.push(`accent ${JSON.stringify(accent)} must be #rrggbb`);
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        // ctx.target is the SLOT when a parent passes one — every number below
        // is a share of it, so the same code fills a sliver or a full canvas.
        const { width, height } = ctx.target;
        const railWeight = 6; // ~6% of the width
        const labelBoxW = Math.round((width * (100 - railWeight)) / 100);
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([railWeight, 100 - railWeight], "col", { claimants: ["1", "1{1}"] })), ID);
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: PANEL,
            sources: [
                (0, template_utils_1.makeColorTile)(accent),
                (0, template_utils_1.makeColorTile)(PANEL),
                (0, template_utils_1.bindProp)((0, svg_text_1.svgLabel)(text, labelBoxW, height, {
                    maxPx: Math.round(Math.min(labelBoxW, height) * 0.2),
                    maxLines: 3,
                    color: INK,
                }), "text"),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Nested Badge",
        lines: [
            "The CHILD half of compose/nested-template, and the point is how ordinary it is.",
            "A nested template reads ctx.target and knows nothing about who called it - which is why the parent must hand it a slot.",
            "internal: true means \"not a top-level pick\", not \"cannot run\" - opening a child directly is how you debug one.",
        ],
        explore: [
            "Open compose/nested-template and change Slot % - this file doesn't",
            "Render this one directly at a wide aspect",
            "Change Text and watch the fit react to its box",
        ],
    }),
});
exports.default = exports.NestedBadgeV1;
