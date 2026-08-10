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
exports.geometryTemplates = void 0;
const gcd_collapse_1 = require("./gcd-collapse/v1/gcd-collapse");
const ratio_vs_absolute_1 = require("./ratio-vs-absolute/v1/ratio-vs-absolute");
const overlay_stack_1 = require("./overlay-stack/v1/overlay-stack");
const lattice_gutters_1 = require("./lattice-gutters/v1/lattice-gutters");
const inset_recovery_1 = require("./inset-recovery/v1/inset-recovery");
const place_rect_dock_1 = require("./place-rect-dock/v1/place-rect-dock");
const mask_in_a_cell_1 = require("./mask-in-a-cell/v1/mask-in-a-cell");
const quantization_cures_1 = require("./quantization-cures/v1/quantization-cures");
/** Chapter `geometry`, in teaching order (mirrors ./registry.ts). */
exports.geometryTemplates = [
    gcd_collapse_1.GcdCollapseV1,
    ratio_vs_absolute_1.RatioVsAbsoluteV1,
    overlay_stack_1.OverlayStackV1,
    lattice_gutters_1.LatticeGuttersV1,
    inset_recovery_1.InsetRecoveryV1,
    place_rect_dock_1.PlaceRectDockV1,
    mask_in_a_cell_1.MaskInACellV1,
    quantization_cures_1.QuantizationCuresV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./gcd-collapse/v1/gcd-collapse"), exports);
__exportStar(require("./ratio-vs-absolute/v1/ratio-vs-absolute"), exports);
__exportStar(require("./overlay-stack/v1/overlay-stack"), exports);
__exportStar(require("./lattice-gutters/v1/lattice-gutters"), exports);
__exportStar(require("./inset-recovery/v1/inset-recovery"), exports);
__exportStar(require("./place-rect-dock/v1/place-rect-dock"), exports);
__exportStar(require("./mask-in-a-cell/v1/mask-in-a-cell"), exports);
__exportStar(require("./quantization-cures/v1/quantization-cures"), exports);
