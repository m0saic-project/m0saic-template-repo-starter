"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AspectAdaptiveCardV1 = void 0;
exports.wrapMeasured = wrapMeasured;
exports.fitSvgText = fitSvgText;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/basics/aspect-adaptive-card/v1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    title: {
        type: "string",
        required: false,
        description: "Headline, accent panel.",
        meta: { ui: { label: "Title", order: 1 } },
    },
    body: {
        type: "string",
        required: false,
        description: "Supporting line, body panel.",
        meta: { ui: { label: "Body", order: 2 } },
    },
    accentColor: {
        type: "string",
        required: false,
        description: "Accent panel fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2471a3" },
            ui: { label: "Accent color", order: 3 },
        },
    },
    panelColor: {
        type: "string",
        required: false,
        description: "Body panel fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Panel color", order: 4 },
        },
    },
});
/**
 * Greedy word-wrap measured against the bundled font: each line takes words
 * while it still fits `maxWidthPx` at `fontSize`. Never breaks a word (a
 * single over-long word gets its own line and the caller's size search
 * shrinks until it fits).
 */
function wrapMeasured(text, fontSize, maxWidthPx) {
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const lines = [];
    let line = "";
    for (const word of words) {
        const candidate = line.length === 0 ? word : `${line} ${word}`;
        if (line.length === 0 ||
            (0, template_utils_1.measureText)(candidate, { fontSize }).width <= maxWidthPx) {
            line = candidate;
        }
        else {
            lines.push(line);
            line = word;
        }
    }
    if (line.length > 0)
        lines.push(line);
    return lines;
}
/**
 * Fit `text` into a `boxW`×`boxH` pixel box: binary-search the largest font
 * size (12..maxPx) whose measured, wrapped block fits both axes. The width
 * budget is deliberately generous (~28% total side margin): breathing room
 * is good typography on desktop canvases, and it keeps the block safe even
 * on hosts whose preview font runs wider than the bundled render font.
 * Returns the "\n"-joined block ready for one svg layer.
 */
function fitSvgText(text, boxW, boxH, opts) {
    var _a;
    const clean = text.trim().replace(/\s+/g, " ");
    const usableW = boxW * ((_a = opts.widthFrac) !== null && _a !== void 0 ? _a : 0.72);
    const usableH = boxH * 0.66;
    const attempt = (fontSize) => {
        const lines = wrapMeasured(clean, fontSize, usableW);
        if (lines.length > opts.maxLines)
            return undefined;
        const block = lines.join("\n");
        const m = (0, template_utils_1.measureText)(block, { fontSize });
        if (m.width > usableW || m.height > usableH)
            return undefined;
        return { text: block, fontSize, lineCount: lines.length };
    };
    let lo = 12;
    let hi = Math.max(12, Math.round(opts.maxPx));
    let best = attempt(lo);
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const fit = attempt(mid);
        if (fit) {
            best = fit;
            lo = mid + 1;
        }
        else {
            hi = mid - 1;
        }
    }
    // Nothing fits even at 12px (absurd box) — emit at 12px anyway; a clipped
    // render beats a throw for a purely cosmetic overflow.
    return best !== null && best !== void 0 ? best : { text: clean, fontSize: 12, lineCount: 1 };
}
/**
 * SVG-glyph text source: bundled deterministic font, identical app + CLI.
 * NOTE: svg-rasterized text bakes to a masked color tile, so it carries NO
 * background of its own — pair it with a `makeColorTile` base underneath
 * (see render(): base tile + attached `{...}` overlay per panel).
 */
