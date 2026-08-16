import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { RenderLiteV1 } from "./render-lite/v1/render-lite";
import { RenderCoverV1 } from "./render-cover/v1/render-cover";
import { RenderTutorialV1 } from "./render-tutorial/v1/render-tutorial";

/** Chapter `surfaces`, in teaching order (mirrors ./registry.ts). */
export const surfacesTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  RenderLiteV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  RenderCoverV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  RenderTutorialV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./render-lite/v1/render-lite";
export * from "./render-cover/v1/render-cover";
export * from "./render-tutorial/v1/render-tutorial";
