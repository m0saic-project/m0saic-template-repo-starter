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
exports.controlsTemplates = void 0;
const static_options_1 = require("./static-options/v1/static-options");
const row_editors_1 = require("./row-editors/v1/row-editors");
const number_series_1 = require("./number-series/v1/number-series");
const weights_1 = require("./weights/v1/weights");
/** Chapter `controls`, in teaching order (mirrors ./registry.ts). */
exports.controlsTemplates = [
    static_options_1.StaticOptionsV1,
    row_editors_1.RowEditorsV1,
    number_series_1.NumberSeriesV1,
    weights_1.WeightsV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./static-options/v1/static-options"), exports);
__exportStar(require("./row-editors/v1/row-editors"), exports);
__exportStar(require("./number-series/v1/number-series"), exports);
__exportStar(require("./weights/v1/weights"), exports);
