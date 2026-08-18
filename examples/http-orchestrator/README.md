# http-orchestrator — a real upstream for the `connections` chapter

The `connections` chapter teaches how Mosaic templates pull **rich, pickable
data from an upstream backend** at edit time: dynamic dropdowns, artwork card
grids, grouped multi-selects. Those lessons need a backend to talk to — this
directory is one. Zero dependencies, fully offline, deterministic.

```
node examples/http-orchestrator/server.cjs
# starter-catalog serving at http://127.0.0.1:4977
```

Then, in Mosaic: **Settings → Integrations → starter-catalog**, set the Base
URL to `http://127.0.0.1:4977`, hit *Test connection*, and open any
`connections/*` template in Make. The pickers now fetch live options — flip
the server off and watch the same props degrade to their static fallbacks.

## The shape

The connection (`src/connections/`) speaks a small catalog protocol:

| Endpoint | Returns |
|---|---|
| `GET /health` | `{ ok, service, version, authenticated }` — the probe target |
| `GET /collections` | `[{ id, title, count }]` |
| `GET /items?collection=` | `[{ id, title, collection }]` |
| `GET /art/<id>.svg` | per-item artwork (`image/svg+xml`) |

`Authorization: Bearer <key>` is honored: start the server with
`STARTER_CATALOG_KEY=… ` to require it (wrong key → 401), or leave it unset
and any presented key simply flips `authenticated` — enough for the probe's
two ticks (reachable / authenticated) to mean something.

## Pointing it at YOUR backend

Nothing about the lessons is specific to this server. Put the same four
routes (or an adapter that shapes your API into them) in front of any real
system — a media library, a CMS, an asset store — and set the connection's
Base URL to it. The fetchers in `src/connections/fetchers.ts` are the whole
client: ~60 lines to adapt to a different protocol, and the Make experience
stays identical. That is the point of the chapter: the host stays generic,
the publisher pack owns the protocol.
