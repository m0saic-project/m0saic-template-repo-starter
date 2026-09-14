import type { StarterRegistryEntry } from "../registry-types";

/**
 * Chapter registry: `media` — array order is the teaching order.
 * The arc: one file through the pipeline → a folder of them → reading
 * the probe → windowing time → asking about the pixels → bending time →
 * mixing audio → and the remote-asset trade-off.
 */
export const mediaRegistry: StarterRegistryEntry[] = [
  {
    slug: "image-card",
    templateId: "@m0saic-starter/media/image-card/v1",
    exportName: "ImageCardV1",
    title: "32 · Image Card",
    description:
      "One image through the whole media pipeline: raw path prop, ctx.media probe, slugified asset key, {kind:\"file\"} entry, media source — and the contain-vs-cover decision on a knob.",
    tags: ["media", "image", "lesson"],
  },
  {
    slug: "folder-contact-strip",
    templateId: "@m0saic-starter/media/folder-contact-strip/v1",
    exportName: "FolderContactStripV1",
    title: "33 · Folder Contact Strip",
    description:
      "type:\"media[]\" + the folder picker: an array of probed paths mapped to per-file assets and sources; the strip resplits to the count.",
    tags: ["media", "folder", "lesson"],
  },
  {
    slug: "probe-card",
    templateId: "@m0saic-starter/media/probe-card/v1",
    exportName: "ProbeCardV1",
    title: "34 · Probe Card",
    description:
      "ctx.media is the host's ffprobe registry, keyed by the RAW prop string. Pick any file and the card prints its entry — the facts every layout decision is built on.",
    tags: ["media", "probe", "lesson"],
  },
  {
    slug: "time-range-clip",
    templateId: "@m0saic-starter/media/time-range-clip/v1",
    exportName: "TimeRangeClipV1",
    title: "35 · Time-Range Clip",
    description:
      "The time-range picker pair (clipStartMs/clipEndMs + videoFromProp) renders ONE two-handle scrubber — and the window lands as playback.clipStartMs + clipDurationMs (start + LENGTH).",
    tags: ["media", "playback", "lesson"],
  },
  {
    slug: "time-ranges-medley",
    templateId: "@m0saic-starter/media/time-ranges-medley/v1",
    exportName: "TimeRangesMedleyV1",
    title: "36 · Time-Ranges Medley",
    description:
      "The MULTI-range control: one json prop (Array<{startMs,endMs,label?}>) with picker:\"time-ranges\" — the studio writes the whole array through it, and every window renders as its own medley column off the same assetId.",
    tags: ["media", "playback", "lesson"],
  },
  {
    slug: "luma-badge",
    templateId: "@m0saic-starter/media/luma-badge/v1",
    exportName: "LumaBadgeV1",
    title: "37 · Luma Badge",
    description:
      "ctx.analysis.regionLuminance picks the badge's contrast from the pixels under it — and the OPTIONAL-analysis law: degrade to a STATED default, never a silent one.",
    tags: ["media", "analysis", "lesson"],
  },
  {
    slug: "play-speed",
    templateId: "@m0saic-starter/media/play-speed/v1",
    exportName: "PlaySpeedV1",
    title: "38 · Play Speed",
    description:
      "playback.playSpeed: source time vs output time, with the caption doing the arithmetic — a 2s source at 4x lasts 500ms of output and loop fills the rest.",
    tags: ["media", "playback", "lesson"],
  },
  {
    slug: "audio-mix",
    templateId: "@m0saic-starter/media/audio-mix/v1",
    exportName: "AudioMixV1",
    title: "39 · Audio Mix",
    description:
      "Audio sources contribute no pixels — per-source audio.volume sets the blend, and the mute idiom (audio.enabled=false, source KEPT) keeps the document's shape stable.",
    tags: ["media", "audio", "lesson"],
  },
  {
    slug: "url-asset",
    templateId: "@m0saic-starter/media/url-asset/v1",
    exportName: "UrlAssetV1",
    title: "40 · URL Asset",
    description:
      "The {kind:\"url\"} manifest entry: host-fetched remote media with the costs stated on canvas — offline fails, bytes drift, no probe before fetch. Prefer files for reproducibility.",
    tags: ["media", "url", "lesson"],
  },
];
