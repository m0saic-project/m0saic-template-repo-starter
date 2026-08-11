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
exports.propsTemplates = void 0;
const typed_props_tour_1 = require("./typed-props-tour/v1/typed-props-tour");
const seeded_shuffle_1 = require("./seeded-shuffle/v1/seeded-shuffle");
const color_props_1 = require("./color-props/v1/color-props");
const json_data_prop_1 = require("./json-data-prop/v1/json-data-prop");
const control_gallery_1 = require("./control-gallery/v1/control-gallery");
const error_mosaic_1 = require("./error-mosaic/v1/error-mosaic");
/** Chapter `props`, in teaching order (mirrors ./registry.ts). */
exports.propsTemplates = [
    typed_props_tour_1.TypedPropsTourV1,
    seeded_shuffle_1.SeededShuffleV1,
    color_props_1.ColorPropsV1,
    json_data_prop_1.JsonDataPropV1,
    control_gallery_1.ControlGalleryV1,
    error_mosaic_1.ErrorMosaicV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./typed-props-tour/v1/typed-props-tour"), exports);
__exportStar(require("./seeded-shuffle/v1/seeded-shuffle"), exports);
__exportStar(require("./color-props/v1/color-props"), exports);
__exportStar(require("./json-data-prop/v1/json-data-prop"), exports);
__exportStar(require("./control-gallery/v1/control-gallery"), exports);
__exportStar(require("./error-mosaic/v1/error-mosaic"), exports);
