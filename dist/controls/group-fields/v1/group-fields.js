"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupFieldsV1 = void 0;
exports.parseSpeaker = parseSpeaker;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/group-fields/v1";
const DEFAULT_SPEAKER = {
    name: "Ada Lehtinen",
    role: "Field Producer",
    accent: "#2e86c1",
};
/** Validate the group as a UNIT — whole or not at all. */
function parseSpeaker(raw) {
    const value = raw !== null && raw !== void 0 ? raw : DEFAULT_SPEAKER;
    if (typeof value !== "object" || value === null) {
        throw new Error(`${ID}: speaker must be an object.`);
    }
    const s = value;
    if (typeof s.name !== "string" || s.name.length === 0 || s.name.length > 40) {
        throw new Error(`${ID}: speaker.name must be a 1-40 char string.`);
    }
    if (typeof s.role !== "string" || s.role.length === 0 || s.role.length > 40) {
        throw new Error(`${ID}: speaker.role must be a 1-40 char string.`);
    }
    if (typeof s.accent !== "string" || !HEX.test(s.accent)) {
        throw new Error(`${ID}: speaker.accent must be #rrggbb.`);
    }
    return { name: s.name, role: s.role, accent: s.accent };
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    speaker: {
        type: "group",
        required: false,
        description: "Who is on screen. One group value — name, role, accent — edited as one fieldset and written in one edit, whole or not at all.",
        fields: {
            name: {
                type: "string",
                required: true,
                description: "Display name on the lower third.",
                meta: { ui: { label: "Name", order: 1 } },
            },
            role: {
                type: "string",
                required: true,
                description: "Second line — role, title, or affiliation.",
                meta: { ui: { label: "Role", order: 2 } },
            },
            accent: {
                type: "string",
                required: true,
                description: "Accent bar color as #rrggbb.",
                meta: {
                    constraints: { isColor: true },
                    control: { colorPicker: true, defaultColor: "#2e86c1" },
                    ui: { label: "Accent", order: 3 },
                },
            },
        },
        meta: {
            ui: { label: "Speaker", order: 1 },
        },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Backdrop as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Page color", order: 2 },
        },
    },
});
/** A darker twin of a #rrggbb colour. */
function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const dim = (v) => Math.max(0, Math.round(v * 0.62));
    const hh = (v) => v.toString(16).padStart(2, "0");
    return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}`;
}
exports.GroupFieldsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "24 · Group Fields",
    version: 1,
    description: "Related props that travel as one value: type group + fields nests ordinary prop definitions (same types, same controls — the accent is a normal colorPicker) under a single prop, the editor renders one fieldset, and the value is one object written in one edit — whole or not at all. Render validates it as a unit too: one guard for one idea. Drawn as the lower third this shape most often is.",
    capabilities: { tier: "core" },
    tags: ["controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Edit Speaker: one fieldset, three fields, one value. Save the file and look — the props carry a single speaker object.",
    },
    propsSchema,
    defaultProps: {
        speaker: DEFAULT_SPEAKER,
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a;
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const speaker = parseSpeaker(props.speaker);
        const { width, height } = ctx.target;
        const page = ((_a = props.pageColor) !== null && _a !== void 0 ? _a : "#1c2833");
        const accent = speaker.accent;
        // The lower third this shape most often is: accent bar, name plate,
        // role strip, docked low-left over "footage" (a plain backdrop here).
        const namePlate = String((0, dsl_stdlib_1.weightedSplit)([2, 58, 40], "col", {
            mode: "literal",
            claimants: ["1", "1{1}", "-"],
        }));
        const rolePlate = String((0, dsl_stdlib_1.weightedSplit)([2, 44, 54], "col", {
            mode: "literal",
            claimants: ["1", "1{1}", "-"],
        }));
        const third = String((0, dsl_stdlib_1.weightedSplit)([52, 12, 3, 8, 25], "row", {
            mode: "literal",
            claimants: ["-", namePlate, "-", rolePlate, "-"],
        }));
        const stage = String((0, dsl_stdlib_1.weightedSplit)([6, 88, 6], "col", {
            mode: "literal",
            claimants: ["-", third, "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${stage}{6[-,-,-,-,-,1]}`, ID);
        const sources = [];
        sources.push((0, template_utils_1.makeColorTile)(accent));
        sources.push((0, template_utils_1.makeColorTile)(shade("#1c2833")));
        sources.push((0, template_utils_1.bindProp)((0, template_utils_1.svgLabel)(speaker.name, width * 0.5, height * 0.11, {
            color: "#eaeef2",
            maxPx: Math.round(height * 0.05),
            vAlign: "middle",
        }), "speaker.name"));
        sources.push((0, template_utils_1.makeColorTile)(accent));
        sources.push((0, template_utils_1.makeColorTile)(shade("#1c2833")));
        sources.push((0, template_utils_1.bindProp)((0, template_utils_1.svgLabel)(speaker.role, width * 0.38, height * 0.075, {
            color: "#b9c4cf",
            maxPx: Math.round(height * 0.03),
            vAlign: "middle",
        }), "speaker.role"));
        const heading = (0, svg_text_1.fitSvgText)("GROUP FIELDS - three fields, one value, one edit", width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.036), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            "type group + fields: nested ordinary definitions (the accent is a normal colorPicker) rendered as one fieldset",
            "the value is one object - whole or not at all; render guards it as a unit for the same reason",
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
        title: "Group Fields",
        lines: [
            "type group + fields nests ordinary prop definitions under one prop - same types, same meta, same controls, one fieldset in the editor.",
            "The value is ONE object written in one edit. No half-edited presets, no agent writing two fields of three.",
            "Validate the group as a unit at render - one guard for one idea.",
        ],
        explore: [
            "Edit Speaker - three fields, one fieldset",
            "Change the accent - a nested colorPicker, like any top-level one",
        ],
    }),
});
exports.default = exports.GroupFieldsV1;
