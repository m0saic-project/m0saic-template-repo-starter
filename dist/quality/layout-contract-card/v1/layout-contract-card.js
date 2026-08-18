"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutContractCardV1 = exports.LAYOUT_CONSTRAINTS = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/quality/layout-contract-card/v1";
const TOTAL = 10;
const MIN_W = 1;
const MAX_W = 9;
/** The contract. Fractions of the canvas, so it holds at any size. */
const CONSTRAINTS = [
    { label: "sidebar", maxWidthFrac: 0.4 },
    { label: "body", minWidthFrac: 0.5 },
];
const propsSchema = (0, template_utils_1.definePropsSchema)({
    sidebarWeight: {
        type: "number",
        required: false,
        description: `Sidebar share in tenths of the width (${MIN_W}-${MAX_W}). Past 4 it breaks the contract.`,
        meta: {
            constraints: { min: MIN_W, max: MAX_W },
            ui: { label: "Sidebar weight", order: 1 },
        },
    },
    debugLayout: {
        type: "boolean",
        required: false,
        description: "Run the layout contract. Off (default) returns the document untouched.",
        meta: { ui: { label: "Debug layout", order: 2 } },
    },
    sidebarColor: {
        type: "string",
        required: false,
        description: "Sidebar fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#8e44ad" },
            ui: { label: "Sidebar color", order: 3 },
        },
    },
    bodyColor: {
        type: "string",
        required: false,
        description: "Body fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Body color", order: 4 },
        },
    },
});
/** Exported so the test can assert the same contract the template ships. */
exports.LAYOUT_CONSTRAINTS = CONSTRAINTS;
exports.LayoutContractCardV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "62 · Layout Contract Card",
    version: 1,
    description: "Ratio invariants authored against LABELS, which survive every m0 the template regenerates — unlike tile order and stableKeys, which do not. Push the sidebar past 40% with the contract on and the render becomes the violation report, at exactly the canvas that broke.",
    capabilities: { tier: "core" },
    tags: ["quality", "contracts", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Sidebar weight 5 + Debug layout on = the contract fires. Any canvas.",
    },
    propsSchema,
    defaultProps: {
        sidebarWeight: 3,
        debugLayout: false,
        sidebarColor: "#8e44ad",
        bodyColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c;
        for (const [key, value] of [
            ["sidebarColor", props.sidebarColor],
            ["bodyColor", props.bodyColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const weight = Math.round((_a = props.sidebarWeight) !== null && _a !== void 0 ? _a : 3);
        if (weight < MIN_W || weight > MAX_W) {
            throw new Error(`${ID}: sidebarWeight ${weight} out of range ${MIN_W}-${MAX_W}.`);
        }
        const { width, height } = ctx.target;
        const m0 = (0, dsl_stdlib_1.weightedSplit)([weight, TOTAL - weight], "col", {
            claimants: ["1", "1{1}"],
        });
        const frac = weight / TOTAL;
        const caption = (0, svg_text_1.fitSvgText)(`sidebar ${(frac * 100).toFixed(0)}% of width - contract allows up to 40%`, width * 0.5, height * 0.2, { maxPx: Math.round(height * 0.035), maxLines: 2 });
        // The LABEL is the durable identity. Everything else about this document
        // is re-derived the moment a prop or the canvas changes.
        const sources = [
            { ...(0, template_utils_1.makeColorTile)(((_b = props.sidebarColor) !== null && _b !== void 0 ? _b : "#8e44ad")), editor: { label: "sidebar" } },
            { ...(0, template_utils_1.makeColorTile)(((_c = props.bodyColor) !== null && _c !== void 0 ? _c : "#1c2833")), editor: { label: "body" } },
            (0, svg_text_1.svgTextSource)([
                {
                    text: caption.text,
                    fontSize: caption.fontSize,
                    color: "#d5dbdb",
                },
            ]),
        ];
        const doc = {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            sources,
        };
        // Debug off → `doc` comes back by reference, untouched. Debug on → the
        // contract runs, stamps `editor.layoutContract`, and replaces the
        // document with a violation card if an invariant broke.
        return (0, template_utils_1.withLayoutContract)(doc, ctx, {
            templateId: ID,
            constraints: CONSTRAINTS,
            debug: props.debugLayout,
        });
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Layout Contract Card",
        lines: [
            "The m0 is disposable - it re-addresses every node on any change - so intent rides on the LABEL you stamp, the one identity that survives.",
            "Constraints are canvas-INDEPENDENT fractions, so one line holds at every size. That matters: the bug you are hunting only shows at some sizes.",
            "debug falsy returns your document untouched, same reference - so the call can stay in a shipped template at zero cost.",
        ],
        explore: [
            "Set Sidebar weight to 5, turn Debug layout on",
            "Resize the canvas - the same contract still holds",
        ],
    }),
});
exports.default = exports.LayoutContractCardV1;
