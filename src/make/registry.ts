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
export const makeRegistry: StarterRegistryEntry[] = [
  {
    slug: "prop-bindings",
    templateId: "@m0saic-starter/make/prop-bindings/v1",
    exportName: "PropBindingsV1",
    title: "81 · Prop Bindings",
    description:
      "Provenance: the rect that shows a prop is bound to it, so Make's double-click edits that knob in place - and every bindable kind is on one card. bindProp for free text and a number, bindProps for a header over a subtitle (one rect, two knobs), a colour swatch whose binding opens a picker, bindProp with an index for one element of a string[] or number[], bindPropPath (path AND kind) for string / number / colour leaves of a row list, bindPropRange (line span + focus token) for one line of a multi-line string - plus a closed picker drawn as a chip that gets no pencil on purpose. Which props are bindable is decided once, in the platform; the lesson's test uses the same predicate Make does.",
    tags: ["make", "lesson"],
  },
];
