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

import type {
  ConnectionOptionImagesFetcher,
  ConnectionOptionsFetcher,
  ConnectionOptionsFetcherArgs,
} from "@m0saic/template-utils";
import {
  registerConnectionOptionImagesFetcher,
  registerConnectionOptionsFetcher,
} from "@m0saic/template-utils";
import { mintConnectionSecretRef } from "@m0saic/types";

import { CATALOG_KEY_FIELD, catalogBaseUrl } from "./connection";

export const COLLECTIONS_KIND = "starter-catalog-collections";
export const ITEMS_KIND = "starter-catalog-items";

type CatalogCollection = { id: string; title: string; count: number };
type CatalogItem = { id: string; title: string; collection: string };

/** Bearer header from the keychain-scoped resolver; absent when no key. */
async function authHeaders(
  args: Pick<ConnectionOptionsFetcherArgs, "secrets" | "connectionId">,
): Promise<Record<string, string>> {
  const key = await args.secrets?.get(
    mintConnectionSecretRef(args.connectionId, CATALOG_KEY_FIELD),
  );
  return typeof key === "string" && key.length > 0
    ? { authorization: `Bearer ${key}` }
    : {};
}

async function getJson<T>(
  url: string,
  args: Pick<ConnectionOptionsFetcherArgs, "secrets" | "connectionId" | "signal">,
): Promise<T> {
  const res = await fetch(url, { headers: await authHeaders(args), signal: args.signal });
  if (!res.ok) {
    throw new Error(`catalog upstream ${url} responded HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const collectionsFetcher: ConnectionOptionsFetcher = async (args) => {
  const base = catalogBaseUrl(args.connectionValues);
  const collections = await getJson<CatalogCollection[]>(`${base}/collections`, args);
  return collections.map((c) => ({
    value: c.id,
    label: c.title,
    description: `${c.count} item${c.count === 1 ? "" : "s"}`,
  }));
};

export const itemsFetcher: ConnectionOptionsFetcher = async (args) => {
  const base = catalogBaseUrl(args.connectionValues);
  const [collections, items] = await Promise.all([
    getJson<CatalogCollection[]>(`${base}/collections`, args),
    getJson<CatalogItem[]>(`${base}/items`, args),
  ]);
  const titleOf = new Map(collections.map((c) => [c.id, c.title]));
  return items.map((i) => ({
    value: i.id,
    label: i.title,
    group: titleOf.get(i.collection) ?? i.collection,
  }));
};

/** Artwork for one visible page of item options, as `value → data URI`. */
export const itemImagesFetcher: ConnectionOptionImagesFetcher = async (args) => {
  const base = catalogBaseUrl(args.connectionValues);
  const headers = await authHeaders(args);
  const out: Record<string, string> = {};
  await Promise.all(
    args.values.map(async (value) => {
      // Missing keys mean "no image" — a failed page entry degrades to the
      // editor's fallback card rather than failing the whole page.
      try {
        const res = await fetch(`${base}/art/${value}.svg`, { headers, signal: args.signal });
        if (!res.ok) return;
        const svg = await res.text();
        out[value] = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
      } catch {
        /* skip */
      }
    }),
  );
  return out;
};

registerConnectionOptionsFetcher(COLLECTIONS_KIND, collectionsFetcher);
registerConnectionOptionsFetcher(ITEMS_KIND, itemsFetcher);
registerConnectionOptionImagesFetcher(ITEMS_KIND, itemImagesFetcher);
