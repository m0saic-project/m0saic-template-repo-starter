/**
 * `@m0saic-starter/media/audio-mix/v1` — two audio tracks, one mix.
 *
 * ONE CONCEPT: audio sources + `audio: { enabled, volume }`. An audio
 * file enters like any media (path prop → probe → asset → source) but
 * contributes NO pixels — the engine skips it in the video composite and
 * mixes it into the output track. Each source carries its own volume,
 * and THE MUTE IDIOM: to silence a track conditionally, keep the source
 * and set `audio.enabled: false` — never drop the source, so the
 * document's shape (and everyone's tile indices) stay stable across the
 * toggle.
 *
 * The canvas shows the mixer state: one meter bar per track.
 */
export type AudioMixProps = {
    /** Narration track (audio file). */
    narration?: string;
    /** Music bed (audio file). */
    music?: string;
    /** Narration gain (0-4; 1 = as recorded). */
    narrationVolume?: number;
    /** Music gain (0-4; 1 = as recorded). */
    musicVolume?: number;
    /** Mute the music (keeps the source; audio.enabled=false). */
    muteMusic?: boolean;
};
export declare const AudioMixV1: import("@m0saic/types").MosaicTemplate<AudioMixProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default AudioMixV1;
