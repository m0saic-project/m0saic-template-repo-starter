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
exports.connectionsTemplates = void 0;
// Side-effect imports FIRST: registering the starter-catalog connection and
// its options/images fetchers is what makes the chapter's pickers work.
// This is the repo's one deliberate exception to "no self-registration" —
// see ./registry.ts and docs/security.md.
require("./connection");
require("./fetchers");
const host_connection_1 = require("./host-connection/v1/host-connection");
const options_select_1 = require("./options-select/v1/options-select");
const cards_picker_1 = require("./cards-picker/v1/cards-picker");
const multi_select_1 = require("./multi-select/v1/multi-select");
/** Chapter `connections`, in teaching order (mirrors ./registry.ts). */
exports.connectionsTemplates = [
    host_connection_1.HostConnectionV1,
    options_select_1.OptionsSelectV1,
    cards_picker_1.CardsPickerV1,
    multi_select_1.MultiSelectV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./connection"), exports);
__exportStar(require("./fetchers"), exports);
__exportStar(require("./host-connection/v1/host-connection"), exports);
__exportStar(require("./options-select/v1/options-select"), exports);
__exportStar(require("./cards-picker/v1/cards-picker"), exports);
__exportStar(require("./multi-select/v1/multi-select"), exports);
