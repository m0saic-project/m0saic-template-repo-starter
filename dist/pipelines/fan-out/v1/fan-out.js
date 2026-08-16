"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FanOutV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/pipelines/fan-out/v1";
const BRAND = "#EF7525";
const PANEL = "#17202a";
const INK = "#ecf0f1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    title: {
        type: "string",
        required: false,
        description: "Text drawn on every variant — one source of truth, laid out differently per shape.",
        meta: { control: { placeholder: "Ship it" }, ui: { label: "Title" } },
    },
    includeSquare: {
        type: "boolean",
        required: false,
        description: "Add a third output step at 1:1. Each step becomes its own file, named from step.name.",
        meta: { ui: { label: "Include square" } },
    },
    variantMs: {
        type: "number",
        required: false,
        description: "How long each variant renders. Steps are independent documents, so they could differ — this one keeps them equal.",
        meta: {
            constraints: { min: 200, max: 5000 },
            control: { step: 100 },
            ui: { label: "Variant ms" },
        },
    },
});
/** One variant: a mark and a title, laid out for THIS shape. */
function variant(title, width, height, durationMs, fps) {
    const portrait = height > width;
    // The point of fanning out: the layout CHANGES, it doesn't just scale.
    const m0 = portrait
        ? String((0, dsl_stdlib_1.weightedSplit)([3, 2], "row", { claimants: ["1", "1"] }))
        : String((0, dsl_stdlib_1.weightedSplit)([2, 3], "col", { claimants: ["1", "1"] }));
    const titleBox = portrait
        ? { w: width, h: Math.round((height * 2) / 5) }
        : { w: Math.round((width * 3) / 5), h: height };
    return {
        kind: "mosaic_document",
        version: 1,
        m0: (0, dsl_stdlib_1.toM0String)(m0, ID),
        assets: {},
        // Each step declares its OWN canvas — this is what emit:"multi" honors.
        size: { width, height },
        fps,
        durationMs,
        backgroundColor: PANEL,
        sources: [
            (0, template_utils_1.makeColorTile)(BRAND),
            (0, svg_text_1.svgLabel)(`${title}\n${width}x${height}`, titleBox.w, titleBox.h, {
                maxPx: Math.round(Math.min(titleBox.w, titleBox.h) * 0.16),
                maxLines: 2,
                color: INK,
            }),
        ],
    };
}
exports.FanOutV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "43 · Fan Out",
    version: 1,
    description: "emit:\"multi\" writes one file per output step, each at its own canvas — the only way one template delivers several geometries. Landscape and portrait re-LAY OUT rather than scaling, which is the reason to fan out instead of adding an encode.",
    capabilities: { tier: "core" },
    tags: ["pipelines", "multi-output", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 1000,
        note: "Render it and look at the output folder: one file per step, named from step.name.",
    },
    propsSchema,
    defaultProps: { title: "Ship it", includeSquare: false, variantMs: 1000 },
    async render(props, ctx) {
        var _a, _b, _c;
        const title = ((_a = props.title) !== null && _a !== void 0 ? _a : "Ship it").trim();
        const includeSquare = (_b = props.includeSquare) !== null && _b !== void 0 ? _b : false;
        const variantMs = (_c = props.variantMs) !== null && _c !== void 0 ? _c : 1000;
        const problems = [];
        if (title.length < 1 || title.length > 24) {
            problems.push(`title must be 1-24 characters, got ${JSON.stringify(title)}`);
        }
        if (!Number.isFinite(variantMs) || variantMs < 200 || variantMs > 5000) {
            problems.push(`variantMs must be 200-5000, got ${JSON.stringify(variantMs)}`);
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height, fps } = ctx.target;
        // Derive the variants from the CANVAS, so the shapes follow ctx.target
        // instead of hardcoding 1920x1080 the way a fixture would.
        const long = Math.max(width, height);
        const short = Math.min(width, height);
        const steps = [
            {
                name: "landscape",
                label: title,
                durationMs: variantMs,
                file: variant(title, long, short, variantMs, fps),
            },
            {
                name: "portrait",
                label: title,
                durationMs: variantMs,
                file: variant(title, short, long, variantMs, fps),
            },
        ];
        if (includeSquare) {
            steps.push({
                name: "square",
                label: title,
                durationMs: variantMs,
                file: variant(title, short, short, variantMs, fps),
            });
        }
        return {
            kind: "mosaic_pipeline",
            version: 1,
            // The whole lesson. Without this the steps concatenate into one file.
            emit: "multi",
            fps,
            steps,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Fan Out",
        lines: [
            "emit \"multi\" stops concatenating and writes ONE FILE PER STEP, each at its own canvas.",
            "Each file is named from step.name: {base}-{name}.{ext}. Names must be unique; unnamed steps fall back to step-{index}.",
            "Multi is TOP-LEVEL only - nested in another document's children it silently downgrades to single.",
            "These variants re-LAY OUT per shape. If a resize would do, one render plus an encodes entry is cheaper.",
        ],
        explore: [
            "Render it and look at the output folder - one file per step",
            "Turn Include square on: a third file appears",
            "Compare with encode-matrix: re-layout versus re-encode",
        ],
    }),
});
exports.default = exports.FanOutV1;
