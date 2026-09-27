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
  {
    slug: "bound-numbers",
    templateId: "@m0saic-starter/make/bound-numbers/v1",
    exportName: "BoundNumbersV1",
    title: "82 · Bound Numbers",
    description:
      "The numeral you draw is a handle. Three numbers, three honest spellings - 12,480 (toLocaleString), $3.50 (toFixed), 2026 (String) - each bound to the rect that shows it, plus a derived total that is not a prop and needs no binding. The bindingsCover numbers rule reads exactly these spellings, on a digit boundary.",
    tags: ["make", "lesson"],
  },
  {
    slug: "composite-line",
    templateId: "@m0saic-starter/make/composite-line/v1",
    exportName: "CompositeLineV1",
    title: "83 · Composite Line",
    description:
      "One rect drawing two props - \"@handle - 2026 on GitHub\" - keeps BOTH handles with bindProps; a second bindProp would replace the first. The same line shown split, one rect per prop, as the other correct form.",
    tags: ["make", "lesson"],
  },
  {
    slug: "declared-unbound",
    templateId: "@m0saic-starter/make/declared-unbound/v1",
    exportName: "DeclaredUnboundV1",
    title: "84 · Declared Unbound",
    description:
      "What a compliant NON-binding looks like: one bound label beside five accountable props that no rect shows - columns, gap, seed, padding, accent - each named in bindings.unbound with its reason, and a page colour that needs nothing because it IS the document background.",
    tags: ["make", "lesson"],
  },
  {
    slug: "array-rows",
    templateId: "@m0saic-starter/make/array-rows/v1",
    exportName: "ArrayRowsV1",
    title: "85 · Array Rows",
    description:
      "A type \"array\" prop, declared plainly and edited as rows: flavor objectRows + columns in the panel, and on the canvas every cell is a leaf handle - bindPropPath with a path AND a kind, onClear removing the row, and the empty last row bound as the add handle.",
    tags: ["make", "lesson"],
  },
];
