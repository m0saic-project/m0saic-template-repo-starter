import type { StarterRegistryEntry } from "../registry-types";
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
export declare const makeRegistry: StarterRegistryEntry[];
