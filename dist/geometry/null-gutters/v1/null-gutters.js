"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullGuttersV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/geometry/null-gutters/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    tileCount: {
        type: "number",
        required: false,
        description: "Content tiles (2-6).",
        meta: { constraints: { min: 2, max: 6 }, control: { step: 1 }, ui: { label: "Tiles" } },
    },
    tileWeight: {
        type: "number",
        required: false,
        description: "Content weight per tile, relative to a gutter weight of 1 (2-24).",
        meta: { constraints: { min: 2, max: 24 }, control: { step: 1 }, ui: { label: "Tile weight" } },
    },
    tileColor: {
        type: "string",
        required: false,
        description: "Tile fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2471a3" },
            ui: { label: "Tile color" },
        },
    },
});
exports.NullGuttersV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "Null Gutters",
    version: 1,
    description: "Gutters as `-` null tiles on one weighted split: nulls claim their space and paint nothing, so the document background becomes the gap. The honest alternative to margin-as-split (the insetNode trap), where quantization spreads INTO your margins.",
    capabilities: { tier: "core" },
    tags: ["geometry", "gutters", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Lower Tile weight to widen the gutters — they're just weights.",
    },
    propsSchema,
    defaultProps: { tileCount: 3, tileWeight: 8, tileColor: "#2471a3" },
    async render(props, ctx) {
        var _a, _b, _c;
        const count = (_a = props.tileCount) !== null && _a !== void 0 ? _a : 3;
        const weight = (_b = props.tileWeight) !== null && _b !== void 0 ? _b : 8;
        const tileColor = (_c = props.tileColor) !== null && _c !== void 0 ? _c : "#2471a3";
        if (!Number.isInteger(count) || count < 2 || count > 6) {
            throw new Error(`${ID}: tileCount must be an integer 2-6, got ${count}.`);
        }
        if (!Number.isInteger(weight) || weight < 2 || weight > 24) {
            throw new Error(`${ID}: tileWeight must be an integer 2-24, got ${weight}.`);
        }
        if (!HEX.test(tileColor)) {
            throw new Error(`${ID}: tileColor ${JSON.stringify(tileColor)} must be #rrggbb.`);
        }
        void ctx;
        // [tile, gutter, tile, gutter, tile] — content weights with unit-weight
        // nulls between them. One split; gaps are first-class tiles.
        const weights = [];
        const claimants = [];
        for (let i = 0; i < count; i++) {
            if (i > 0) {
                weights.push(1);
                claimants.push("-");
            }
            weights.push(weight);
            claimants.push("1");
        }
        const m0 = (0, dsl_stdlib_1.weightedSplit)(weights, "col", { claimants });
        const sources = new Array(count)
            .fill(null)
            .map(() => (0, template_utils_1.makeColorTile)(tileColor));
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            // THE point: nulls paint nothing, so this is what the gutters show.
            backgroundColor: "#0b0e11",
            sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Null Gutters",
        lines: [
            "A - tile claims its slots and paints NOTHING - the document background shows through. That makes nulls the honest gutter: content and gaps are all weights on ONE split.",
            "Never spell margins as extra split cells around each tile (the insetNode trap): the remainder rule spreads INTO those margins differently at every canvas.",
        ],
        explore: [
            "Lower Tile weight - the gutters widen; they are just weights",
            "Compare with lattice-gutters at an odd canvas size",
        ],
    }),
});
exports.default = exports.NullGuttersV1;
