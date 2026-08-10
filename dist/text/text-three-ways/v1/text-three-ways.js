"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextThreeWaysV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/text/text-three-ways/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const PANEL = "#17202a";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    word: {
        type: "string",
        required: false,
        description: "The word rendered three ways (ASCII, 1-12 chars).",
        meta: { control: { placeholder: "M0saic" }, ui: { label: "Word" } },
    },
    inkColor: {
        type: "string",
        required: false,
        description: "Ink color as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#ecf0f1" },
            ui: { label: "Ink" },
        },
    },
});
exports.TextThreeWaysV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "Text, Three Ways",
    version: 1,
    description: "The same word through all three text pipelines, side by side: drawtext (ffmpeg, expr-capable, host fonts), the svg rasterizer (bundled font baked to geometry — identical app/CLI), and mask-carved glyphs (text as a mask any source can wear). All valid; different promises.",
    capabilities: { tier: "core" },
    tags: ["text", "rasterizer", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Select each column's tile — the rasterizer row and the MASK section tell the three apart.",
    },
    propsSchema,
    defaultProps: { word: "M0saic", inkColor: "#ecf0f1" },
    async render(props, ctx) {
        var _a, _b;
        const word = (_a = props.word) !== null && _a !== void 0 ? _a : "M0saic";
        const inkColor = (_b = props.inkColor) !== null && _b !== void 0 ? _b : "#ecf0f1";
        if (word.length < 1 || word.length > 12 || !/^[\x20-\x7E]+$/.test(word)) {
            throw new Error(`${ID}: word must be 1-12 ASCII characters, got ${JSON.stringify(word)}.`);
        }
        if (!HEX.test(inkColor)) {
            throw new Error(`${ID}: inkColor ${JSON.stringify(inkColor)} must be #rrggbb.`);
        }
        const ink = inkColor;
        const { width, height } = ctx.target;
        const cellW = Math.round(width / 3);
        // One size for all three, measured against the bundled font so the svg
        // and mask columns match exactly (drawtext draws the HOST font at the
        // same number — the small visual drift IS part of the lesson).
        const fit = (0, template_utils_1.fitSvgText)(word, cellW, height * 0.5, {
            maxPx: Math.round(height * 0.12),
            maxLines: 1,
        });
        // 1) DRAWTEXT: the plain text source. No `rasterizer` — ffmpeg draws it.
        // One more asymmetry: a drawtext frame paints an OPAQUE background
        // (black unless told otherwise), while svg/mask text bakes to
        // transparent geometry — so this source carries the panel fill itself.
        //
        // The second layer is the expr beat: a % count-up ffmpeg re-evaluates
        // per frame (`renderMode:"video"`, not "image" — a still would freeze
        // the counter at frame 0). Only THIS pipeline can do this; an svg
        // source with an expr layer silently falls back to drawtext.
        const durationSec = ctx.target.durationMs / 1000;
        const drawtextCol = {
            type: "text",
            renderMode: { kind: "video" },
            visual: { backgroundColor: (0, template_utils_1.solidBackground)(PANEL) },
            layers: [
                {
                    content: { kind: "literal", text: word },
                    style: { fontSize: fit.fontSize, fontColor: ink },
                },
                {
                    content: {
                        kind: "expr",
                        expr: (0, template_utils_1.animateNumbersInText)("100%", { durationSec }),
                        eval: "frame",
                    },
                    style: {
                        fontSize: Math.max(14, Math.round(fit.fontSize * 0.4)),
                        fontColor: "#7f8c9b",
                    },
                    placement: { hAlign: "center", vAlign: "bottom", padding: { bottom: 0.12 } },
                },
            ],
        };
        // 2) SVG RASTERIZER: same word, bundled font, baked to geometry.
        const svgCol = (0, template_utils_1.svgTextSource)([
            { text: word, fontSize: fit.fontSize, color: ink },
        ]);
        // 3) MASK-CARVED: the word becomes an inline-mask on an ordinary color
        // tile. Design canvas = this column's box, so bounds match the cell
        // aspect (see geometry/mask-in-a-cell) and nothing smears.
        const maskCanvas = { width: cellW, height };
        const maskCol = (0, template_utils_1.makeColorTile)(ink, {
            mask: {
                kind: "inline-mask",
                localPath: (0, template_utils_1.textToPath)(word, { fontSize: fit.fontSize }, maskCanvas),
                bounds: { x: 0, y: 0, width: maskCanvas.width, height: maskCanvas.height },
            },
        });
        // Three panel columns, each content on its attached overlay; captions
        // bound to a bottom band split per column (tight text binding).
        const m0 = (0, dsl_stdlib_1.toM0String)("3(1{1},1{1},1{1}){6[-,-,-,-,-,3(1,1,1)]}", ID);
        const caption = (text) => (0, svg_text_1.svgLabel)(text, cellW, Math.round(height / 6), {
            maxPx: Math.round(height * 0.028),
            maxLines: 2,
            color: "#7f8c9b",
        });
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                (0, template_utils_1.makeColorTile)(PANEL),
                drawtextCol,
                (0, template_utils_1.makeColorTile)(PANEL),
                svgCol,
                (0, template_utils_1.makeColorTile)(PANEL),
                maskCol,
                caption("drawtext: ffmpeg filter, host font - the counter is an expr"),
                caption("svg rasterizer: bundled font, baked, app == CLI"),
                caption("mask-carved: text AS a mask - any source can wear it"),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Text, Three Ways",
        lines: [
            "DRAWTEXT is ffmpeg's text filter: rendered at encode time with the HOST's font. It is the only path that runs expressions - the % count-up under column one is an expr layer (animateNumbersInText compiles \"100%\" to a %{eif:...} expansion; renderMode \"video\" makes ffmpeg re-evaluate it every frame).",
            "The SVG RASTERIZER (rasterizer: \"svg\") bakes the bundled font's outlines to geometry: identical in app and CLI, fast, measurable with measureText. Static literals only - give it an expr layer and it silently falls back to drawtext.",
            "MASK-CARVED text (textToPath -> inline-mask) turns the word into a mask an ordinary source wears - a color today, a gradient or video playing through the letters tomorrow. Most powerful, most manual.",
            "One asymmetry to remember: drawtext frames paint an OPAQUE background (black unless set); svg and mask text bake to transparent geometry.",
        ],
        explore: [
            "Press play: only column one's counter ticks - svg and mask text are baked geometry",
            "Select column one: its rasterizer row is LOCKED (expr layers need ffmpeg); column two's stays editable",
            "Flip column two's layer content.kind literal -> expr in the panel and watch its lock appear too",
            "Column three is a lavfi tile - the word lives in its MASK section",
        ],
    }),
});
exports.default = exports.TextThreeWaysV1;
