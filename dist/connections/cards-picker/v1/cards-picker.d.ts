/**
 * `@m0saic-starter/connections/cards-picker/v1` — pick upstream results by
 * their ARTWORK, not their ids.
 *
 * ONE CONCEPT: `picker: "cards"`. A `string[]` prop with
 * `optionsFromConnection` gets, instead of a text multi-select, an expanded
 * picker modal that renders each option as an image card. Three declarations
 * make it work, all on the template side:
 *
 *  - `picker: "cards"` — ask for the artwork grid. The modal falls back to
 *    the text list when options carry no images, so it is always safe.
 *  - `cardAspect` / `cardFit` — the card SHAPE and object-fit are properties
 *    of the CONNECTION KIND being queried (catalog stills are wide 16:9 and
 *    crop-tolerant, so "wide" + "cover"; a portrait or logo source would
 *    declare "tall" or "square" + "contain").
 *  - the pack registers a companion IMAGES fetcher
 *    (`registerConnectionOptionImagesFetcher`) for the same kind: heavy art
 *    never rides the options list — the editor resolves it LAZILY, one
 *    visible page at a time, by option value, as data URIs.
 *
 * RENDER NEVER FETCHES ART. At render this prop is a plain `string[]`; the
 * posters drawn here are deterministic stand-ins keyed by id. The real
 * artwork's only job was making the PICK rich.
 */
export type CardsPickerProps = {
    /** Which configured connection profile the picker reads. */
    connectionId?: string;
    /** Catalog item ids — picked from the artwork grid at edit time. */
    itemIds?: string[];
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export declare const CardsPickerV1: import("@m0saic/types").MosaicTemplate<CardsPickerProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default CardsPickerV1;
