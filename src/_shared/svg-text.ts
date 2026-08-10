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
export {
  fitSvgLines,
  fitSvgText,
  svgLabel,
  svgTextSource,
  wrapMeasured,
} from "@m0saic/template-utils";
export type { SvgTextLayerSpec } from "@m0saic/template-utils";
