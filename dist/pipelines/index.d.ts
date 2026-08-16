import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";
/** Chapter `pipelines`, in teaching order (mirrors ./registry.ts). */
export declare const pipelinesTemplates: MosaicTemplate<MosaicTemplateProps>[];
export * from "./two-scenes/v1/two-scenes";
export * from "./fan-out/v1/fan-out";
export * from "./png-sequence/v1/png-sequence";
export * from "./encode-matrix/v1/encode-matrix";
export * from "./ref-mirror/v1/ref-mirror";
export * from "./ref-across-steps/v1/ref-across-steps";
export * from "./ref-reframe/v1/ref-reframe";
export * from "./nested-pipeline/v1/nested-pipeline";
