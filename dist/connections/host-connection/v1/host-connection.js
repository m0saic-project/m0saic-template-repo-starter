"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostConnectionV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const connection_1 = require("../../connection");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/connections/host-connection/v1";
/** A darkened twin of a #rrggbb colour at the given brightness factor. */
function dim(hex, factor) {
    const n = parseInt(hex.slice(1), 16);
    const d = (v) => Math.max(0, Math.round(v * factor));
    const hh = (v) => v.toString(16).padStart(2, "0");
    return `#${hh(d((n >> 16) & 0xff))}${hh(d((n >> 8) & 0xff))}${hh(d(n & 0xff))}`;
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    bandColor: {
        type: "string",
        required: false,
        description: "Accent fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2e86c1" },
            ui: { label: "Band color", order: 1 },
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
exports.HostConnectionV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "66 · Host Connection",
    version: 1,
    description: "A template pack can teach the host a new kind of backend: registerHostConnection declares the Settings → Integrations form (base URL + keychain secret) and the Test-connection probe (reachable / authenticated / named failure). Registration is a module-eval side effect — importing the chapter makes starter-catalog@default exist — and the publisher half of the id must match the schema or registration throws. This card renders the REAL registered schema, not a mockup.",
    capabilities: { tier: "core" },
    tags: ["connections", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Start the example upstream (node examples/http-orchestrator/server.cjs), then Settings → Integrations → Starter Catalog → Test connection.",
    },
    propsSchema,
    defaultProps: {
        bandColor: "#2e86c1",
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b;
        for (const [key, value] of [
            ["bandColor", props.bandColor],
            ["pageColor", props.pageColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const { width, height } = ctx.target;
        const bandHex = (_a = props.bandColor) !== null && _a !== void 0 ? _a : "#2e86c1";
        const page = ((_b = props.pageColor) !== null && _b !== void 0 ? _b : "#1c2833");
        // Render the Settings -> Integrations card this schema PRODUCES — the
        // same surface the user sees one screen away, derived from the real
        // registration constant: title + id + "configured" chip, one
        // input-looking row per declared field, and the green two-tick probe
        // banner. Recognizing the mapping IS the lesson.
        const fields = connection_1.CATALOG_CONNECTION_SCHEMA.fields;
        const titleRow = String((0, dsl_stdlib_1.weightedSplit)([6, 62, 4, 22, 6], "col", {
            mode: "literal",
            claimants: ["-", "1", "-", "1{1}", "-"],
        }));
        const textRow = String((0, dsl_stdlib_1.weightedSplit)([8, 84, 8], "col", {
            mode: "literal",
            claimants: ["-", "1", "-"],
        }));
        const boxRow = String((0, dsl_stdlib_1.weightedSplit)([8, 84, 8], "col", {
            mode: "literal",
            claimants: ["-", "1{1}", "-"],
        }));
        const cardWeights = [
            4, 11, 7, 4,
            ...fields.flatMap(() => [5, 2, 12, 4]),
            2, 12,
        ];
        const cardClaimants = [
            "-", titleRow, textRow, "-",
            ...fields.flatMap(() => [textRow, "-", boxRow, "-"]),
            "-", boxRow,
        ];
        const spare = 100 - cardWeights.reduce((a, b) => a + b, 0);
        if (spare > 0) {
            cardWeights.push(spare);
            cardClaimants.push("-");
        }
        const cardContent = String((0, dsl_stdlib_1.weightedSplit)(cardWeights, "row", {
            mode: "literal",
            claimants: cardClaimants,
        }));
        const pageRow = String((0, dsl_stdlib_1.weightedSplit)([17, 66, 17], "col", {
            mode: "literal",
            claimants: ["-", `1{${cardContent}}`, "-"],
        }));
        const rows = String((0, dsl_stdlib_1.weightedSplit)([5, 76, 19], "row", {
            mode: "literal",
            claimants: ["-", pageRow, "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const cardW = width * 0.66;
        const green = "#7ce8a9";
        const sources = [];
        // Card background, then its contents in claim order.
        sources.push((0, template_utils_1.makeColorTile)(dim(bandHex, 0.24)));
        sources.push((0, template_utils_1.svgLabel)(`${connection_1.CATALOG_CONNECTION_SCHEMA.label}   ${String(connection_1.CATALOG_CONNECTION_ID)}`, cardW * 0.6, height * 0.09, { color: "#eaeef2", maxPx: Math.round(height * 0.038), vAlign: "middle" }));
        sources.push((0, template_utils_1.makeColorTile)("#14432c"));
        sources.push((0, template_utils_1.svgLabel)("configured", cardW * 0.2, height * 0.08, {
            color: green,
            maxPx: Math.round(height * 0.024),
            vAlign: "middle",
        }));
        sources.push((0, template_utils_1.svgLabel)("the Settings -> Integrations card this schema produces", cardW * 0.8, height * 0.06, { color: "#7f8c9b", maxPx: Math.round(height * 0.022), vAlign: "middle" }));
        for (const f of fields) {
            const secret = f.kind === "secret";
            sources.push((0, template_utils_1.svgLabel)(`${f.label.toUpperCase()}  -  ${f.kind}${f.required ? "" : "  -  optional"}${secret ? "  -  keychain" : ""}`, cardW * 0.8, height * 0.05, { color: "#b9c4cf", maxPx: Math.round(height * 0.02), vAlign: "middle" }));
            sources.push((0, template_utils_1.makeColorTile)(dim(bandHex, 0.14)));
            const placeholder = !secret && "placeholder" in f && f.placeholder
                ? f.placeholder
                : "<set - type to replace>";
            sources.push((0, template_utils_1.svgLabel)(placeholder, cardW * 0.8, height * 0.09, {
                color: "#7f8c9b",
                maxPx: Math.round(height * 0.026),
                vAlign: "middle",
            }));
        }
        // The probe banner — Test connection's two ticks, as the real card shows them.
        sources.push((0, template_utils_1.makeColorTile)("#14432c"));
        sources.push((0, template_utils_1.svgLabel)("reachable (v1)  +  authenticated - the probe's two ticks", cardW * 0.8, height * 0.09, {
            color: green,
            maxPx: Math.round(height * 0.026),
            vAlign: "middle",
        }));
        const heading = (0, svg_text_1.fitSvgText)("REGISTERED ON IMPORT - a module-eval side effect", width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.036), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            `publisher "${connection_1.CATALOG_CONNECTION_SCHEMA.publisher}" must match the id's publisher half - registration throws otherwise`,
            `render never probes and never sees the secret - Settings owns the probe; fetchers get a scoped keychain resolver - default upstream ${connection_1.CATALOG_DEFAULT_BASE_URL}`,
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
        title: "Host Connection",
        lines: [
            "registerHostConnection teaches the host a backend: a schema (the Settings form - url + keychain secret) and a probe (Test connection's two ticks).",
            "Registration is a module-eval side effect: importing the chapter makes starter-catalog@default exist in the app and CLI. Consent covers it.",
            "The publisher half of the id must match schema.publisher or registration throws. Secrets stay in the keychain; render never sees them.",
        ],
        explore: [
            "node examples/http-orchestrator/server.cjs, then Test connection",
            "Add STARTER_CATALOG_KEY and watch the second tick appear",
        ],
    }),
});
exports.default = exports.HostConnectionV1;
