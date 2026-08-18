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
        title: "71 · Host Connection",
        description: "A template pack can teach the host a new kind of backend: registerHostConnection declares the Settings → Integrations form (base URL + keychain secret) and the Test-connection probe (reachable / authenticated / named failure). Registration is a module-eval side effect, the publisher half of the id is law, and secrets never leave the keychain. The card renders the REAL registered schema.",
        tags: ["connections", "lesson"],
    },
    {
        slug: "options-select",
        templateId: "@m0saic-starter/connections/options-select/v1",
        exportName: "OptionsSelectV1",
        title: "72 · Options From a Connection",
        description: "A picker whose values live in the upstream backend, and the wire that connects them: optionsFromConnection names a registered fetcher kind, and connectionFromProp names the SIBLING PROP holding the connection id — the control reads the sibling, calls the host IPC, and fills with live rows. No id in the sibling, no fetch, and the control says so. The sibling is a normal prop: switch profiles by editing it. Render never fetches — by then the value is a plain string[].",
        tags: ["connections", "lesson"],
    },
    {
        slug: "cards-picker",
        templateId: "@m0saic-starter/connections/cards-picker/v1",
        exportName: "CardsPickerV1",
        title: "73 · Cards Picker",
        description: "Pick upstream results by their artwork: picker \"cards\" turns a connection-backed string[] into an image-card grid, cardAspect/cardFit are declared by the template because they describe the connection kind, and the heavy art rides a companion images fetcher — lazy, per visible page, data URIs. At render the prop is a plain string[].",
        tags: ["connections", "lesson"],
    },
    {
        slug: "multi-select",
        templateId: "@m0saic-starter/connections/multi-select/v1",
        exportName: "MultiSelectV1",
        title: "74 · Connection Multi-Select",
        description: "Cards of chips, each chip a rich pick: flavor cardList renders a json prop as a repeating card editor, and a connectionMultiSelect column backs every card's chips with the connection's options — groupByKey sectioning the picker modal by an option field. The value stays plain Array<{label, itemIds}> JSON, identical picked or typed — why CLI and app renders agree.",
        tags: ["connections", "lesson"],
    },
    {
        slug: "criteria-filter",
        templateId: "@m0saic-starter/connections/criteria-filter/v1",
        exportName: "CriteriaFilterV1",
        title: "75 · Criteria Filter",
        description: "A query as a prop: flavor criteriaFilter + a criteria catalog declares which criteria exist (search / number / boolean / idSet with modifiers) and the editor renders the filter builder by KIND — opaque keys, any catalog. The idSet's options ride optionsFromConnection through the connectionId wire. The value is a flat AND-object, absent key = unset, drawn as the saved-search card it is; executing the query belongs to the data chapter.",
        tags: ["connections", "controls", "lesson"],
    },
    {
        slug: "weighted-cards",
        templateId: "@m0saic-starter/connections/weighted-cards/v1",
        exportName: "WeightedCardsV1",
        title: "76 · Weighted Cards",
        description: "Weights at both depths: a weights column SHARING the multi-select's key gives each card an auto-balancing share group over its own chips (two cells, one array — even sets round-trip string[], customized {id,weight}[]), and interWeightProp names a sibling number[] weighing the cards against each other. Rows and chips in the render ARE those values.",
        tags: ["controls", "connections", "lesson"],
    },
];
