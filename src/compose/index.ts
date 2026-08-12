import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { ChildMosaicV1 } from "./child-mosaic/v1/child-mosaic";
import { RotateHeadroomV1 } from "./rotate-headroom/v1/rotate-headroom";
import { NestedTemplateV1 } from "./nested-template/v1/nested-template";
import { NestedBadgeV1 } from "./nested-badge/v1/nested-badge";
import { CameraFollowV1 } from "./camera-follow/v1/camera-follow";
import { ThemeProviderV1 } from "./theme-provider/v1/theme-provider";
import { ThemeTokensV1 } from "./theme-tokens/v1/theme-tokens";
import { ReduceToOneV1 } from "./reduce-to-one/v1/reduce-to-one";

/**
 * Chapter `compose`, in teaching order (mirrors ./registry.ts).
 *
 * `NestedBadgeV1` ships here for a reason worth knowing: it is `internal`
 * (not a top-level pick), but the host registers whatever this array holds,
 * and `renderNestedTemplate` resolves children BY ID against that registry.
 * Leave it out and compose/nested-template throws.
 */
export const composeTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  ChildMosaicV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  RotateHeadroomV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  NestedTemplateV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  NestedBadgeV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  CameraFollowV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  ThemeProviderV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  ThemeTokensV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  ReduceToOneV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./child-mosaic/v1/child-mosaic";
export * from "./rotate-headroom/v1/rotate-headroom";
export * from "./nested-template/v1/nested-template";
export * from "./nested-badge/v1/nested-badge";
export * from "./camera-follow/v1/camera-follow";
export * from "./theme-provider/v1/theme-provider";
export * from "./theme-tokens/v1/theme-tokens";
export * from "./reduce-to-one/v1/reduce-to-one";
