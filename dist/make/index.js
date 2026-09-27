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
exports.makeTemplates = void 0;
const prop_bindings_1 = require("./prop-bindings/v1/prop-bindings");
const bound_numbers_1 = require("./bound-numbers/v1/bound-numbers");
const composite_line_1 = require("./composite-line/v1/composite-line");
const declared_unbound_1 = require("./declared-unbound/v1/declared-unbound");
const array_rows_1 = require("./array-rows/v1/array-rows");
/** Chapter `make`, in teaching order (mirrors ./registry.ts). */
exports.makeTemplates = [
    prop_bindings_1.PropBindingsV1,
    bound_numbers_1.BoundNumbersV1,
    composite_line_1.CompositeLineV1,
    declared_unbound_1.DeclaredUnboundV1,
    array_rows_1.ArrayRowsV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./prop-bindings/v1/prop-bindings"), exports);
__exportStar(require("./bound-numbers/v1/bound-numbers"), exports);
__exportStar(require("./composite-line/v1/composite-line"), exports);
__exportStar(require("./declared-unbound/v1/declared-unbound"), exports);
__exportStar(require("./array-rows/v1/array-rows"), exports);
