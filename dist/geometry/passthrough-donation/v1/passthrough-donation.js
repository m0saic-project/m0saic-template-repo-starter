"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassthroughDonationV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const svg_text_1 = require("../../../_shared/svg-text");
const ID = "@m0saic-starter/geometry/passthrough-donation/v1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    donatedSlots: {
        type: "number",
        required: false,
        description: "How many `0` slots donate forward into the second tile (1-8).",
        meta: {
            constraints: { min: 1, max: 8 },
            control: { step: 1 },
            ui: { label: "Donated slots" },
        },
    },
});
exports.PassthroughDonationV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "Passthrough Donation",
    version: 1,
    description: "4(1,0,0,1) has four slots but two tiles: each 0 donates its slot FORWARD to the next claimant. The labels print each tile's slot arithmetic — this is the mechanism weighted splits are made of.",
    capabilities: { tier: "core" },
    tags: ["geometry", "passthrough", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Crank Donated slots up and watch the right tile absorb them.",
    },
    propsSchema,
    defaultProps: { donatedSlots: 2 },
    async render(props, ctx) {
        var _a;
        const donated = (_a = props.donatedSlots) !== null && _a !== void 0 ? _a : 2;
        if (!Number.isInteger(donated) || donated < 1 || donated > 8) {
            throw new Error(`${ID}: donatedSlots must be an integer 1-8, got ${donated}.`);
        }
        const { width, height } = ctx.target;
        const totalSlots = donated + 2;
        // The raw spelling, by hand, so the donation is visible:
        // one claimant, `donated` passthroughs, one claimant.
        const tokens = ["1", ...new Array(donated).fill("0"), "1"];
        const row = `${totalSlots}(${tokens.join(",")})`;
        // Labels mirror the same row on the attached overlay.
        const m0 = (0, dsl_stdlib_1.toM0String)(`${row}{${row}}`, ID);
        const leftFrac = 1 / totalSlots;
        const rightFrac = (donated + 1) / totalSlots;
        const leftW = width * leftFrac;
        const rightW = width * rightFrac;
        const pct = (f) => `${Math.round(f * 100)}%`;
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                (0, template_utils_1.makeColorTile)("#7d6608"),
                (0, template_utils_1.makeColorTile)("#1e8449"),
                (0, svg_text_1.svgLabel)(`1 slot = ${pct(leftFrac)}`, leftW, height, {
                    maxPx: Math.round(height * 0.045),
                    maxLines: 3,
                }),
                (0, svg_text_1.svgLabel)(`${new Array(donated).fill("0").join("+")}+1 = ${donated + 1} slots = ${pct(rightFrac)}`, rightW, height, { maxPx: Math.round(height * 0.045), maxLines: 2 }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Passthrough Donation",
        lines: [
            "A 0 slot donates its space FORWARD to the next claimant: 4(1,0,0,1) is four slots but two tiles - 25% and 75%.",
            "That is the whole mechanism behind weighted splits: a weight of N is spelled as N-1 zeros followed by one claimant.",
        ],
        explore: [
            "Crank Donated slots and watch the right tile absorb them",
            "Geometry view - the zeros are visible as slots, not tiles",
        ],
    }),
});
exports.default = exports.PassthroughDonationV1;
