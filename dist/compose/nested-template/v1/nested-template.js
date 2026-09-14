"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestedTemplateV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/compose/nested-template/v1";
const BADGE_ID = "@m0saic-starter/compose/nested-badge/v1";
const CHILD_REF = "badge";
const PANEL = "#17202a";
const INK_DIM = "#7f8c9b";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    badgeText: {
        type: "string",
        required: false,
        description: "Text handed down to the badge child as its own prop. Parent props in, child props out — nothing shared but the call.",
        meta: { control: { placeholder: "nested" }, ui: { label: "Badge text" } },
    },
    slotPct: {
        type: "number",
        required: false,
        description: "Badge slot width as a percent of the canvas. This number becomes the child's ctx.target.width — watch the badge re-fit itself, not stretch.",
        meta: {
            constraints: { min: 20, max: 50 },
            control: { step: 5 },
            ui: { label: "Slot %" },
        },
    },
});
exports.NestedTemplateV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "49 · Nested Template",
    version: 1,
    description: "renderNestedTemplate calls another registered template and returns a document to drop into children. The slot option is the lesson: hand the child its real pixel box and it lays itself out for that box instead of for your canvas.",
    capabilities: { tier: "core" },
    tags: ["compose", "children", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Drag Slot % and watch the badge re-fit — it is re-rendering, not re-scaling.",
    },
    propsSchema,
    defaultProps: { badgeText: "nested", slotPct: 30 },
    async render(props, ctx) {
        var _a, _b;
        const badgeText = ((_a = props.badgeText) !== null && _a !== void 0 ? _a : "nested").trim();
        const slotPct = (_b = props.slotPct) !== null && _b !== void 0 ? _b : 30;
        const problems = [];
        if (badgeText.length < 1 || badgeText.length > 24) {
            problems.push(`badgeText must be 1-24 characters, got ${JSON.stringify(badgeText)}`);
        }
        if (!Number.isFinite(slotPct) || slotPct < 20 || slotPct > 50) {
            problems.push(`slotPct must be 20-50, got ${JSON.stringify(slotPct)}`);
        }
        else if (slotPct % 5 !== 0) {
            problems.push(`slotPct steps by 5 (the split weights are integers), got ${slotPct}`);
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height } = ctx.target;
        // The slot's REAL pixel box — the same arithmetic the split will do.
        const slot = { width: Math.round((width * slotPct) / 100), height };
        // The call. Registry lookup by id, the child's own props, and the slot
        // that becomes its ctx.target. A missing registration throws here with
        // the id in the message — a good error, and worth reading once.
        const badge = (await (0, template_utils_1.renderNestedTemplate)(BADGE_ID, { text: badgeText }, ctx, { slot }));
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([100 - slotPct, slotPct], "col", { claimants: ["1{1}", "1"] })), ID);
        const caption = `child rendered against a ${slot.width}x${slot.height} slot (${slotPct}% of ${width}) - ` +
            `it fitted its own text for THAT box, then the parent placed the result`;
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            children: { [CHILD_REF]: badge },
            sources: [
                (0, template_utils_1.makeColorTile)(PANEL),
                (0, svg_text_1.svgLabel)(caption, Math.round((width * (100 - slotPct)) / 100), height, {
                    maxPx: Math.round(height * 0.036),
                    maxLines: 6,
                    color: INK_DIM,
                }),
                { type: "mosaic", ref: CHILD_REF, placement: { fit: "contain" } },
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Nested Template",
        lines: [
            "renderNestedTemplate looks a template up in the registry, renders it, and hands back a document for children.",
            "Where child-mosaic BUILDS its child inline, this one CALLS one - subroutine versus copy-paste.",
            "slot is the part everyone forgets: pass the slot's real pixel box and the child lays itself out for that box.",
            "The lookup is by id, so the child works because the host registered it - this file never imports it.",
        ],
        explore: [
            "Drag Slot % and watch the badge re-FIT, not re-scale",
            "Change Badge text - parent props in, child props out",
            "Open compose/nested-badge directly: same template, standalone",
            "Structure dock: the badge is a whole document under one tile",
        ],
    }),
});
exports.default = exports.NestedTemplateV1;
