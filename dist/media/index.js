"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaTemplates = void 0;
const image_card_1 = require("./image-card/v1/image-card");
const folder_contact_strip_1 = require("./folder-contact-strip/v1/folder-contact-strip");
const probe_card_1 = require("./probe-card/v1/probe-card");
const time_range_clip_1 = require("./time-range-clip/v1/time-range-clip");
const time_ranges_medley_1 = require("./time-ranges-medley/v1/time-ranges-medley");
const luma_badge_1 = require("./luma-badge/v1/luma-badge");
const play_speed_1 = require("./play-speed/v1/play-speed");
const audio_mix_1 = require("./audio-mix/v1/audio-mix");
const url_asset_1 = require("./url-asset/v1/url-asset");
/** Chapter `media`, in teaching order (mirrors ./registry.ts). */
exports.mediaTemplates = [
    image_card_1.ImageCardV1,
    folder_contact_strip_1.FolderContactStripV1,
    probe_card_1.ProbeCardV1,
    time_range_clip_1.TimeRangeClipV1,
    time_ranges_medley_1.TimeRangesMedleyV1,
    luma_badge_1.LumaBadgeV1,
    play_speed_1.PlaySpeedV1,
    audio_mix_1.AudioMixV1,
    url_asset_1.UrlAssetV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./image-card/v1/image-card"), exports);
__exportStar(require("./folder-contact-strip/v1/folder-contact-strip"), exports);
__exportStar(require("./probe-card/v1/probe-card"), exports);
__exportStar(require("./time-range-clip/v1/time-range-clip"), exports);
__exportStar(require("./time-ranges-medley/v1/time-ranges-medley"), exports);
__exportStar(require("./luma-badge/v1/luma-badge"), exports);
__exportStar(require("./play-speed/v1/play-speed"), exports);
__exportStar(require("./audio-mix/v1/audio-mix"), exports);
__exportStar(require("./url-asset/v1/url-asset"), exports);
