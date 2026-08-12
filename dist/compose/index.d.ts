import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";
/**
 * Chapter `compose`, in teaching order (mirrors ./registry.ts).
 *
 * `NestedBadgeV1` ships here for a reason worth knowing: it is `internal`
 * (not a top-level pick), but the host registers whatever this array holds,
 * and `renderNestedTemplate` resolves children BY ID against that registry.
 * Leave it out and compose/nested-template throws.
 */
export declare const composeTemplates: MosaicTemplate<MosaicTemplateProps>[];
export * from "./child-mosaic/v1/child-mosaic";
export * from "./rotate-headroom/v1/rotate-headroom";
export * from "./nested-template/v1/nested-template";
export * from "./nested-badge/v1/nested-badge";
export * from "./camera-follow/v1/camera-follow";
export * from "./theme-provider/v1/theme-provider";
export * from "./theme-tokens/v1/theme-tokens";
export * from "./reduce-to-one/v1/reduce-to-one";
