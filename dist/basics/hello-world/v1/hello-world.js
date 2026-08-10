"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorldV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const HEX = /^#[0-9a-fA-F]{6}$/;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    text: {
        type: "string",
        required: false,
        description: "Text rendered in the center of the canvas.",
        meta: { control: { placeholder: "Hello, m0saic" } },
    },
    backgroundColor: {
        type: "string",
        required: false,
        description: "Canvas fill as #rrggbb.",
        // Color props declare themselves: `isColor` + `colorPicker` gives the
        // app a real swatch control instead of a bare text field.
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Background" },
        },
    },
});
exports.HelloWorldV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)("@m0saic-starter/basics/hello-world/v1"),
    label: "Hello World",
    version: 1,
    description: "The smallest correct template: one full-canvas tile, one text source, a typed props surface with deterministic defaults, and a validated m0 string. Start here.",
    capabilities: { tier: "core" },
    tags: ["basics", "starter", "text"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Static content — any canvas and any duration render cleanly.",
    },
    propsSchema,
    defaultProps: {
        text: "Hello, m0saic",
        backgroundColor: "#1c2833",
    },
    async render(props, _ctx) {
        var _a, _b;
        // Fail fast on bad input rather than rendering something misleading.
        // The props schema above is DOCUMENTATION — hosts can (and the CLI does)
        // call render() directly with a raw props bag, so render() is the gate.
        if (props.backgroundColor !== undefined &&
            !HEX.test(props.backgroundColor)) {
            throw new Error(`@m0saic-starter/basics/hello-world/v1: backgroundColor ` +
                `${JSON.stringify(props.backgroundColor)} must be a #rrggbb hex color.`);
        }
        const text = (_a = props.text) !== null && _a !== void 0 ? _a : "Hello, m0saic";
        const fill = ((_b = props.backgroundColor) !== null && _b !== void 0 ? _b : "#1c2833");
        // One layer, no `placement`: hAlign defaults to "center" and vAlign to
        // "middle", so the text centers itself in its tile.
        const layers = [
            {
                content: { kind: "literal", text },
                style: { fontSize: 72, fontColor: "#ffffff" },
            },
        ];
        return {
            kind: "mosaic_document",
            version: 1,
            // "F" = one full-canvas rect — the simplest possible m0 string.
            m0: (0, dsl_stdlib_1.toM0String)("F", "@m0saic-starter/basics/hello-world/v1"),
            assets: {},
            sources: [
                {
                    type: "text",
                    visual: { backgroundColor: (0, template_utils_1.solidBackground)(fill) },
                    layers,
                },
            ],
        };
    },
});
exports.default = exports.HelloWorldV1;
