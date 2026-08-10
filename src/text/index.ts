import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { TextThreeWaysV1 } from "./text-three-ways/v1/text-three-ways";

/** Chapter `text`, in teaching order (mirrors ./registry.ts). */
export const textTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  TextThreeWaysV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./text-three-ways/v1/text-three-ways";
