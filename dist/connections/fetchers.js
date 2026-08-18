"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemImagesFetcher = exports.itemsFetcher = exports.collectionsFetcher = exports.ITEMS_KIND = exports.COLLECTIONS_KIND = void 0;
const template_utils_1 = require("@m0saic/template-utils");
const types_1 = require("@m0saic/types");
const connection_1 = require("./connection");
exports.COLLECTIONS_KIND = "starter-catalog-collections";
exports.ITEMS_KIND = "starter-catalog-items";
/** Bearer header from the keychain-scoped resolver; absent when no key. */
async function authHeaders(args) {
    var _a;
    const key = await ((_a = args.secrets) === null || _a === void 0 ? void 0 : _a.get((0, types_1.mintConnectionSecretRef)(args.connectionId, connection_1.CATALOG_KEY_FIELD)));
    return typeof key === "string" && key.length > 0
        ? { authorization: `Bearer ${key}` }
        : {};
}
async function getJson(url, args) {
    const res = await fetch(url, { headers: await authHeaders(args), signal: args.signal });
    if (!res.ok) {
        throw new Error(`catalog upstream ${url} responded HTTP ${res.status}`);
    }
    return (await res.json());
}
const collectionsFetcher = async (args) => {
    const base = (0, connection_1.catalogBaseUrl)(args.connectionValues);
    const collections = await getJson(`${base}/collections`, args);
    return collections.map((c) => ({
        value: c.id,
        label: c.title,
        description: `${c.count} item${c.count === 1 ? "" : "s"}`,
    }));
};
exports.collectionsFetcher = collectionsFetcher;
const itemsFetcher = async (args) => {
    const base = (0, connection_1.catalogBaseUrl)(args.connectionValues);
    const [collections, items] = await Promise.all([
        getJson(`${base}/collections`, args),
        getJson(`${base}/items`, args),
    ]);
    const titleOf = new Map(collections.map((c) => [c.id, c.title]));
    return items.map((i) => {
        var _a;
        return ({
            value: i.id,
            label: i.title,
            group: (_a = titleOf.get(i.collection)) !== null && _a !== void 0 ? _a : i.collection,
        });
    });
};
exports.itemsFetcher = itemsFetcher;
/** Artwork for one visible page of item options, as `value → data URI`. */
const itemImagesFetcher = async (args) => {
    const base = (0, connection_1.catalogBaseUrl)(args.connectionValues);
    const headers = await authHeaders(args);
    const out = {};
    await Promise.all(args.values.map(async (value) => {
        // Missing keys mean "no image" — a failed page entry degrades to the
        // editor's fallback card rather than failing the whole page.
        try {
            const res = await fetch(`${base}/art/${value}.svg`, { headers, signal: args.signal });
            if (!res.ok)
                return;
            const svg = await res.text();
            out[value] = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
        }
        catch {
            /* skip */
        }
    }));
    return out;
};
exports.itemImagesFetcher = itemImagesFetcher;
(0, template_utils_1.registerConnectionOptionsFetcher)(exports.COLLECTIONS_KIND, exports.collectionsFetcher);
(0, template_utils_1.registerConnectionOptionsFetcher)(exports.ITEMS_KIND, exports.itemsFetcher);
(0, template_utils_1.registerConnectionOptionImagesFetcher)(exports.ITEMS_KIND, exports.itemImagesFetcher);
