import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { LayoutContractCardV1 } from "./layout-contract-card/v1/layout-contract-card";
import { GeometryContractCardV1 } from "./geometry-contract-card/v1/geometry-contract-card";
import { BelowTheFloorV1 } from "./below-the-floor/v1/below-the-floor";
import { WhyTheFloorsCrossV1 } from "./why-the-floors-cross/v1/why-the-floors-cross";

/** Chapter `quality`, in teaching order (mirrors ./registry.ts). */
export const qualityTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  LayoutContractCardV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  GeometryContractCardV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  BelowTheFloorV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  WhyTheFloorsCrossV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./layout-contract-card/v1/layout-contract-card";
export * from "./geometry-contract-card/v1/geometry-contract-card";
export * from "./below-the-floor/v1/below-the-floor";
export * from "./why-the-floors-cross/v1/why-the-floors-cross";
