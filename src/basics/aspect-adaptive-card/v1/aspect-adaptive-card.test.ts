import type { MosaicTextSource } from "@m0saic/types";
import { measureText } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import {
  AspectAdaptiveCardV1,
  fitSvgText,
  wrapMeasured,
} from "./aspect-adaptive-card";

function layerTexts(source: MosaicTextSource): string[] {
  return source.layers.map((l) => (l.content as { text?: string }).text ?? "");
}

describe("@m0saic-starter/basics/aspect-adaptive-card/v1", () => {
  it("lays panels as columns on a landscape target, rows on portrait", async () => {
    const landscape = asDocument(
      await AspectAdaptiveCardV1.render({}, targetCtx(1920, 1080)),
    );
    expect(landscape.m0).toBe("3(1{1},0,1{1})");

    const portrait = asDocument(
      await AspectAdaptiveCardV1.render({}, targetCtx(1080, 1920)),
    );
    expect(portrait.m0).toBe("3[1{1},0,1{1}]");
  });

  it("binds [fillA, textA, fillB, textB] and prints its live decision", async () => {
    const doc = asDocument(
      await AspectAdaptiveCardV1.render({ title: "A", body: "B" }, targetCtx(1280, 720)),
    );
    expect(doc.sources).toHaveLength(4);
    expect(doc.sources?.map((s) => s.type)).toEqual(["lavfi", "text", "lavfi", "text"]);

    expect(layerTexts(doc.sources?.[1] as MosaicTextSource)[0]).toBe("A");
    const bodyTexts = layerTexts(doc.sources?.[3] as MosaicTextSource);
    expect(bodyTexts[0]).toBe("B");
    expect(bodyTexts[1]).toBe("1280x720 -> columns");

    const portrait = asDocument(
      await AspectAdaptiveCardV1.render({ title: "A", body: "B" }, targetCtx(720, 1280)),
    );
    const portraitTexts = layerTexts(portrait.sources?.[3] as MosaicTextSource);
    expect(portraitTexts[1]).toBe("720x1280 -> rows");
  });

  it("uses the svg rasterizer so app and CLI draw the same glyphs", async () => {
    const doc = asDocument(await AspectAdaptiveCardV1.render({}, targetCtx(1280, 720)));
    const textSources = (doc.sources ?? []).filter((s) => s.type === "text");
    expect(textSources.length).toBe(2);
    for (const source of textSources) {
      expect((source as { rasterizer?: string }).rasterizer).toBe("svg");
    }
  });

  it("fits long copy into the panel, measured with the bundled font", async () => {
    const longTitle = "A considerably longer headline that must wrap";
    const doc = asDocument(
      await AspectAdaptiveCardV1.render({ title: longTitle }, targetCtx(1280, 720)),
    );
    const accentText = doc.sources?.[1] as MosaicTextSource;
    const block = layerTexts(accentText)[0] ?? "";
    // Every word preserved, wrapped onto multiple lines.
    expect(block.replace(/\n/g, " ")).toBe(longTitle);
    expect(block.split("\n").length).toBeGreaterThan(1);
    // The measured block genuinely fits the accent panel (1280/3 px wide),
    // inside the deliberate ~28% side-margin budget.
    const fontSize =
      (accentText.layers[0]?.style as { fontSize?: number }).fontSize ?? 0;
    const measured = measureText(block, { fontSize });
    expect(measured.width).toBeLessThanOrEqual((1280 / 3) * 0.72 + 1);
  });

  it("keeps card copy ASCII — the bundled glyph font has no U+2192", async () => {
    const doc = asDocument(await AspectAdaptiveCardV1.render({}, targetCtx(1280, 720)));
    for (const source of doc.sources ?? []) {
      if (source.type !== "text") continue;
      for (const text of layerTexts(source as MosaicTextSource)) {
        expect(text).toMatch(/^[\x20-\x7E\n]*$/);
      }
    }
  });

  it("wrapMeasured never splits a word and preserves order", () => {
    const lines = wrapMeasured("one two three four", 40, 160);
    expect(lines.join(" ")).toBe("one two three four");
    expect(lines.length).toBeGreaterThan(1);
    expect(wrapMeasured("single", 40, 10)).toEqual(["single"]);
  });

  it("fitSvgText shrinks the font as the box narrows", () => {
    const wide = fitSvgText("Reads the room", 800, 400, { maxPx: 96, maxLines: 3 });
    const narrow = fitSvgText("Reads the room", 200, 400, { maxPx: 96, maxLines: 3 });
    expect(wide.fontSize).toBeGreaterThan(narrow.fontSize);
    expect(narrow.fontSize).toBeGreaterThanOrEqual(12);
  });

  it("fails fast on a malformed color", async () => {
    await expect(
      AspectAdaptiveCardV1.render({ accentColor: "teal" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/#rrggbb/);
  });
});
