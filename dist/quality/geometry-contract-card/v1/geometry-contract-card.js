"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryContractCardV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/quality/geometry-contract-card/v1";
/** The chip is the bottom band: one sixth of the canvas height. */
const CHIP_ROWS = 1;
const CARD_ROWS = 5;
const TOTAL_ROWS = CHIP_ROWS + CARD_ROWS;
/**
 * The checker's own default, restated here so the caption can name it. A
 * realized edge may sit 1px off its intent without that being a defect — an
 * exact ratio still lands on integers, and ±1px is what healthy rounding
 * looks like. Tightening it to 0 is for inset recovery, where byte-exactness
 * IS the contract.
 */
const DEFAULT_TOLERANCE_PX = 1;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    debugGeometry: {
        type: "boolean",
        required: false,
        description: "Run the geometry contract. Off (default) returns the document untouched.",
        meta: { ui: { label: "Debug geometry", order: 1 } },
    },
    contractOffsetPx: {
        type: "number",
        required: false,
        description: "Px added to the CONTRACT's target height. The chip stays 1/6 of the canvas either way — this moves what the contract ASKS FOR. 1px is inside the checker's default tolerance and passes on purpose; 2 or more crosses it.",
        meta: {
            constraints: { min: 0, max: 40 },
            ui: { label: "Contract offset (px)", order: 2 },
        },
    },
    chipColor: {
        type: "string",
        required: false,
        description: "Chip fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#16a085" },
            ui: { label: "Chip color", order: 3 },
        },
    },
    cardColor: {
        type: "string",
        required: false,
        description: "Card fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Card color", order: 4 },
        },
    },
});
exports.GeometryContractCardV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "71 · Geometry Contract Card",
    version: 1,
    description: "A template computes rects in JS and throws the intent away at return — so a quantization squash reads as a healthy m0 and a wrong picture. Declare the intended box, select it by a computed stableKey, and prove it survived to the pixels at this canvas.",
    capabilities: { tier: "core" },
    tags: ["quality", "contracts", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Debug geometry on + a contract offset of 2 or more = the contract fires. 1 is inside tolerance.",
    },
    propsSchema,
    defaultProps: {
        debugGeometry: false,
        contractOffsetPx: 0,
        chipColor: "#16a085",
        cardColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c;
        for (const [key, value] of [
            ["chipColor", props.chipColor],
            ["cardColor", props.cardColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const offset = Math.round((_a = props.contractOffsetPx) !== null && _a !== void 0 ? _a : 0);
        if (offset < 0 || offset > 40) {
            throw new Error(`${ID}: contractOffsetPx ${offset} out of range 0-40.`);
        }
        const { width, height } = ctx.target;
        // A card band over a chip band, 5:1. Built with the splitter rather than
        // hand-written: a `0` donates to the NEXT tile, so the literal that LOOKS
        // like "card first" (`6[1{1},0,0,0,0,1]`) actually hands five sixths to
        // the chip. This lesson's own contract caught that while it was being
        // written, which is as good an argument for the contract as any.
        const m0 = (0, dsl_stdlib_1.weightedSplit)([CARD_ROWS, CHIP_ROWS], "row", {
            claimants: ["1{1}", "1"],
        });
        // THE INTENT, in pixels. The engine distributes an equal row split
        // outside-in, so the chip's height is what integer division leaves.
        const chipH = Math.floor((height * CHIP_ROWS) / TOTAL_ROWS);
        // The selector, computed from the very string being shipped. The chip is
        // the LAST frame in walk order.
        const keys = (0, dsl_stdlib_1.findStableKeys)(m0, (f) => f.kind === "frame");
        const chipKey = keys[keys.length - 1];
        const expectations = [
            {
                name: "chip",
                stableKey: chipKey,
                // The chip is always `chipH`. `offset` moves what the CONTRACT asks
                // for — the mismatch is manufactured on the expectation side, which
                // is the only side a lesson can move without faking the engine.
                expectSize: { h: chipH + offset },
            },
        ];
        const heading = (0, svg_text_1.fitSvgText)("Intent vs realized", width * 0.86, height * 0.34, {
            maxPx: Math.round(height * 0.11),
            maxLines: 1,
        });
        // Name which number is which, and say where the line is. A 1px gap
        // passing is not a bug — `tolerancePx` defaults to 1 because ≤1px
        // jitter from a healthy ratio is expected.
        const verdict = offset === 0
            ? "match"
            : offset <= DEFAULT_TOLERANCE_PX
                ? `off by ${offset}px - inside the ${DEFAULT_TOLERANCE_PX}px tolerance, passes`
                : `off by ${offset}px - past the ${DEFAULT_TOLERANCE_PX}px tolerance, fires`;
        const note = (0, svg_text_1.fitSvgText)(`contract wants ${chipH + offset}px, chip is ${chipH}px - ${verdict}`, width * 0.86, height * 0.2, { maxPx: Math.round(height * 0.04), maxLines: 2 });
        const doc = {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            sources: [
                (0, template_utils_1.makeColorTile)(((_b = props.cardColor) !== null && _b !== void 0 ? _b : "#1c2833")),
                (0, svg_text_1.svgTextSource)([
                    { text: heading.text, fontSize: heading.fontSize, color: "#eaeef2" },
                    {
                        text: note.text,
                        fontSize: note.fontSize,
                        color: "#7f8c9b",
                        vAlign: "bottom",
                        padding: { bottom: 0.12 },
                    },
                ]),
                (0, template_utils_1.makeColorTile)(((_c = props.chipColor) !== null && _c !== void 0 ? _c : "#16a085")),
            ],
        };
        return (0, template_utils_1.withGeometryContract)(doc, ctx, {
            templateId: ID,
            expectations,
            debug: props.debugGeometry,
        });
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Geometry Contract Card",
        lines: [
            "A template computes rects in JS and throws the intent away at return - so a quantization squash gives a healthy m0 and a wrong picture.",
            "Declare the box you meant and check it survived AT THIS CANVAS. Select it by a stableKey you COMPUTE with findStableKeys - never one you typed.",
            "tolerancePx defaults to 1: an exact ratio still lands on integers, so a 1px gap is healthy rounding and passes on purpose.",
        ],
        explore: [
            "Debug geometry on, Contract offset 1 - nothing, that is tolerance",
            "Raise it to 2 - now the contract fires",
        ],
    }),
});
exports.default = exports.GeometryContractCardV1;
