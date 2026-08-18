"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefMirrorV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/pipelines/ref-mirror/v1";
const FITS = ["contain", "cover"];
const HERO_BG = "#EF7525";
const INK = "#17202a";
const INK_DIM = "#7f8c9b";
const propsSchema = (0, template_utils_1.definePropsSchema)({
    word: {
        type: "string",
        required: false,
        description: "Drawn ONCE in the hero cell. The three cells beside it are mirrors of those very pixels, not re-renders.",
        meta: { control: { placeholder: "MIRROR" }, ui: { label: "Word" } },
    },
    mirrorFit: {
        type: "string",
        required: false,
        description: "Placement on the MIRRORS only — the hero is untouched. Same pixels, different treatment per copy.",
        meta: { constraints: { oneOf: [...FITS] }, ui: { label: "Mirror fit" } },
    },
});
exports.RefMirrorV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "55 · Ref Mirror",
    version: 1,
    description: "A ref source mirrors another cell's rendered pixels by flattenedStableKey: the target renders once and every mirror reads the same intermediate, decorating its own copy. N mirrors, one decode.",
    capabilities: { tier: "core" },
    tags: ["pipelines", "refs", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "The three right-hand cells are the left one's pixels — flip Mirror fit and only they change.",
    },
    propsSchema,
    defaultProps: { word: "MIRROR", mirrorFit: "contain" },
    async render(props, ctx) {
        var _a, _b;
        const word = ((_a = props.word) !== null && _a !== void 0 ? _a : "MIRROR").trim();
        const mirrorFit = (_b = props.mirrorFit) !== null && _b !== void 0 ? _b : "contain";
        const problems = [];
        if (word.length < 1 || word.length > 12) {
            problems.push(`word must be 1-12 characters, got ${JSON.stringify(word)}`);
        }
        if (!FITS.includes(mirrorFit)) {
            problems.push(`mirrorFit must be one of ${FITS.join(" | ")}, got ${JSON.stringify(mirrorFit)}`);
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height } = ctx.target;
        // Hero on the left, three mirrors stacked on the right, caption band
        // underneath. The hero's key falls out of THIS string: r/fc0.
        const top = String((0, dsl_stdlib_1.weightedSplit)([1, 1], "col", {
            claimants: ["1", String((0, dsl_stdlib_1.weightedSplit)([1, 1, 1], "row", { claimants: ["1", "1", "1"] }))],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: [top, "1"] })), ID);
        // ASK the m0 for the key instead of guessing it. `findStableKeys` walks
        // the FLATTENED geometry in source order, so the first painted frame is
        // the hero — and the answer survives any change to the string above.
        // (Guessing looks fine until a weightedSplit expands into a run: this
        // very layout reads `6[0,0,0,0,2(...),1]`, so the hero is NOT "r/fc0".)
        const heroKey = (0, dsl_stdlib_1.findStableKeys)(m0, (f) => f.kind === "frame", { width, height })[0];
        // A drawtext card: text-as-image is a real intermediate, which is exactly
        // the kind of target a mirror pays off against (a colour tile would not).
        const hero = {
            type: "text",
            renderMode: { kind: "image" },
            visual: { backgroundColor: (0, template_utils_1.solidBackground)(HERO_BG) },
            layers: [
                {
                    content: { kind: "literal", text: word },
                    style: { fontSize: Math.round(height * 0.16), fontColor: INK },
                },
            ],
        };
        const mirror = () => ({
            type: "ref",
            // The coordinate, not a name: the m0 above decides it.
            flattenedStableKey: heroKey,
            placement: { fit: mirrorFit },
        });
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                hero,
                mirror(),
                mirror(),
                mirror(),
                (0, svg_text_1.svgLabel)(`3 mirrors of ${heroKey} - drawn once, decorated three times (fit "${mirrorFit}")`, width, Math.round(height / 6), { maxPx: Math.round(height * 0.028), maxLines: 2, color: INK_DIM }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Ref Mirror",
        lines: [
            "A ref mirrors another cell's rendered PIXELS: the target renders once and every ref reads that same intermediate.",
            "flattenedStableKey is a coordinate in the flattened geometry - \"r\" the root, \"r/fc0\" a split's first cell. The m0 decides it.",
            "placement, effects, mask and playback on the REF decorate that copy alone - full-bleed here, contained there.",
            "Not for flat colours: color= is nearly free. Refs pay off against media, text-as-image and nested mosaics.",
        ],
        explore: [
            "Flip Mirror fit - only the three copies change",
            "Change Word: all four cells follow, from one render",
            "Read the caption for the key the m0 produced",
        ],
    }),
});
exports.default = exports.RefMirrorV1;
