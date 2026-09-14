"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.M0PropV1 = exports.DEFAULT_LAYOUT = exports.WIREFRAME_CLAIM_BUDGET = exports.MAX_CHARS = void 0;
const types_1 = require("@m0saic/types");
const dsl_1 = require("@m0saic/dsl");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/m0-prop/v1";
/** Grammar has no cap; this LESSON stops wireframing somewhere sane. */
exports.MAX_CHARS = 32000;
exports.WIREFRAME_CLAIM_BUDGET = 120;
/** A friendly default: a little dashboard-ish arrangement. */
exports.DEFAULT_LAYOUT = "3(2[1,1],1,2[1,2(1,1)])";
/** A darker twin of a #rrggbb colour. */
function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const dim = (v) => Math.max(0, Math.round(v * 0.62));
    const hh = (v) => v.toString(16).padStart(2, "0");
    return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}`;
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    layout: {
        type: "m0",
        required: false,
        description: "The layout to frame, as a raw m0 string. type m0 tells the editor this value is grammar, not prose — and the template validates it like any untrusted input.",
        meta: {
            ui: { label: "Layout", order: 1 },
        },
    },
    bandColor: {
        type: "string",
        required: false,
        description: "Accent fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2e86c1" },
            ui: { label: "Band color", order: 2 },
        },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Backdrop as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Page color", order: 3 },
        },
    },
});
exports.M0PropV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "28 · m0 Prop",
    version: 1,
    description: "The layout itself as a prop: type m0 tells the editor the value is grammar, not prose, and the template treats it like any untrusted input — isValidM0String at the boundary, a report card instead of a dead render when it doesn't parse. Valid layouts are framed and wireframed, one tile per claim; heavy layouts DEGRADE instead of failing — hundreds of claims get a measured stats card (chars, claims, floors), and a layout too big for this canvas gets the floors card naming its safe minimum. The grammar has no cap; only lessons and budgets do.",
    capabilities: { tier: "core" },
    tags: ["controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Paste any m0 into Layout — a valid string is framed as a wireframe; an invalid one gets a report card naming the problem, never a dead preview.",
    },
    propsSchema,
    defaultProps: {
        layout: exports.DEFAULT_LAYOUT,
        bandColor: "#2e86c1",
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c;
        for (const [key, value] of [
            ["bandColor", props.bandColor],
            ["pageColor", props.pageColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const layout = ((_a = props.layout) !== null && _a !== void 0 ? _a : exports.DEFAULT_LAYOUT).trim();
        const { width, height } = ctx.target;
        const bandHex = (_b = props.bandColor) !== null && _b !== void 0 ? _b : "#2e86c1";
        const band = bandHex;
        const page = ((_c = props.pageColor) !== null && _c !== void 0 ? _c : "#1c2833");
        // The boundary: grammar props are untrusted input. Report, don't die —
        // and DEGRADE, don't refuse: a real dictionary layout can run to many
        // thousands of chars and hundreds of claims, and every rung of this
        // ladder still returns a working document.
        if (layout.length === 0 || !(0, dsl_1.isValidM0String)(layout)) {
            return (0, template_utils_1.makeErrorMosaic)([
                `- the layout prop is not a valid m0 string`,
                `- validate with isValidM0String / validateM0String before shipping one`,
                `- try the default: ${exports.DEFAULT_LAYOUT}`,
            ].join("\n"), { width, height, title: "Layout does not parse", errorCode: "STARTER_INVALID_M0_PROP" });
        }
        if (layout.length > exports.MAX_CHARS) {
            // Valid grammar, honestly out of this LESSON's scope — say that,
            // never "does not parse".
            return (0, template_utils_1.makeErrorMosaic)([
                `- this layout is valid m0, but at ${layout.length} chars it is beyond what this lesson renders (cap ${exports.MAX_CHARS})`,
                `- the cap is the lesson's, not the grammar's — real templates set their own budget`,
            ].join("\n"), { width, height, title: "Layout larger than this lesson renders", errorCode: "STARTER_M0_PROP_TOO_LARGE" });
        }
        // Measure the user's layout ON ITS OWN before composing anything.
        const own = (0, dsl_stdlib_1.evaluateM0)(layout, { width, height });
        // Too many claims to wireframe? Still a working render: the stats card
        // — the layout measured, not drawn. (Hundreds of one-source-per-claim
        // tiles is a cost budget, not a validity question.)
        if (own.frameCount > exports.WIREFRAME_CLAIM_BUDGET) {
            const statsRow = String((0, dsl_stdlib_1.weightedSplit)([8, 84, 8], "col", {
                mode: "literal",
                claimants: ["-", "1{1}", "-"],
            }));
            const statRows = String((0, dsl_stdlib_1.weightedSplit)([14, 14, 4, 14, 4, 14, 36], "row", {
                mode: "literal",
                claimants: ["-", statsRow, "-", statsRow, "-", statsRow, "-"],
            }));
            const statsM0 = (0, dsl_stdlib_1.toM0String)(`${statRows}{6[-,-,-,-,-,1]}`, ID);
            const stats = [];
            const line = (text) => {
                stats.push((0, template_utils_1.makeColorTile)(shade(bandHex)));
                stats.push((0, template_utils_1.svgLabel)(text, width * 0.78, height * 0.12, {
                    color: "#eaeef2",
                    maxPx: Math.round(height * 0.03),
                    vAlign: "middle",
                }));
            };
            line(`${layout.length} chars - ${own.frameCount} claims (wireframe budget is ${exports.WIREFRAME_CLAIM_BUDGET})`);
            line(`feasibility ${own.feasibility.minWidthPx}x${own.feasibility.minHeightPx} - precision ${own.precision.maxSplitX}x${own.precision.maxSplitY}`);
            line(`safe minimum ${own.recommendedMin.width}x${own.recommendedMin.height}${own.feasible ? "" : " - above this canvas"}`);
            const statsHeading = (0, svg_text_1.fitSvgText)("M0 PROP - layout received and MEASURED; too many claims to wireframe here", width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.03), maxLines: 1 });
            const statsReadout = (0, svg_text_1.fitSvgLines)([
                "a heavy layout is not an error - this card is the degrade path: measured floors instead of a wireframe",
                "real consumers set their own claim budget; the grammar has no cap",
            ], width * 0.9, height * 0.09, { maxPx: Math.round(height * 0.026), widthFrac: 0.92 });
            stats.push((0, svg_text_1.svgTextSource)([
                {
                    text: statsHeading.text,
                    fontSize: statsHeading.fontSize,
                    color: "#eaeef2",
                    vAlign: "top",
                    padding: { top: 0.08 },
                },
                {
                    text: statsReadout.text,
                    fontSize: statsReadout.fontSize,
                    color: "#7f8c9b",
                    vAlign: "bottom",
                    padding: { bottom: 0.12 },
                },
            ]));
            return {
                kind: "mosaic_document",
                version: 1,
                m0: statsM0,
                assets: {},
                backgroundColor: page,
                sources: stats,
            };
        }
        // Frame the user's layout on a padded stage, wireframe-bound.
        const stage = String((0, dsl_stdlib_1.weightedSplit)([8, 84, 8], "col", {
            mode: "literal",
            claimants: ["-", layout, "-"],
        }));
        const rows = String((0, dsl_stdlib_1.weightedSplit)([8, 64, 28], "row", {
            mode: "literal",
            claimants: ["-", stage, "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const e = (0, dsl_stdlib_1.evaluateM0)(String(m0), { width, height });
        // Valid but infeasible once framed at THIS canvas — the floors lessons'
        // territory. Name the number instead of handing the engine a doomed m0.
        if (!e.feasible) {
            return (0, template_utils_1.makeErrorMosaic)([
                `- this layout is valid, but framed on this stage its safe minimum is ${e.recommendedMin.width}x${e.recommendedMin.height}`,
                `- the canvas is ${width}x${height} - raise it, or hand over a lighter layout`,
                `- why nesting multiplies the floor: see the quality chapter's floors lessons`,
            ].join("\n"), { width, height, title: "Layout larger than this canvas", errorCode: "STARTER_M0_PROP_INFEASIBLE" });
        }
        const sources = [];
        // One alternating tile per claim — frameCount is the binding rule.
        // Subtract the caption's own claim, appended as the text source below.
        for (let i = 0; i < e.frameCount - 1; i++) {
            sources.push((0, template_utils_1.makeColorTile)(i % 2 === 0 ? band : shade(bandHex)));
        }
        const heading = (0, svg_text_1.fitSvgText)(`M0 PROP - your ${layout.length}-char layout, framed and wireframed (${e.frameCount - 1} claims)`, width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.032), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            "type m0 = the value is grammar; the editor knows, and the template validates at the boundary like any untrusted input",
            "invalid strings get a report card, never a dead render - and claims are counted with evaluateM0().frameCount",
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
        title: "m0 Prop",
        lines: [
            "type m0: the layout itself is a value. The editor treats it as grammar, not prose - and so must the template.",
            "Validate at the boundary with isValidM0String; an invalid string gets a report card, never a dead render.",
            "Heavy layouts degrade, never fail: hundreds of claims become a measured stats card; an infeasible one names its safe minimum.",
        ],
        explore: [
            "Paste any m0 from another lesson's Geometry view",
            "Break it on purpose - the report card names the fix",
        ],
    }),
});
exports.default = exports.M0PropV1;
