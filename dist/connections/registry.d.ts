import type { StarterRegistryEntry } from "../registry-types";
/**
 * Chapter registry: `connections` — array order is the teaching order.
 *
 * The Make experience gets RICHER than static props when a template pack
 * teaches the host an upstream backend: registered connections, dynamic
 * options, artwork card grids, grouped multi-selects. The neutral upstream
 * these lessons talk to is `examples/http-orchestrator` — a zero-dep local
 * catalog server shaped like a real backend (see its README for pointing
 * the connection at YOUR system instead).
 *
 * One deliberate divergence from the rest of the repo: connections REGISTER
 * THEMSELVES on import (`src/connections/connection.ts` + `fetchers.ts`,
 * mirroring the platform's own exemplar pattern) — templates stay plain
 * exports, but connection kinds are module-eval side effects by design, and
 * loading a repo that registers one is part of the Add-source consent
 * surface (docs/security.md).
 *
 * The chapter's through-line: the connection enriches EDIT time only. At
 * render every prop is plain data — a string, a string[], a JSON array —
 * identical whether it was picked from a rich modal or typed by hand.
 */
export declare const connectionsRegistry: StarterRegistryEntry[];
