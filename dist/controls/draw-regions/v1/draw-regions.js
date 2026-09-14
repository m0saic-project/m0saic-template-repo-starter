"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawRegionsV1 = exports.DEFAULT_REGIONS = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/draw-regions/v1";
const MAX_REGIONS = 6;
/** Region chip palette — index-stable so re-renders keep their colors. */
const CHIPS = [
    "#2e86c1",
    "#27ae60",
    "#ca6f1e",
    "#884ea0",
    "#c0392b",
    "#17a589",
];
/** Default marked areas — two rects over the stand-in scene. */
exports.DEFAULT_REGIONS = {
    canvas: { w: 1280, h: 720 },
    regions: [
        { x: 96, y: 128, w: 288, h: 288 },
        { x: 800, y: 96, w: 384, h: 192 },
    ],
};
const propsSchema = (0, template_utils_1.definePropsSchema)({
    regions: {
        type: "json",
        required: false,
        description: "The areas you marked. Draw on the preview (rect tool; ellipse and brush carve masks inside a rect), or hand-author { canvas, regions: [{x,y,w,h}] } px JSON — the wire is the same either way, and order is your intent.",
        meta: {
            control: {
                picker: "regions",
                regions: {
                    min: 0,
                    max: MAX_REGIONS,
                    shapes: ["rect", "ellipse", "brush"],
                },
            },
            ui: { label: "Marked areas", order: 1 },
        },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Backdrop as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Page color", order: 2 },
        },
    },
});
exports.DrawRegionsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "26 · Draw Regions",
    version: 1,
    description: "The user marks an area on the live preview and the template receives geometry — that handshake is the product. picker \"regions\" arms Make's draw mode (rect tool, plus ellipse/brush mask carving inside a rect); the wire is plain px JSON, so the same value arrives from --props or an agent identically. What a template does with the areas is its own concern — blur them, redact them, hand them to AI work as target boxes; this lesson shows the handshake itself, marking each region with an index chip in draw order. Zero regions is the working base case, and consumption runs parseRegionsValue then resolveRegionsToPx, degrading bad regions without killing the batch.",
    capabilities: { tier: "core" },
    tags: ["controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Open Marked areas and draw on the preview — rectangles land as numbered chips in draw order. Delete them all: the scene invites you again.",
    },
    propsSchema,
    defaultProps: {
        regions: exports.DEFAULT_REGIONS,
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b;
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const { width, height } = ctx.target;
        const page = ((_a = props.pageColor) !== null && _a !== void 0 ? _a : "#1c2833");
        // Boundary: tolerant parse; a malformed value gets a report card that
        // names the wire shape, never a dead preview.
        const parsed = (0, template_utils_1.parseRegionsValue)((_b = props.regions) !== null && _b !== void 0 ? _b : exports.DEFAULT_REGIONS);
        if (!parsed.ok) {
            return (0, template_utils_1.makeErrorMosaic)([
                `- the regions prop did not parse: ${parsed.error}`,
                `- the wire is { canvas?, regions: [{x, y, w, h}, ...] } in integer px`,
                `- draw on the preview instead of hand-typing, and the shape is always right`,
            ].join("\n"), { width, height, title: "Marked areas do not parse", errorCode: "STARTER_BAD_REGIONS" });
        }
        // Semantics: rescale to THIS canvas, clamp, judge per region.
        const resolved = (0, template_utils_1.resolveRegionsToPx)(parsed, { width, height });
        const rects = resolved
            .filter((r) => r.ok === true)
            .slice(0, MAX_REGIONS);
        const dropped = resolved.length - rects.length;
        // The stand-in scene: sky / ridge / ground bands — something to draw
        // OVER, so marking "the subject" feels natural.
        const scene = String((0, dsl_stdlib_1.weightedSplit)([46, 22, 32], "row", {
            mode: "literal",
            claimants: ["1", "1", "1"],
        }));
        // Quarter-resolution grid keeps the precision floor at width/4 instead
        // of width (the design-pixels trap). One placeRects layer per region,
        // nested innermost-last, so source order equals DRAW order.
        const gw = Math.max(8, Math.ceil(width / 4));
        const gh = Math.max(8, Math.ceil(height / 4));
        const grid = (v, scaleFrom, max) => Math.min(max, Math.max(0, Math.round((v / scaleFrom) * max)));
        // Fold layers innermost-out with the caption strip at the very center —
        // overlay CHAINS are illegal, nesting is not, and string order (layer 0
        // outermost) is what keeps source binding in DRAW order.
        let chain = "6[-,-,-,-,-,1]";
        for (let i = rects.length - 1; i >= 0; i--) {
            const r = rects[i];
            const x = grid(r.x, width, gw - 2);
            const y = grid(r.y, height, gh - 2);
            const rect = {
                x,
                y,
                w: Math.min(gw - x, Math.max(2, grid(r.w, width, gw))),
                h: Math.min(gh - y, Math.max(2, grid(r.h, height, gh))),
                claimant: "1{1}",
            };
            const layer = String((0, dsl_stdlib_1.placeRects)({ rootW: gw, rootH: gh, rects: [rect] }).layers[0].m0);
            chain = `${layer}{${chain}}`;
        }
        const m0 = (0, dsl_stdlib_1.toM0String)(`${scene}{${chain}}`, ID);
        const sources = [];
        sources.push((0, template_utils_1.makeColorTile)("#22303e")); // sky
        sources.push((0, template_utils_1.makeColorTile)("#1a252f")); // ridge
        sources.push((0, template_utils_1.makeColorTile)("#141d26")); // ground
        for (const [i, r] of rects.entries()) {
            sources.push((0, template_utils_1.makeColorTile)(CHIPS[i % CHIPS.length]));
            sources.push((0, template_utils_1.svgLabel)(`${i + 1}  ${r.w}x${r.h}`, Math.max(60, r.w * 0.9), Math.max(30, r.h * 0.5), {
                color: "#eaeef2",
                maxPx: Math.round(height * 0.03),
                vAlign: "middle",
            }));
        }
        const heading = (0, svg_text_1.fitSvgText)(rects.length === 0
            ? "DRAW REGIONS - the scene is waiting; mark an area on the preview"
            : `DRAW REGIONS - ${rects.length} area${rects.length === 1 ? "" : "s"} received, in draw order${dropped > 0 ? ` (${dropped} degraded)` : ""}`, width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.032), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            "the handshake is the product: you mark geometry against the live preview; the wire is plain px JSON either way",
            "what a template DOES with areas is its own concern - blur, redact, AI target boxes; this one just shows receipt",
        ], width * 0.9, height * 0.09, { maxPx: Math.round(height * 0.026), widthFrac: 0.92 });
        sources.push((0, svg_text_1.svgTextSource)([
            {
                text: heading.text,
                fontSize: heading.fontSize,
                color: "#eaeef2",
                vAlign: "top",
                padding: { top: 0.08 },
            },
            {
                text: readout.text,
                fontSize: readout.fontSize,
                color: "#7f8c9b",
                vAlign: "bottom",
                padding: { bottom: 0.12 },
            },
        ]));
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: page,
            sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Draw Regions",
        lines: [
            "picker regions arms draw mode on the LIVE preview - the user marks areas naturally, and the template receives plain px JSON geometry.",
            "What you do with the areas is your concern: blur them, redact them, hand them to AI work as target boxes. The handshake is the product.",
            "Consume with parseRegionsValue then resolveRegionsToPx: tolerant at the boundary, per-region verdicts, zero regions as the base case.",
        ],
        explore: [
            "Draw two rects on the preview - chips land in draw order",
            "Delete them all - zero is a working state, not an error",
        ],
    }),
});
exports.default = exports.DrawRegionsV1;
