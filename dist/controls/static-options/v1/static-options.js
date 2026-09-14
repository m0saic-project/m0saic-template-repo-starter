"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticOptionsV1 = exports.TRACKS = exports.PRESETS = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9-]+$/;
const ID = "@m0saic-starter/controls/static-options/v1";
exports.PRESETS = [
    { value: "draft", label: "Draft", description: "fast encode, small file" },
    { value: "standard", label: "Standard", description: "the everyday balance" },
    { value: "premium", label: "Premium", description: "slow encode, best pixels" },
];
exports.TRACKS = [
    { value: "video", label: "Video" },
    { value: "audio", label: "Audio" },
    { value: "captions", label: "Captions" },
    { value: "thumbnail", label: "Thumbnail" },
];
/** A darker twin of a #rrggbb colour. */
function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const dim = (v) => Math.max(0, Math.round(v * 0.62));
    const hh = (v) => v.toString(16).padStart(2, "0");
    return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}`;
}
const titleCase = (slug) => slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const propsSchema = (0, template_utils_1.definePropsSchema)({
    preset: {
        type: "string",
        required: false,
        description: "Export preset. options + constraints.oneOf together: the editor shows pills AND the validator fences the value — a true closed set.",
        meta: {
            constraints: { oneOf: exports.PRESETS.map((p) => p.value) },
            control: { options: exports.PRESETS },
            ui: { label: "Preset", order: 1 },
        },
    },
    tracks: {
        type: "string[]",
        required: false,
        description: "Included tracks. options WITHOUT oneOf: toggle pills as a convenience, but any slug still validates — the picker is presentation, not a fence.",
        meta: {
            constraints: { minItems: 1, maxItems: 6 },
            control: { options: exports.TRACKS },
            ui: { label: "Tracks", order: 2 },
        },
    },
    bandColor: {
        type: "string",
        required: false,
        description: "Accent fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2e86c1" },
            ui: { label: "Band color", order: 3 },
        },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Backdrop as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Page color", order: 4 },
        },
    },
});
exports.StaticOptionsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "20 · Static Options",
    version: 1,
    description: "The static option list: declare rows of value/label/description and a string prop becomes segmented pills or a dropdown, a string[] becomes toggle pills. The lesson is the distinction — options is PRESENTATION, constraints.oneOf is VALIDATION, and they are independent: preset declares both (a true closed set), tracks declares options only (pills as convenience, values open — the same posture connection-backed props need). Choose per prop, on purpose.",
    capabilities: { tier: "core" },
    tags: ["controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Preset renders as three pills (options + oneOf); Tracks as toggle pills (options only). Try typing an off-list track into the saved file — it renders; an off-list preset is refused.",
    },
    propsSchema,
    defaultProps: {
        preset: "standard",
        tracks: ["video", "audio", "captions"],
        bandColor: "#2e86c1",
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b, _c, _d, _e;
        for (const [key, value] of [
            ["bandColor", props.bandColor],
            ["pageColor", props.pageColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const preset = (_a = props.preset) !== null && _a !== void 0 ? _a : "standard";
        if (!exports.PRESETS.some((p) => p.value === preset)) {
            // oneOf's fence, enforced here too so CLI renders fail identically.
            throw new Error(`${ID}: preset ${JSON.stringify(preset)} must be one of ${exports.PRESETS.map((p) => p.value).join(", ")}.`);
        }
        const tracks = (_b = props.tracks) !== null && _b !== void 0 ? _b : ["video", "audio", "captions"];
        if (!Array.isArray(tracks) || tracks.length < 1 || tracks.length > 6) {
            throw new Error(`${ID}: tracks must hold 1-6 entries.`);
        }
        for (const t of tracks) {
            if (typeof t !== "string" || !SLUG.test(t)) {
                throw new Error(`${ID}: tracks entry ${JSON.stringify(t)} must be a lowercase slug.`);
            }
        }
        const { width, height } = ctx.target;
        const bandHex = (_c = props.bandColor) !== null && _c !== void 0 ? _c : "#2e86c1";
        const band = bandHex;
        const page = ((_d = props.pageColor) !== null && _d !== void 0 ? _d : "#1c2833");
        // The export card: preset pills (picked = accent), then a toggle-pill
        // row where ON tracks are lit and known-but-off tracks are dimmed.
        // Off-list picked tracks still render — that is the tracks lesson.
        const pillRow = (n) => {
            const w = Math.floor(72 / n) - 2;
            const weights = [14, ...Array.from({ length: n }, () => [w, 2]).flat()];
            const claimants = ["1", ...Array.from({ length: n }, () => ["1{1}", "-"]).flat()];
            const rem = 100 - weights.reduce((a, b) => a + b, 0);
            if (rem > 0) {
                weights.push(rem);
                claimants.push("-");
            }
            return String((0, dsl_stdlib_1.weightedSplit)(weights, "col", { mode: "literal", claimants }));
        };
        const shownTracks = [
            ...exports.TRACKS.map((t) => t.value),
            ...tracks.filter((t) => !exports.TRACKS.some((k) => k.value === t)),
        ];
        // The bottom ~40% stays clear of rows — the caption strip owns the
        // bottom sixth and needs air above it.
        const rows = String((0, dsl_stdlib_1.weightedSplit)([6, 10, 5, 15, 7, 15, 42], "row", {
            mode: "literal",
            claimants: ["-", pillRow(1), "-", pillRow(exports.PRESETS.length), "-", pillRow(shownTracks.length), "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const sources = [];
        // Header "row" reuses pillRow(1): label plate + one wide pill.
        sources.push((0, template_utils_1.svgLabel)("EXPORT", width * 0.12, height * 0.1, {
            color: "#7f8c9b",
            maxPx: Math.round(height * 0.026),
            vAlign: "middle",
        }));
        sources.push((0, template_utils_1.makeColorTile)(shade(bandHex)));
        sources.push((0, template_utils_1.svgLabel)(`${titleCase(preset)} - ${tracks.length} track${tracks.length === 1 ? "" : "s"}`, width * 0.6, height * 0.1, {
            color: "#eaeef2",
            maxPx: Math.round(height * 0.032),
            vAlign: "middle",
        }));
        // Preset pills.
        sources.push((0, template_utils_1.svgLabel)("PRESET", width * 0.12, height * 0.14, {
            color: "#7f8c9b",
            maxPx: Math.round(height * 0.022),
            vAlign: "middle",
        }));
        for (const p of exports.PRESETS) {
            const picked = p.value === preset;
            sources.push((0, template_utils_1.makeColorTile)(picked ? band : shade(bandHex)));
            sources.push((0, template_utils_1.svgLabel)(`${p.label}${picked ? " [picked]" : ""}`, width * 0.2, height * 0.14, {
                color: (picked ? "#eaeef2" : "#b9c4cf"),
                maxPx: Math.round(height * 0.024),
                maxLines: 2,
                vAlign: "middle",
            }));
        }
        // Track toggle pills (known set + any off-list picks).
        sources.push((0, template_utils_1.svgLabel)("TRACKS", width * 0.12, height * 0.14, {
            color: "#7f8c9b",
            maxPx: Math.round(height * 0.022),
            vAlign: "middle",
        }));
        for (const t of shownTracks) {
            const on = tracks.includes(t);
            const known = exports.TRACKS.find((k) => k.value === t);
            sources.push((0, template_utils_1.makeColorTile)(on ? band : shade(bandHex)));
            sources.push((0, template_utils_1.svgLabel)(`${(_e = known === null || known === void 0 ? void 0 : known.label) !== null && _e !== void 0 ? _e : titleCase(t)}${on ? " [on]" : ""}`, width * 0.16, height * 0.14, {
                color: (on ? "#eaeef2" : "#7f8c9b"),
                maxPx: Math.round(height * 0.02),
                maxLines: 2,
                vAlign: "middle",
            }));
        }
        const heading = (0, svg_text_1.fitSvgText)("STATIC OPTIONS - pills for the editor, and only oneOf is a fence", width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.034), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            "preset: options + oneOf - a true closed set, refused outside it (in the app AND this render)",
            "tracks: options only - the pills are presentation; any slug renders, so upstream-owned sets stay open",
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
        title: "Static Options",
        lines: [
            "control.options rows (value/label/description) turn a string prop into pills or a dropdown and a string[] into toggle pills - no more text boxes.",
            "options is PRESENTATION; constraints.oneOf is VALIDATION. Declare both for a true closed set, options alone to keep values open.",
            "The open posture matters: connection-backed props can't enumerate upstream values at publish time, so they fence shape, not membership.",
        ],
        explore: [
            "Flip Preset pills; toggle Tracks on and off",
            "Hand-edit the file: off-list track renders, off-list preset refused",
        ],
    }),
});
exports.default = exports.StaticOptionsV1;
