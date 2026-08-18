"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataRegistry = void 0;
/**
 * Chapter registry: `data` — array order is the teaching order.
 * The chain in dependency order (fetch → reshape → draw), then the two
 * shapes of a file written beside the render.
 */
exports.dataRegistry = [
    {
        slug: "fixture-fetcher",
        templateId: "@m0saic-starter/data/fixture-fetcher/v1",
        exportName: "FixtureFetcherV1",
        title: "62 · Fixture Fetcher",
        description: "Where data enters: a type:\"data\" source publishes a payload downstream templates read as ctx.upstreamData[alias]. tier:\"capability\" is what makes ctx.secrets exist, and only a derived marker is published — never the value.",
        tags: ["data", "producer", "capability", "lesson"],
    },
    {
        slug: "pure-adapter",
        templateId: "@m0saic-starter/data/pure-adapter/v1",
        exportName: "PureAdapterV1",
        title: "63 · Pure Adapter",
        description: "A pure function between channels: read one block, publish another. Reshaping needs no capability tier and no network, so it stays core tier — and a missing upstream degrades to an empty result rather than throwing.",
        tags: ["data", "adapter", "lesson"],
    },
    {
        slug: "data-card",
        templateId: "@m0saic-starter/data/data-card/v1",
        exportName: "DataCardV1",
        title: "64 · Data Card",
        description: "The consumer end: read ctx.upstreamData[alias] and draw it. The three links agree on an alias and a shape, never on each other's ids, and the card names what it read so a broken chain shows in the picture.",
        tags: ["data", "consumer", "lesson"],
    },
    {
        slug: "sidecar-json",
        templateId: "@m0saic-starter/data/sidecar-json/v1",
        exportName: "SidecarJsonV1",
        title: "65 · Sidecar JSON",
        description: "doc.sidecars writes files beside the render — each key becomes {output-basename}.{key}.json. Declared on the template, attached to the document: a file for what comes after m0saic, where a data source is a channel for the next template.",
        tags: ["data", "sidecars", "lesson"],
    },
    {
        slug: "sidecar-text",
        templateId: "@m0saic-starter/data/sidecar-text/v1",
        exportName: "SidecarTextV1",
        title: "66 · Sidecar Text",
        description: "{ kind: \"text\", ext, content } writes the string verbatim, which is how real formats ship. Captions prove the point: burned-in subtitles are pixels, a .vtt beside the video is a track a player can style.",
        tags: ["data", "sidecars", "captions", "lesson"],
    },
];
