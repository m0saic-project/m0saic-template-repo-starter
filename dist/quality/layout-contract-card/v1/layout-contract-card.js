"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutContractCardV1 = exports.LAYOUT_CONSTRAINTS = exports.LAYOUT_RELATIONS = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/quality/layout-contract-card/v1";
const CARDS = 4;
const MIN_S = 1;
const MAX_S = 3;
/** Card weight inside its column; the null margins are 1 unit each (a 20-slot cell). */
const CARD_W = 18;
/** The contract. One relation covers all four cards; one constraint, the header. */
const RELATIONS = [{ label: "card", equal: "size" }];
const CONSTRAINTS = [{ label: "header", maxHeightFrac: 0.35 }];
const propsSchema = (0, template_utils_1.definePropsSchema)({
    stretchCard: {
        type: "number",
        required: false,
        description: `Width multiplier on the third card (${MIN_S}-${MAX_S}). 1 keeps the rail uniform; anything past ~1.02 breaks the equal-size rule (tolerance 2%).`,
        meta: {
            constraints: { min: MIN_S, max: MAX_S },
            control: { flavor: "slider", step: 0.1 },
            ui: { label: "Stretch card", order: 1 },
        },
    },
    debugLayout: {
        type: "boolean",
        required: false,
        description: "Run the layout contract and render the CONTRACT VIEW: members green with the measured rule when it holds, the offender red among them when it breaks. Off (default) returns the document untouched.",
        meta: { ui: { label: "Debug layout", order: 2 } },
    },
    cardColor: {
        type: "string",
        required: false,
        description: "Card fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2e86c1" },
            ui: { label: "Card color", order: 3 },
        },
    },
    headerColor: {
        type: "string",
        required: false,
        description: "Header fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#8e44ad" },
            ui: { label: "Header color", order: 4 },
        },
    },
});
/** Exported so the test can assert the same contract the template ships. */
exports.LAYOUT_RELATIONS = RELATIONS;
exports.LAYOUT_CONSTRAINTS = CONSTRAINTS;
exports.LayoutContractCardV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "71 · Layout Contract Card",
    version: 1,
    description: "Ratio invariants authored against LABELS, which survive every m0 the template regenerates. One relation makes four cards equal; debug on DRAWS the contract — green members with the measured rule, or the stretched card red among them.",
    capabilities: { tier: "core" },
    tags: ["quality", "contracts", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Debug layout on = four green cards + the measured rule. Stretch card 1.5 = one red among green. Any canvas.",
    },
    propsSchema,
    defaultProps: {
        stretchCard: 1,
        debugLayout: false,
        cardColor: "#2e86c1",
        headerColor: "#8e44ad",
    },
    async render(props, ctx) {
        var _a, _b;
        for (const [key, value] of [
            ["cardColor", props.cardColor],
            ["headerColor", props.headerColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const stretch = Math.round(((_a = props.stretchCard) !== null && _a !== void 0 ? _a : 1) * 10) / 10;
        if (stretch < MIN_S || stretch > MAX_S) {
            throw new Error(`${ID}: stretchCard ${stretch} out of range ${MIN_S}-${MAX_S}.`);
        }
        const { width, height } = ctx.target;
        // The rail: four EQUAL columns, the THIRD carrying the stretch; inside
        // each column the card sits between two null margins ([1, 18, 1] — a
        // fixed 20-slot cell, on the 5-smooth lattice at every canvas). Weights
        // are rail units, not pixels — the same string reflows anywhere. Equal
        // columns quantize identically, so the equal-size rule holds exactly
        // wherever the canvas lands; a stretched column breaks it (and leaves
        // the lattice with it — that IS the broken state on display).
        const card = String((0, dsl_stdlib_1.weightedSplit)([1, CARD_W, 1], "col", { claimants: ["-", "1", "-"] }));
        const railM0 = (0, dsl_stdlib_1.weightedSplit)(Array.from({ length: CARDS }, (_, i) => (i === 2 ? Math.round(10 * stretch) : 10)), "col", { claimants: Array.from({ length: CARDS }, () => card) });
        // Header band (tile + caption overlay), a gap, the card rail, breathing
        // room — a 12-slot basis, exact on every standard height.
        const m0 = (0, dsl_stdlib_1.weightedSplit)([3, 1, 6, 2], "row", {
            claimants: ["1{1}", "-", String(railM0), "-"],
        });
        const heading = (0, svg_text_1.fitSvgText)("One label, one rule, four cards", width * 0.86, height * 0.16, {
            maxPx: Math.round(height * 0.07),
            maxLines: 1,
        });
        const spreadPct = ((stretch - 1) / stretch) * 100;
        const note = (0, svg_text_1.fitSvgText)(stretch === 1
            ? 'all four tiles are tagged "card" - equal size holds everywhere'
            : `third card ${stretch.toFixed(1)}x wide - spread ${spreadPct.toFixed(0)}% breaks the 2% rule`, width * 0.86, height * 0.12, { maxPx: Math.round(height * 0.032), maxLines: 2 });
        // The LABEL is the durable identity. Everything else about this document
        // is re-derived the moment a prop or the canvas changes.
        const cardTile = () => { var _a; return ({ ...(0, template_utils_1.makeColorTile)(((_a = props.cardColor) !== null && _a !== void 0 ? _a : "#2e86c1")), editor: { label: "card" } }); };
        const sources = [
            { ...(0, template_utils_1.makeColorTile)(((_b = props.headerColor) !== null && _b !== void 0 ? _b : "#8e44ad")), editor: { label: "header" } },
            (0, svg_text_1.svgTextSource)([
                { text: heading.text, fontSize: heading.fontSize, color: "#eaeef2" },
                {
                    text: note.text,
                    fontSize: note.fontSize,
                    color: "#d5dbdb",
                    vAlign: "bottom",
                    padding: { bottom: 0.1 },
                },
            ]),
            cardTile(),
            cardTile(),
            cardTile(),
            cardTile(),
        ];
        const doc = {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            sources,
            backgroundColor: "#1c2833",
        };
        // Debug off -> `doc` comes back by reference, untouched. Debug on -> the
        // contract runs, stamps `editor.layoutContract`, and the render becomes
        // the contract view: green members + measured rules, or the offender red.
        return (0, template_utils_1.withLayoutContract)(doc, ctx, {
            templateId: ID,
            relations: RELATIONS,
            constraints: CONSTRAINTS,
            debug: props.debugLayout,
        });
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Layout Contract Card",
        lines: [
            "The m0 is disposable - it re-addresses every node on any change - so intent rides on the LABEL you stamp, the one identity that survives.",
            "A rule targets a KIND, not a node: tag four tiles \"card\" and one equal-size line constrains all four, at every canvas.",
            "Debug on DRAWS the contract: members green with the measured rule when it holds, the offender red among them when it breaks.",
            "Off returns your document untouched, same reference - zero cost in shipped code.",
        ],
        explore: [
            "Turn Debug layout on - four green cards + the measured spread",
            "Set Stretch card to 1.5 - one red card among the green",
        ],
    }),
});
exports.default = exports.LayoutContractCardV1;
