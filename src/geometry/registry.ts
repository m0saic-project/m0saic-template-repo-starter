import type { StarterRegistryEntry } from "../registry-types";

/**
 * Chapter registry: `geometry` — array order is the teaching order.
 * The arc: collapse quantization → choose a drafting mode → layering →
 * the three precision tools (lattice gutters, inset recovery, placeRect)
 * → masks as fiber → and the capstone: the quantization disease with
 * every cure in the toolbox, one enum apart.
 *
 * (Learn owns what the interactive editor teaches better: the
 * feasibility/precision floors lesson, null-token gutters, the
 * outside-in remainder rule for equal splits — capped at ±1px per tile
 * by construction, live on ANY typed m0 via the "Show dimensions"
 * toggle — and passthrough donation, which Learn > Frame Types teaches
 * by converting tiles with the `>` key; gcd-collapse's tutorial keeps
 * the one-line run-reading key in this repo. This repo teaches the
 * TypeScript authoring loop; Learn teaches thinking in m0.)
 */
export const geometryRegistry: StarterRegistryEntry[] = [
  {
    slug: "gcd-collapse",
    templateId: "@m0saic-starter/geometry/gcd-collapse/v1",
    exportName: "GcdCollapseV1",
    title: "06 · GCD Collapse",
    description:
      "Two pixel-identical rows from the same weights: literal keeps 100 slots, the default optimized mode collapses to 4. Same look, fraction of the string.",
    tags: ["geometry", "quantization", "lesson"],
  },
  {
    slug: "ratio-vs-absolute",
    templateId: "@m0saic-starter/geometry/ratio-vs-absolute/v1",
    exportName: "RatioVsAbsoluteV1",
    title: "07 · Ratio vs Absolute",
    description:
      "The same 1:2:1 spelled as a ratio split (recomposes anywhere) and as placeRects (exact pixels, baked to THIS canvas). Identical render, opposite promises.",
    tags: ["geometry", "drafting-modes", "lesson"],
  },
  {
    slug: "overlay-stack",
    templateId: "@m0saic-starter/geometry/overlay-stack/v1",
    exportName: "OverlayStackV1",
    title: "08 · Overlay Stack",
    description:
      "1{3[-,1{1},-]}: base, band on its overlay, badge on the band's overlay. Overlays restore their node's whole rect and paint after it.",
    tags: ["geometry", "overlay", "lesson"],
  },
  {
    slug: "lattice-gutters",
    templateId: "@m0saic-starter/geometry/lattice-gutters/v1",
    exportName: "LatticeGuttersV1",
    title: "09 · Lattice Gutters",
    description:
      "Base × fiber: a plain gutterless grid as the m0, pixel-exact gutters computed into per-cell placement insets by latticeCellInset. Exact at every canvas, zero DSL cost.",
    tags: ["geometry", "gutters", "lesson"],
  },
  {
    slug: "inset-recovery",
    templateId: "@m0saic-starter/geometry/inset-recovery/v1",
    exportName: "InsetRecoveryV1",
    title: "10 · Inset Recovery",
    description:
      "Exact pixels that survive nesting: placeInsetPieces keeps the string coarse (precision bounded at the lattice basis) while placement.inset recovers every chip byte-exact. The caption prints the precision floor placeRects would bake instead — the cost a parent inherits.",
    tags: ["geometry", "precision", "lesson"],
  },
  {
    slug: "place-rect-dock",
    templateId: "@m0saic-starter/geometry/place-rect-dock/v1",
    exportName: "PlaceRectDockV1",
    title: "11 · PlaceRect Dock",
    description:
      "One pixel-exact rect docked bottom-right via placeRect — margins are null tiles, nothing quantizes into your rect. Head-only: the string bakes THIS canvas.",
    tags: ["geometry", "placement", "lesson"],
  },
  {
    slug: "mask-in-a-cell",
    templateId: "@m0saic-starter/geometry/mask-in-a-cell/v1",
    exportName: "MaskInACellV1",
    title: "12 · Mask in a Cell",
    description:
      "A diamond as a masked color tile in a plain ratio cell. Mask bounds scale onto the cell per axis — match their aspect or the shape silently smears.",
    tags: ["geometry", "masks", "lesson"],
  },
  {
    slug: "quantization-cures",
    templateId: "@m0saic-starter/geometry/quantization-cures/v1",
    exportName: "QuantizationCuresV1",
    title: "13 · Quantization: Three Cures",
    description:
      "The capstone: one 12×3 gridded design through four spellings — naive ratio gutters that wobble N/N+1 px, then inset recovery, snapGrid, and placeRects. Flip the Method enum, watch the lines even out, read the receipts.",
    tags: ["geometry", "quantization", "lesson"],
  },
];
