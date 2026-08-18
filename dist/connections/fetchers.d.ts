/**
 * Options fetchers for the `starter-catalog` connection — the publisher-side
 * half of `optionsFromConnection`.
 *
 * The host stays generic: it only knows the IPC (`connections:fetchOptions`)
 * and this registry. The PUBLISHER owns the protocol — these ~60 lines are
 * the entire upstream client, and adapting the chapter to a different
 * backend means editing only this file (see examples/http-orchestrator's
 * README).
 *
 * Two kinds, one images companion:
 *
 *   "starter-catalog-collections" — the small closed set (a dropdown's worth)
 *   "starter-catalog-items"       — the big set, options carrying `group`
 *                                   (collection title) so grouped pickers
 *                                   can section the modal
 *   images for "starter-catalog-items" — per-item artwork resolved LAZILY,
 *                                   by option value, as data URIs; heavy art
 *                                   never rides the options list itself
 *
 * Failure model: fetchers THROW on any upstream problem. The host IPC turns
 * that into `{ ok:false, reason }` and the control surfaces the error state
 * (the documented static-`options` swap-in is not implemented yet — see the
 * monorepo drift candidate). Values already picked keep rendering.
 * Registration is a module-eval side effect, same as ./connection.ts.
 */
import type { ConnectionOptionImagesFetcher, ConnectionOptionsFetcher } from "@m0saic/template-utils";
export declare const COLLECTIONS_KIND = "starter-catalog-collections";
export declare const ITEMS_KIND = "starter-catalog-items";
export declare const collectionsFetcher: ConnectionOptionsFetcher;
export declare const itemsFetcher: ConnectionOptionsFetcher;
/** Artwork for one visible page of item options, as `value → data URI`. */
export declare const itemImagesFetcher: ConnectionOptionImagesFetcher;
