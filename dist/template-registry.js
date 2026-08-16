"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateRegistry = exports.CHAPTERS = void 0;
const registry_1 = require("./basics/registry");
const registry_2 = require("./geometry/registry");
const registry_3 = require("./props/registry");
const registry_4 = require("./media/registry");
const registry_5 = require("./text/registry");
const registry_6 = require("./masks/registry");
const registry_7 = require("./compose/registry");
const registry_8 = require("./pipelines/registry");
const registry_9 = require("./data/registry");
const registry_10 = require("./surfaces/registry");
const registry_11 = require("./quality/registry");
/**
 * The whole curriculum, chapter by chapter. ORDER IS THE CURRICULUM —
 * chapters here follow TEMPLATE_PACKS (src/repo.ts), and each chapter's
 * entries follow that chapter's teaching order. The manifest generator
 * flattens this verbatim into template-manifest.json, so what you read in
 * CURRICULUM.md, what the app lists, and what this file says can't drift
 * from each other (tools/check-deps.mjs lints the triangle).
 */
exports.CHAPTERS = [
    { pack: "basics", entries: registry_1.basicsRegistry },
    { pack: "geometry", entries: registry_2.geometryRegistry },
    { pack: "props", entries: registry_3.propsRegistry },
    { pack: "media", entries: registry_4.mediaRegistry },
    { pack: "text", entries: registry_5.textRegistry },
    { pack: "masks", entries: registry_6.masksRegistry },
    { pack: "compose", entries: registry_7.composeRegistry },
    { pack: "pipelines", entries: registry_8.pipelinesRegistry },
    { pack: "data", entries: registry_9.dataRegistry },
    { pack: "surfaces", entries: registry_10.surfacesRegistry },
    { pack: "quality", entries: registry_11.qualityRegistry },
];
/** Flat view over every chapter, in curriculum order. */
exports.templateRegistry = exports.CHAPTERS.flatMap((chapter) => chapter.entries);
