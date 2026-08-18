/**
 * `@m0saic-starter/connections/weighted-cards/v1` — weights at BOTH depths:
 * chips against chips inside a card, and cards against each other.
 *
 * ONE CONCEPT: the weighted `cardList`. Two declarations extend lesson 77's
 * card editor into a proportion instrument:
 *
 *  - a `weights` COLUMN sharing the multi-select's key ("itemIds") — two
 *    cells, one array. The chips picker owns membership; the slider group
 *    beside it owns shares. The VALUE SHAPE follows the interaction: an
 *    even, untouched set round-trips as plain `string[]`; a customized one
 *    as `{ id, weight }[]`. Render must accept both — that duality is the
 *    contract, not an accident.
 *  - `interWeightProp: "mixWeights"` — a SIBLING `number[]` prop the card
 *    strip drags to weigh the CARDS against each other. Same sibling-wire
 *    idea as the connections chapter's `connectionId`, pointed at numbers.
 *
 * Render is the honest visualization again: row heights come from
 * `mixWeights`, chip widths from each card's item weights — the entire
 * layout is the prop values wearing rectangles.
 */
export type WeightedItem = {
    id: string;
    weight: number;
};
export type WeightedMix = {
    label: string;
    itemIds: string[] | WeightedItem[];
};
export type WeightedCardsProps = {
    /** Which configured connection profile the chip pickers read. */
    connectionId?: string;
    /** The mixes: cards of connection-picked chips with per-chip weights. */
    mixes?: WeightedMix[] | string;
    /** Inter-card weights — the sibling the card strip drags. */
    mixWeights?: number[];
    /** Accent fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
/** Parse + validate the whole prop pair. */
export declare function parseWeighted(rawMixes: WeightedCardsProps["mixes"], rawWeights: WeightedCardsProps["mixWeights"]): {
    mixes: Array<{
        label: string;
        items: WeightedItem[];
    }>;
    mixWeights: number[];
};
export declare const WeightedCardsV1: import("@m0saic/types").MosaicTemplate<WeightedCardsProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default WeightedCardsV1;
