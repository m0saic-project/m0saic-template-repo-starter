import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { StaticOptionsV1 } from "./static-options/v1/static-options";
import { RowEditorsV1 } from "./row-editors/v1/row-editors";
import { NumberSeriesV1 } from "./number-series/v1/number-series";
import { WeightsV1 } from "./weights/v1/weights";
import { GroupFieldsV1 } from "./group-fields/v1/group-fields";
import { RangeV1 } from "./range/v1/range";
import { DrawRegionsV1 } from "./draw-regions/v1/draw-regions";
import { CodeHandoffV1 } from "./code-handoff/v1/code-handoff";
import { M0PropV1 } from "./m0-prop/v1/m0-prop";

/** Chapter `controls`, in teaching order (mirrors ./registry.ts). */
export const controlsTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  StaticOptionsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  RowEditorsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  NumberSeriesV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  WeightsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  GroupFieldsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  RangeV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  DrawRegionsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  CodeHandoffV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  M0PropV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./static-options/v1/static-options";
export * from "./row-editors/v1/row-editors";
export * from "./number-series/v1/number-series";
export * from "./weights/v1/weights";
export * from "./group-fields/v1/group-fields";
export * from "./range/v1/range";
export * from "./draw-regions/v1/draw-regions";
export * from "./code-handoff/v1/code-handoff";
export * from "./m0-prop/v1/m0-prop";
