"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRegistry = void 0;
/**
 * Chapter registry: `make` — array order is the teaching order.
 *
 * What Make does with a template once it loads: the handshake between the
 * rects a template draws and the knobs in its panel. The chapter opens with
 * PROVENANCE — a rect that displays a prop is BOUND to it, and Make derives
 * "double-click this rect -> edit that knob" from the binding on every
 * render. The per-render `stableKey` is output; the binding is authored.
 *
 * The build gate enforces the chapter's rule on the whole repo: a binding
 * that names a prop the schema does not have (or cannot bind) FAILS the
 * build (`bindingsSound`); a free-text prop drawn but never bound is a
 * warning (`bindingsCover`, "bind what you show").
 */
exports.makeRegistry = [
    {
        slug: "prop-bindings",
        templateId: "@m0saic-starter/make/prop-bindings/v1",
        exportName: "PropBindingsV1",
    },
    {
        slug: "bound-numbers",
        templateId: "@m0saic-starter/make/bound-numbers/v1",
        exportName: "BoundNumbersV1",
    },
    {
        slug: "composite-line",
        templateId: "@m0saic-starter/make/composite-line/v1",
        exportName: "CompositeLineV1",
    },
    {
        slug: "declared-unbound",
        templateId: "@m0saic-starter/make/declared-unbound/v1",
        exportName: "DeclaredUnboundV1",
    },
    {
        slug: "array-rows",
        templateId: "@m0saic-starter/make/array-rows/v1",
        exportName: "ArrayRowsV1",
    },
];
