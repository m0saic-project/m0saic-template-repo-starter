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
exports.masksTemplates = void 0;
const shape_masks_1 = require("./shape-masks/v1/shape-masks");
const path_mask_1 = require("./path-mask/v1/path-mask");
/** Chapter `masks`, in teaching order (mirrors ./registry.ts). */
exports.masksTemplates = [
    shape_masks_1.ShapeMasksV1,
    path_mask_1.PathMaskV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./shape-masks/v1/shape-masks"), exports);
__exportStar(require("./path-mask/v1/path-mask"), exports);
