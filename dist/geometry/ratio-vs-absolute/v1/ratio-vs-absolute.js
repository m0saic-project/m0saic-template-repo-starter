"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatioVsAbsoluteV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const svg_text_1 = require("../../../_shared/svg-text");
const ID = "@m0saic-starter/geometry/ratio-vs-absolute/v1";
const RATIO_FILLS = ["#1a5276", "#2471a3", "#1a5276"];
const HEX = /^#[0-9a-fA-F]{6}$/;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    railPx: {
        type: "number",
        required: false,
        description: "Pinned width of the absolute band's side rails in px (40-1000). The ratio band ignores it — that's the point.",
        meta: { constraints: { min: 40, max: 1000 }, control: { step: 20 }, ui: { label: "Rail px" } },
    },
    absoluteColor: {
        type: "string",
        required: false,
        description: "Fill for the bottom (absolute) band's middle rect as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#117864" },
            ui: { label: "Absolute fill" },
        },
    },
});
exports.RatioVsAbsoluteV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "Ratio vs Absolute",
    version: 1,
    description: "A proportion contract over a pixel contract: a 1:2:1 ratio split whose sides scale with the canvas, above a placeRects band whose side rails are PINNED in px while the middle absorbs the rest. Resize the canvas and watch them disagree. Default to ratio; pin pixels only at the head canvas.",
    capabilities: { tier: "core" },
    tags: ["geometry", "drafting-modes", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Render at several widths: the ratio band's string never changes; the absolute band re-bakes its pixels every time.",
    },
    propsSchema,
    defaultProps: { railPx: 240, absoluteColor: "#117864" },
    async render(props, ctx) {
        var _a, _b;
        const railPx = (_a = props.railPx) !== null && _a !== void 0 ? _a : 240;
        const absoluteColor = (_b = props.absoluteColor) !== null && _b !== void 0 ? _b : "#117864";
        if (!Number.isInteger(railPx) || railPx < 40 || railPx > 1000) {
            throw new Error(`${ID}: railPx must be an integer 40-1000, got ${JSON.stringify(railPx)}.`);
        }
        if (!HEX.test(absoluteColor)) {
            throw new Error(`${ID}: absoluteColor ${JSON.stringify(absoluteColor)} must be #rrggbb.`);
        }
        const { width, height } = ctx.target;
        const halfH = Math.floor(height / 2);
        // RATIO band: proportions only. This exact string works at ANY canvas.
        const ratio = (0, dsl_stdlib_1.weightedSplit)([1, 2, 1], "col");
        // ABSOLUTE band: rails pinned in px, middle takes the remainder. The
        // pin has a feasibility edge — two rails can't exceed the canvas — so
        // narrow canvases clamp the rail and the caption says so (a silent
        // clamp would be a lie about the very thing this lesson teaches).
        const railEff = Math.min(railPx, Math.floor(width * 0.3));
        const clamped = railEff !== railPx;
        const absolute = (0, dsl_stdlib_1.placeRects)({
            rootW: width,
            rootH: halfH,
            rects: [
                { x: 0, y: 0, w: railEff, h: halfH },
                { x: railEff, y: 0, w: width - 2 * railEff, h: halfH },
                { x: width - railEff, y: 0, w: railEff, h: halfH },
            ],
        });
        // Stack the two bands; labels ride the attached overlay.
        const m0 = (0, dsl_stdlib_1.toM0String)(`2[${ratio},${absolute.m0}]{2[1,1]}`, ID);
        const ratioSources = RATIO_FILLS.map((fill) => (0, template_utils_1.makeColorTile)(fill));
        // Non-overlapping rects pack onto one layer and walk left-to-right, so
        // the middle rect carries the caller's accent while the rails stay muted.
        const orderedRects = absolute.layers.flatMap((layer) => layer.rectIndices);
        const absoluteSources = orderedRects.map((rectIndex) => (0, template_utils_1.makeColorTile)(rectIndex === 1 ? absoluteColor : "#0e6251"));
        const label = (text) => (0, svg_text_1.svgLabel)(text, width, halfH, {
            maxPx: Math.round(height * 0.04),
            vAlign: "bottom",
            padding: { bottom: 0.08 },
        });
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                ...ratioSources,
                ...absoluteSources,
                label(`ratio 1:2:1 - sides scale with the canvas: ~${Math.round(width / 4)}px here`),
                label(`placeRects - rails PINNED at ${railEff}px` +
                    (clamped ? ` (clamped from ${railPx})` : "") +
                    `, middle absorbs ${width - 2 * railEff}px`),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Ratio vs Absolute",
        lines: [
            "RATIO (weightedSplit [1,2,1]) is a PROPORTION contract: the sides are a quarter of ANY canvas. Resize and they scale; nest it in a parent slot and it recomposes.",
            "ABSOLUTE (placeRects) is a PIXEL contract: the bottom rails stay railPx wide no matter the canvas - the middle absorbs every extra pixel. Desktop chrome thinks this way: fixed sidebars, fluid content.",
            "The cost of pinning: a px-baked string only means something AT the canvas it was baked for. Nested into a different slot it quietly degrades. Default to ratio; go absolute only at the head - the final, never-nested canvas.",
            "At exactly 4x the rail width the contracts collide: a quarter IS 240px at 960 wide, and both bands canonicalize to the SAME string. Ratio says 'a quarter', absolute says '240px' - only sometimes do they agree.",
        ],
        explore: [
            "Drag the canvas width (DEVICE panel): top boundaries move, bottom rails hold still",
            "Watch the m0 readout in Geometry view: the ratio band's spelling never changes; the absolute band re-bakes every width",
            "Set the canvas 960 wide at Rail px 240 - the two bands collapse into one spelling",
            "Push Rail px past 30% of the width and the caption reports the clamp",
        ],
    }),
});
exports.default = exports.RatioVsAbsoluteV1;
