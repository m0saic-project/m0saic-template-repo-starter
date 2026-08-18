"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhyTheFloorsCrossV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const kpi_overview_m0_1 = require("./real/kpi-overview.m0");
const theming_m0_1 = require("./real/theming.m0");
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/quality/why-the-floors-cross/v1";
const LAYOUTS = [
    "dashboard",
    "sidebar-page",
    "even-grid",
    "real-kpi-strip",
    "real-theming",
];
const GRID_COLS = 12;
const col = (w, c) => String((0, dsl_stdlib_1.weightedSplit)(w, "col", { mode: "literal", claimants: c }));
const row = (w, c) => String((0, dsl_stdlib_1.weightedSplit)(w, "row", { mode: "literal", claimants: c }));
/**
 * One stat card: background tile carrying the content as its overlay —
 * icon+label row, big value, delta chip, all with real pads. Claims 5
 * sources: bg, icon, label, value, delta.
 */
function cardM0() {
    const labelRow = col([8, 24, 8, 52, 8], ["-", "1", "-", "1", "-"]);
    const valueRow = col([8, 84, 8], ["-", "1", "-"]);
    const deltaRow = col([8, 36, 56], ["-", "1", "-"]);
    const content = row([10, 22, 8, 34, 10, 16], ["-", labelRow, "-", valueRow, "-", deltaRow]);
    return `1{${content}}`;
}
/**
 * The synthetic shapes. `mode: "literal"` is load-bearing: GCD reduction
 * would rewrite the card anatomy and collapse the sidebar's [320,1120]
 * design-pixel spec to [2,7] — swapping the 1440-slot ruler for 9 slots.
 */
