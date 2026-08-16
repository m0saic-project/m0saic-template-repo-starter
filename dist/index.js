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
exports.TEMPLATE_REPO = exports.TEMPLATE_PACKS = exports.templates = exports.repo = void 0;
const repo_1 = require("./repo");
Object.defineProperty(exports, "TEMPLATE_PACKS", { enumerable: true, get: function () { return repo_1.TEMPLATE_PACKS; } });
Object.defineProperty(exports, "TEMPLATE_REPO", { enumerable: true, get: function () { return repo_1.TEMPLATE_REPO; } });
const basics_1 = require("./basics");
const geometry_1 = require("./geometry");
const props_1 = require("./props");
const media_1 = require("./media");
const text_1 = require("./text");
const masks_1 = require("./masks");
const compose_1 = require("./compose");
const pipelines_1 = require("./pipelines");
const data_1 = require("./data");
const surfaces_1 = require("./surfaces");
exports.repo = repo_1.TEMPLATE_REPO;
/** Every template in the curriculum, chapter by chapter, in teaching order. */
exports.templates = [
    ...basics_1.basicsTemplates,
    ...geometry_1.geometryTemplates,
    ...props_1.propsTemplates,
    ...media_1.mediaTemplates,
    ...text_1.textTemplates,
    ...masks_1.masksTemplates,
    ...compose_1.composeTemplates,
    ...pipelines_1.pipelinesTemplates,
    ...data_1.dataTemplates,
    ...surfaces_1.surfacesTemplates,
];
// Library re-exports for anyone importing this repo as code. `export *`
// only for template modules — see the note in src/basics/index.ts for why
// the `export * from` + named-re-export pairing is a trap. The repo
// descriptors re-export as LOCAL bindings, which is always safe.
__exportStar(require("./basics"), exports);
__exportStar(require("./geometry"), exports);
__exportStar(require("./props"), exports);
__exportStar(require("./media"), exports);
__exportStar(require("./text"), exports);
__exportStar(require("./masks"), exports);
__exportStar(require("./compose"), exports);
__exportStar(require("./pipelines"), exports);
__exportStar(require("./data"), exports);
__exportStar(require("./surfaces"), exports);
