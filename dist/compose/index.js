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
exports.composeTemplates = void 0;
const child_mosaic_1 = require("./child-mosaic/v1/child-mosaic");
const rotate_headroom_1 = require("./rotate-headroom/v1/rotate-headroom");
const nested_template_1 = require("./nested-template/v1/nested-template");
const nested_badge_1 = require("./nested-badge/v1/nested-badge");
const camera_follow_1 = require("./camera-follow/v1/camera-follow");
const theme_provider_1 = require("./theme-provider/v1/theme-provider");
const theme_tokens_1 = require("./theme-tokens/v1/theme-tokens");
const reduce_to_one_1 = require("./reduce-to-one/v1/reduce-to-one");
/**
 * Chapter `compose`, in teaching order (mirrors ./registry.ts).
 *
 * `NestedBadgeV1` ships here for a reason worth knowing: it is `internal`
 * (not a top-level pick), but the host registers whatever this array holds,
 * and `renderNestedTemplate` resolves children BY ID against that registry.
 * Leave it out and compose/nested-template throws.
 */
exports.composeTemplates = [
    child_mosaic_1.ChildMosaicV1,
    rotate_headroom_1.RotateHeadroomV1,
    nested_template_1.NestedTemplateV1,
    nested_badge_1.NestedBadgeV1,
    camera_follow_1.CameraFollowV1,
    theme_provider_1.ThemeProviderV1,
    theme_tokens_1.ThemeTokensV1,
    reduce_to_one_1.ReduceToOneV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./child-mosaic/v1/child-mosaic"), exports);
__exportStar(require("./rotate-headroom/v1/rotate-headroom"), exports);
__exportStar(require("./nested-template/v1/nested-template"), exports);
__exportStar(require("./nested-badge/v1/nested-badge"), exports);
__exportStar(require("./camera-follow/v1/camera-follow"), exports);
__exportStar(require("./theme-provider/v1/theme-provider"), exports);
__exportStar(require("./theme-tokens/v1/theme-tokens"), exports);
__exportStar(require("./reduce-to-one/v1/reduce-to-one"), exports);
