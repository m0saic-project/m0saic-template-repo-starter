"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowYourFloorsV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const ID = "@m0saic-starter/geometry/know-your-floors/v1";
const DEMO_M0 = "2[3(1,1,1),7(1,0,0,1,0,0,1)]";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    m0: {
        type: "m0",
        required: false,
        description: "Demo layout to evaluate (any valid m0 string). Default: a 3-col row stacked over a 7-slot 1:3:3 row.",
        meta: { ui: { label: "Layout" } },
    },
});
exports.KnowYourFloorsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "Know Your Floors",
    version: 1,
    description: "Runs evaluateM0 on its own layout against ctx.target and prints the report card: the feasibility floor (won't error), the precision floor (looks right), the recommended minimum, and whether THIS canvas clears each bar. Both floors are arithmetic you can run before rendering.",
    capabilities: { tier: "core" },
    tags: ["geometry", "feasibility", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Render small (e.g. 320x180, 40x40) to watch the verdicts flip.",
    },
    propsSchema,
    defaultProps: {},
    async render(props, ctx) {
        var _a;
        const { width, height } = ctx.target;
        // Validate through the canonicalizer first — evaluateM0 throws on
        // non-m0, but branding it here yields the better error message and the
        // canonical spelling for the printout.
        const demo = (0, dsl_stdlib_1.toM0String)((_a = props.m0) !== null && _a !== void 0 ? _a : DEMO_M0, ID);
        const ev = (0, dsl_stdlib_1.evaluateM0)(demo, { width, height });
        const lines = [
            `m0  ${demo}`,
            "",
            `feasibility floor   ${ev.feasibility.minWidthPx} x ${ev.feasibility.minHeightPx} px`,
            `precision floor     ${ev.precision.maxSplitX} x ${ev.precision.maxSplitY} px`,
            `recommended min     ${ev.recommendedMin.width} x ${ev.recommendedMin.height} px`,
            "",
            `this canvas         ${width} x ${height} px`,
            `renders             ${ev.feasible ? "yes" : "NO - below feasibility"}`,
            `looks right         ${ev.meetsPrecision ? "yes" : "NO - quantizes"}`,
            `max spread here     ${Number.isFinite(ev.maxSpreadPx) ? `${ev.maxSpreadPx}px` : "n/a (infeasible)"}`,
        ];
        const fit = (0, svg_text_1.fitSvgLines)(lines, width, height, {
            maxPx: Math.round(height * 0.05),
        });
        return {
            kind: "mosaic_document",
            version: 1,
            // A filled base with the report card floating on its overlay.
            m0: (0, dsl_stdlib_1.toM0String)("1{1}", ID),
            assets: {},
            sources: [
                (0, template_utils_1.makeColorTile)("#17202a"),
                (0, svg_text_1.svgTextSource)([
                    { text: fit.text, fontSize: fit.fontSize, color: "#ecf0f1" },
                ]),
            ],
        };
    },
});
exports.default = exports.KnowYourFloorsV1;
