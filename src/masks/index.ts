import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { ShapeMasksV1 } from "./shape-masks/v1/shape-masks";
import { PathMaskV1 } from "./path-mask/v1/path-mask";

/** Chapter `masks`, in teaching order (mirrors ./registry.ts). */
export const masksTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  ShapeMasksV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  PathMaskV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./shape-masks/v1/shape-masks";
export * from "./path-mask/v1/path-mask";
