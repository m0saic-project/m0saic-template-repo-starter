"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundNumbersV1 = exports.drawTotal = exports.drawYear = exports.drawPrice = exports.drawVisitors = exports.BOUND_NUMBERS_DEFAULTS = void 0;
exports.honestSpellings = honestSpellings;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/make/bound-numbers/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const INK = "#eaeef2";
const DIM = "#9aa7b4";
const ACCENT = "#ee7525";
const CELL = "#243342";
const VISITORS_MAX = 9999999;
const PRICE_MAX = 9999;
const YEAR_MIN = 1970;
const YEAR_MAX = 2999;
exports.BOUND_NUMBERS_DEFAULTS = { visitors: 12480, price: 3.5, year: 2026, pageColor: "#1c2833" };
/**
 * The spellings the gate reads a number in — a mirror of the audit's list,
 * kept here so the lesson's test can say what "honest" means. An integer
 * never spells with decimals: nothing draws a count as "1.0".
 */
function honestSpellings(v) {
    const out = [String(v), v.toLocaleString("en-US")];
    if (!Number.isInteger(v))
        out.push(v.toFixed(1), v.toFixed(2));
    return [...new Set(out)];
}
/** How each number is DRAWN — the card's own formatting, each an honest spelling. */
const drawVisitors = (v) => v.toLocaleString("en-US");
exports.drawVisitors = drawVisitors;
const drawPrice = (v) => `$${v.toFixed(2)}`;
exports.drawPrice = drawPrice;
const drawYear = (v) => String(v);
exports.drawYear = drawYear;
/** Derived — not a prop, so not a handle. */
const drawTotal = (visitors, price) => `$${(visitors * price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
exports.drawTotal = drawTotal;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    visitors: {
        type: "number",
        required: false,
        meta: { constraints: { min: 0, max: VISITORS_MAX }, control: { step: 1 }, },
    },
    price: {
        type: "number",
        required: false,
        meta: { constraints: { min: 0, max: PRICE_MAX }, control: { step: 0.25 }, },
    },
    year: {
        type: "number",
        required: false,
        meta: { constraints: { min: YEAR_MIN, max: YEAR_MAX }, control: { step: 1 }, },
    },
    pageColor: {
        type: "string",
        required: false,
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
        },
    },
});
exports.BoundNumbersV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: { tier: "core" },
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Static card. Double-click any of the three numerals - the total is derived and has no handle.",
    },
    propsSchema,
    defaultProps: { ...exports.BOUND_NUMBERS_DEFAULTS },
    async render(props, ctx) {
        var _a, _b, _c, _d;
        // The schema is documentation; render() is the gate.
        const visitors = (_a = props.visitors) !== null && _a !== void 0 ? _a : exports.BOUND_NUMBERS_DEFAULTS.visitors;
        const price = (_b = props.price) !== null && _b !== void 0 ? _b : exports.BOUND_NUMBERS_DEFAULTS.price;
        const year = (_c = props.year) !== null && _c !== void 0 ? _c : exports.BOUND_NUMBERS_DEFAULTS.year;
        if (!Number.isInteger(visitors) || visitors < 0 || visitors > VISITORS_MAX) {
            throw new Error(`${ID}: visitors must be an integer in [0, ${VISITORS_MAX}].`);
        }
        if (typeof price !== "number" || !Number.isFinite(price) || price < 0 || price > PRICE_MAX) {
            throw new Error(`${ID}: price must be a number in [0, ${PRICE_MAX}].`);
        }
        if (!Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX) {
            throw new Error(`${ID}: year must be an integer in [${YEAR_MIN}, ${YEAR_MAX}].`);
        }
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const page = ((_d = props.pageColor) !== null && _d !== void 0 ? _d : exports.BOUND_NUMBERS_DEFAULTS.pageColor);
        const { width: W, height: H } = ctx.target;
        const px = (fx, fy, fw, fh) => ({
            x: Math.round(fx * W),
            y: Math.round(fy * H),
            w: Math.round(fw * W),
            h: Math.round(fh * H),
        });
        const label = (text, box, maxPx, color) => (0, template_utils_1.svgLabel)(text || " ", box.w, box.h, { maxPx: Math.round(maxPx * H), maxLines: 1, color });
        const pieces = [];
        const piece = (rect, importance, source) => pieces.push({ rect: { ...rect, importance }, source });
        // No backdrop rect: the DOCUMENT fills the canvas (backgroundColor below).
        const head = px(0.06, 0.06, 0.88, 0.09);
        piece(head, 2, label("BOUND NUMBERS - the numeral you draw is the handle", head, 0.04, INK));
        // Three stat tiles. Each numeral is formatted the way the card wants and
        // then BOUND to the prop it shows - the binding rides the rect, not the
        // spelling.
        const stats = [
            { key: "visitors", caption: "visitors - toLocaleString", text: (0, exports.drawVisitors)(visitors) },
            { key: "price", caption: "price - toFixed(2)", text: (0, exports.drawPrice)(price) },
            { key: "year", caption: "year - String", text: (0, exports.drawYear)(year) },
        ];
        stats.forEach((s, i) => {
            const x = 0.06 + i * 0.3;
            const tile = px(x, 0.2, 0.28, 0.34);
            piece(tile, 1, (0, template_utils_1.makeColorTile)(CELL));
            const cap = px(x + 0.02, 0.22, 0.24, 0.06);
            piece(cap, 2, label(s.caption, cap, 0.022, DIM));
            const num = px(x + 0.02, 0.3, 0.24, 0.2);
            piece(num, 2, (0, template_utils_1.bindProp)(label(s.text, num, 0.09, ACCENT), s.key));
        });
        // The total is DERIVED: visitors x price. It is a number on the card, but
        // no prop is behind it, so it is not a handle and is deliberately unbound.
        const totCap = px(0.06, 0.6, 0.3, 0.07);
        piece(totCap, 2, label("total = visitors x price", totCap, 0.026, DIM));
        const tot = px(0.38, 0.6, 0.56, 0.07);
        piece(tot, 2, label((0, exports.drawTotal)(visitors, price), tot, 0.04, INK));
        const cap1 = px(0.06, 0.72, 0.88, 0.055);
        piece(cap1, 2, label("the gate reads a drawn number in its honest spellings - String, toLocaleString, toFixed when it has decimals", cap1, 0.021, DIM));
        const cap2 = px(0.06, 0.785, 0.88, 0.055);
        piece(cap2, 2, label("on a digit boundary, so 12 is never read out of 2012 - and the total is derived, so it is not a handle", cap2, 0.021, DIM));
        const cap3 = px(0.06, 0.88, 0.88, 0.05);
        piece(cap3, 2, label("double-click a numeral - the inline form edits that prop", cap3, 0.022, DIM));
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
        title: "Bound Numbers",
        lines: [
            "A number you draw is a handle: bind the numeral to its prop, however the card formats it.",
            "The gate reads drawn numbers in their honest spellings - String, toLocaleString, toFixed when the value has decimals - on a digit boundary.",
            "A derived number (the total) is not a prop, so it has no handle and needs none. Bind what you show OF A PROP.",
        ],
        explore: [
            "Double-click 12,480 - the inline form edits Visitors",
            "Set Price to 4 - it draws 4.00; the binding still holds",
            "Change Year - the total does not move; it is not that kind of number",
        ],
    }),
});
exports.default = exports.BoundNumbersV1;
