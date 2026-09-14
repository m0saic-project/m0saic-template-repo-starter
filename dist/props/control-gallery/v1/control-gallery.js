"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlGalleryV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/props/control-gallery/v1";
const SEASONS = ["spring", "summer", "autumn", "winter"];
const propsSchema = (0, template_utils_1.definePropsSchema)({
    nickname: {
        type: "string",
        required: false,
        description: "Ghost-text demo: the placeholder shows until you type.",
        meta: { control: { placeholder: "type a nickname..." }, ui: { label: "Nickname" } },
    },
    homepage: {
        type: "string",
        required: false,
        description: "flavor:\"url\" demo — semantic hint, still a plain string on the wire.",
        meta: { control: { flavor: "url", placeholder: "https://example.com" }, ui: { label: "Homepage" } },
    },
    strength: {
        type: "number",
        required: false,
        description: "Bounded + stepped number demo (0-100, step 5).",
        meta: { constraints: { min: 0, max: 100 }, control: { step: 5 }, ui: { label: "Strength" } },
    },
    season: {
        type: "string",
        required: false,
        description: "Enum select demo.",
        meta: { constraints: { oneOf: [...SEASONS] }, ui: { label: "Season" } },
    },
});
exports.ControlGalleryV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "18 · Control Gallery",
    version: 1,
    description: "The meta surface, one knob per affordance: placeholder ghost text, flavor:\"url\", bounded+stepped numbers, an enum select, and ui.label. The real demo is the sidebar; the canvas renders the spec sheet.",
    capabilities: { tier: "core" },
    tags: ["props", "controls", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Look RIGHT: every row of the form is one meta affordance. The canvas is just the spec sheet.",
    },
    propsSchema,
    defaultProps: { nickname: "", homepage: "", strength: 50, season: "summer" },
    async render(props, ctx) {
        var _a, _b, _c, _d;
        const nickname = (_a = props.nickname) !== null && _a !== void 0 ? _a : "";
        const homepage = (_b = props.homepage) !== null && _b !== void 0 ? _b : "";
        const strength = (_c = props.strength) !== null && _c !== void 0 ? _c : 50;
        const season = (_d = props.season) !== null && _d !== void 0 ? _d : "summer";
        if (nickname.length > 24 || !/^[\x20-\x7E]*$/.test(nickname)) {
            throw new Error(`${ID}: nickname must be ASCII, up to 24 chars.`);
        }
        if (homepage !== "" && !/^https?:\/\/[\x21-\x7E]+$/.test(homepage)) {
            throw new Error(`${ID}: homepage must be empty or an http(s) URL (flavor:"url" is an editor hint, not validation - render() is still the gate).`);
        }
        if (!Number.isFinite(strength) || strength < 0 || strength > 100) {
            throw new Error(`${ID}: strength must be a number 0-100.`);
        }
        if (!SEASONS.includes(season)) {
            throw new Error(`${ID}: season must be one of ${SEASONS.join(" | ")}.`);
        }
        const { width, height } = ctx.target;
        // The spec sheet: one row per prop + a strength meter row.
        const lines = [
            `nickname   control.placeholder   ${nickname === "" ? "(empty - ghost text shows)" : `"${nickname}"`}`,
            `homepage   flavor:"url"          ${homepage === "" ? "(empty)" : homepage}`,
            `strength   min 0 max 100 step 5  ${strength}`,
            `season     constraints.oneOf     "${season}"`,
        ];
        const meter = strength === 0
            ? "-"
            : strength === 100
                ? "1"
                : String((0, dsl_stdlib_1.weightedSplit)([Math.round(strength), 100 - Math.round(strength)], "col", {
                    claimants: ["1", "-"],
                }));
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([4, 1], "row", { claimants: ["1", meter] })), ID);
        // The sheet keeps ONE ROW PER PROP — fitSvgLines preserves line breaks
        // (svgLabel would re-wrap the columns into a paragraph).
        const sheet = (0, svg_text_1.fitSvgLines)(lines, Math.round(width * 0.9), Math.round((height * 4) / 5), {
            maxPx: Math.round(height * 0.034),
            widthFrac: 0.7,
        });
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: "#0b0e11",
            sources: [
                (0, svg_text_1.svgTextSource)([
                    { text: sheet.text, fontSize: sheet.fontSize, color: "#c8d2dc" },
                ]),
                ...(strength > 0 ? [(0, template_utils_1.makeColorTile)("#EF7525")] : []),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Control Gallery",
        lines: [
            "The prop TYPE picks the widget; meta refines it - placeholder, flavor, min/max with step, oneOf, ui.label.",
            "The real demo is the SIDEBAR; the canvas just prints the spec sheet.",
            "flavor is an editor hint, not validation - render() still gates the value itself.",
        ],
        explore: [
            "Match each sidebar field to its spec-sheet row",
            "Step Strength with the arrows - it moves by 5",
            "Type a non-URL into Homepage and read the remedy",
        ],
    }),
});
exports.default = exports.ControlGalleryV1;
