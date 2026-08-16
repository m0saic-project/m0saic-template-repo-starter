"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidecarTextV1 = void 0;
exports.serializeCues = serializeCues;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/data/sidecar-text/v1";
const FORMATS = ["vtt", "srt"];
const PANEL = "#17202a";
const ACCENT = "#EF7525";
const INK = "#ecf0f1";
const INK_DIM = "#7f8c9b";
const DEFAULT_CUES = [
    "0|1200|A sidecar carries the words",
    "1200|2400|the pixels only show",
];
/** `startMs|endMs|text` → a cue. Returns null for a row that can't parse. */
function parseCue(row) {
    const parts = row.split("|");
    if (parts.length < 3)
        return null;
    const startMs = Number(parts[0]);
    const endMs = Number(parts[1]);
    const text = parts.slice(2).join("|").trim();
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs))
        return null;
    if (endMs <= startMs || startMs < 0 || text.length === 0)
        return null;
    return { startMs, endMs, text };
}
/** `hh:mm:ss` + a fractional separator that differs between the two formats. */
function stamp(ms, sep) {
    const total = Math.max(0, Math.round(ms));
    const h = String(Math.floor(total / 3600000)).padStart(2, "0");
    const m = String(Math.floor((total % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((total % 60000) / 1000)).padStart(2, "0");
    const frac = String(total % 1000).padStart(3, "0");
    return `${h}:${m}:${s}${sep}${frac}`;
}
/** Serialise cues to WebVTT or SubRip. The `\n` endings are deliberate:
 *  both formats are line-based and CRLF is a portability trap. */
function serializeCues(cues, format) {
    const sep = format === "vtt" ? "." : ",";
    const blocks = cues.map((cue, i) => {
        const timing = `${stamp(cue.startMs, sep)} --> ${stamp(cue.endMs, sep)}`;
        // SubRip numbers its cues from 1; WebVTT does not need to.
        return format === "srt"
            ? `${i + 1}\n${timing}\n${cue.text}`
            : `${timing}\n${cue.text}`;
    });
    return format === "vtt"
        ? `WEBVTT\n\n${blocks.join("\n\n")}\n`
        : `${blocks.join("\n\n")}\n`;
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    cues: {
        type: "string[]",
        required: false,
        description: "One cue per row as startMs|endMs|text. Rows that cannot parse are named in the error rather than silently dropped.",
        meta: { ui: { label: "Cues" } },
    },
    format: {
        type: "string",
        required: false,
        description: "vtt or srt. It picks the serialiser AND the file extension — nothing checks that the two agree, so they are set together here.",
        meta: { constraints: { oneOf: [...FORMATS] }, ui: { label: "Format" } },
    },
});
exports.SidecarTextV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "54 · Sidecar Text",
    version: 1,
    description: "A sidecar value of { kind: \"text\", ext, content } writes the string verbatim as {output-basename}.{key}.{ext} — the way real formats ship. Captions are the case that proves it: burned-in subtitles are pixels, a .vtt beside the video is a track a player can style and a search engine can read.",
    capabilities: { tier: "core" },
    tags: ["data", "sidecars", "captions", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2400,
        note: "Render to out.mp4 and open out.captions.vtt beside it.",
    },
    propsSchema,
    defaultProps: { cues: DEFAULT_CUES, format: "vtt" },
    sidecarsSchema: {
        captions: {
            type: "object",
            required: false,
            description: "Caption track written verbatim as {output-basename}.captions.vtt (or .srt) next to the deliverable.",
        },
    },
    async render(props, ctx) {
        var _a, _b;
        const rows = (_a = props.cues) !== null && _a !== void 0 ? _a : DEFAULT_CUES;
        const format = (_b = props.format) !== null && _b !== void 0 ? _b : "vtt";
        const problems = [];
        if (!Array.isArray(rows) || rows.length === 0) {
            problems.push("cues must be a non-empty array of startMs|endMs|text rows");
        }
        if (!FORMATS.includes(format)) {
            problems.push(`format must be one of ${FORMATS.join(" | ")}, got ${JSON.stringify(format)}`);
        }
        const cues = [];
        if (Array.isArray(rows)) {
            rows.forEach((row, i) => {
                const cue = parseCue(String(row));
                // Name the row that failed — a caption silently missing from a file
                // nobody opens until publication is the worst possible failure.
                if (cue === null)
                    problems.push(`cues[${i}] is not "startMs|endMs|text" with endMs > startMs: ${JSON.stringify(row)}`);
                else
                    cues.push(cue);
            });
        }
        if (problems.length > 0)
            throw new Error(`${ID}: ${problems.join("; ")}.`);
        const { width, height } = ctx.target;
        const content = serializeCues(cues, format);
        const preview = content.split("\n").slice(0, 4).join("   ");
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([1, 2, 2], "row", { claimants: ["1{1}", "1{1}", "1{1}"] })), ID),
            assets: {},
            backgroundColor: PANEL,
            sources: [
                (0, template_utils_1.makeColorTile)(ACCENT),
                (0, svg_text_1.svgLabel)(`out.captions.${format}`, width, Math.round(height / 5), {
                    maxPx: Math.round(height * 0.06),
                    maxLines: 1,
                    color: PANEL,
                }),
                (0, template_utils_1.makeColorTile)(PANEL),
                (0, svg_text_1.svgLabel)(`${cues.length} cues, ${content.length} bytes`, width, Math.round((height * 2) / 5), {
                    maxPx: Math.round(height * 0.05),
                    maxLines: 1,
                    color: INK,
                }),
                (0, template_utils_1.makeColorTile)(PANEL),
                (0, svg_text_1.svgLabel)(preview, width, Math.round((height * 2) / 5), {
                    maxPx: Math.round(height * 0.03),
                    maxLines: 4,
                    color: INK_DIM,
                }),
            ],
            // The verbatim half: content lands byte for byte under this extension.
            sidecars: { captions: { kind: "text", ext: format, content } },
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Sidecar Text",
        lines: [
            "A sidecar of { kind: \"text\", ext, content } writes the string verbatim as {basename}.{key}.{ext} - no JSON wrapper.",
            "That is how real formats ship: .srt, .vtt, .md, .csv beside the deliverable.",
            "Burned-in subtitles are pixels - unsearchable, untranslatable, one size forever. The same cues as a .vtt are a real track.",
            "Nothing checks content against ext. Malformed WebVTT under ext \"vtt\" is a malformed file, not an error.",
        ],
        explore: [
            "Render to a file and open the .vtt beside it",
            "Switch Format to srt: numbered cues, comma stamps",
            "Give a cue endMs below startMs - the row is named",
        ],
    }),
});
exports.default = exports.SidecarTextV1;
