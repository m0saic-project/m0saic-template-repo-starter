import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { StaticOptionsV1 } from "./static-options/v1/static-options";
import { RowEditorsV1 } from "./row-editors/v1/row-editors";
import { NumberSeriesV1 } from "./number-series/v1/number-series";
import { WeightsV1 } from "./weights/v1/weights";

/** Chapter `controls`, in teaching order (mirrors ./registry.ts). */
export const controlsTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  StaticOptionsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  RowEditorsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  NumberSeriesV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  WeightsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./static-options/v1/static-options";
export * from "./row-editors/v1/row-editors";
export * from "./number-series/v1/number-series";
export * from "./weights/v1/weights";
