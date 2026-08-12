"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraFollowV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/compose/camera-follow/v1";
const WORLD_REF = "world";
const GRID = 3;
const INK_DIM = "#7f8c9b";
const DEBUG = "#ecf0f1";
/** Nine distinct cells, so "which one is it on" has an answer. */
const PALETTE = [
    "#c0392b", "#d35400", "#f1c40f",
    "#27ae60", "#16a085", "#2980b9",
    "#8e44ad", "#7f8c8d", "#EF7525",
];
/** Which cells the camera visits, in order. */
const TARGET_CELLS = [0, 4, 8];
/**
 * A hollow rect: outer subpath clockwise, inner counter-clockwise. Under the
 * nonzero fill rule the two cancel in the middle, leaving a frame.
 */
function hollowRect(x, y, w, h, t) {
    const outer = `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
    const inner = `M ${x + t} ${y + t} V ${y + h - t} H ${x + w - t} V ${y + t} Z`;
    return `${outer} ${inner}`;
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    zoom: {
        type: "number",
        required: false,
        description: "Camera zoom. At 1 followCamera returns undefined — no camera at all, which the template has to handle rather than assume.",
        meta: {
            constraints: { min: 1, max: 3 },
            control: { step: 0.25 },
            ui: { label: "Zoom" },
        },
    },
    pullBack: {
        type: "boolean",
        required: false,
        description: "Ease back to the full view after the last target and hold there — the standard end of a camera walk.",
        meta: { ui: { label: "Pull back at the end" } },
    },
    showViewport: {
        type: "boolean",
        required: false,
        description: "Draw the crop window the camera will frame at each target, via cameraViewportRect — the same math a camera debugger uses.",
        meta: { ui: { label: "Show viewport rects" } },
    },
});
exports.CameraFollowV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "38 · Camera Follow",
    version: 1,
    description: "A keyframed camera walk described as rects and times: followCamera turns targets into per-frame focus expressions over a child mosaic's own coordinate space, with an optional pull-back — and viewport rects showing exactly what each settle will frame.",
    capabilities: { tier: "core" },
    tags: ["compose", "camera", "animation", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 6000,
        note: "Press play: the camera settles on three cells in turn. Turn Show viewport rects on to see why.",
    },
    propsSchema,
    defaultProps: { zoom: 2, pullBack: true, showViewport: true },
    async render(props, ctx) {
        var _a, _b, _c;
        const zoom = (_a = props.zoom) !== null && _a !== void 0 ? _a : 2;
        const pullBack = (_b = props.pullBack) !== null && _b !== void 0 ? _b : true;
        const showViewport = (_c = props.showViewport) !== null && _c !== void 0 ? _c : true;
        if (!Number.isFinite(zoom) || zoom < 1 || zoom > 3) {
            throw new Error(`${ID}: zoom must be 1-3, got ${JSON.stringify(zoom)}.`);
        }
        const { width, height } = ctx.target;
        const durationSec = ctx.target.durationMs / 1000;
        /* ── The world: a child with a coordinate space we own ─── */
        // The world gets everything above the caption band. Its box is the
        // coordinate space for the targets, the viewport math and the camera —
        // one number, used consistently, is what keeps the debug rects honest.
        const world = { width, height: Math.round((height * 5) / 6) };
        const cellW = Math.round(world.width / GRID);
        const cellH = Math.round(world.height / GRID);
        const cellRect = (index) => ({
            x: (index % GRID) * cellW,
            y: Math.floor(index / GRID) * cellH,
            width: cellW,
            height: cellH,
        });
        // Settle times spread across the clip, in order — followCamera expects
        // targets already sorted by time.
        const targets = TARGET_CELLS.map((cell, i) => ({
            rect: cellRect(cell),
            atSec: Number((((i + 1) * durationSec) / (TARGET_CELLS.length + 1)).toFixed(3)),
        }));
        const ones = new Array(GRID).fill(1);
        const row = String((0, dsl_stdlib_1.weightedSplit)(ones, "col", { claimants: new Array(GRID).fill("1") }));
        const grid = String((0, dsl_stdlib_1.weightedSplit)(ones, "row", { claimants: new Array(GRID).fill(row) }));
        const worldSources = PALETTE.map((c) => (0, template_utils_1.makeColorTile)(c));
        if (showViewport) {
            // One tile, one path, one hollow rect per target — the debug layer
            // costs a single source no matter how long the walk gets.
            const thickness = Math.max(3, Math.round(Math.min(world.width, world.height) * 0.006));
            const frames = targets
                .map((t) => {
                const fx = (t.rect.x + t.rect.width / 2) / world.width;
                const fy = (t.rect.y + t.rect.height / 2) / world.height;
                // The rect the camera will actually show once settled here — NOT
                // the target rect. At zoom 2 it is a quarter of the world.
                const view = (0, template_utils_1.cameraViewportRect)((0, template_utils_1.centerFocus)(fx, zoom), (0, template_utils_1.centerFocus)(fy, zoom), zoom, world.width, world.height);
                return hollowRect(Math.round(view.x), Math.round(view.y), Math.round(view.width), Math.round(view.height), thickness);
            })
                .join(" ");
            worldSources.push((0, template_utils_1.makeColorTile)(DEBUG, {
                mask: {
                    kind: "inline-mask",
                    localPath: frames,
                    bounds: { x: 0, y: 0, width: world.width, height: world.height },
                },
            }));
        }
        const worldDoc = {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)(showViewport ? `${grid}{1}` : grid, `${ID}:world`),
            assets: {},
            // The camera's rects are in THIS space — declare it instead of hoping.
            size: world,
            sources: worldSources,
        };
        /* ── The camera over that world ────────────────────────── */
        const camera = zoom > 1
            ? (0, template_utils_1.followCamera)(targets, world.width, world.height, zoom, pullBack
                ? {
                    endSec: durationSec,
                    earliestStartSec: targets[targets.length - 1].atSec,
                    settleOutSec: targets[targets.length - 1].atSec + 0.5,
                }
                : undefined)
            : undefined;
        const caption = camera
            ? `zoom ${zoom} over ${targets.length} targets at ${targets.map((t) => `${t.atSec}s`).join(", ")}` +
                (pullBack ? " - then pulls back to the full view and holds" : " - no pull-back: it ends where it lands")
            : `zoom ${zoom}: followCamera returned undefined, so there is NO camera - the source renders whole`;
        // The caption gets its own row rather than an overlay: text over a
        // camera that is panning a colour field is text you cannot read.
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: ["1", "1"] })), ID);
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            children: { [WORLD_REF]: worldDoc },
            sources: [
                {
                    type: "mosaic",
                    ref: WORLD_REF,
                    placement: { fit: "contain" },
                    ...(camera ? { effects: { camera } } : {}),
                },
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.028),
                    maxLines: 2,
                    color: INK_DIM,
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Camera Follow",
        lines: [
            "effects.camera is a crop window: a zoom plus a focus point ffmpeg re-evaluates per frame.",
            "You describe WHERE to look and WHEN - followCamera turns {rect, atSec} targets into the focus expressions.",
            "They come back as EXPRESSION STRINGS, and with a pull-back so does the zoom - assume nothing is a number.",
            "zoom <= 1 returns undefined: no camera, not a broken one. Handle it.",
        ],
        explore: [
            "Press play: three settles, then the pull-back",
            "Toggle Show viewport rects - the frames are each settle",
            "Drop Zoom to 1 and the camera disappears entirely",
            "Turn Pull back off: the walk ends on the last target",
        ],
    }),
});
exports.default = exports.CameraFollowV1;
