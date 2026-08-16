"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipelinesTemplates = void 0;
const two_scenes_1 = require("./two-scenes/v1/two-scenes");
const fan_out_1 = require("./fan-out/v1/fan-out");
const png_sequence_1 = require("./png-sequence/v1/png-sequence");
const encode_matrix_1 = require("./encode-matrix/v1/encode-matrix");
const ref_mirror_1 = require("./ref-mirror/v1/ref-mirror");
const ref_across_steps_1 = require("./ref-across-steps/v1/ref-across-steps");
const ref_reframe_1 = require("./ref-reframe/v1/ref-reframe");
const nested_pipeline_1 = require("./nested-pipeline/v1/nested-pipeline");
/** Chapter `pipelines`, in teaching order (mirrors ./registry.ts). */
exports.pipelinesTemplates = [
    two_scenes_1.TwoScenesV1,
    fan_out_1.FanOutV1,
    png_sequence_1.PngSequenceV1,
    encode_matrix_1.EncodeMatrixV1,
    ref_mirror_1.RefMirrorV1,
    ref_across_steps_1.RefAcrossStepsV1,
    ref_reframe_1.RefReframeV1,
    nested_pipeline_1.NestedPipelineV1,
];
// `export *` ONLY — see the note in src/basics/index.ts for why the
// `export * from` + named-re-export pairing is a trap.
__exportStar(require("./two-scenes/v1/two-scenes"), exports);
__exportStar(require("./fan-out/v1/fan-out"), exports);
__exportStar(require("./png-sequence/v1/png-sequence"), exports);
__exportStar(require("./encode-matrix/v1/encode-matrix"), exports);
__exportStar(require("./ref-mirror/v1/ref-mirror"), exports);
__exportStar(require("./ref-across-steps/v1/ref-across-steps"), exports);
__exportStar(require("./ref-reframe/v1/ref-reframe"), exports);
__exportStar(require("./nested-pipeline/v1/nested-pipeline"), exports);
