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
exports.surfacesTemplates = void 0;
const render_lite_1 = require("./render-lite/v1/render-lite");
const render_cover_1 = require("./render-cover/v1/render-cover");
const render_tutorial_1 = require("./render-tutorial/v1/render-tutorial");
/** Chapter `surfaces`, in teaching order (mirrors ./registry.ts). */
exports.surfacesTemplates = [
    render_lite_1.RenderLiteV1,
    render_cover_1.RenderCoverV1,
    render_tutorial_1.RenderTutorialV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./render-lite/v1/render-lite"), exports);
__exportStar(require("./render-cover/v1/render-cover"), exports);
__exportStar(require("./render-tutorial/v1/render-tutorial"), exports);
