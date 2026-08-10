import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { GcdCollapseV1 } from "./gcd-collapse/v1/gcd-collapse";
import { RatioVsAbsoluteV1 } from "./ratio-vs-absolute/v1/ratio-vs-absolute";
import { OverlayStackV1 } from "./overlay-stack/v1/overlay-stack";
import { LatticeGuttersV1 } from "./lattice-gutters/v1/lattice-gutters";
import { InsetRecoveryV1 } from "./inset-recovery/v1/inset-recovery";
import { PlaceRectDockV1 } from "./place-rect-dock/v1/place-rect-dock";
import { MaskInACellV1 } from "./mask-in-a-cell/v1/mask-in-a-cell";
import { QuantizationCuresV1 } from "./quantization-cures/v1/quantization-cures";

/** Chapter `geometry`, in teaching order (mirrors ./registry.ts). */
export const geometryTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  GcdCollapseV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  RatioVsAbsoluteV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  OverlayStackV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  LatticeGuttersV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  InsetRecoveryV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  PlaceRectDockV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  MaskInACellV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  QuantizationCuresV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./gcd-collapse/v1/gcd-collapse";
export * from "./ratio-vs-absolute/v1/ratio-vs-absolute";
export * from "./overlay-stack/v1/overlay-stack";
export * from "./lattice-gutters/v1/lattice-gutters";
export * from "./inset-recovery/v1/inset-recovery";
export * from "./place-rect-dock/v1/place-rect-dock";
export * from "./mask-in-a-cell/v1/mask-in-a-cell";
export * from "./quantization-cures/v1/quantization-cures";
