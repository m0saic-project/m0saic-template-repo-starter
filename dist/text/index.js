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
exports.textTemplates = void 0;
const text_three_ways_1 = require("./text-three-ways/v1/text-three-ways");
const fit_text_1 = require("./fit-text/v1/fit-text");
const count_up_1 = require("./count-up/v1/count-up");
const carved_type_1 = require("./carved-type/v1/carved-type");
/** Chapter `text`, in teaching order (mirrors ./registry.ts). */
exports.textTemplates = [
    text_three_ways_1.TextThreeWaysV1,
    fit_text_1.FitTextV1,
    count_up_1.CountUpV1,
    carved_type_1.CarvedTypeV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./text-three-ways/v1/text-three-ways"), exports);
__exportStar(require("./fit-text/v1/fit-text"), exports);
__exportStar(require("./count-up/v1/count-up"), exports);
__exportStar(require("./carved-type/v1/carved-type"), exports);
