/**
 * `@m0saic-starter/controls/number-series/v1` — chart data edited as tabs of
 * rows, shaped one way when simple and another when not.
 *
 * ONE CONCEPT: `flavor: "numberSeries"`. A `json` prop holding chart values
 * gets a tabbed multi-series editor — one tab per series (+ to add, x to
 * remove), each tab a numeric row list. The SHAPE CONTRACT is the teachable
 * part: a single series round-trips as a flat `number[]`, multiple series as
 * `number[][]`. Render must accept BOTH — normalize first, then draw — and
 * that same tolerance is what keeps hand-authored files working.
 *
 * (Its little sibling `flavor: "numberList"` is the single-series-only
 * version of the same idea — a flat numeric row list for props like a
 * chart's xValues. Same contract minus the tabs; it doesn't need its own
 * lesson once you've seen this one.)
 *
 * Render draws the shape this prop family exists for: grouped bars, one
 * band of bars per series, heights proportional to the shared maximum so
 * series stay comparable.
 */
export type NumberSeriesProps = {
    /** Chart values: number[] (one series) or number[][] (several). */
    values?: number[] | number[][] | string;
    /** Accent fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
/** Normalize the round-trip contract: number[] and number[][] both arrive. */
export declare function parseSeries(raw: NumberSeriesProps["values"]): number[][];
export declare const NumberSeriesV1: import("@m0saic/types").MosaicTemplate<NumberSeriesProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default NumberSeriesV1;