function layoutM0(layout) {
    switch (layout) {
        case "dashboard": {
            const card = cardM0();
            const strip = col([3, 14, 2, 14, 2, 14, 2, 14, 2, 14, 2, 14, 3], ["-", card, "-", card, "-", card, "-", card, "-", card, "-", card, "-"]);
            const titleBar = col([3, 22, 75], ["-", "1", "-"]);
            return row([10, 4, 86], [titleBar, "-", strip]);
        }
        case "sidebar-page":
            return col([320, 1120], ["1", "1"]);
        case "even-grid":
            return col(Array(GRID_COLS).fill(1), Array(GRID_COLS).fill("1"));
        case "real-kpi-strip":
            return kpi_overview_m0_1.KPI_OVERVIEW_REAL.m0;
        case "real-theming":
            return theming_m0_1.THEMING_REAL.m0;
    }
}
/** A darker twin of a #rrggbb colour so adjacent blocks stay tellable-apart. */
function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const dim = (v) => Math.max(0, Math.round(v * 0.62));
    const hh = (v) => v.toString(16).padStart(2, "0");
    return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}`;
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    layout: {
        type: "string",
        required: false,
        description: "dashboard: title bar + six stat cards — one card is precision-high alone, six nested cross to feasibility-high (safe minimum 680x100). sidebar-page: design-pixel spec (320 of 1440) — 1440-slot ruler, silently off at 1280. even-grid: floors stay at 12. real-kpi-strip / real-theming: captured production m0, flattened, rendered as a wireframe — read Make's safe-minimum callout.",
        meta: {
            constraints: { oneOf: LAYOUTS },
            ui: { label: "Layout", order: 1 },
        },
    },
    bandColor: {
        type: "string",
        required: false,
        description: "Block fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2e86c1" },
            ui: { label: "Band color", order: 2 },
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
exports.WhyTheFloorsCrossV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "70 · Why the Floors Cross",
    version: 1,
    description: "Which floor is the one to watch, for layouts people actually build? Synthetic shapes show the mechanism: one stat card is precision-high alone, six in a strip cross over to feasibility-high (safe minimum 680x100); a sidebar speced in design pixels (320 of 1440) bakes a 1440-slot ruler into the m0 and is silently off at 1280; an even grid stays at 12. Then the real thing: captured production m0, shipped bare and rendered as a wireframe — the kpi strip's flattened 22,988 chars measure 934x117 feasibility vs 193x121 precision, and theming measures 1920x1080 precision vs 663x313 feasibility. All floors are of the FLATTENED layout, the form render actually runs.",
    capabilities: { tier: "core" },
    tags: ["quality", "feasibility", "lesson"],
    /**
     * REQUIRED: compaction's GCD reduction would rewrite the card anatomy and
     * collapse [320,1120] to [2,7]; and the real-* layouts must ship the
     * captured string EXACTLY as production flattened it.
     */
    skipAutoCompact: true,
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Flip Layout and read Make's safe-minimum callout — it measures the same flattened string this template ships. real-kpi-strip jumps it to 934x117.",
    },
    propsSchema,
    defaultProps: {
        layout: "dashboard",
        bandColor: "#2e86c1",
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c;
        for (const [key, value] of [
            ["bandColor", props.bandColor],
            ["pageColor", props.pageColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const layout = ((_a = props.layout) !== null && _a !== void 0 ? _a : "dashboard");
        if (!LAYOUTS.includes(layout)) {
            throw new Error(`${ID}: layout "${layout}" must be one of ${LAYOUTS.join(", ")}.`);
        }
        const { width, height } = ctx.target;
        const bandHex = (_b = props.bandColor) !== null && _b !== void 0 ? _b : "#2e86c1";
        const band = bandHex;
        const page = ((_c = props.pageColor) !== null && _c !== void 0 ? _c : "#1c2833");
        const real = layout === "real-kpi-strip" || layout === "real-theming";
        // Synthetic shapes carry a burned caption strip; the real captures ship
        // BARE — appending an overlay to their roots is an illegal overlay
        // chain, and the captured string should not be edited anyway.
        const base = layoutM0(layout);
        const m0 = (0, dsl_stdlib_1.toM0String)(real ? base : `${base}{6[-,-,-,-,-,1]}`, ID);
        const e = (0, dsl_stdlib_1.evaluateM0)(String(m0), { width, height });
        const { feasibility, precision, recommendedMin } = e;
        if (!e.feasible) {
            return (0, template_utils_1.makeErrorMosaic)([
                `- this layout's safe minimum is ${recommendedMin.width}x${recommendedMin.height}; the canvas is ${width}x${height}`,
                `- fix: raise the canvas, or pick a layout with a lower floor`,
            ].join("\n"), { width, height, title: "Below this layout's floor", errorCode: "STARTER_BELOW_SHAPE_FLOOR" });
        }
        const sources = [];
        if (real) {
            // Wireframe of the real geometry: one alternating tile per claim.
            for (let i = 0; i < e.frameCount; i++) {
                sources.push((0, template_utils_1.makeColorTile)(i % 2 === 0 ? band : shade(bandHex)));
            }
            return {
                kind: "mosaic_document",
                version: 1,
                m0,
                assets: {},
                backgroundColor: page,
                sources,
            };
        }
        // One card measured ALONE, so the dashboard caption can SHOW the floors
        // crossing at the nesting step instead of asserting it.
        const cardAlone = (0, dsl_stdlib_1.evaluateM0)(cardM0(), { width, height });
        const fx = feasibility.minWidthPx;
        const px = precision.maxSplitX;
        const heading = layout === "dashboard"
            ? "FEASIBILITY RUNS HIGH - nesting crossed the floors"
            : layout === "sidebar-page"
                ? e.meetsPrecision
                    ? "PRECISION RUNS HIGH - true here, silently off below the design width"
                    : "PRECISION RUNS HIGH - this canvas is already silently off"
                : "FLOORS EQUAL - even splits stay cheap";
        const why = layout === "dashboard"
            ? `one card: feas ${cardAlone.feasibility.minWidthPx}px wide, prec ${cardAlone.precision.maxSplitX} - six in a strip: feasibility ${fx}px, past precision ${px}`
            : layout === "sidebar-page"
                ? `sidebar speced 320px of a 1440 design frame - the ruler is now ${px} slots; renders at ${fx}px, pixel-true only at ${px}px and up`
                : `twelve equal columns - both floors sit at ${px} no matter how many you add`;
        const fitted = (0, svg_text_1.fitSvgText)(heading, width * 0.9, height * 0.07, {
            maxPx: Math.round(height * 0.036),
            maxLines: 1,
        });
        const readout = (0, svg_text_1.fitSvgLines)([
            why,
            `flattened floors at ${width}x${height}: feasibility ${fx}x${feasibility.minHeightPx}   precision ${px}x${precision.maxSplitY}   safe minimum ${recommendedMin.width}x${recommendedMin.height}`,
        ], width * 0.9, height * 0.09, { maxPx: Math.round(height * 0.026), widthFrac: 0.92 });
        // Blocks bind left to right / top to bottom, then the caption text.
        if (layout === "dashboard") {
            sources.push((0, template_utils_1.makeColorTile)(band)); // title chip
            for (let i = 0; i < 6; i++) {
                // card bg, then icon / label / value / delta on it
                sources.push((0, template_utils_1.makeColorTile)(shade(bandHex)), (0, template_utils_1.makeColorTile)(band), (0, template_utils_1.makeColorTile)(band), (0, template_utils_1.makeColorTile)(band), (0, template_utils_1.makeColorTile)(band));
            }
        }
        else if (layout === "sidebar-page") {
            sources.push((0, template_utils_1.makeColorTile)(shade(bandHex)), (0, template_utils_1.makeColorTile)(band));
        }
        else {
            for (let i = 0; i < GRID_COLS; i++) {
                sources.push((0, template_utils_1.makeColorTile)(i % 2 === 0 ? band : shade(bandHex)));
            }
        }
        sources.push((0, svg_text_1.svgTextSource)([
            {
                text: fitted.text,
                fontSize: fitted.fontSize,
                color: (layout === "sidebar-page" ? "#f2a03d" : "#eaeef2"),
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
        title: "Why the Floors Cross",
        lines: [
            "One card is precision-high alone; six in a strip cross to feasibility-high, safe minimum 680px wide. Ordinary design choices move floors by hundreds.",
            "Spec a sidebar in design pixels - 320 of 1440 - and the ruler is 1440 slots: pixel-true only at full design width, silently off below it.",
            "The real-* layouts ARE production m0, flattened as render runs it: the kpi strip measures 934x117 vs 193x121. Read Make's safe-minimum callout.",
        ],
        explore: [
            "Flip Layout - synthetic shapes, then the real captures",
            "real-kpi-strip: the app's callout jumps to 934x117",
        ],
    }),
});
exports.default = exports.WhyTheFloorsCrossV1;
