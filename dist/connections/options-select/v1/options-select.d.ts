/**
 * `@m0saic-starter/connections/options-select/v1` — a picker whose values
 * live in someone else's backend, and the WIRE that connects them.
 *
 * ONE CONCEPT: `optionsFromConnection` + the `connectionId` sibling prop.
 * The `collections` prop's valid values aren't known at publish time — they
 * are whatever the configured catalog holds. Two declarations close the
 * circuit:
 *
 *   optionsFromConnection: { kind: "starter-catalog-collections",
 *                            connectionFromProp: "connectionId" }
 *   connectionId: "starter-catalog@default"     // a plain sibling prop
 *
 * At edit time the control reads the connection id FROM THE SIBLING PROP,
 * calls the host's fetchOptions IPC with `{ kind, connectionId }`, and the
 * host runs the pack-registered fetcher with that connection's values and
 * secrets. The sibling wire is the whole resolution story — no id in the
 * sibling, no fetch, and the control tells you so. It is a normal prop:
 * users with several profiles of the same backend switch by editing it,
 * and it travels inside saved .mosaic files like everything else.
 *
 * Scope honesty, measured against the app (2026-08-17): connection-backed
 * options dispatch for `string[]` props, cardList columns, and criteria
 * filters — a lone `string` single-select does not fetch, and the static
 * `options` list is not yet swapped in when a fetch fails (the control
 * surfaces its error instead). The type docs describe both as intended;
 * the drift is filed as a monorepo candidate. This lesson teaches the
 * surface that exists.
 *
 * RENDER NEVER FETCHES. By render time `collections` is a plain string[]
 * like any other — the connection only made PICKING it richer.
 */
export type OptionsSelectProps = {
    /** Which configured connection profile the picker reads. */
    connectionId?: string;
    /** Catalog collection ids — options fetched from the connection at edit time. */
    collections?: string[];
    /** Accent fill (#rrggbb). */
    bandColor?: string;
    /** Backdrop (#rrggbb). */
    pageColor?: string;
};
export declare const OptionsSelectV1: import("@m0saic/types").MosaicTemplate<OptionsSelectProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default OptionsSelectV1;
