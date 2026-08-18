/**
 * `@m0saic-starter/connections/criteria-filter/v1` — a QUERY as a prop: the
 * rich filter builder.
 *
 * ONE CONCEPT: `flavor: "criteriaFilter"` + the `criteria` CATALOG. Some
 * templates don't want a hand-picked list — they want a QUERY the upstream
 * can answer ("shorts under a minute mentioning drones"). The catalog
 * declares which criteria exist and what kind each is (search / text /
 * number / date / boolean / idSet), which modifiers each allows, and — for
 * idSet — where its options come from: the SAME `optionsFromConnection`
 * machinery as every other picker in this chapter, resolved through the
 * `connectionId` sibling wire.
 *
 * The editor renders entries by KIND only; keys and labels are opaque
 * strings, so the control works for ANY catalog. The VALUE is a flat
 * object, one entry per criterion the user set — absent key means unset
 * (never write empty placeholders) — and every set criterion ANDs
 * together: no nesting, no OR, no groups, by design.
 *
 * Value shapes, per kind (the parse below is the reference):
 *   search  → "drone"
 *   number  → { modifier, value, value2? }   (value2 rides BETWEEN only)
 *   idSet   → { modifier, value: ["shorts"], excludes?, depth? }
 *   boolean → true | false
 *
 * Render draws the saved-search card the value IS — one row per set
 * criterion, in catalog order, with the empty query as the working base
 * case ("matching everything"). Whether anything EXECUTES the query is a
 * data-chapter concern; the prop's job is carrying intent precisely.
 */
export type CriteriaFilterValue = {
    search?: string;
    collections?: {
        modifier: string;
        value: string[];
        excludes?: string[];
        depth?: number;
    };
    duration?: {
        modifier: string;
        value: number;
        value2?: number;
    };
    featured?: boolean;
};
export type CriteriaFilterProps = {
    /** Which configured connection profile the idSet picker reads. */
    connectionId?: string;
    /** The query — a flat AND of set criteria. */
    filter?: CriteriaFilterValue | string;
    /** Accent fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
/** Validate the flat AND-object; absent keys are UNSET, never placeholders. */
export declare function parseFilter(raw: CriteriaFilterProps["filter"]): CriteriaFilterValue;
/** One human-readable clause per SET criterion, in catalog order. */
export declare function describeFilter(f: CriteriaFilterValue): Array<{
    label: string;
    clause: string;
}>;
export declare const CriteriaFilterV1: import("@m0saic/types").MosaicTemplate<CriteriaFilterProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default CriteriaFilterV1;
