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
exports.dataTemplates = void 0;
const fixture_fetcher_1 = require("./fixture-fetcher/v1/fixture-fetcher");
const pure_adapter_1 = require("./pure-adapter/v1/pure-adapter");
const data_card_1 = require("./data-card/v1/data-card");
const sidecar_json_1 = require("./sidecar-json/v1/sidecar-json");
const sidecar_text_1 = require("./sidecar-text/v1/sidecar-text");
/** Chapter `data`, in teaching order (mirrors ./registry.ts). */
exports.dataTemplates = [
    fixture_fetcher_1.FixtureFetcherV1,
    pure_adapter_1.PureAdapterV1,
    data_card_1.DataCardV1,
    sidecar_json_1.SidecarJsonV1,
    sidecar_text_1.SidecarTextV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./fixture-fetcher/v1/fixture-fetcher"), exports);
__exportStar(require("./pure-adapter/v1/pure-adapter"), exports);
__exportStar(require("./data-card/v1/data-card"), exports);
__exportStar(require("./sidecar-json/v1/sidecar-json"), exports);
__exportStar(require("./sidecar-text/v1/sidecar-text"), exports);
