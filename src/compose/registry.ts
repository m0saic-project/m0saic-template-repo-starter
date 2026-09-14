import type { StarterRegistryEntry } from "../registry-types";

/**
 * Chapter registry: `compose` — array order is the teaching order.
 * Documents inside documents first, then what that buys you: headroom for
 * effects, calling other templates, a camera over a space you own, a palette
 * from upstream, and finally the refactor the whole chapter enables.
 */
export const composeRegistry: StarterRegistryEntry[] = [
  {
    slug: "child-mosaic",
    templateId: "@m0saic-starter/compose/child-mosaic/v1",
    exportName: "ChildMosaicV1",
    title: "47 · Child Mosaic",
    description:
      "A complete document rendered inside one tile: children + a {type:\"mosaic\", ref} source, evaluated bottom-up. The child's grid grows while the parent's m0 stays two cells — and a procedural child keeps its aspect only if it declares its own size.",
    tags: ["compose", "children", "lesson"],
  },
  {
    slug: "rotate-headroom",
    templateId: "@m0saic-starter/compose/rotate-headroom/v1",
    exportName: "RotateHeadroomV1",
    title: "48 · Rotate Headroom",
    description:
      "effects.rotate spins content inside a buffer that never grows, so corners clip. The cure isn't a bigger inset — it's a child whose declared size is the rotated bounding box, carrying the rotation instead.",
    tags: ["compose", "effects", "lesson"],
  },
  {
    slug: "nested-template",
    templateId: "@m0saic-starter/compose/nested-template/v1",
    exportName: "NestedTemplateV1",
    title: "49 · Nested Template",
    description:
      "renderNestedTemplate calls another registered template and returns a document to drop into children. The slot option is the lesson: hand the child its real pixel box and it lays itself out for that box instead of for your canvas.",
    tags: ["compose", "children", "lesson"],
  },
  {
    slug: "nested-badge",
    templateId: "@m0saic-starter/compose/nested-badge/v1",
    exportName: "NestedBadgeV1",
    title: "50 · Nested Badge (internal)",
    description:
      "The child half of compose/nested-template: a badge that sizes everything off ctx.target, so it fills whatever slot the caller gives it. Marked internal — not a top-level pick, but it renders standalone, which is how you debug a child.",
    tags: ["compose", "internal", "lesson"],
  },
  {
    slug: "camera-follow",
    templateId: "@m0saic-starter/compose/camera-follow/v1",
    exportName: "CameraFollowV1",
    title: "51 · Camera Follow",
    description:
      "A keyframed camera walk described as rects and times: followCamera turns targets into per-frame focus expressions over a child mosaic's own coordinate space, with an optional pull-back — and viewport rects showing exactly what each settle will frame.",
    tags: ["compose", "camera", "animation", "lesson"],
  },
  {
    slug: "theme-provider",
    templateId: "@m0saic-starter/compose/theme-provider/v1",
    exportName: "ThemeProviderV1",
    title: "52 · Theme Provider",
    description:
      "The PRODUCER half of theming: publishTheme(tokens, { alias }) emits a data source carrying a token set, and every downstream template reading that alias picks it up. One mode prop re-skins the whole chain.",
    tags: ["compose", "theming", "producer", "lesson"],
  },
  {
    slug: "theme-tokens",
    templateId: "@m0saic-starter/compose/theme-tokens/v1",
    exportName: "ThemeTokensV1",
    title: "53 · Theme Tokens",
    description:
      "The CONSUMER half of theming, and the three places tokens come from: local constants, a pipeline producer on ctx.upstreamData, or a provider called by id right here. applyTheme overlays whatever arrived, per key.",
    tags: ["compose", "theming", "lesson"],
  },
  {
    slug: "reduce-to-one",
    templateId: "@m0saic-starter/compose/reduce-to-one/v1",
    exportName: "ReduceToOneV1",
    title: "54 · Reduce to One",
    description:
      "The same grid spelled two ways: inline (the parent's m0 grows with the density) or pushed into a child (the parent stays one cell). Identical pixels, with both string lengths printed so the refactor is a number.",
    tags: ["compose", "complexity", "lesson"],
  },
];
