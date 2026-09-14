"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RotateHeadroomV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/compose/rotate-headroom/v1";
const MODES = ["in-place", "headroom"];
const CHILD_REF = "card";
const CARD_BG = "#EF7525";
const CARD_INK = "#17202a";
const INK_DIM = "#7f8c9b";
/** The card's own footprint, as a fraction of the canvas. */
const CARD_FRAC = 0.55;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    angle: {
        type: "number",
        required: false,
        description: "Rotation in degrees, clockwise. The corner loss peaks near 45.",
        meta: {
            constraints: { min: -45, max: 45 },
            control: { step: 5 },
            ui: { label: "Angle" },
        },
    },
    mode: {
        type: "string",
        required: false,
        description: "\"in-place\": the rotation sits on the card, whose buffer is exactly the card — corners clip. \"headroom\": the card rides a child whose declared size is the rotated bounding box, and the rotation sits on the CHILD — same card, room to turn.",
        meta: { constraints: { oneOf: [...MODES] }, ui: { label: "Mode" } },
    },
});
/** The axis-aligned box a w×h rect needs once rotated by `deg`. */
function rotatedBounds(w, h, deg) {
    const rad = (Math.abs(deg) * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    return {
        width: Math.ceil(w * cos + h * sin),
        height: Math.ceil(w * sin + h * cos),
    };
}
/** The rect that centers `inner` inside an `outer` box. */
function centeredRect(outer, inner) {
    return {
        x: Math.round((outer.width - inner.width) / 2),
        y: Math.round((outer.height - inner.height) / 2),
        w: inner.width,
        h: inner.height,
    };
}
exports.RotateHeadroomV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "48 · Rotate Headroom",
    version: 1,
    description: "effects.rotate spins content inside a buffer that never grows, so corners clip. The cure isn't a bigger inset — it's a child whose declared size is the rotated bounding box (W' = w·|cos θ| + h·|sin θ|), carrying the rotation instead.",
    capabilities: { tier: "core" },
    tags: ["compose", "effects", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Set Angle to 30 and flip between the two modes — same card, one keeps its corners.",
    },
    propsSchema,
    defaultProps: { angle: 20, mode: "in-place" },
    async render(props, ctx) {
        var _a, _b;
        const angle = (_a = props.angle) !== null && _a !== void 0 ? _a : 20;
        const mode = (_b = props.mode) !== null && _b !== void 0 ? _b : "in-place";
        const problems = [];
        if (!Number.isFinite(angle) || angle < -45 || angle > 45) {
            problems.push(`angle must be -45..45 degrees, got ${JSON.stringify(angle)}`);
        }
        if (!MODES.includes(mode)) {
            problems.push(`mode must be one of ${MODES.join(" | ")}, got ${JSON.stringify(mode)}`);
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height } = ctx.target;
        // Everything above the caption band. The card's box grows with the
        // angle in headroom mode, so the caption gets its own row rather than
        // an overlay — a padded box would otherwise sit on top of it.
        const area = { width, height: Math.round((height * 5) / 6) };
        // The card is the same size in both modes. Only its buffer differs.
        const card = {
            width: Math.round(area.width * CARD_FRAC),
            height: Math.round(area.height * CARD_FRAC),
        };
        const needed = rotatedBounds(card.width, card.height, angle);
        // Clamped so a steep angle can't ask for more room than exists: the
        // child still DECLARES the full padded size, so `contain` scales it
        // down uniformly instead of clipping it.
        const box = mode === "headroom"
            ? {
                width: Math.min(needed.width, area.width),
                height: Math.min(needed.height, area.height),
            }
            : card;
        // A drawtext card: glyphs and panel are baked INTO the content buffer,
        // so the rotation is visible. (An svg-rasterized label would rotate its
        // fill under an axis-aligned glyph mask — masks are a SHAPE effect,
        // applied after rotation, so the letters wouldn't turn at all.)
        const cardSource = {
            type: "text",
            renderMode: { kind: "image" },
            visual: { backgroundColor: (0, template_utils_1.solidBackground)(CARD_BG) },
            layers: [
                {
                    content: { kind: "literal", text: `${angle} deg` },
                    style: { fontSize: Math.round(card.height * 0.28), fontColor: CARD_INK },
                },
            ],
        };
        const children = {};
        let tileSource;
        if (mode === "headroom") {
            // The child's DECLARED size is the whole point: it is the buffer the
            // rotation gets to use, and it is also the child's aspect signal.
            //
            // Centering the card inside it via placeInsetPieces, NOT pixel-weight
            // splits: padding spelled as raw weights makes the child's own string
            // demand near-canvas precision, and precision is hereditary — the
            // parent inherits it. Coarse cells plus a recovery inset keep the
            // exact rect and a small floor.
            const childInner = (0, template_utils_1.placeInsetPieces)({
                rootW: needed.width,
                rootH: needed.height,
                pieces: [
                    { rect: { ...centeredRect(needed, card), importance: 1 }, source: cardSource },
                ],
            });
            children[CHILD_REF] = {
                kind: "mosaic_document",
                version: 1,
                m0: (0, dsl_stdlib_1.toM0String)(childInner.m0, `${ID}:child`),
                assets: {},
                size: { width: needed.width, height: needed.height },
                sources: childInner.sources,
            };
            tileSource = {
                type: "mosaic",
                ref: CHILD_REF,
                placement: { fit: "contain" },
                effects: { rotate: angle },
            };
        }
        else {
            // The rotation sits on the card, whose buffer IS the card.
            tileSource = { ...cardSource, effects: { rotate: angle } };
        }
        // Parent geometry, same doctrine: the box is an exact rect, so it gets a
        // coarse lattice cell plus a recovery inset instead of pixel weights.
        // Spelling this pair as raw splits produced a 5,000-character m0 whose
        // precision floor sat ABOVE 720p — the layout rendered, but any parent
        // nesting it inherited that floor.
        const captionRect = {
            x: Math.round(width * 0.08),
            y: Math.round(height * 0.87),
            w: Math.round(width * 0.84),
            h: Math.round(height * 0.11),
        };
        const growthPct = Math.round((needed.width / card.width - 1) * 100);
        const caption = mode === "headroom"
            ? `headroom: child declared ${box.width}x${box.height} for a ${card.width}x${card.height} card ` +
                `(+${growthPct}% wide at ${angle} deg) - the rotation rides the CHILD, so nothing clips`
            : `in-place: the buffer stays ${card.width}x${card.height}, but ${angle} deg needs ` +
                `${needed.width}x${needed.height} (+${growthPct}% wide) - the corners are clipped`;
        const placed = (0, template_utils_1.placeInsetPieces)({
            rootW: width,
            rootH: height,
            pieces: [
                {
                    rect: {
                        ...centeredRect({ width, height: area.height }, box),
                        importance: 1,
                    },
                    source: tileSource,
                },
                {
                    rect: { ...captionRect, importance: 10 },
                    source: (0, svg_text_1.svgLabel)(caption, captionRect.w, captionRect.h, {
                        maxPx: Math.round(height * 0.028),
                        maxLines: 2,
                        color: mode === "headroom" ? INK_DIM : "#e67e22",
                    }),
                },
            ],
        });
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)(placed.m0, ID),
            assets: {},
            backgroundColor: "#0b0e11",
            ...(mode === "headroom" ? { children } : {}),
            sources: placed.sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Rotate Headroom",
        lines: [
            "effects.rotate is IN-PLACE: the buffer keeps its size, so content corners that leave it are clipped.",
            "inset and padding shrink the box BEFORE the effects chain, which makes the clipping worse, not better.",
            "The cure is real geometry: a child whose declared size is the rotated bounding box, carrying the rotation.",
            "Rotation is a CONTENT effect applied before masks - rotate svg text and the letters never turn.",
        ],
        explore: [
            "Set Angle 30 and flip modes - same card, one keeps its corners",
            "Sweep to 45 in headroom and watch the child size grow",
            "Set Angle 0: the child collapses to a plain \"1\"",
            "Structure dock: in headroom the rotation is on the CHILD",
        ],
    }),
});
exports.default = exports.RotateHeadroomV1;
