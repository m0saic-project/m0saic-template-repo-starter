/**
 * `@m0saic-starter/connections/multi-select/v1` — cards of chips, each chip
 * a rich pick from the connection.
 *
 * ONE CONCEPT: the `connectionMultiSelect` CELL. A `json` prop with
 * `flavor: "cardList"` renders as a repeating card editor; a column of
 * `kind: "connectionMultiSelect"` gives every card a chips row backed by
 * the SAME options machinery as lessons 72/73 — plus one new knob:
 * `groupByKey: "group"` sections the picker modal by an option field, so
 * the 12 catalog items arrive grouped under Shorts / Features / Loops
 * (options without the key fall into "Other").
 *
 * The VALUE is boring on purpose: `Array<{ label, itemIds }>` — plain JSON.
 * The editor machinery (cards, chips, grouped modal, live options) exists
 * entirely at EDIT time; render parses the same JSON it would get from a
 * text editor, validates it, and draws. A template never knows whether its
 * props were picked from a rich modal or typed by hand — that symmetry is
 * what keeps CLI renders and app renders identical.
 */
export type MixEntry = {
    label: string;
    itemIds: string[];
};
export type MultiSelectProps = {
    /** Which configured connection profile the chip pickers read. */
    connectionId?: string;
    /** The mixes: each card a label + connection-picked item chips. */
    mixes?: MixEntry[] | string;
    /** Accent fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
/** Parse + validate the prop (editors may deliver a JSON string). */
export declare function parseMixes(raw: MultiSelectProps["mixes"]): MixEntry[];
export declare const MultiSelectV1: import("@m0saic/types").MosaicTemplate<MultiSelectProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default MultiSelectV1;
