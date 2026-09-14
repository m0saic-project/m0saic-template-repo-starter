"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeededShuffleV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/props/seeded-shuffle/v1";
const PALETTE = [
    "#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#1abc9c", "#3498db",
    "#9b59b6", "#e91e63", "#00bcd4", "#8bc34a", "#ff5722", "#607d8b",
];
const propsSchema = (0, template_utils_1.definePropsSchema)({
    seed: {
        type: "number",
        required: true,
        description: "The shuffle seed (integer 0-2147483647). Required on purpose: randomness must be reproducible, so the seed is a prop, never Math.random.",
        meta: { constraints: { min: 0, max: 2147483647 }, control: { step: 1 }, ui: { label: "Seed" } },
    },
    tiles: {
        type: "number",
        required: false,
        description: "How many tiles to deal (4-12).",
        meta: { constraints: { min: 4, max: 12 }, control: { step: 1 }, ui: { label: "Tiles" } },
    },
});
exports.SeededShuffleV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "15 · Seeded Shuffle",
    version: 1,
    description: "Randomness done the m0saic way: a REQUIRED seed prop feeds mulberry32, a Fisher-Yates shuffle deals the palette, and identical props render byte-identical documents. The caption prints the dealt order.",
    capabilities: { tier: "core" },
    tags: ["props", "determinism", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Re-render with the same seed — nothing changes. That's the point.",
    },
    propsSchema,
    defaultProps: { seed: 42, tiles: 8 },
    async render(props, ctx) {
        var _a;
        const seed = props.seed;
        const tiles = (_a = props.tiles) !== null && _a !== void 0 ? _a : 8;
        if (!Number.isInteger(seed) || seed === undefined || seed < 0 || seed > 2147483647) {
            throw new Error(`${ID}: seed is REQUIRED (integer 0-2147483647), got ${JSON.stringify(seed)}. ` +
                "Randomness must be reproducible - pass a seed, don't reach for Math.random.");
        }
        if (!Number.isInteger(tiles) || tiles < 4 || tiles > 12) {
            throw new Error(`${ID}: tiles must be an integer 4-12, got ${JSON.stringify(tiles)}.`);
        }
        const { width, height } = ctx.target;
        // Fisher-Yates over the palette, driven ONLY by the seeded generator.
        const rng = (0, template_utils_1.mulberry32)(seed);
        const deck = PALETTE.slice(0, Math.max(tiles, 4));
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        const dealt = deck.slice(0, tiles);
        // The dealt strip over a caption band, 5:1.
        const strip = `${tiles}(${new Array(tiles).fill("1").join(",")})`;
        const docM0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: [strip, "1"] })), ID);
        const caption = `seed ${seed} dealt: ${dealt.join(" ")}`;
        return {
            kind: "mosaic_document",
            version: 1,
            m0: docM0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                ...dealt.map((c) => (0, template_utils_1.makeColorTile)(c)),
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.026),
                    maxLines: 2,
                    color: "#7f8c9b",
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Seeded Shuffle",
        lines: [
            "Templates never call Math.random - determinism is a law.",
            "Randomness flows from a REQUIRED seed through a seeded generator, so identical props render identical bytes.",
            "The seed is required on purpose: a default would hide the contract.",
        ],
        explore: [
            "Change Seed, then set it back - the exact order returns",
            "Change Tiles - the strip resplits, still seed-stable",
            "Read the caption: the dealt order is the receipt",
        ],
    }),
});
exports.default = exports.SeededShuffleV1;
