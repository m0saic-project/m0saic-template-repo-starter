"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapMeasured = exports.svgTextSource = exports.svgLabel = exports.fitSvgText = exports.fitSvgLines = void 0;
/**
 * Svg-text helpers — re-exported from `@m0saic/template-utils`, where they
 * live (text/fitText + sources/svgTextSource). The short version of the
 * contract every lesson in this repo follows:
 *
 *   - Static text uses `rasterizer: "svg"`: bundled deterministic font,
 *     baked to geometry, identical in the app preview and the CLI.
 *   - Nothing soft-wraps — fit copy with the measured helpers (they measure
 *     with the SAME font file the rasterizer draws).
 *   - Svg text has no background of its own — pair it with a
 *     `makeColorTile` base (attached `{...}` overlay is the usual home).
 *   - Keep copy ASCII; the bundled glyph font renders exotic codepoints
 *     (like U+2192) as tofu.
 */
var template_utils_1 = require("@m0saic/template-utils");
Object.defineProperty(exports, "fitSvgLines", { enumerable: true, get: function () { return template_utils_1.fitSvgLines; } });
Object.defineProperty(exports, "fitSvgText", { enumerable: true, get: function () { return template_utils_1.fitSvgText; } });
Object.defineProperty(exports, "svgLabel", { enumerable: true, get: function () { return template_utils_1.svgLabel; } });
Object.defineProperty(exports, "svgTextSource", { enumerable: true, get: function () { return template_utils_1.svgTextSource; } });
Object.defineProperty(exports, "wrapMeasured", { enumerable: true, get: function () { return template_utils_1.wrapMeasured; } });
