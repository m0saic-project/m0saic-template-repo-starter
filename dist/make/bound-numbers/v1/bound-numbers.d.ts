/**
 * `@m0saic-starter/make/bound-numbers/v1` — three numbers a reader can
 * double-click, each drawn in a different honest spelling.
 *
 * ONE CONCEPT: a NUMBER you draw is a handle, and the gate reads the drawn
 * text to check that you bound it (`bindingsCover`, widened from strings to
 * numbers at 0.3.0). It recognises a number in its honest spellings —
 * `String(v)`, `v.toLocaleString("en-US")`, and `toFixed(1|2)` ONLY when the
 * value already carries decimals — and only on a digit boundary: `12` is not
 * read out of `2012`, and a drawn `1,200` is not the prop `200`. So format
 * the number however the card needs, then bind the rect that shows it:
 *
 *   visitors 12480 → "12,480"   toLocaleString
 *   price    3.5   → "$3.50"    toFixed(2) — decimals stay decimals
 *   year     2026  → "2026"     String
 *
 * And one number that is NOT a prop: the total (visitors × price) is derived.
 * It has no handle and needs none — bind what you show OF A PROP, not every
 * numeral on the card.
 *
 * The rule that bites: `bindingsCover` is the WEAKER second signal (a
 * warning). It cannot see a one-character spelling (`columns: 3` drawn as
 * "3"), nor a spelling it does not read ("12.5k"), nor an integer drawn with
 * decimals ("4.00" for `4`). Bind those anyway. The roll call —
 * `bindingsDeclared`, lesson 84 — is the gate; this rule is what catches a
 * number bound to the WRONG rect.
 */
export type BoundNumbersProps = {
    /** A count — drawn with thousands separators, bound to the numeral. */
    visitors?: number;
    /** A price — drawn to two decimals, bound to the numeral. */
    price?: number;
    /** A year — drawn plainly, bound to the numeral. */
    year?: number;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export declare const BOUND_NUMBERS_DEFAULTS: {
    readonly visitors: 12480;
    readonly price: 3.5;
    readonly year: 2026;
    readonly pageColor: "#1c2833";
};
/**
 * The spellings the gate reads a number in — a mirror of the audit's list,
 * kept here so the lesson's test can say what "honest" means. An integer
 * never spells with decimals: nothing draws a count as "1.0".
 */
export declare function honestSpellings(v: number): string[];
/** How each number is DRAWN — the card's own formatting, each an honest spelling. */
export declare const drawVisitors: (v: number) => string;
export declare const drawPrice: (v: number) => string;
export declare const drawYear: (v: number) => string;
/** Derived — not a prop, so not a handle. */
export declare const drawTotal: (visitors: number, price: number) => string;
export declare const BoundNumbersV1: import("@m0saic/types").MosaicTemplate<BoundNumbersProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default BoundNumbersV1;
