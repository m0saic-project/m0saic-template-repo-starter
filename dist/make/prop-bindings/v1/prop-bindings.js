"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropBindingsV1 = void 0;
exports.lineSpans = lineSpans;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/make/prop-bindings/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const MAX_BULLETS = 4;
const MAX_ROWS = 3;
const MAX_SCORES = 4;
const MAX_CODE_LINES = 4;
const COUNT_MAX = 999;
const MODES = ["plain", "boxed"];
const INK = "#eaeef2";
const DIM = "#9aa7b4";
const CHIP = "#2e3d4d";
const CELL = "#243342";
const DEFAULT_BULLETS = [
    "Double-click any text on this card",
    "The rect knows which prop drew it",
    "Closed pickers get no pencil",
];
const DEFAULT_ROWS = [
    { name: "latency", value: 42, color: "#2e86c1" },
    { name: "errors", value: 0, color: "#27ae60" },
];
const DEFAULT_SCORES = [3, 8, 5];
const DEFAULT_CODE = 'const src = svgLabel(props.title, w, h)\nbindProp(src, "title")\nreturn { m0, sources: [src] }';
const propsSchema = (0, template_utils_1.definePropsSchema)({
    title: {
        type: "string",
        required: false,
        description: "Headline - layer 0 of the header rect. bindProps binds it together with the subtitle: one rect, two knobs.",
        meta: { control: { placeholder: "Bind what you show" }, ui: { label: "Title", order: 1 } },
    },
    subtitle: {
        type: "string",
        required: false,
        description: "Under the headline - layer 1 of the SAME header rect. Make opens the rect as a stacked two-field form.",
        meta: { control: { placeholder: "every rect knows which knob drew it" }, ui: { label: "Subtitle", order: 2 } },
    },
    accentColor: {
        type: "string",
        required: false,
        description: "The swatch's fill (#rrggbb). A colour-valued string binds with kind \"color\": double-click the swatch and Make opens a picker.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#ee7525" },
            ui: { label: "Accent", order: 3 },
        },
    },
    count: {
        type: "number",
        required: false,
        description: "A plain number. The numeral binds it (kind \"number\"): double-click opens a numeric editor.",
        meta: { constraints: { min: 0, max: COUNT_MAX }, ui: { label: "Count", order: 4 } },
    },
    scores: {
        type: "number[]",
        required: false,
        description: "Up to 4 numbers. Each tile binds ONE element - bindProp(src, \"scores\", i). The list itself is never bindable.",
        meta: { constraints: { maxItems: MAX_SCORES }, ui: { label: "Scores", order: 5 } },
    },
    bullets: {
        type: "string[]",
        required: false,
        description: "Up to 4 lines. Each line is its own rect bound to ONE element - bindProp(src, \"bullets\", i). The list itself is never bindable.",
        meta: { constraints: { maxItems: MAX_BULLETS }, ui: { label: "Bullets", order: 6 } },
    },
    rows: {
        type: "json",
        required: false,
        description: "Up to 3 rows of {name, value, color}. Each cell binds ONE leaf - bindPropPath(src, \"rows\", [i, \"name\"], \"string\") - path AND kind, because the schema carries no per-leaf type. The value leaf is kind \"number\", the swatch leaf kind \"color\".",
        meta: {
            constraints: {
                jsonSchema: {
                    type: "array",
                    maxItems: MAX_ROWS,
                    items: {
                        type: "object",
                        required: ["name", "value", "color"],
                        properties: {
                            name: { type: "string", maxLength: 16 },
                            value: { type: "number", minimum: 0, maximum: COUNT_MAX },
                            color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
                        },
                    },
                },
            },
            control: {
                flavor: "objectRows",
                columns: [
                    { key: "name", kind: "text", label: "Name", placeholder: "metric" },
                    { key: "value", kind: "number", label: "Value" },
                    { key: "color", kind: "color", label: "Color" },
                ],
            },
            ui: { label: "Rows", order: 7 },
        },
    },
    code: {
        type: "string",
        required: false,
        description: "Up to 4 lines. Each line is its own rect bound to ONE character span of this string - bindPropRange(src, \"code\", undefined, lineSpan, tokenSpan); Make pre-selects the token.",
        meta: { control: { placeholder: "one line per rect" }, ui: { label: "Code", order: 8 } },
    },
    mode: {
        type: "string",
        required: false,
        description: "A closed set drawn as a chip. NOT bindable - closed pickers never are - so the chip carries no pencil.",
        meta: { constraints: { oneOf: [...MODES] }, ui: { label: "Mode", order: 9 } },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Backdrop as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Page color", order: 10 },
        },
    },
});
/** `[start, end)` spans of each line in the RAW string, plus its first token. */
function lineSpans(code) {
    const out = [];
    let offset = 0;
    for (const line of code.split("\n")) {
        const start = offset;
        const end = start + line.length;
        const tok = /\S+/.exec(line);
        const focus = tok ? { start: start + tok.index, end: start + tok.index + tok[0].length } : { start, end };
        out.push({ line, range: { start, end }, focus });
        offset = end + 1; // the "\n"
    }
    return out;
}
const isFiniteIn = (n, lo, hi) => typeof n === "number" && Number.isFinite(n) && n >= lo && n <= hi;
exports.PropBindingsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "81 · Prop Bindings",
    version: 1,
    description: "Provenance: the rect that shows a prop is bound to it, so Make's double-click edits that knob in place - and every bindable kind is on one card. bindProp for free text and a number, bindProps for a header over a subtitle (one rect, two knobs), a colour swatch whose binding opens a picker, bindProp with an index for one element of a string[] or number[], bindPropPath (path AND kind) for string / number / colour leaves of a row list, bindPropRange (line span + focus token) for one line of a multi-line string - plus a closed picker drawn as a chip that gets no pencil on purpose. Which props are bindable is decided once, in the platform; the lesson's test uses the same predicate Make does.",
    capabilities: { tier: "core" },
    tags: ["make", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Static card. Double-click the header, the subtitle, the swatch, a number, a bullet, a row cell, or a code line; the mode chip has no pencil.",
    },
    propsSchema,
    defaultProps: {
        title: "Bind what you show",
        subtitle: "every rect knows which knob drew it",
        accentColor: "#ee7525",
        count: 7,
        scores: DEFAULT_SCORES,
        bullets: DEFAULT_BULLETS,
        rows: DEFAULT_ROWS,
        code: DEFAULT_CODE,
        mode: "boxed",
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        // The schema is documentation; render() is the gate.
        const title = (_a = props.title) !== null && _a !== void 0 ? _a : "Bind what you show";
        const subtitle = (_b = props.subtitle) !== null && _b !== void 0 ? _b : "every rect knows which knob drew it";
        if (typeof title !== "string" || typeof subtitle !== "string")
            throw new Error(`${ID}: title and subtitle must be strings.`);
        const accent = (_c = props.accentColor) !== null && _c !== void 0 ? _c : "#ee7525";
        if (!HEX.test(accent))
            throw new Error(`${ID}: accentColor ${JSON.stringify(accent)} must be #rrggbb.`);
        const count = (_d = props.count) !== null && _d !== void 0 ? _d : 7;
        if (!isFiniteIn(count, 0, COUNT_MAX))
            throw new Error(`${ID}: count must be a number in [0, ${COUNT_MAX}].`);
        const scores = (_e = props.scores) !== null && _e !== void 0 ? _e : DEFAULT_SCORES;
        if (!Array.isArray(scores) || scores.length > MAX_SCORES || scores.some((n) => !isFiniteIn(n, 0, COUNT_MAX))) {
            throw new Error(`${ID}: scores must be up to ${MAX_SCORES} numbers in [0, ${COUNT_MAX}].`);
        }
        const bullets = (_f = props.bullets) !== null && _f !== void 0 ? _f : DEFAULT_BULLETS;
        if (!Array.isArray(bullets) || bullets.length > MAX_BULLETS || bullets.some((b) => typeof b !== "string")) {
            throw new Error(`${ID}: bullets must be up to ${MAX_BULLETS} strings.`);
        }
        const rows = (_g = props.rows) !== null && _g !== void 0 ? _g : DEFAULT_ROWS;
        if (!Array.isArray(rows) ||
            rows.length > MAX_ROWS ||
            rows.some((r) => !r || typeof r !== "object" || typeof r.name !== "string" || !isFiniteIn(r.value, 0, COUNT_MAX) || typeof r.color !== "string" || !HEX.test(r.color))) {
            throw new Error(`${ID}: rows must be up to ${MAX_ROWS} objects of {name: string, value: number, color: #rrggbb}.`);
        }
        const code = (_h = props.code) !== null && _h !== void 0 ? _h : DEFAULT_CODE;
        if (typeof code !== "string")
            throw new Error(`${ID}: code must be a string.`);
        const lines = lineSpans(code);
        if (lines.length > MAX_CODE_LINES)
            throw new Error(`${ID}: code must have at most ${MAX_CODE_LINES} lines.`);
        const mode = (_j = props.mode) !== null && _j !== void 0 ? _j : "boxed";
        if (!MODES.includes(mode))
            throw new Error(`${ID}: mode must be one of ${MODES.join(", ")}.`);
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const page = ((_k = props.pageColor) !== null && _k !== void 0 ? _k : "#1c2833");
        const ACCENT = accent;
        const { width: W, height: H } = ctx.target;
        const px = (fx, fy, fw, fh) => ({
            x: Math.round(fx * W),
            y: Math.round(fy * H),
            w: Math.round(fw * W),
            h: Math.round(fh * H),
        });
        const label = (text, box, maxPx, color) => (0, template_utils_1.svgLabel)(text || " ", box.w, box.h, { maxPx: Math.round(maxPx * H), maxLines: 1, color });
        const boxed = mode === "boxed";
        const pieces = [];
        const piece = (rect, importance, source) => pieces.push({ rect: { ...rect, importance }, source });
        // Backdrop - the whole canvas, painted first.
        piece(px(0, 0, 1, 1), 0, (0, template_utils_1.makeColorTile)(page));
        // 1. Header OVER subtitle - one multi-layer rect, TWO knobs (bindProps).
        //    Make opens it as a stacked form; each layer names the prop it shows.
        const head = px(0.06, 0.05, 0.66, 0.15);
        const titleFit = (0, template_utils_1.fitSvgText)(title || " ", head.w, head.h * 0.55, { maxPx: Math.round(H * 0.07), maxLines: 1 });
        const subFit = (0, template_utils_1.fitSvgText)(subtitle || " ", head.w, head.h * 0.4, { maxPx: Math.round(H * 0.03), maxLines: 1 });
        piece(head, 2, (0, template_utils_1.bindProps)((0, template_utils_1.svgTextSource)([
            { text: titleFit.text, fontSize: titleFit.fontSize, color: INK, vAlign: "top", padding: { top: 0.04 } },
            { text: subFit.text, fontSize: subFit.fontSize, color: DIM, vAlign: "bottom", padding: { bottom: 0.06 } },
        ]), [
            { propKey: "title", layer: 0 },
            { propKey: "subtitle", layer: 1 },
        ]));
        // 2. A colour string: the swatch binds `accentColor` - kind "color", so
        //    Make opens a picker instead of a text field.
        const swatch = px(0.78, 0.06, 0.16, 0.07);
        piece(swatch, 2, (0, template_utils_1.bindProp)((0, template_utils_1.makeColorTile)(ACCENT), "accentColor"));
        const swatchCap = px(0.78, 0.14, 0.16, 0.05);
        piece(swatchCap, 2, label("accentColor - a picker", swatchCap, 0.02, DIM));
        // The mode chip: a closed set, drawn but NOT bound (no pencil).
        const chipRect = px(0.06, 0.22, 0.14, 0.06);
        piece(chipRect, 1, (0, template_utils_1.makeColorTile)(boxed ? CHIP : page));
        piece(chipRect, 2, label(`mode: ${mode}`, chipRect, 0.026, DIM));
        // 3. A number: the numeral binds `count` - kind "number".
        const countCap = px(0.24, 0.22, 0.08, 0.06);
        piece(countCap, 2, label("count", countCap, 0.024, DIM));
        const countRect = px(0.33, 0.22, 0.09, 0.06);
        if (boxed)
            piece(countRect, 1, (0, template_utils_1.makeColorTile)(CELL));
        piece(countRect, 2, (0, template_utils_1.bindProp)(label(String(count), countRect, 0.034, ACCENT), "count"));
        // 4. ONE element of a number[]: each tile binds `scores[i]`.
        const scoresCap = px(0.46, 0.22, 0.09, 0.06);
        piece(scoresCap, 2, label("scores", scoresCap, 0.024, DIM));
        scores.forEach((n, i) => {
            const r = px(0.56 + i * 0.065, 0.22, 0.055, 0.06);
            if (boxed)
                piece(r, 1, (0, template_utils_1.makeColorTile)(CELL));
            piece(r, 2, (0, template_utils_1.bindProp)(label(String(n), r, 0.03, INK), "scores", i));
        });
        // 5. ONE element of a string[]: each bullet rect binds `bullets[i]`.
        bullets.forEach((b, i) => {
            const r = px(0.06, 0.32 + i * 0.075, 0.42, 0.065);
            if (boxed)
                piece(r, 1, (0, template_utils_1.makeColorTile)(CELL));
            piece(r, 2, (0, template_utils_1.bindProp)(label(b, r, 0.032, INK), "bullets", i));
        });
        // 6. LEAVES of a json row list - path AND kind, one per leaf type:
        //    `rows[i].name` (string), `rows[i].value` (number), `rows[i].color` (color).
        rows.forEach((row, i) => {
            const y = 0.32 + i * 0.075;
            const name = px(0.54, y, 0.18, 0.065);
            const value = px(0.74, y, 0.1, 0.065);
            const color = px(0.86, y, 0.08, 0.065);
            if (boxed) {
                piece(name, 1, (0, template_utils_1.makeColorTile)(CELL));
                piece(value, 1, (0, template_utils_1.makeColorTile)(CELL));
            }
            piece(name, 2, (0, template_utils_1.bindPropPath)(label(row.name, name, 0.03, INK), "rows", [i, "name"], "string"));
            piece(value, 2, (0, template_utils_1.bindPropPath)(label(String(row.value), value, 0.03, ACCENT), "rows", [i, "value"], "number"));
            piece(color, 2, (0, template_utils_1.bindPropPath)((0, template_utils_1.makeColorTile)(row.color), "rows", [i, "color"], "color"));
        });
        // 7. ONE LINE of a multi-line string: each code rect binds its own
        //    character span of `code`, with the first token pre-selected.
        lines.forEach((l, i) => {
            const r = px(0.06, 0.64 + i * 0.062, 0.88, 0.055);
            if (boxed)
                piece(r, 1, (0, template_utils_1.makeColorTile)(CELL));
            piece(r, 2, (0, template_utils_1.bindPropRange)(label(l.line, r, 0.028, DIM), "code", undefined, l.range, l.focus));
        });
        // Static caption - not a prop, so nothing to bind.
        const cap = px(0.06, 0.905, 0.88, 0.05);
        piece(cap, 2, label("double-click any text, swatch, or number - the mode chip has no pencil", cap, 0.024, DIM));
        const placed = (0, template_utils_1.placeInsetPieces)({ rootW: W, rootH: H, pieces });
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)(placed.m0, ID),
            assets: {},
            backgroundColor: page,
            sources: placed.sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Prop Bindings",
        lines: [
            "A rect that shows a prop is BOUND to it - bindProp on the source. Make derives 'double-click this rect -> edit that knob' from it, every render.",
            "Every bindable kind is here: text, header over subtitle (one rect, two knobs), a colour swatch, numbers, list elements, row leaves, one code line.",
            "The mode chip is a closed picker - not bindable, so no pencil. Bindable-or-not is decided once, in the platform; the test asks the same question.",
        ],
        explore: [
            "Double-click the header, then the subtitle - one rect, two fields",
            "Double-click the orange swatch - a colour picker",
            "Double-click a score or a row's number - numeric editors",
            "Double-click the mode chip - nothing; use the panel",
        ],
    }),
});
exports.default = exports.PropBindingsV1;
