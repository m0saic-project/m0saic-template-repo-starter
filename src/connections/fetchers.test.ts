import {
  getConnectionOptionImagesFetcher,
  getConnectionOptionsFetcher,
} from "@m0saic/template-utils";

import {
  COLLECTIONS_KIND,
  ITEMS_KIND,
  collectionsFetcher,
  itemImagesFetcher,
  itemsFetcher,
} from "./fetchers";

// The upstream example is deliberately a zero-dep CJS file outside src/ —
// require() is the honest way to load it from a test.
/* eslint-disable-next-line @typescript-eslint/no-require-imports */
const { startCatalogServer } = require("../../examples/http-orchestrator/server.cjs") as {
  startCatalogServer(opts?: { port?: number; key?: string }): Promise<{
    port: number;
    baseUrl: string;
    close(): Promise<void>;
  }>;
};

let server: { baseUrl: string; close(): Promise<void> };
const args = (over: Record<string, unknown> = {}) => ({
  connectionValues: { baseUrl: server.baseUrl },
  connectionId: "starter-catalog@default",
  ...over,
});

beforeAll(async () => {
  server = await startCatalogServer({ port: 0 });
});
afterAll(async () => {
  await server.close();
});

describe("starter-catalog options fetchers", () => {
  it("registers both kinds plus the images companion on import", () => {
    expect(getConnectionOptionsFetcher(COLLECTIONS_KIND)).toBe(collectionsFetcher);
    expect(getConnectionOptionsFetcher(ITEMS_KIND)).toBe(itemsFetcher);
    expect(getConnectionOptionImagesFetcher(ITEMS_KIND)).toBe(itemImagesFetcher);
  });

  it("collections: value/label/description rows", async () => {
    const options = await collectionsFetcher(args());
    expect(options.map((o) => o.value)).toEqual(["shorts", "features", "loops"]);
    expect(options[0]).toMatchObject({ label: "Shorts", description: "4 items" });
  });

  it("items: every option carries its collection title as `group`", async () => {
    const options = await itemsFetcher(args());
    expect(options.length).toBe(12);
    const bunny = options.find((o) => o.value === "big-buck-bunny");
    expect(bunny).toMatchObject({ label: "Big Buck Bunny", group: "Features" });
    expect(new Set(options.map((o) => o.group))).toEqual(new Set(["Shorts", "Features", "Loops"]));
  });

  it("images: one page of values resolves to data URIs; unknown ids are just absent", async () => {
    const images = await itemImagesFetcher(
      args({ values: ["big-buck-bunny", "ember-glow", "not-a-real-item"] }) as never,
    );
    expect(Object.keys(images).sort()).toEqual(["big-buck-bunny", "ember-glow"]);
    expect(images["big-buck-bunny"]).toMatch(/^data:image\/svg\+xml;base64,/);
    // Deterministic upstream art → deterministic data URI.
    const again = await itemImagesFetcher(args({ values: ["big-buck-bunny"] }) as never);
    expect(again["big-buck-bunny"]).toBe(images["big-buck-bunny"]);
  });

  it("secrets resolver mints a bearer key the upstream accepts", async () => {
    const keyed = await startCatalogServer({ port: 0, key: "s3cret" });
    try {
      const okArgs = {
        connectionValues: { baseUrl: keyed.baseUrl },
        connectionId: "starter-catalog@default",
        secrets: { get: async () => "s3cret" },
      };
      const options = await collectionsFetcher(okArgs as never);
      expect(options.length).toBe(3);

      const badArgs = { ...okArgs, secrets: { get: async () => "wrong" } };
      await expect(collectionsFetcher(badArgs as never)).rejects.toThrow(/HTTP 401/);
    } finally {
      await keyed.close();
    }
  });

  it("throws on an unreachable upstream — the host turns this into the static-options fallback", async () => {
    const dead = args({ connectionValues: { baseUrl: "http://127.0.0.1:9" } });
    await expect(itemsFetcher(dead)).rejects.toThrow();
  });
});
