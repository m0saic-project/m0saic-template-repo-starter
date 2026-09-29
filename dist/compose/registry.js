"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeRegistry = void 0;
/**
 * Chapter registry: `compose` — array order is the teaching order.
 * Documents inside documents first, then what that buys you: headroom for
 * effects, calling other templates, a camera over a space you own, a palette
 * from upstream, and finally the refactor the whole chapter enables.
 */
exports.composeRegistry = [
    {
        slug: "child-mosaic",
        templateId: "@m0saic-starter/compose/child-mosaic/v1",
        exportName: "ChildMosaicV1",
    },
    {
        slug: "rotate-headroom",
        templateId: "@m0saic-starter/compose/rotate-headroom/v1",
        exportName: "RotateHeadroomV1",
    },
    {
        slug: "nested-template",
        templateId: "@m0saic-starter/compose/nested-template/v1",
        exportName: "NestedTemplateV1",
    },
    {
        slug: "nested-badge",
        templateId: "@m0saic-starter/compose/nested-badge/v1",
        exportName: "NestedBadgeV1",
    },
    {
        slug: "camera-follow",
        templateId: "@m0saic-starter/compose/camera-follow/v1",
        exportName: "CameraFollowV1",
    },
    {
        slug: "theme-provider",
        templateId: "@m0saic-starter/compose/theme-provider/v1",
        exportName: "ThemeProviderV1",
    },
    {
        slug: "theme-tokens",
        templateId: "@m0saic-starter/compose/theme-tokens/v1",
        exportName: "ThemeTokensV1",
    },
    {
        slug: "reduce-to-one",
        templateId: "@m0saic-starter/compose/reduce-to-one/v1",
        exportName: "ReduceToOneV1",
    },
];
