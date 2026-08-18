#!/usr/bin/env node
/**
 * starter-catalog — a tiny NEUTRAL upstream backend for the `connections`
 * chapter. Zero dependencies, fully offline, deterministic.
 *
 * This is the stand-in for "your real backend": a catalog-shaped API with
 * collections, items, and per-item artwork — the shape the
 * `starter-catalog@default` host connection (see `src/connections/`) speaks.
 * Point the connection's Base URL at any server with this shape and the
 * Make pickers light up with YOUR data; this one exists so the lessons work
 * on a laptop with no accounts and no network.
 *
 *   node examples/http-orchestrator/server.cjs            # port 4977
 *   node examples/http-orchestrator/server.cjs --port 0   # ephemeral
 *   STARTER_CATALOG_KEY=s3cret node …                     # require a bearer key
 *
 * Endpoints (all JSON unless noted):
 *   GET /health           → { ok, service, version, authenticated }
 *   GET /collections      → [{ id, title, count }]
 *   GET /items            → [{ id, title, collection }]   (?collection= filters)
 *   GET /art/<id>.svg     → deterministic SVG artwork (image/svg+xml)
 *
 * Auth model (mirrors real backends, kept minimal): requests MAY carry
 * `Authorization: Bearer <key>`. When the server was started with a key,
 * a wrong key is rejected (401) and `authenticated` reflects a match; when
 * no key is configured, any presented bearer counts as authenticated —
 * enough for the connection probe to demonstrate its two ticks.
 */

"use strict";

const http = require("http");

// ── The catalog ──────────────────────────────────────────────────────────
// Neutral fixture data. Titles are generic footage-library entries.

const COLLECTIONS = [
  { id: "shorts", title: "Shorts" },
  { id: "features", title: "Features" },
  { id: "loops", title: "Loops" },
];

const ITEMS = [
  { id: "sunrise-timelapse", title: "Sunrise Timelapse", collection: "shorts" },
  { id: "harbor-drone-pass", title: "Harbor Drone Pass", collection: "shorts" },
  { id: "rainy-window", title: "Rainy Window", collection: "shorts" },
  { id: "market-crowd", title: "Market Crowd", collection: "shorts" },
  { id: "big-buck-bunny", title: "Big Buck Bunny", collection: "features" },
  { id: "glacier-flight", title: "Glacier Flight", collection: "features" },
  { id: "desert-night-sky", title: "Desert Night Sky", collection: "features" },
  { id: "coastal-walk", title: "Coastal Walk", collection: "features" },
  { id: "ember-glow", title: "Ember Glow", collection: "loops" },
  { id: "soft-gradient", title: "Soft Gradient", collection: "loops" },
  { id: "particle-drift", title: "Particle Drift", collection: "loops" },
  { id: "ink-in-water", title: "Ink in Water", collection: "loops" },
];

// ── Deterministic artwork ────────────────────────────────────────────────
// Every item gets a 320x180 SVG derived from its id: a two-tone gradient
// plus a shape picked by hash. Deterministic → same bytes every run, so the
// lessons' image tests are stable.

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function artSvg(id) {
  const h = hash(id);
  const hue1 = h % 360;
  const hue2 = (hue1 + 40 + (h % 80)) % 360;
  const shape = h % 3;
  const cx = 80 + (h % 160);
  const mid =
    shape === 0
      ? `<circle cx="${cx}" cy="90" r="52" fill="hsl(${hue2} 70% 78%)" opacity="0.9"/>`
      : shape === 1
        ? `<rect x="${cx - 46}" y="44" width="92" height="92" rx="14" fill="hsl(${hue2} 70% 78%)" opacity="0.9"/>`
        : `<polygon points="${cx},38 ${cx + 56},142 ${cx - 56},142" fill="hsl(${hue2} 70% 78%)" opacity="0.9"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">` +
    `<rect width="320" height="180" fill="hsl(${hue1} 55% 38%)"/>` +
    mid +
    `<rect y="150" width="320" height="30" fill="hsl(${hue1} 55% 22%)"/>` +
    `</svg>`
  );
}

// ── Server ───────────────────────────────────────────────────────────────

function startCatalogServer({ port = 4977, key = process.env.STARTER_CATALOG_KEY } = {}) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const bearer = /^Bearer (.+)$/.exec(req.headers.authorization ?? "")?.[1];
    const authenticated = key ? bearer === key : typeof bearer === "string" && bearer.length > 0;

    const json = (status, body) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };

    if (key && bearer !== undefined && bearer !== key) {
      return json(401, { ok: false, error: "bad key" });
    }

    if (url.pathname === "/health") {
      return json(200, { ok: true, service: "starter-catalog", version: 1, authenticated });
    }
    if (url.pathname === "/collections") {
      return json(
        200,
        COLLECTIONS.map((c) => ({
          ...c,
          count: ITEMS.filter((i) => i.collection === c.id).length,
        })),
      );
    }
    if (url.pathname === "/items") {
      const c = url.searchParams.get("collection");
      return json(200, c ? ITEMS.filter((i) => i.collection === c) : ITEMS);
    }
    const art = /^\/art\/([a-z0-9-]+)\.svg$/.exec(url.pathname);
    if (art) {
      if (!ITEMS.some((i) => i.id === art[1])) return json(404, { ok: false, error: "unknown item" });
      res.writeHead(200, { "content-type": "image/svg+xml" });
      return res.end(artSvg(art[1]));
    }
    return json(404, { ok: false, error: "unknown route" });
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      const actual = server.address().port;
      resolve({
        port: actual,
        baseUrl: `http://127.0.0.1:${actual}`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

module.exports = { startCatalogServer, COLLECTIONS, ITEMS, artSvg };

if (require.main === module) {
  const portArg = process.argv.indexOf("--port");
  const port = portArg >= 0 ? Number(process.argv[portArg + 1]) : 4977;
  startCatalogServer({ port }).then(({ baseUrl }) => {
    console.log(`starter-catalog serving at ${baseUrl}`);
    console.log(`  GET ${baseUrl}/health`);
    console.log(`  GET ${baseUrl}/collections`);
    console.log(`  GET ${baseUrl}/items?collection=shorts`);
    console.log(`  GET ${baseUrl}/art/big-buck-bunny.svg`);
    console.log(`Point the starter-catalog connection's Base URL here (Settings → Integrations).`);
  });
}
