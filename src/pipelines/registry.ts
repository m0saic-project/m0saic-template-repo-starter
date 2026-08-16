import type { StarterRegistryEntry } from "../registry-types";

/**
 * Chapter registry: `pipelines` — array order is the teaching order.
 * Time first (two steps, one file), then the shapes of "more than one
 * deliverable", then refs (mirror → across steps → reframed), and finally a
 * pipeline living inside a tile.
 */
export const pipelinesRegistry: StarterRegistryEntry[] = [
  {
    slug: "two-scenes",
    templateId: "@m0saic-starter/pipelines/two-scenes/v1",
    exportName: "TwoScenesV1",
    title: "42 · Two Scenes",
    description:
      "The smallest pipeline: two documents concatenated into one file. A step IS a document (own m0, own canvas, own exact durationMs), and a d-ms transition OVERLAPS them — the output is A + B − d.",
    tags: ["pipelines", "time", "lesson"],
  },
  {
    slug: "fan-out",
    templateId: "@m0saic-starter/pipelines/fan-out/v1",
    exportName: "FanOutV1",
    title: "43 · Fan Out",
    description:
      "emit:\"multi\" writes one file per output step, each at its own canvas — the only way one template delivers several geometries. The variants re-LAY OUT rather than scaling.",
    tags: ["pipelines", "multi-output", "lesson"],
  },
  {
    slug: "png-sequence",
    templateId: "@m0saic-starter/pipelines/png-sequence/v1",
    exportName: "PngSequenceV1",
    title: "44 · PNG Sequence",
    description:
      "A frame sequence is emit:\"multi\" where every step is an image. Files land as {base}-{step.name}.png, so zero-padded names are the template's job — the engine only guarantees the name it was given.",
    tags: ["pipelines", "multi-output", "lesson"],
  },
  {
    slug: "encode-matrix",
    templateId: "@m0saic-starter/pipelines/encode-matrix/v1",
    exportName: "EncodeMatrixV1",
    title: "45 · Encode Matrix",
    description:
      "One render, many deliverables, no pipeline: `encodes` declares post-render transcode passes off a single master. Codec, container, even size (as a stretching scale pass) — never fps, duration or layout.",
    tags: ["pipelines", "encodes", "lesson"],
  },
  {
    slug: "ref-mirror",
    templateId: "@m0saic-starter/pipelines/ref-mirror/v1",
    exportName: "RefMirrorV1",
    title: "46 · Ref Mirror",
    description:
      "A ref source mirrors another cell's rendered pixels by flattenedStableKey: the target renders once and every mirror decorates its own copy. N mirrors, one decode.",
    tags: ["pipelines", "refs", "lesson"],
  },
  {
    slug: "ref-across-steps",
    templateId: "@m0saic-starter/pipelines/ref-across-steps/v1",
    exportName: "RefAcrossStepsV1",
    title: "47 · Ref Across Steps",
    description:
      "A ref with stepIndex is a BACK-EDGE: a later step shows an earlier step's exact pixels, no re-render. Back-edges only, plus the handoff idiom where the producer self-stamps its own coordinates.",
    tags: ["pipelines", "refs", "lesson"],
  },
  {
    slug: "ref-reframe",
    templateId: "@m0saic-starter/pipelines/ref-reframe/v1",
    exportName: "RefReframeV1",
    title: "48 · Ref Reframe",
    description:
      "A mirror whose slot differs in shape and length: placement.fit reframes the pixels, playback.loopMode fills the tail. Nothing is re-rendered — one intermediate, per-consumer decoration.",
    tags: ["pipelines", "refs", "lesson"],
  },
  {
    slug: "nested-pipeline",
    templateId: "@m0saic-starter/pipelines/nested-pipeline/v1",
    exportName: "NestedPipelineV1",
    title: "49 · Nested Pipeline",
    description:
      "A children entry may be a PIPELINE: it renders first and the parent consumes its stitched output as one tile. The slot's duration and canvas win, emit:\"multi\" downgrades, and loopMode fills any shortfall.",
    tags: ["pipelines", "children", "lesson"],
  },
];
