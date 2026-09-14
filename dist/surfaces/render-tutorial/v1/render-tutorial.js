"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderTutorialV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/surfaces/render-tutorial/v1";
const PAGE_BG = "#0b0e11";
const BAND_BG = "#151d26";
const ACCENT = "#f2a03d";
const INK = "#eaeef2";
const INK_DIM = "#7f8c9b";
/**
 * The pages, with their own durations. Longer page, longer read — the
 * numbers are the timeline, and nothing outside this file influences them.
 */
const PAGES = [
    {
        name: "what",
        heading: "A tutorial is watched",
        lines: [
            "renderTutorial returns a renderable the user scrubs in place.",
            "It is never rendered to a file, and never runs on the CLI path.",
        ],
        durationMs: 3200,
    },
    {
        name: "timing",
        heading: "It owns its timing",
        lines: [
            "Each page declares its own durationMs; the pipeline total is their sum.",
            "Never read ctx.target.durationMs - the host passes no form duration.",
        ],
        durationMs: 4000,
    },
    {
        name: "optin",
        heading: "Opt-in, and loud on failure",
        lines: [
            "No tutorial declared means no pill appears - hosts synthesize nothing.",
            "A tutorial that throws shows an error card, because the user clicked.",
        ],
        durationMs: 3600,
    },
];
const propsSchema = (0, template_utils_1.definePropsSchema)({
    title: {
        type: "string",
        required: false,
        description: "Headline on the rendered card.",
        meta: { ui: { label: "Title", order: 1 } },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Page background as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: PAGE_BG },
            ui: { label: "Page color", order: 2 },
        },
    },
});
/** One page: a heading band over a body band. Real rects, not floating text. */
function buildPage(page, width, height, fps, pageBg) {
    const bands = [1, 2];
    const m0 = (0, dsl_stdlib_1.weightedSplit)(bands, "row", { claimants: ["1{1}", "1{1}"] });
    const headH = height / 3;
    const bodyH = (height * 2) / 3;
    const heading = (0, svg_text_1.fitSvgText)(page.heading, width * 0.86, headH * 0.62, {
        maxPx: Math.round(height * 0.1),
        maxLines: 1,
    });
    const body = (0, svg_text_1.fitSvgLines)(page.lines, width * 0.86, bodyH * 0.6, {
        maxPx: Math.round(height * 0.042),
        widthFrac: 0.9,
    });
    return {
        kind: "mosaic_document",
        version: 1,
        m0,
        assets: {},
        backgroundColor: pageBg,
        size: { width, height },
        fps,
        // The page's own duration. This is the line the lesson is about.
        durationMs: page.durationMs,
        sources: [
            (0, template_utils_1.makeColorTile)(BAND_BG),
            (0, svg_text_1.svgTextSource)([
                { text: heading.text, fontSize: heading.fontSize, color: ACCENT },
            ]),
            (0, template_utils_1.makeColorTile)(pageBg),
            (0, svg_text_1.svgTextSource)([
                { text: body.text, fontSize: body.fontSize, color: INK },
            ]),
        ],
    };
}
exports.RenderTutorialV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "70 · Render Tutorial",
    version: 1,
    description: "The only lesson in this repo that builds its own tutorial instead of using the standard page — because building one is what it teaches. Three pages as a pipeline, each declaring its own durationMs, proving the rule that a tutorial owns its timing and never reads ctx.target.durationMs.",
    capabilities: { tier: "core" },
    tags: ["surfaces", "tutorial", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Press the ? pill - the walkthrough is three pages long, and it decides how long.",
    },
    propsSchema,
    defaultProps: {
        title: "Press the ? pill",
        pageColor: PAGE_BG,
    },
    async render(props, ctx) {
        var _a, _b;
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const { width, height } = ctx.target;
        const pageBg = ((_a = props.pageColor) !== null && _a !== void 0 ? _a : PAGE_BG);
        const title = (0, svg_text_1.fitSvgText)((_b = props.title) !== null && _b !== void 0 ? _b : "Press the ? pill", width * 0.86, height * 0.3, {
            maxPx: Math.round(height * 0.12),
            maxLines: 1,
        });
        const total = PAGES.reduce((sum, p) => sum + p.durationMs, 0);
        const note = (0, svg_text_1.fitSvgText)(`The tutorial is ${PAGES.length} pages and ${(total / 1000).toFixed(1)}s - its own, not this card's.`, width * 0.86, height * 0.2, { maxPx: Math.round(height * 0.04), maxLines: 2 });
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)("1{1}", ID),
            assets: {},
            backgroundColor: pageBg,
            sources: [
                (0, template_utils_1.makeColorTile)(pageBg),
                (0, template_utils_1.bindProp)((0, svg_text_1.svgTextSource)([
                    { text: title.text, fontSize: title.fontSize, color: ACCENT },
                    {
                        text: note.text,
                        fontSize: note.fontSize,
                        color: INK_DIM,
                        vAlign: "bottom",
                        padding: { bottom: 0.26 },
                    },
                ]), "title"),
            ],
        };
    },
    /**
     * The bespoke walkthrough: pages as pipeline steps, each with its own
     * duration, cut between. `fps` comes from `ctx.target` (geometry-ish, and
     * the host's canvas); `durationMs` does NOT.
     */
    renderTutorial(_props, ctx) {
        var _a;
        const { width, height } = ctx.target;
        const fps = (_a = ctx.target.fps) !== null && _a !== void 0 ? _a : 30;
        const pageBg = PAGE_BG;
        const steps = PAGES.map((page) => ({
            name: page.name,
            durationMs: page.durationMs,
            file: buildPage(page, width, height, fps, pageBg),
        }));
        return {
            kind: "mosaic_pipeline",
            version: 1,
            fps,
            durationMs: steps.reduce((sum, step) => sum + step.durationMs, 0),
            defaultTransition: { type: "cut" },
            backgroundColor: pageBg,
            steps,
        };
    },
});
exports.default = exports.RenderTutorialV1;
