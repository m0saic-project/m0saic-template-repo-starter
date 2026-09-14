"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicsRegistry = void 0;
/**
 * Chapter registry: `basics` — array order is the teaching order.
 */
exports.basicsRegistry = [
    {
        slug: "hello-world",
        templateId: "@m0saic-starter/basics/hello-world/v1",
        exportName: "HelloWorldV1",
        title: "01 · Hello World",
        description: "The canonical m0saic hello-world card with this repo's subline: the brand field wipes in, a navy card rises, the M assembles from its own rectangles, then the wordmark and your greeting. The repo's front door — what `m0saic hello-world --template-repo .` renders.",
        tags: ["basics", "starter", "brand", "hello"],
    },
    {
        slug: "anatomy",
        templateId: "@m0saic-starter/basics/anatomy/v1",
        exportName: "AnatomyV1",
        title: "02 · Anatomy",
        description: "The smallest correct template, written by hand: the pixel-M in a square cell over a greeting, typed props with deterministic defaults, and a validated m0 string. Every part of a template, visible. The repo's smoke render.",
        tags: ["basics", "starter", "brand"],
    },
    {
        slug: "hot-reload-canary",
        templateId: "@m0saic-starter/basics/hot-reload-canary/v1",
        exportName: "HotReloadCanaryV1",
        title: "03 · Hot-Reload Canary",
        description: "Prove your edit loop: the fill comes from a module CONSTANT, so a rebuild + Refresh repos must change it — no app restart, no prop-bag tricks.",
        tags: ["basics", "starter", "smoke"],
    },
    {
        slug: "color-tiles",
        templateId: "@m0saic-starter/basics/color-tiles/v1",
        exportName: "ColorTilesV1",
        title: "04 · Color Tiles",
        description: "Three equal columns, one makeColorTile each — the sources[]-to-tiles mapping, the lavfi color-tile convention, and document.backgroundColor over a wasted base layer.",
        tags: ["basics", "layout", "color"],
    },
    {
        slug: "aspect-adaptive-card",
        templateId: "@m0saic-starter/basics/aspect-adaptive-card/v1",
        exportName: "AspectAdaptiveCardV1",
        title: "05 · Aspect-Adaptive Card",
        description: "One template, every aspect: reads ctx.target and flips columns to rows on portrait. Size off ctx.target, never ctx.output — the rule that prevents the classic nested-render bug.",
        tags: ["basics", "ctx", "layout"],
    },
];
