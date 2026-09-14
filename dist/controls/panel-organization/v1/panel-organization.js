"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelOrganizationV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/panel-organization/v1";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    title: {
        type: "string",
        required: true,
        description: "Poster title. Required, so it sits in the top group by right.",
        meta: { ui: { label: "Title", order: 1 } },
    },
    accent: {
        type: "string",
        required: false,
        description: "Accent color. OPTIONAL — but pinned into the top group with ui.primary, because burying the one knob everyone reaches for would be panel malpractice.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2e86c1" },
            ui: { label: "Accent", order: 2, primary: true },
        },
    },
    frame: {
        type: "boolean",
        required: false,
        description: "Draw a thin frame. Plain optional — the Optional fold is its home.",
        meta: { ui: { label: "Frame", order: 3 } },
    },
    showBadge: {
        type: "boolean",
        required: false,
        description: "The gate: while off, badgeText has no control at all.",
        meta: { ui: { label: "Show badge", order: 4 } },
    },
    badgeText: {
        type: "string",
        required: false,
        description: "Badge copy. visibleWhen skips this control until showBadge matches — gone, not grayed.",
        meta: {
            ui: { label: "Badge text", order: 5, visibleWhen: { prop: "showBadge", equals: "true" } },
        },
    },
    watermarkTag: {
        type: "string",
        required: false,
        description: "ui.hidden: never a control, still a prop — agents and saved files set it, and render paints it.",
        meta: { ui: { label: "Watermark tag", order: 6, hidden: true } },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Backdrop as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Page color", order: 7 },
        },
    },
});
exports.PanelOrganizationV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "29 · Panel Organization",
    version: 1,
    description: "The props panel is authored, not emitted: the top group is required props plus optional ones pinned with ui.primary; the rest folds under Optional; ui.visibleWhen skips a control until its sibling gate matches (string-coerced, so a boolean gate matches equals \"true\"); and ui.hidden removes the control entirely while the prop stays fully render-effective — hidden is not dead, agents and saved files still set it. Render paints every one of them regardless: placement is an editor conversation, render sees plain values.",
    capabilities: { tier: "core" },
    tags: ["controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Read the panel: Accent sits on top (primary) though optional; Badge text appears only while Show badge is on; watermarkTag has no control — yet look at the corner.",
    },
    propsSchema,
    defaultProps: {
        title: "Field Notes",
        accent: "#2e86c1",
        frame: true,
        showBadge: true,
        badgeText: "NEW",
        watermarkTag: "set-by-no-control",
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c, _d, _e, _f, _g;
        for (const [key, value] of [
            ["accent", props.accent],
            ["pageColor", props.pageColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const title = (_a = props.title) !== null && _a !== void 0 ? _a : "Field Notes";
        if (typeof title !== "string" || title.length === 0 || title.length > 40) {
            throw new Error(`${ID}: title must be a 1-40 char string.`);
        }
        const badgeText = (_b = props.badgeText) !== null && _b !== void 0 ? _b : "NEW";
        if (typeof badgeText !== "string" || badgeText.length > 16) {
            throw new Error(`${ID}: badgeText must be at most 16 chars.`);
        }
        const watermarkTag = (_c = props.watermarkTag) !== null && _c !== void 0 ? _c : "set-by-no-control";
        if (typeof watermarkTag !== "string" || watermarkTag.length > 32) {
            throw new Error(`${ID}: watermarkTag must be at most 32 chars.`);
        }
        const showBadge = (_d = props.showBadge) !== null && _d !== void 0 ? _d : true;
        const frame = (_e = props.frame) !== null && _e !== void 0 ? _e : true;
        const { width, height } = ctx.target;
        const accent = ((_f = props.accent) !== null && _f !== void 0 ? _f : "#2e86c1");
        const page = ((_g = props.pageColor) !== null && _g !== void 0 ? _g : "#1c2833");
        // The poster: accent bar + title, optional frame edge, badge chip when
        // gated on, and the hidden prop's tag quietly in the corner — painted
        // to PROVE hidden is not dead.
        const titleRow = String((0, dsl_stdlib_1.weightedSplit)([3, 1, 60, 36], "col", {
            mode: "literal",
            claimants: ["1", "-", "1", showBadge ? "1{1}" : "-"],
        }));
        const tagRow = String((0, dsl_stdlib_1.weightedSplit)([64, 33, 3], "col", {
            mode: "literal",
            claimants: ["-", "1", "-"],
        }));
        const rows = String((0, dsl_stdlib_1.weightedSplit)(frame ? [2, 12, 22, 8, 4, 2, 50] : [14, 22, 8, 4, 52], "row", {
            mode: "literal",
            claimants: frame
                ? ["1", "-", titleRow, "-", tagRow, "1", "-"]
                : ["-", titleRow, "-", tagRow, "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const sources = [];
        if (frame)
            sources.push((0, template_utils_1.makeColorTile)(accent));
        sources.push((0, template_utils_1.makeColorTile)(accent));
        sources.push((0, template_utils_1.svgLabel)(title, width * 0.55, height * 0.2, {
            color: "#eaeef2",
            maxPx: Math.round(height * 0.08),
            vAlign: "middle",
        }));
        if (showBadge) {
            sources.push((0, template_utils_1.makeColorTile)("#c0392b"));
            sources.push((0, template_utils_1.svgLabel)(badgeText, width * 0.3, height * 0.12, {
                color: "#eaeef2",
                maxPx: Math.round(height * 0.036),
                vAlign: "middle",
            }));
        }
        sources.push((0, template_utils_1.svgLabel)(`watermarkTag: ${watermarkTag}`, width * 0.3, height * 0.05, {
            color: "#5d6d7e",
            maxPx: Math.round(height * 0.018),
            vAlign: "middle",
        }));
        if (frame)
            sources.push((0, template_utils_1.makeColorTile)(accent));
        const heading = (0, svg_text_1.fitSvgText)("PANEL ORGANIZATION - required + primary on top, gated and hidden props still real", width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.03), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            "top group = required + ui.primary pins; visibleWhen SKIPS a control until its gate matches (string-coerced)",
            "ui.hidden = no control, full effect - see the corner tag no panel ever showed you",
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
        title: "Panel Organization",
        lines: [
            "The top group is required props plus optional ones pinned with ui.primary - don't bury the knob everyone reaches for.",
            "ui.visibleWhen skips a control until its sibling gate matches; the comparison is string-coerced, so boolean gates match \"true\".",
            "ui.hidden removes the control, not the prop - agents and files still set it, and render still paints it.",
        ],
        explore: [
            "Toggle Show badge - Badge text appears and disappears",
            "Find watermarkTag in the panel. You can't - now find it on the canvas",
        ],
    }),
});
exports.default = exports.PanelOrganizationV1;
