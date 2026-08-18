"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeRangesMedleyV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/media/time-ranges-medley/v1";
const MAX_RANGES = 6;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    video: {
        type: "media",
        required: false,
        description: "The video to pull windows from.",
        meta: { control: { picker: "file", accept: ["video"] }, ui: { label: "Video" } },
    },
    ranges: {
        type: "json",
        required: false,
        description: "Windows within the source, milliseconds: an array of { startMs, endMs, label? }. Each renders as its own medley column (1-6).",
        meta: {
            constraints: {
                jsonSchema: {
                    type: "array",
                    minItems: 1,
                    maxItems: MAX_RANGES,
                    items: {
                        type: "object",
                        required: ["startMs", "endMs"],
                        properties: {
                            startMs: { type: "integer", minimum: 0 },
                            endMs: { type: "integer", minimum: 1 },
                            label: { type: "string" },
                        },
                    },
                },
            },
            control: { picker: "time-ranges", videoFromProp: "video" },
            ui: { label: "Ranges" },
        },
    },
});
exports.TimeRangesMedleyV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "27 · Time-Ranges Medley",
    version: 1,
    description: "The MULTI-range control: one type:\"json\" prop (Array<{startMs,endMs,label?}>) with picker:\"time-ranges\" — the editor's multi-range studio writes the whole array through it. Every window renders as its own medley column via clipStartMs + clipDurationMs, mapped over the array.",
    capabilities: { tier: "core" },
    tags: ["media", "playback", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Mark several ranges in the studio — the medley resplits, one column per window.",
    },
    propsSchema,
    defaultProps: { video: "", ranges: [{ startMs: 0, endMs: 1000 }] },
    async render(props, ctx) {
        var _a, _b;
        const raw = ((_a = props.video) !== null && _a !== void 0 ? _a : "").trim();
        const ranges = (_b = props.ranges) !== null && _b !== void 0 ? _b : [{ startMs: 0, endMs: 1000 }];
        const { width, height } = ctx.target;
        if (raw.length === 0) {
            return {
                kind: "mosaic_document",
                version: 1,
                m0: (0, dsl_stdlib_1.toM0String)("1", ID),
                assets: {},
                backgroundColor: "#0b0e11",
                sources: [
                    (0, svg_text_1.svgLabel)("Pick a video (Video), then mark several ranges - one medley column each", width, height, {
                        maxPx: Math.round(height * 0.04),
                        maxLines: 2,
                        color: "#7f8c9b",
                    }),
                ],
            };
        }
        const meta = ctx.media[(0, types_1.asAssetId)(raw)];
        if (!meta || meta.kind !== "video") {
            throw new Error(`${ID}: "${raw}" must be a probed video.`);
        }
        const sourceDurationMs = meta.durationMs;
        // The jsonSchema above is editor documentation; THIS is the gate —
        // collect every problem across the whole array, then throw once.
        const problems = [];
        if (!Array.isArray(ranges) || ranges.length < 1 || ranges.length > MAX_RANGES) {
            problems.push(`ranges must be an array of 1-${MAX_RANGES} windows`);
        }
        else {
            ranges.forEach((r, i) => {
                if (typeof r !== "object" || r === null) {
                    problems.push(`ranges[${i}] must be { startMs, endMs, label? }`);
                    return;
                }
                const { startMs, endMs, label } = r;
                if (!Number.isInteger(startMs) || startMs < 0) {
                    problems.push(`ranges[${i}].startMs must be an integer >= 0`);
                }
                if (!Number.isInteger(endMs) || endMs <= (Number.isInteger(startMs) ? startMs : 0)) {
                    problems.push(`ranges[${i}] needs integer endMs > startMs`);
                }
                if (typeof sourceDurationMs === "number" && Number.isInteger(endMs) && endMs > sourceDurationMs) {
                    problems.push(`ranges[${i}].endMs ${endMs} is past the source's ${sourceDurationMs}ms`);
                }
                if (label !== undefined && (typeof label !== "string" || label.length > 12)) {
                    problems.push(`ranges[${i}].label must be a string of up to 12 chars`);
                }
            });
        }
        if (problems.length > 0) {
            throw new Error(`${ID}: invalid ranges:\n- ${problems.join("\n- ")}`);
        }
        const key = String((0, template_utils_1.slugifyAssetKeyFromPath)(raw));
        const assets = {
            [key]: { kind: "file", path: raw, mediaType: "video" },
        };
        // One column per window over a caption band — the SAME start+LENGTH
        // conversion as time-range-clip, mapped over the array. Every column
        // references the SAME assetId: one file, many windows.
        // Grammar: 1-count splits are illegal — a single window IS the band.
        const strip = ranges.length === 1
            ? "1"
            : `${ranges.length}(${new Array(ranges.length).fill("1").join(",")})`;
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([5, 1], "row", { claimants: [strip, "1"] })), ID);
        const columns = ranges.map((r) => ({
            type: "media",
            mediaType: "video",
            assetId: key,
            placement: { fit: "cover" },
            playback: {
                clipStartMs: r.startMs,
                clipDurationMs: r.endMs - r.startMs,
                loopMode: "loop",
            },
        }));
        const caption = `picker:"time-ranges" - ${ranges.length} window(s) through ONE json prop: ` +
            ranges
                .map((r) => { var _a; return `${(_a = r.label) !== null && _a !== void 0 ? _a : `${r.startMs}-${r.endMs}`}(${r.endMs - r.startMs}ms)`; })
                .join(" ");
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets,
            backgroundColor: "#0b0e11",
            sources: [
                ...columns,
                (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 6), {
                    maxPx: Math.round(height * 0.022),
                    maxLines: 2,
                    color: "#7f8c9b",
                }),
            ],
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Time-Ranges Medley",
        lines: [
            "m0saic has TWO time controls: a pair of StartMs/EndMs numbers for ONE window, and a json prop for MANY.",
            "picker:\"time-ranges\" reads and writes the whole Array<{startMs, endMs, label?}> through that single prop.",
            "Each window becomes a media source with clipStartMs + clipDurationMs, all referencing the SAME assetId.",
        ],
        explore: [
            "Mark a second and third range - the medley resplits",
            "Drag any range's handles - only its column changes",
            "Give a range a label and find it on the caption",
            "Compare the sidebar with time-range-clip's",
        ],
    }),
});
exports.default = exports.TimeRangesMedleyV1;
