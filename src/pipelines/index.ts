import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { TwoScenesV1 } from "./two-scenes/v1/two-scenes";
import { FanOutV1 } from "./fan-out/v1/fan-out";
import { PngSequenceV1 } from "./png-sequence/v1/png-sequence";
import { EncodeMatrixV1 } from "./encode-matrix/v1/encode-matrix";
import { RefMirrorV1 } from "./ref-mirror/v1/ref-mirror";
import { RefAcrossStepsV1 } from "./ref-across-steps/v1/ref-across-steps";
import { RefReframeV1 } from "./ref-reframe/v1/ref-reframe";
import { NestedPipelineV1 } from "./nested-pipeline/v1/nested-pipeline";

/** Chapter `pipelines`, in teaching order (mirrors ./registry.ts). */
export const pipelinesTemplates: MosaicTemplate<MosaicTemplateProps>[] = [
  TwoScenesV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  FanOutV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  PngSequenceV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  EncodeMatrixV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  RefMirrorV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  RefAcrossStepsV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  RefReframeV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
  NestedPipelineV1 as unknown as MosaicTemplate<MosaicTemplateProps>,
];

// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
export * from "./two-scenes/v1/two-scenes";
export * from "./fan-out/v1/fan-out";
export * from "./png-sequence/v1/png-sequence";
export * from "./encode-matrix/v1/encode-matrix";
export * from "./ref-mirror/v1/ref-mirror";
export * from "./ref-across-steps/v1/ref-across-steps";
export * from "./ref-reframe/v1/ref-reframe";
export * from "./nested-pipeline/v1/nested-pipeline";
