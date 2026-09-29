"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionsRegistry = void 0;
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
exports.connectionsRegistry = [
    {
        slug: "host-connection",
        templateId: "@m0saic-starter/connections/host-connection/v1",
        exportName: "HostConnectionV1",
    },
    {
        slug: "options-select",
        templateId: "@m0saic-starter/connections/options-select/v1",
        exportName: "OptionsSelectV1",
    },
    {
        slug: "cards-picker",
        templateId: "@m0saic-starter/connections/cards-picker/v1",
        exportName: "CardsPickerV1",
    },
    {
        slug: "multi-select",
        templateId: "@m0saic-starter/connections/multi-select/v1",
        exportName: "MultiSelectV1",
    },
    {
        slug: "criteria-filter",
        templateId: "@m0saic-starter/connections/criteria-filter/v1",
        exportName: "CriteriaFilterV1",
    },
    {
        slug: "weighted-cards",
        templateId: "@m0saic-starter/connections/weighted-cards/v1",
        exportName: "WeightedCardsV1",
    },
];
