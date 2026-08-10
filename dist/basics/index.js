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
exports.basicsTemplates = void 0;
const hello_world_1 = require("./hello-world/v1/hello-world");
const hot_reload_canary_1 = require("./hot-reload-canary/v1/hot-reload-canary");
const color_tiles_1 = require("./color-tiles/v1/color-tiles");
const aspect_adaptive_card_1 = require("./aspect-adaptive-card/v1/aspect-adaptive-card");
/** Chapter `basics`, in teaching order (mirrors ./registry.ts). */
exports.basicsTemplates = [
    hello_world_1.HelloWorldV1,
    hot_reload_canary_1.HotReloadCanaryV1,
    color_tiles_1.ColorTilesV1,
    aspect_adaptive_card_1.AspectAdaptiveCardV1,
];
// `export *` ONLY — never `export * from "./x"` alongside a named
// `export { X } from "./x"` for the same module. tsc would emit a second
// require() for it, which Node's ESM→CJS translation mis-serves on re-import,
// silently filling template arrays with `undefined`. (Direct `import` +
// `export *`, as here, is the safe pairing.)
__exportStar(require("./hello-world/v1/hello-world"), exports);
__exportStar(require("./hot-reload-canary/v1/hot-reload-canary"), exports);
__exportStar(require("./color-tiles/v1/color-tiles"), exports);
__exportStar(require("./aspect-adaptive-card/v1/aspect-adaptive-card"), exports);
