import { listRegisteredHostConnectionIds } from "@m0saic/template-utils";

import {
  CATALOG_CONNECTION_ID,
  CATALOG_CONNECTION_SCHEMA,
  catalogBaseUrl,
  catalogConnectionProbe,
} from "./connection";

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

describe("starter-catalog@default connection", () => {
  it("registers itself on import (module-eval side effect)", () => {
    expect(listRegisteredHostConnectionIds()).toContain("starter-catalog@default");
  });

  it("publisher half of the id matches schema.publisher — the registration invariant", () => {
    expect(String(CATALOG_CONNECTION_ID).split("@")[0]).toBe(CATALOG_CONNECTION_SCHEMA.publisher);
  });

  it("catalogBaseUrl defaults and trims", () => {
    expect(catalogBaseUrl({})).toBe("http://127.0.0.1:4977");
    expect(catalogBaseUrl({ baseUrl: "http://x:9/" })).toBe("http://x:9");
    expect(catalogBaseUrl({ baseUrl: "   " })).toBe("http://127.0.0.1:4977");
  });

  describe("probe against a live example server", () => {
    it("reachable, authenticated tick only when a key is provided", async () => {
      const s = await startCatalogServer({ port: 0 });
      try {
        const anon = await catalogConnectionProbe.probe({ baseUrl: s.baseUrl });
        expect(anon).toMatchObject({ ok: true, reachable: true });
        expect("authenticated" in anon).toBe(false);

        const keyed = await catalogConnectionProbe.probe({
          baseUrl: s.baseUrl,
          apiKey: "any-key",
        });
        expect(keyed).toMatchObject({ ok: true, reachable: true, authenticated: true });
      } finally {
        await s.close();
      }
    });

    it("AUTH_FAILED on a rejected key", async () => {
      const s = await startCatalogServer({ port: 0, key: "right" });
      try {
        const bad = await catalogConnectionProbe.probe({
          baseUrl: s.baseUrl,
          apiKey: "wrong",
        });
        expect(bad).toMatchObject({ ok: false, code: "AUTH_FAILED" });
      } finally {
        await s.close();
      }
    });

    it("UNREACHABLE when nothing is listening", async () => {
      const res = await catalogConnectionProbe.probe(
        { baseUrl: "http://127.0.0.1:9" },
        { timeoutMs: 1500 },
      );
      expect(res).toMatchObject({ ok: false, code: "UNREACHABLE" });
    });

    it("UNREACHABLE when the URL answers but is not a catalog", async () => {
      // The art route answers 200 with SVG — /health on a non-catalog shape.
      const s = await startCatalogServer({ port: 0 });
      try {
        const res = await catalogConnectionProbe.probe({
          baseUrl: `${s.baseUrl}/art`, // /art/health → 404 JSON, not the service banner
        });
        expect(res.ok).toBe(false);
      } finally {
        await s.close();
      }
    });
  });
});
