import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { PropBindingsV1 } from "./prop-bindings/v1/prop-bindings";
import { BoundNumbersV1 } from "./bound-numbers/v1/bound-numbers";
import { CompositeLineV1 } from "./composite-line/v1/composite-line";
import { DeclaredUnboundV1 } from "./declared-unbound/v1/declared-unbound";
import { ArrayRowsV1 } from "./array-rows/v1/array-rows";

/** Chapter `make`, in teaching order (mirrors ./registry.ts). */
export const makeTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  PropBindingsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  BoundNumbersV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  CompositeLineV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  DeclaredUnboundV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  ArrayRowsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./prop-bindings/v1/prop-bindings";
export * from "./bound-numbers/v1/bound-numbers";
export * from "./composite-line/v1/composite-line";
export * from "./declared-unbound/v1/declared-unbound";
export * from "./array-rows/v1/array-rows";
