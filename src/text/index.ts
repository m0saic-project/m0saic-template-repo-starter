import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { TextThreeWaysV1 } from "./text-three-ways/v1/text-three-ways";
import { FitTextV1 } from "./fit-text/v1/fit-text";
import { CountUpV1 } from "./count-up/v1/count-up";
import { CarvedTypeV1 } from "./carved-type/v1/carved-type";

/** Chapter `text`, in teaching order (mirrors ./registry.ts). */
export const textTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  TextThreeWaysV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  FitTextV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  CountUpV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  CarvedTypeV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./text-three-ways/v1/text-three-ways";
export * from "./fit-text/v1/fit-text";
export * from "./count-up/v1/count-up";
export * from "./carved-type/v1/carved-type";
