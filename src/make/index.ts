import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { PropBindingsV1 } from "./prop-bindings/v1/prop-bindings";

/** Chapter `make`, in teaching order (mirrors ./registry.ts). */
export const makeTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  PropBindingsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./prop-bindings/v1/prop-bindings";
