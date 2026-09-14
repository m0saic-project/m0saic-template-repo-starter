"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioMixV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/media/audio-mix/v1";
const HEX_TRACK = ["#EF7525", "#2e86c1"];
/**
 * The ceiling this lesson offers, and it is not arbitrary: it is where the
 * engine itself stops being quiet. `audio.volume` is a GAIN factor lowered
 * onto ffmpeg's `volume=` filter, which amplifies freely — so the engine
 * REJECTS only what it cannot render (negative, non-finite) and WARNS once a
 * gain is loud enough to clip. That warn threshold is 4, so 4 is the top of
 * the meter: every gain reachable here renders without a diagnostic, and the
 * first value past it is the first one the engine complains about.
 */
const MAX_GAIN = 4;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    narration: {
        type: "media",
        required: false,
        description: "Narration track.",
        meta: { control: { picker: "file", accept: ["audio"] }, ui: { label: "Narration" } },
    },
    music: {
        type: "media",
        required: false,
        description: "Music bed.",
        meta: { control: { picker: "file", accept: ["audio"] }, ui: { label: "Music" } },
    },
    narrationVolume: {
        type: "number",
        required: false,
        description: "Narration gain: 1 = as recorded, 0.5 = half, 2 = double, 4 = the top of the meter. volume is a GAIN FACTOR, not a percentage — past 4 the engine warns that it will clip.",
        meta: { constraints: { min: 0, max: MAX_GAIN }, control: { step: 0.1 }, ui: { label: "Narration vol" } },
    },
    musicVolume: {
        type: "number",
        required: false,
        description: "Music gain: 1 = as recorded, 0.5 = half, 2 = double, 4 = the top of the meter. volume is a GAIN FACTOR, not a percentage — past 4 the engine warns that it will clip.",
        meta: { constraints: { min: 0, max: MAX_GAIN }, control: { step: 0.1 }, ui: { label: "Music vol" } },
    },
    muteMusic: {
        type: "boolean",
        required: false,
        description: "Mute the music — the source STAYS, audio.enabled goes false.",
        meta: { ui: { label: "Mute music" } },
    },
});
exports.AudioMixV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "39 · Audio Mix",
    version: 1,
    description: "Two audio tracks, one mix: audio sources enter like any media but contribute no pixels — per-source audio.volume sets the blend, and the mute idiom keeps a silenced source IN the document (audio.enabled=false) so tile indices never shift. The canvas is the mixer's meter.",
    capabilities: { tier: "core" },
    tags: ["media", "audio", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        note: "Slide the two volumes; toggle Mute music and note the source count never changes.",
    },
    propsSchema,
    defaultProps: {
        narration: "",
        music: "",
        narrationVolume: 1,
        musicVolume: 0.4,
        muteMusic: false,
    },
    async render(props, ctx) {
        var _a, _b, _c, _d, _e;
        const narration = ((_a = props.narration) !== null && _a !== void 0 ? _a : "").trim();
        const music = ((_b = props.music) !== null && _b !== void 0 ? _b : "").trim();
        const narrationVolume = (_c = props.narrationVolume) !== null && _c !== void 0 ? _c : 1;
        const musicVolume = (_d = props.musicVolume) !== null && _d !== void 0 ? _d : 0.4;
        const muteMusic = (_e = props.muteMusic) !== null && _e !== void 0 ? _e : false;
        const { width, height } = ctx.target;
        for (const [name, v] of [
            ["narrationVolume", narrationVolume],
            ["musicVolume", musicVolume],
        ]) {
            // volume is a GAIN factor (ffmpeg's `volume=`): 1 leaves the track as
            // recorded, 2 doubles it. The template's ceiling tracks the ENGINE's:
            // negatives and non-finites are unrenderable, and MAX_GAIN is where
            // the engine starts warning about clipping.
            if (!Number.isFinite(v) || v < 0 || v > MAX_GAIN) {
                throw new Error(`${ID}: ${name} is a gain factor and must be 0-${MAX_GAIN} here (1 = as recorded), got ${JSON.stringify(v)}.`);
            }
        }
        if (typeof muteMusic !== "boolean") {
            throw new Error(`${ID}: muteMusic must be a boolean.`);
        }
        const assets = {};
        const track = (raw, volume, enabled) => {
            const meta = ctx.media[(0, types_1.asAssetId)(raw)];
            if (!meta) {
                throw new Error(`${ID}: "${raw}" has no ctx.media probe - check the path.`);
            }
            const key = String((0, template_utils_1.slugifyAssetKeyFromPath)(raw));
            assets[key] = { kind: "file", path: raw, mediaType: "audio" };
            return {
                type: "media",
                mediaType: "audio",
                assetId: key,
                // The mute idiom: enabled=false, source STAYS.
                audio: { enabled, volume },
            };
        };
        const narrationTrack = narration.length > 0 ? track(narration, narrationVolume, true) : null;
        const musicTrack = music.length > 0 ? track(music, musicVolume, !muteMusic) : null;
        // Two meter rows (narration, music) + a caption. THE CONTRACT: sources
        // bind to m0 frames 1:1, and an audio source paints nothing but still
        // holds a frame — so where you PUT that frame is a design choice.
        //
        // Here each track rides its OWN row as an overlay (`<meter>{1}`), so
        // the audio shares the rect of the meter it belongs to: select that
        // row and you get the track, and the editor's audio badge lands on
        // the right bar. (The common alternative is parking every track in a
        // trailing full-canvas leaf — see the tutorial for when to prefer it.)
        //
        // The bar is measured ONCE, in units of the meter, and everything else
        // reads that number. A gain small enough to round to zero units paints
        // no bar, and the sources list has to agree — `volume > 0` would have
        // pushed a colour tile the m0 never gave a frame to, and sources bind
        // to frames 1:1.
        const meterUnits = (v) => Math.round((Math.min(v, MAX_GAIN) / MAX_GAIN) * 100);
        const meter = (units) => {
            if (units <= 0)
                return "-";
            if (units >= 100)
                return "1";
            return String((0, dsl_stdlib_1.weightedSplit)([units, 100 - units], "col", { claimants: ["1", "-"] }));
        };
        const musicShown = muteMusic ? 0 : musicVolume;
        const narrationUnits = meterUnits(narrationVolume);
        const musicUnits = meterUnits(musicShown);
        const withTrack = (bar, hasTrack) => hasTrack ? `${bar}{1}` : bar;
        const m0 = (0, dsl_stdlib_1.toM0String)(String((0, dsl_stdlib_1.weightedSplit)([2, 2, 1], "row", {
            claimants: [
                withTrack(meter(narrationUnits), narrationTrack !== null),
                withTrack(meter(musicUnits), musicTrack !== null),
                "1",
            ],
        })), ID);
        const caption = `narration vol ${narrationVolume}${narration ? "" : " (no file)"} - ` +
            `music vol ${musicVolume}${muteMusic ? " MUTED (source kept, audio.enabled=false)" : ""}${music ? "" : " (no file)"}`;
        // Walk order per row: the bar's own frames, THEN its overlay (the
        // track). A muted-to-zero bar contributes no frame; its track still
        // does.
        const sources = [
            ...(narrationUnits > 0 ? [(0, template_utils_1.makeColorTile)(HEX_TRACK[0])] : []),
            ...(narrationTrack ? [narrationTrack] : []),
            ...(musicUnits > 0 ? [(0, template_utils_1.makeColorTile)(HEX_TRACK[1])] : []),
            ...(musicTrack ? [musicTrack] : []),
            (0, svg_text_1.svgLabel)(caption, width, Math.round(height / 5), {
                maxPx: Math.round(height * 0.024),
                maxLines: 2,
                color: "#7f8c9b",
            }),
        ];
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: assets,
            backgroundColor: "#0b0e11",
            sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Audio Mix",
        lines: [
            "An audio file enters like any media but contributes NO pixels: the engine mixes it into the output track.",
            "Sources still bind to frames 1:1, so a track has to HOLD a frame - here each rides its own meter row.",
            "THE MUTE IDIOM: keep the source and set audio.enabled=false. Dropping it would shift every later tile's index.",
            "volume is a GAIN FACTOR, not a percentage: 1 as recorded, 2 double, and past 4 the engine warns.",
        ],
        explore: [
            "Slide both volumes - the meters resplit (full bar = gain 4)",
            "Toggle Mute music: the meter empties, the source stays",
            "Eye menu > Show audio overlays, then click a badge",
            "Pick audio files for both tracks and render",
        ],
    }),
});
exports.default = exports.AudioMixV1;
