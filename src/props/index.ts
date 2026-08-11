import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { TypedPropsTourV1 } from "./typed-props-tour/v1/typed-props-tour";
import { SeededShuffleV1 } from "./seeded-shuffle/v1/seeded-shuffle";
import { ColorPropsV1 } from "./color-props/v1/color-props";
import { JsonDataPropV1 } from "./json-data-prop/v1/json-data-prop";
import { ControlGalleryV1 } from "./control-gallery/v1/control-gallery";
import { ErrorMosaicV1 } from "./error-mosaic/v1/error-mosaic";

/** Chapter `props`, in teaching order (mirrors ./registry.ts). */
export const propsTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  TypedPropsTourV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  SeededShuffleV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  ColorPropsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  JsonDataPropV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  ControlGalleryV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  ErrorMosaicV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./typed-props-tour/v1/typed-props-tour";
export * from "./seeded-shuffle/v1/seeded-shuffle";
export * from "./color-props/v1/color-props";
export * from "./json-data-prop/v1/json-data-prop";
export * from "./control-gallery/v1/control-gallery";
export * from "./error-mosaic/v1/error-mosaic";
