"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateRegistry = exports.CHAPTERS = void 0;
const registry_1 = require("./basics/registry");
const registry_2 = require("./geometry/registry");
const registry_3 = require("./props/registry");
const registry_4 = require("./media/registry");
const registry_5 = require("./text/registry");
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
];
/** Flat view over every chapter, in curriculum order. */
exports.templateRegistry = exports.CHAPTERS.flatMap((chapter) => chapter.entries);
