"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeLineV1 = exports.byline = exports.COMPOSITE_LINE_DEFAULTS = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/make/composite-line/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const INK = "#eaeef2";
const DIM = "#9aa7b4";
const ACCENT = "#ee7525";
const CELL = "#243342";
const YEAR_MIN = 1970;
const YEAR_MAX = 2999;
exports.COMPOSITE_LINE_DEFAULTS = { handle: "@qsbuilds", year: 2026, pageColor: "#1c2833" };
/** The composite line: two props, one string. */
const byline = (handle, year) => `${handle} - ${year} on GitHub`;
exports.byline = byline;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    handle: {
        type: "string",
        required: false,
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
exports.CompositeLineV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    capabilities: { tier: "core" },
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Static card. Double-click the byline: two fields. Double-click either split rect: one field.",
    },
    propsSchema,
    defaultProps: { ...exports.COMPOSITE_LINE_DEFAULTS },
    async render(props, ctx) {
        var _a, _b, _c;
        // The schema is documentation; render() is the gate.
        const handle = (_a = props.handle) !== null && _a !== void 0 ? _a : exports.COMPOSITE_LINE_DEFAULTS.handle;
        const year = (_b = props.year) !== null && _b !== void 0 ? _b : exports.COMPOSITE_LINE_DEFAULTS.year;
        if (typeof handle !== "string")
            throw new Error(`${ID}: handle must be a string.`);
        if (!Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX) {
            throw new Error(`${ID}: year must be an integer in [${YEAR_MIN}, ${YEAR_MAX}].`);
        }
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const page = ((_c = props.pageColor) !== null && _c !== void 0 ? _c : exports.COMPOSITE_LINE_DEFAULTS.pageColor);
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
        piece(head, 2, label("COMPOSITE LINE - one rect, two props, both handles", head, 0.04, INK));
        // A. ONE rect, TWO knobs. bindProps writes editor.bindings; Make opens the
        //    rect with a field per entry, and the roll call sees both props bound.
        const capA = px(0.06, 0.2, 0.88, 0.055);
        piece(capA, 2, label("bindProps - ONE rect keeps BOTH knobs", capA, 0.024, DIM));
        const line = px(0.06, 0.27, 0.88, 0.13);
        piece(line, 1, (0, template_utils_1.makeColorTile)(CELL));
        const lineText = px(0.08, 0.29, 0.84, 0.09);
        piece(lineText, 2, (0, template_utils_1.bindProps)(label((0, exports.byline)(handle, year), lineText, 0.055, ACCENT), [
            { propKey: "handle" },
            { propKey: "year", kind: "number" },
        ]));
        // B. Or split the line - one rect per prop, one bindProp each. Equally
        //    correct; the choice is layout, not provenance.
        const capB = px(0.06, 0.47, 0.88, 0.055);
        piece(capB, 2, label("or split the line - one rect per prop", capB, 0.024, DIM));
        const left = px(0.06, 0.54, 0.42, 0.13);
        piece(left, 1, (0, template_utils_1.makeColorTile)(CELL));
        const leftText = px(0.08, 0.56, 0.38, 0.09);
        piece(leftText, 2, (0, template_utils_1.bindProp)(label(handle, leftText, 0.05, INK), "handle"));
        const right = px(0.52, 0.54, 0.42, 0.13);
        piece(right, 1, (0, template_utils_1.makeColorTile)(CELL));
        const rightText = px(0.54, 0.56, 0.38, 0.09);
        piece(rightText, 2, (0, template_utils_1.bindProp)(label(`${year} on GitHub`, rightText, 0.05, INK), "year"));
        // The pitfall, in words - and locked in the test.
        const cap1 = px(0.06, 0.76, 0.88, 0.055);
        piece(cap1, 2, label("never bindProp twice on one rect - the second REPLACES the first", cap1, 0.022, DIM));
        const cap2 = px(0.06, 0.825, 0.88, 0.055);
        piece(cap2, 2, label("year-card/v1 does exactly that, and being frozen it warns until its v2", cap2, 0.022, DIM));
        const cap3 = px(0.06, 0.9, 0.88, 0.05);
        piece(cap3, 2, label("double-click the byline - two fields; a split rect - one", cap3, 0.022, DIM));
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
        title: "Composite Line",
        lines: [
            "One rect that draws two props needs two handles. bindProps(src, [{handle}, {year}]) keeps both; Make offers both on double-click.",
            "A second bindProp on the same rect REPLACES the first - one handle survives and the other prop reads as unbound.",
            "The other correct form is to split the line so each prop has its own rect. Either way, every prop you show stays a handle.",
        ],
        explore: [
            "Double-click the byline - two fields, handle and year",
            "Double-click the split rects - one field each",
            "Set Year to 2027 - both forms follow",
        ],
    }),
});
exports.default = exports.CompositeLineV1;
