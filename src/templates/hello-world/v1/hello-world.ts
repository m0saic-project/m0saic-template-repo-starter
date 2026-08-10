import type {
    MosaicDocument,
    MosaicEngineContext,
    MosaicSource,
    MosaicTemplate,
  } from "@m0saic/types";
  import { toM0saicString } from "@m0saic/platform";
  import { definePropsSchema, registerTemplate } from "@m0saic/template-utils";
  
  type HelloWorldProps = {
    text: string;
  };
  
  const propsSchema = definePropsSchema<HelloWorldProps>({
    text: {
      type: "string",
      required: true,
      description: "Text to render in the center of the tile.",
      meta: {
        ui: { label: "Text" },
        control: { placeholder: "Hello world" },
      },
    },
  });
  
  export const HelloWorld: MosaicTemplate<HelloWorldProps> = {
    id: "@m0saic-starter/hello-world/v1",
    label: "Hello World",
    version: 1,
    description: "Minimal template: one tile with a text source.",
    capabilities: { tier: "core" },
  
    outputHints: {
      width: 1920,
      height: 1080,
      fps: 30,
      durationMs: 2000,
      format: {
        kind: "video",
        container: "mp4",
        videoCodec: "libx264", //CHANGE TO LGPL-safe default
        pixelFormat: "yuv420p",
        hasAudio: false,
      },
    },
  
    propsSchema,
    defaultProps: { text: "Hello World!" },
  
    async render(props: HelloWorldProps, _ctx: MosaicEngineContext): Promise<MosaicDocument> {
      const sources: MosaicSource[] = [
        {
          type: "text",
          layers: [
            {
              content: { kind: "literal", text: props.text },
              // Keep this minimal; real styling can be added once we lock text style props.
              // If your MosaicTextPlacementProps supports it, these are the usual suspects:
              // placement: { alignX: "center", alignY: "middle", paddingPx: 0 },
            },
          ],
          renderMode: { kind: "image" }, // simplest: still frame stretched to duration by engine
        },
      ];
  
      return {
        kind: "mosaic_document",
        version: 1,
        m0saic: toM0saicString("1", "HelloWorld"),
        config: {
          sources,
          durationMs: 2000,
        },
        children: {},
      };
    },
  };
  
  registerTemplate(HelloWorld);