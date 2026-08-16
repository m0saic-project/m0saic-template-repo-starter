import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { LayoutContractCardV1 } from "./layout-contract-card/v1/layout-contract-card";
import { GeometryContractCardV1 } from "./geometry-contract-card/v1/geometry-contract-card";

/** Chapter `quality`, in teaching order (mirrors ./registry.ts). */
export const qualityTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  LayoutContractCardV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  GeometryContractCardV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./layout-contract-card/v1/layout-contract-card";
export * from "./geometry-contract-card/v1/geometry-contract-card";
