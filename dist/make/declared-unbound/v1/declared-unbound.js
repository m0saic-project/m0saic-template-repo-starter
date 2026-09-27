"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeclaredUnboundV1 = exports.DECLARED_UNBOUND_DEFAULTS = void 0;
exports.tintsOf = tintsOf;
exports.dealOrder = dealOrder;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/make/declared-unbound/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const INK = "#eaeef2";
const DIM = "#9aa7b4";
const COLUMNS_MIN = 2;
const COLUMNS_MAX = 10;
const GAP_MAX = 4;
const PADDING_MAX = 12;
const SEED_MAX = 2147483647;
exports.DECLARED_UNBOUND_DEFAULTS = {
    label: "declared unbound",
    columns: 6,
    gap: 1,
    seed: 7,
    padding: 6,
    accent: "#ee7525",
    pageColor: "#1c2833",
};
/** `n` tints of one colour, darkest first — mixed toward white. */
function tintsOf(hex, n) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const mix = (c, m) => Math.round(c + (255 - c) * m);
    const to2 = (c) => c.toString(16).padStart(2, "0");
    return Array.from({ length: n }, (_, i) => {
        const m = n === 1 ? 0 : (i / (n - 1)) * 0.6;
        return `#${to2(mix(r, m))}${to2(mix(g, m))}${to2(mix(b, m))}`;
    });
}
/** The order the tints are dealt in — Fisher-Yates over a seeded generator. */
function dealOrder(seed, n) {
    const rng = (0, template_utils_1.mulberry32)(seed);
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    label: {
        type: "string",
        required: false,
        description: "The one bound prop on the card - the rect that shows it is its handle.",
        meta: { control: { placeholder: "declared unbound" }, ui: { label: "Label", order: 1 } },
    },
    columns: {
        type: "number",
        required: false,
        description: "How many tiles. A COUNT of rects, not a value on any one of them - accountable, and honestly unbound.",
        meta: { constraints: { min: COLUMNS_MIN, max: COLUMNS_MAX }, control: { step: 1 }, ui: { label: "Columns", order: 2 } },
    },
    gap: {
        type: "number",
        required: false,
        description: "Gutter between tiles, in percent of the canvas width. Geometry - never drawn.",
        meta: { constraints: { min: 0, max: GAP_MAX }, control: { step: 0.5 }, ui: { label: "Gap", order: 3 } },
    },
    seed: {
        type: "number",
        required: false,
        description: "Deals the tint order through mulberry32 - determinism, never drawn. Same seed, same strip.",
        meta: { constraints: { min: 0, max: SEED_MAX }, control: { step: 1 }, ui: { label: "Seed", order: 4 } },
    },
    padding: {
        type: "number",
        required: false,
        description: "Inset from the canvas edges, in percent of the canvas width. Geometry - never drawn.",
        meta: { constraints: { min: 0, max: PADDING_MAX }, control: { step: 1 }, ui: { label: "Padding", order: 5 } },
    },
    accent: {
        type: "string",
        required: false,
        description: "The tint family painted on every tile. A colour on many rects has no single handle, so it is declared rather than bound.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#ee7525" },
            ui: { label: "Accent", order: 6 },
        },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Backdrop as #rrggbb. It IS document.backgroundColor, so it needs no binding and no declaration.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Page color", order: 7 },
        },
    },
});
exports.DeclaredUnboundV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "84 · Declared Unbound",
    version: 1,
    description: "What a compliant NON-binding looks like: one bound label beside five accountable props that no rect shows - columns, gap, seed, padding, accent - each named in bindings.unbound with its reason, and a page colour that needs nothing because it IS the document background.",
    capabilities: { tier: "core" },
    tags: ["make", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Static card. The label is the only handle; every other knob changes the strip from the panel.",
    },
    propsSchema,
    defaultProps: { ...exports.DECLARED_UNBOUND_DEFAULTS },
    // THE LESSON. Every prop that could carry a handle is bound (label) or named
    // here with the reason it has none. pageColor is absent on purpose: it is the
    // document background, and a colour with no rect needs neither.
    bindings: {
        unbound: {
            columns: "geometry — a COUNT of tiles, not a value on any one",
            gap: "geometry — a split weight, never drawn",
            seed: "determinism — deals the tint order, never drawn",
            padding: "geometry — an inset, never drawn",
            accent: "painted on every tile — no single rect is its handle",
        },
    },
    async render(props, ctx) {
        var _a, _b, _c, _d, _e, _f, _g;
        // The schema is documentation; render() is the gate.
        const label = (_a = props.label) !== null && _a !== void 0 ? _a : exports.DECLARED_UNBOUND_DEFAULTS.label;
        const columns = (_b = props.columns) !== null && _b !== void 0 ? _b : exports.DECLARED_UNBOUND_DEFAULTS.columns;
        const gap = (_c = props.gap) !== null && _c !== void 0 ? _c : exports.DECLARED_UNBOUND_DEFAULTS.gap;
        const seed = (_d = props.seed) !== null && _d !== void 0 ? _d : exports.DECLARED_UNBOUND_DEFAULTS.seed;
        const padding = (_e = props.padding) !== null && _e !== void 0 ? _e : exports.DECLARED_UNBOUND_DEFAULTS.padding;
        const accent = (_f = props.accent) !== null && _f !== void 0 ? _f : exports.DECLARED_UNBOUND_DEFAULTS.accent;
        if (typeof label !== "string")
            throw new Error(`${ID}: label must be a string.`);
        if (!Number.isInteger(columns) || columns < COLUMNS_MIN || columns > COLUMNS_MAX) {
            throw new Error(`${ID}: columns must be an integer in [${COLUMNS_MIN}, ${COLUMNS_MAX}].`);
        }
        if (typeof gap !== "number" || !Number.isFinite(gap) || gap < 0 || gap > GAP_MAX) {
            throw new Error(`${ID}: gap must be a number in [0, ${GAP_MAX}].`);
        }
        if (!Number.isInteger(seed) || seed < 0 || seed > SEED_MAX) {
            throw new Error(`${ID}: seed must be an integer in [0, ${SEED_MAX}].`);
        }
        if (!Number.isInteger(padding) || padding < 0 || padding > PADDING_MAX) {
            throw new Error(`${ID}: padding must be an integer in [0, ${PADDING_MAX}].`);
        }
        if (!HEX.test(accent))
            throw new Error(`${ID}: accent ${JSON.stringify(accent)} must be #rrggbb.`);
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const page = ((_g = props.pageColor) !== null && _g !== void 0 ? _g : exports.DECLARED_UNBOUND_DEFAULTS.pageColor);
        const { width: W, height: H } = ctx.target;
        const px = (fx, fy, fw, fh) => ({
            x: Math.round(fx * W),
            y: Math.round(fy * H),
            w: Math.round(fw * W),
            h: Math.round(fh * H),
        });
        const text = (s, box, maxPx, color) => (0, template_utils_1.svgLabel)(s || " ", box.w, box.h, { maxPx: Math.round(maxPx * H), maxLines: 1, color });
        const pieces = [];
        const piece = (rect, importance, source) => pieces.push({ rect: { ...rect, importance }, source });
        // No backdrop rect: the DOCUMENT fills the canvas (backgroundColor below).
        const head = px(0.06, 0.06, 0.88, 0.09);
        piece(head, 2, text("DECLARED UNBOUND - the honest non-binding", head, 0.04, INK));
        // The ONE bound prop.
        const lab = px(0.06, 0.18, 0.88, 0.08);
        piece(lab, 2, (0, template_utils_1.bindProp)(text(label, lab, 0.036, INK), "label"));
        // The strip: `columns` tiles, `gap` apart, `padding` in, tints of `accent`
        // dealt by `seed`. Four props, five with the colour, and not one of them is
        // a value any single rect shows.
        const padPx = Math.round((padding / 100) * W);
        const gapPx = Math.round((gap / 100) * W);
        const tileW = Math.floor((W - 2 * padPx - (columns - 1) * gapPx) / columns);
        const stripY = Math.round(0.3 * H);
        const stripH = Math.round(0.3 * H);
        const tints = tintsOf(accent, columns);
        const order = dealOrder(seed, columns);
        for (let i = 0; i < columns; i++) {
            piece({ x: padPx + i * (tileW + gapPx), y: stripY, w: tileW, h: stripH }, 1, (0, template_utils_1.makeColorTile)(tints[order[i]]));
        }
        // The receipt - the three categories, in words.
        const r1 = px(0.06, 0.66, 0.88, 0.055);
        piece(r1, 2, text("bound: label", r1, 0.024, DIM));
        const r2 = px(0.06, 0.725, 0.88, 0.055);
        piece(r2, 2, text("declared in bindings.unbound: columns, gap, seed, padding, accent - each with its reason", r2, 0.022, DIM));
        const r3 = px(0.06, 0.79, 0.88, 0.055);
        piece(r3, 2, text("needs nothing: pageColor - it IS document.backgroundColor, so no rect exists to be its handle", r3, 0.022, DIM));
        const cap = px(0.06, 0.88, 0.88, 0.05);
        piece(cap, 2, text("a stale declaration is a violation too - one honest word per prop is the point", cap, 0.022, DIM));
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
        title: "Declared Unbound",
        lines: [
            "Every prop that COULD carry a canvas handle is bound or named in bindings.unbound with its reason. Neither is a build failure.",
            "Here one label is bound; columns, gap, seed, padding and accent are honest non-bindings - geometry, determinism, a colour on every tile.",
            "The page colour needs nothing: it IS document.backgroundColor, so no rect exists to be its handle.",
        ],
        explore: [
            "Double-click the label - the one handle on the card",
            "Change Columns or Seed - the strip re-deals; nothing to click",
            "Read bindings.unbound in the source - one reason per prop",
        ],
    }),
});
exports.default = exports.DeclaredUnboundV1;
