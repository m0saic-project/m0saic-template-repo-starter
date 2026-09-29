"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipelinesRegistry = void 0;
/**
 * Chapter registry: `pipelines` — array order is the teaching order.
 * Time first (two steps, one file), then the shapes of "more than one
 * deliverable", then refs (mirror → across steps → reframed), and finally a
 * pipeline living inside a tile.
 */
exports.pipelinesRegistry = [
    {
        slug: "two-scenes",
        templateId: "@m0saic-starter/pipelines/two-scenes/v1",
        exportName: "TwoScenesV1",
    },
    {
        slug: "fan-out",
        templateId: "@m0saic-starter/pipelines/fan-out/v1",
        exportName: "FanOutV1",
    },
    {
        slug: "png-sequence",
        templateId: "@m0saic-starter/pipelines/png-sequence/v1",
        exportName: "PngSequenceV1",
    },
    {
        slug: "encode-matrix",
        templateId: "@m0saic-starter/pipelines/encode-matrix/v1",
        exportName: "EncodeMatrixV1",
    },
    {
        slug: "ref-mirror",
        templateId: "@m0saic-starter/pipelines/ref-mirror/v1",
        exportName: "RefMirrorV1",
    },
    {
        slug: "ref-across-steps",
        templateId: "@m0saic-starter/pipelines/ref-across-steps/v1",
        exportName: "RefAcrossStepsV1",
    },
    {
        slug: "ref-reframe",
        templateId: "@m0saic-starter/pipelines/ref-reframe/v1",
        exportName: "RefReframeV1",
    },
    {
        slug: "nested-pipeline",
        templateId: "@m0saic-starter/pipelines/nested-pipeline/v1",
        exportName: "NestedPipelineV1",
    },
];
