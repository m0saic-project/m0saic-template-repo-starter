import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { ImageCardV1 } from "./image-card/v1/image-card";
import { FolderContactStripV1 } from "./folder-contact-strip/v1/folder-contact-strip";
import { ProbeCardV1 } from "./probe-card/v1/probe-card";
import { TimeRangeClipV1 } from "./time-range-clip/v1/time-range-clip";
import { TimeRangesMedleyV1 } from "./time-ranges-medley/v1/time-ranges-medley";
import { LumaBadgeV1 } from "./luma-badge/v1/luma-badge";
import { PlaySpeedV1 } from "./play-speed/v1/play-speed";
import { AudioMixV1 } from "./audio-mix/v1/audio-mix";
import { UrlAssetV1 } from "./url-asset/v1/url-asset";

/** Chapter `media`, in teaching order (mirrors ./registry.ts). */
export const mediaTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  ImageCardV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  FolderContactStripV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  ProbeCardV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  TimeRangeClipV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  TimeRangesMedleyV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  LumaBadgeV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  PlaySpeedV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  AudioMixV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  UrlAssetV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./image-card/v1/image-card";
export * from "./folder-contact-strip/v1/folder-contact-strip";
export * from "./probe-card/v1/probe-card";
export * from "./time-range-clip/v1/time-range-clip";
export * from "./time-ranges-medley/v1/time-ranges-medley";
export * from "./luma-badge/v1/luma-badge";
export * from "./play-speed/v1/play-speed";
export * from "./audio-mix/v1/audio-mix";
export * from "./url-asset/v1/url-asset";
