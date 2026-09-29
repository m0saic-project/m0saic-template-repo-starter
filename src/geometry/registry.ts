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
  },
  {
    slug: "ratio-vs-absolute",
    templateId: "@m0saic-starter/geometry/ratio-vs-absolute/v1",
    exportName: "RatioVsAbsoluteV1",
  },
  {
    slug: "overlay-stack",
    templateId: "@m0saic-starter/geometry/overlay-stack/v1",
    exportName: "OverlayStackV1",
  },
  {
    slug: "lattice-gutters",
    templateId: "@m0saic-starter/geometry/lattice-gutters/v1",
    exportName: "LatticeGuttersV1",
  },
  {
    slug: "inset-recovery",
    templateId: "@m0saic-starter/geometry/inset-recovery/v1",
    exportName: "InsetRecoveryV1",
  },
  {
    slug: "place-rect-dock",
    templateId: "@m0saic-starter/geometry/place-rect-dock/v1",
    exportName: "PlaceRectDockV1",
  },
  {
    slug: "mask-in-a-cell",
    templateId: "@m0saic-starter/geometry/mask-in-a-cell/v1",
    exportName: "MaskInACellV1",
  },
  {
    slug: "quantization-cures",
    templateId: "@m0saic-starter/geometry/quantization-cures/v1",
    exportName: "QuantizationCuresV1",
  },
];
