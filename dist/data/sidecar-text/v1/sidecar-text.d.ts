/**
 * `@m0saic-starter/data/sidecar-text/v1` — a sidecar that isn't JSON.
 *
 * ONE CONCEPT: a sidecar value of the form `{ kind: "text", ext, content }`
 * writes `{output-basename}.{key}.{ext}` verbatim — the content string,
 * byte for byte, with no JSON wrapper. That is what makes real formats
 * possible: `.srt`, `.vtt`, `.md`, `.csv`.
 *
 * WHY IT MATTERS. Captions are the case that proves it. A burned-in subtitle
 * is pixels: unsearchable, untranslatable, and stuck at one size forever. The
 * SAME cue list emitted as a `.vtt` beside the video is a real caption track
 * a player can style, a search engine can index, and a translator can edit.
 * Burn when you must; ship the text file always.
 *
 * `ext` IS THE WHOLE FORMAT DECISION. Nothing validates that the content
 * matches the extension — writing malformed WebVTT under `ext: "vtt"` gets
 * you a malformed file, not an error. Serialise carefully; a test that
 * asserts the first line of the output is cheap insurance.
 *
 * SAME RULES AS JSON SIDECARS: declared in `sidecarsSchema`, attached to the
 * document, suppressed in design mode. `data/sidecar-json` covers those.
 */
export type SidecarTextProps = {
    /** One caption line per row, `startMs|endMs|text`. */
    cues?: string[];
    /** Caption format to emit. */
    format?: "vtt" | "srt";
};
type Cue = {
    startMs: number;
    endMs: number;
    text: string;
};
/** Serialise cues to WebVTT or SubRip. The `\n` endings are deliberate:
 *  both formats are line-based and CRLF is a portability trap. */
export declare function serializeCues(cues: readonly Cue[], format: "vtt" | "srt"): string;
export declare const SidecarTextV1: import("@m0saic/types").MosaicTemplate<SidecarTextProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default SidecarTextV1;
