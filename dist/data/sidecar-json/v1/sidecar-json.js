"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidecarJsonV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/data/sidecar-json/v1";
const PANEL = "#17202a";
const ACCENT = "#EF7525";
const INK = "#ecf0f1";
const INK_DIM = "#7f8c9b";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    note: {
        type: "string",
        required: false,
        description: "Free text carried into the sidecar file — stands in for whatever a real template would record.",
        meta: { control: { placeholder: "rendered by the starter repo" }, ui: { label: "Note" } },
    },
    includeGeometry: {
        type: "boolean",
        required: false,
        description: "Add the canvas and timing to the sidecar. Useful downstream: a build step can lay out a page without opening the video.",
        meta: { ui: { label: "Include geometry" } },
    },
});
exports.SidecarJsonV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "66 · Sidecar JSON",
    version: 1,
    description: "doc.sidecars writes files beside the render: each key becomes {output-basename}.{key}.json. sidecarsSchema on the template declares them, doc.sidecars carries the values — a sidecar is a file for what comes after m0saic, where a data source is an in-memory channel for the next template.",
    capabilities: { tier: "core" },
    tags: ["data", "sidecars", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "video", container: "mp4" },
        note: "Render to out.mp4 and look for out.renderFacts.json beside it.",
    },
    propsSchema,
    defaultProps: { note: "rendered by the starter repo", includeGeometry: true },
    // HALF ONE: the declaration. A host reads this to know what to expect.
    sidecarsSchema: {
        renderFacts: {
            type: "object",
            required: false,
            description: "Facts about this render, written as {output-basename}.renderFacts.json next to the deliverable.",
        },
    },
    async render(props, ctx) {
        var _a, _b;
        const note = ((_a = props.note) !== null && _a !== void 0 ? _a : "rendered by the starter repo").trim();
        const includeGeometry = (_b = props.includeGeometry) !== null && _b !== void 0 ? _b : true;
        if (note.length > 120) {
            throw new Error(`${ID}: note must be 120 characters or fewer, got ${note.length}.`);
        }
        const { width, height, fps, durationMs } = ctx.target;
        // Everything here is derived from props and ctx — a sidecar written from
        // a clock or a counter would make the same render produce different files.
        const facts = { templateId: ID, note };
        if (includeGeometry) {
            facts.canvas = { width, height };
            facts.timing = { fps, durationMs, frames: Math.round((durationMs / 1000) * fps) };
        }
        const lines = Object.keys(facts).map((k) => `${k}: ${JSON.stringify(facts[k])}`);
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([1, 3], "row", { claimants: ["1{1}", "1{1}"] })), ID),
            assets: {},
            backgroundColor: PANEL,
            sources: [
                (0, template_utils_1.makeColorTile)(ACCENT),
                (0, svg_text_1.svgLabel)("out.renderFacts.json", width, Math.round(height / 4), {
                    maxPx: Math.round(height * 0.06),
                    maxLines: 1,
                    color: PANEL,
                }),
                (0, template_utils_1.makeColorTile)(PANEL),
                (0, template_utils_1.bindProp)((0, svg_text_1.svgLabel)(lines.join("   "), width, Math.round((height * 3) / 4), {
                    maxPx: Math.round(height * 0.032),
                    maxLines: 5,
                    color: lines.length > 1 ? INK : INK_DIM,
                }), "note"),
            ],
            // HALF TWO: the values for THIS render.
            sidecars: { renderFacts: facts },
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Sidecar JSON",
        lines: [
            "doc.sidecars writes files beside the render: each key lands as {output-basename}.{key}.json.",
            "Two halves: sidecarsSchema on the template declares them, doc.sidecars carries this render's values. Both required.",
            "A sidecar is not a data source: one is a file for what comes AFTER m0saic, the other an in-memory channel for the next template.",
            "Suppressed in design mode - so a fact that lives only in a sidecar is a fact the editor cannot see.",
        ],
        explore: [
            "Render to a file and open the .renderFacts.json beside it",
            "Turn Include geometry off - the file shrinks",
            "Render at another size: the facts follow ctx.target",
        ],
    }),
});
exports.default = exports.SidecarJsonV1;