function svgText(layers) {
    return {
        type: "text",
        rasterizer: "svg",
        renderMode: { kind: "image" },
        layers: layers.map((layer) => {
            var _a;
            return ({
                content: { kind: "literal", text: layer.text },
                style: { fontSize: layer.fontSize, fontColor: layer.color },
                placement: {
                    hAlign: "center",
                    vAlign: (_a = layer.vAlign) !== null && _a !== void 0 ? _a : "middle",
                    ...(layer.padding ? { padding: layer.padding } : {}),
                },
            });
        }),
    };
}
exports.AspectAdaptiveCardV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "Aspect-Adaptive Card",
    version: 1,
    description: "One template, every aspect: reads ctx.target, flips columns to rows on portrait, prints its decision live, and fits svg-rasterized text to the panels it computed. Teaches the rule that prevents the classic nested-render bug — size off ctx.target, never ctx.output.",
    capabilities: { tier: "core" },
    tags: ["basics", "ctx", "layout"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Try 1080x1920 too — the layout flips to a stack and the caption follows.",
    },
    propsSchema,
    defaultProps: {
        title: "Reads the room",
        body: "Same template, either way.",
        accentColor: "#2471a3",
        panelColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c, _d;
        for (const [key, value] of [
            ["accentColor", props.accentColor],
            ["panelColor", props.panelColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        // THE lesson: the target slot decides the layout. Nested or top-level,
        // this is the canvas these pixels actually fill.
        const { width, height } = ctx.target;
        const landscape = width >= height;
        // Landscape: 1:2 columns. Portrait: 1:2 rows. Each panel is a BASE color
        // tile with its text attached as an overlay (`1{1}`): svg-rasterized text
        // carries no background of its own, and "fill underneath, content on the
        // attached overlay" is the standard pairing. Knowing our own weights
        // means we also know each panel's PIXEL box — which is what the text
        // must be fitted against (nothing soft-wraps).
        const m0 = (0, dsl_stdlib_1.weightedSplit)([1, 2], landscape ? "col" : "row", {
            claimants: ["1{1}", "1{1}"],
        });
        const accentBox = landscape
            ? { w: width / 3, h: height }
            : { w: width, h: height / 3 };
        const bodyBox = landscape
            ? { w: (width * 2) / 3, h: height }
            : { w: width, h: (height * 2) / 3 };
        const title = (_a = props.title) !== null && _a !== void 0 ? _a : "Reads the room";
        const body = (_b = props.body) !== null && _b !== void 0 ? _b : "Same template, either way.";
        const titleFit = fitSvgText(title, accentBox.w, accentBox.h, {
            maxPx: Math.round(Math.min(accentBox.h * 0.12, accentBox.w * 0.14)),
            maxLines: 3,
        });
        const bodyFit = fitSvgText(body, bodyBox.w, bodyBox.h * 0.6, {
            maxPx: Math.round(bodyBox.h * 0.065),
            maxLines: 3,
        });
        // The decision, printed on the card — watch it flip with the canvas.
        // ASCII "->" on purpose: the bundled glyph font is lean, and exotic
        // codepoints (like U+2192) render as tofu. Keep card copy ASCII.
        const caption = `${width}x${height} -> ${landscape ? "columns" : "rows"}`;
        const captionFit = fitSvgText(caption, bodyBox.w, bodyBox.h * 0.2, {
            maxPx: Math.round(bodyBox.h * 0.038),
            maxLines: 1,
        });
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            // Paint order follows the DSL walk: base tile, then its attached
            // overlay, per panel — so sources bind [fillA, textA, fillB, textB].
            sources: [
                (0, template_utils_1.makeColorTile)(((_c = props.accentColor) !== null && _c !== void 0 ? _c : "#2471a3")),
                svgText([
                    {
                        text: titleFit.text,
                        fontSize: titleFit.fontSize,
                        color: "#ffffff",
                    },
                ]),
                (0, template_utils_1.makeColorTile)(((_d = props.panelColor) !== null && _d !== void 0 ? _d : "#1c2833")),
                svgText([
                    {
                        text: bodyFit.text,
                        fontSize: bodyFit.fontSize,
                        color: "#ffffff",
                    },
                    {
                        text: captionFit.text,
                        fontSize: captionFit.fontSize,
                        color: "#7f8c9b",
                        vAlign: "bottom",
                        padding: { bottom: 0.06 },
                    },
                ]),
            ],
        };
    },
});
exports.default = exports.AspectAdaptiveCardV1;
