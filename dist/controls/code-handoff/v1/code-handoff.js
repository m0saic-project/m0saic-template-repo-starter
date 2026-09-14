"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeHandoffV1 = exports.RUN_COMMAND = void 0;
exports.parseHandoff = parseHandoff;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/code-handoff/v1";
/** The handoff payload — authored HERE, shipped via defaultProps. */
exports.RUN_COMMAND = {
    language: "bash",
    code: [
        "# Render this exact template from a terminal — no app needed:",
        "m0saic make @m0saic-starter/controls/code-handoff/v1 \\",
        "  --template-repo . \\",
        '  --props \'{"label":"Rendered headless"}\' \\',
        "  -o code-handoff.mp4",
    ].join("\n"),
};
/** Validate the handoff shape (defaults are still validated — house law). */
function parseHandoff(raw) {
    const value = raw !== null && raw !== void 0 ? raw : exports.RUN_COMMAND;
    if (typeof value !== "object" || value === null) {
        throw new Error(`${ID}: runCommand must be { language, code }.`);
    }
    const s = value;
    if (typeof s.language !== "string" || !/^[a-z0-9+#-]{1,24}$/.test(s.language)) {
        throw new Error(`${ID}: runCommand.language must be a short lowercase language id.`);
    }
    if (typeof s.code !== "string" || s.code.length === 0 || s.code.length > 4000) {
        throw new Error(`${ID}: runCommand.code must be a 1-4000 char string.`);
    }
    return { language: s.language, code: s.code };
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    runCommand: {
        type: "code",
        required: false,
        description: "Template-to-user handoff: the exact CLI command that renders this template headless. Read-only and copyable in the editor; render uses it only to draw the card.",
        meta: {
            ui: { label: "Run it yourself", order: 1 },
        },
    },
    label: {
        type: "string",
        required: false,
        description: "A normal INPUT prop, for contrast — this one flows user to template.",
        meta: {
            ui: { label: "Label", order: 2 },
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
exports.CodeHandoffV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "27 · Code Handoff",
    version: 1,
    description: "A prop that flows the other way: type code is a HANDOFF — { language, code } shipped by the author in defaultProps, rendered by the editor as a read-only, selectable, copyable code window (no onChange; not an input), which render() may ignore entirely. For workflows where the user must run something outside the app — the production first-adopter hands the user a browser capture snippet whose output returns through other props. This lesson hands you the CLI command that renders itself headless.",
    capabilities: { tier: "core" },
    tags: ["controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Open 'Run it yourself' — a copyable window, not an input. Copy the command into a terminal and render this template without the app.",
    },
    propsSchema,
    defaultProps: {
        runCommand: exports.RUN_COMMAND,
        label: "Rendered in the app",
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b;
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const label = (_a = props.label) !== null && _a !== void 0 ? _a : "Rendered in the app";
        if (typeof label !== "string" || label.length === 0 || label.length > 40) {
            throw new Error(`${ID}: label must be a 1-40 char string.`);
        }
        const handoff = parseHandoff(props.runCommand);
        const { width, height } = ctx.target;
        const page = ((_b = props.pageColor) !== null && _b !== void 0 ? _b : "#1c2833");
        const lines = handoff.code.split("\n").slice(0, 6).map((l) => l.length > 64 ? `${l.slice(0, 61)}...` : l);
        // The direction card: TEMPLATE -> YOU header, language badge, the
        // command lines, and the user's own label below for contrast.
        const headerRow = String((0, dsl_stdlib_1.weightedSplit)([4, 34, 2, 14, 46], "col", {
            mode: "literal",
            claimants: ["-", "1", "-", "1{1}", "-"],
        }));
        const lineRow = String((0, dsl_stdlib_1.weightedSplit)([4, 92, 4], "col", {
            mode: "literal",
            claimants: ["-", "1", "-"],
        }));
        const cardRows = String((0, dsl_stdlib_1.weightedSplit)([6, 12, 4, ...lines.map(() => 8), 100 - 6 - 12 - 4 - lines.length * 8], "row", { mode: "literal", claimants: ["-", headerRow, "-", ...lines.map(() => lineRow), "-"] }));
        const stage = String((0, dsl_stdlib_1.weightedSplit)([8, 84, 8], "col", {
            mode: "literal",
            claimants: ["-", `1{${cardRows}}`, "-"],
        }));
        const labelRow = String((0, dsl_stdlib_1.weightedSplit)([8, 84, 8], "col", {
            mode: "literal",
            claimants: ["-", "1{1}", "-"],
        }));
        const rows = String((0, dsl_stdlib_1.weightedSplit)([5, 52, 4, 10, 29], "row", {
            mode: "literal",
            claimants: ["-", stage, "-", labelRow, "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const sources = [];
        sources.push((0, template_utils_1.makeColorTile)("#10161d")); // card bg
        sources.push((0, template_utils_1.svgLabel)("TEMPLATE -> YOU: run this outside the app", width * 0.32, height * 0.07, {
            color: "#eaeef2",
            maxPx: Math.round(height * 0.024),
            vAlign: "middle",
        }));
        sources.push((0, template_utils_1.makeColorTile)("#2e86c1")); // language badge
        sources.push((0, template_utils_1.svgLabel)(handoff.language, width * 0.1, height * 0.06, {
            color: "#eaeef2",
            maxPx: Math.round(height * 0.022),
            vAlign: "middle",
        }));
        for (const line of lines) {
            sources.push((0, template_utils_1.svgLabel)(line.length === 0 ? " " : line, width * 0.72, height * 0.045, {
                color: "#b9c4cf",
                maxPx: Math.round(height * 0.022),
                vAlign: "middle",
            }));
        }
        sources.push((0, template_utils_1.makeColorTile)("#1d5378"));
        sources.push((0, template_utils_1.svgLabel)(label, width * 0.7, height * 0.09, {
            color: "#eaeef2",
            maxPx: Math.round(height * 0.034),
            vAlign: "middle",
        }));
        const heading = (0, svg_text_1.fitSvgText)("CODE HANDOFF - the template talking back, read-only and copyable", width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.032), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            "type code = a handoff: shipped in defaultProps, shown as a copyable window (no onChange), ignorable by render",
            "the loop: copy the command, run it in a terminal, feed results back through the ordinary input props",
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
        title: "Code Handoff",
        lines: [
            "type code flows FROM the template TO the user: { language, code } shipped in defaultProps, shown as a read-only copyable window.",
            "It is not an input - no onChange - and render() may ignore it. Use it when the user must run something outside the app.",
            "The loop closes through ordinary props: hand out the command, the user runs it, the results come back as inputs.",
        ],
        explore: [
            "Copy 'Run it yourself' into a terminal - same render, no app",
            "Contrast with Label right below it: that one IS an input",
        ],
    }),
});
exports.default = exports.CodeHandoffV1;
