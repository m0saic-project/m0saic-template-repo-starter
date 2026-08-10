import type { MosaicTextSource } from "@m0saic/types";

import { asDocument, defaultCtx } from "../../../__testutils__/render";
import { HelloWorldV1 } from "./hello-world";

describe("@m0saic-starter/basics/hello-world/v1", () => {
  it("renders one full-canvas tile with the default text", async () => {
    const doc = asDocument(
      await HelloWorldV1.render({ ...HelloWorldV1.defaultProps }, defaultCtx),
    );

    expect(doc.kind).toBe("mosaic_document");
    expect(doc.version).toBe(1);
    // We authored "F", the document carries "1": the canonicalizer reduces
    // every spelling of a full-canvas frame to its canonical form. What you
    // write is a convenience; what ships is always canonical m0.
    expect(doc.m0).toBe("1");
    expect(doc.sources).toHaveLength(1);

    const source = doc.sources?.[0] as MosaicTextSource;
    expect(source.type).toBe("text");
    expect(source.layers[0]?.content).toEqual({
      kind: "literal",
      text: "Hello, m0saic",
    });
  });

  it("renders custom text", async () => {
    const doc = asDocument(await HelloWorldV1.render({ text: "Salut" }, defaultCtx));
    const source = doc.sources?.[0] as MosaicTextSource;
    expect(source.layers[0]?.content).toEqual({ kind: "literal", text: "Salut" });
  });

  it("is deterministic — identical props, identical document", async () => {
    const a = await HelloWorldV1.render({ text: "same" }, defaultCtx);
    const b = await HelloWorldV1.render({ text: "same" }, defaultCtx);
    expect(a).toEqual(b);
  });

  it("fails fast on a malformed color", async () => {
    await expect(
      HelloWorldV1.render({ backgroundColor: "blue" }, defaultCtx),
    ).rejects.toThrow(/backgroundColor .* #rrggbb/);
  });
});
