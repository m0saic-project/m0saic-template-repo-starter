import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicTextLayer,
  MosaicTextSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  solidBackground,
} from "@m0saic/template-utils";

/**
 * `@m0saic-starter/basics/hello-world/v1` — the smallest correct template.
 *
 * ONE CONCEPT: the anatomy of a m0saic template. Everything else in this
 * repo is a variation on the five parts you see here:
 *
 *   1. A typed props surface (`definePropsSchema`) where every optional prop
 *      has a deterministic default — same inputs, same output, always.
 *   2. An id, minted with `asTemplateId`, that encodes repo/pack/slug/version.
 *   3. `outputHints` — the SUGGESTED canvas. The host may render any size;
 *      hints are what the app preselects, not a promise you can rely on.
 *   4. A `render(props, ctx)` that returns a `MosaicDocument`: an `m0` layout
 *      string plus `sources[]` that fill its tiles in order.
 *   5. The m0 string branded through `toM0String(...)` — it canonicalizes
 *      and VALIDATES, throwing on a malformed string instead of failing
 *      later, mysteriously, at render time.
 *
 * The layout is `F`: one full-canvas rect. One tile → one source → the text.
 * This template is deliberately static, so it never reads `ctx` — the first
 * template that must (sizing off `ctx.target`) is
 * `@m0saic-starter/basics/aspect-adaptive-card/v1`, two lessons from here.
 */

export type HelloWorldProps = {
  /** The line of text in the middle of the canvas. */
  text?: string;
  /** Canvas fill (#rrggbb). */
  backgroundColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;

const propsSchema = definePropsSchema<HelloWorldProps>({
  text: {
    type: "string",
    required: false,
    description: "Text rendered in the center of the canvas.",
    meta: { control: { placeholder: "Hello, m0saic" } },
  },
  backgroundColor: {
    type: "string",
    required: false,
    description: "Canvas fill as #rrggbb.",
    // Color props declare themselves: `isColor` + `colorPicker` gives the
    // app a real swatch control instead of a bare text field.
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Background" },
    },
  },
});

export const HelloWorldV1 = defineMosaicTemplate<HelloWorldProps>({
  id: asTemplateId("@m0saic-starter/basics/hello-world/v1"),
  label: "Hello World",
  version: 1,
  description:
    "The smallest correct template: one full-canvas tile, one text source, a typed props surface with deterministic defaults, and a validated m0 string. Start here.",
  capabilities: { tier: "core" },
  tags: ["basics", "starter", "text"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Static content — any canvas and any duration render cleanly.",
  },

  propsSchema,
  defaultProps: {
    text: "Hello, m0saic",
    backgroundColor: "#1c2833",
  },

  async render(
    props: HelloWorldProps,
    _ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    // Fail fast on bad input rather than rendering something misleading.
    // The props schema above is DOCUMENTATION — hosts can (and the CLI does)
    // call render() directly with a raw props bag, so render() is the gate.
    if (
      props.backgroundColor !== undefined &&
      !HEX.test(props.backgroundColor)
    ) {
      throw new Error(
        `@m0saic-starter/basics/hello-world/v1: backgroundColor ` +
          `${JSON.stringify(props.backgroundColor)} must be a #rrggbb hex color.`,
      );
    }

    const text = props.text ?? "Hello, m0saic";
    const fill = (props.backgroundColor ?? "#1c2833") as MosaicColor;

    // One layer, no `placement`: hAlign defaults to "center" and vAlign to
    // "middle", so the text centers itself in its tile.
    const layers: MosaicTextLayer[] = [
      {
        content: { kind: "literal", text },
        style: { fontSize: 72, fontColor: "#ffffff" as MosaicColor },
      },
    ];

    return {
      kind: "mosaic_document",
      version: 1,
      // "F" = one full-canvas rect — the simplest possible m0 string.
      m0: toM0String("F", "@m0saic-starter/basics/hello-world/v1"),
      assets: {},
      sources: [
        {
          type: "text",
          visual: { backgroundColor: solidBackground(fill) },
          layers,
        } as MosaicTextSource,
      ],
    };
  },
});

export default HelloWorldV1;
