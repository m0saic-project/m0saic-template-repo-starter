import type { MosaicTextSource } from "@m0saic/types";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { GcdCollapseV1 } from "./gcd-collapse";

function labelTexts(doc: { sources?: unknown[] }): string[] {
  return (doc.sources ?? [])
    .filter((s) => (s as { type?: string }).type === "text")
    .map(
      (s) =>
        ((s as MosaicTextSource).layers[0]?.content as { text?: string }).text ?? "",
    );
}

describe("@m0saic-starter/geometry/gcd-collapse/v1", () => {
  it("renders the literal 100-slot row over the collapsed 4-slot row", async () => {
    const doc = asDocument(await GcdCollapseV1.render({}, targetCtx(1280, 720)));
    expect(doc.m0).toContain("100(");
    expect(doc.m0).toContain("4(1,0,1,1)");
    // 3 fills per row + 2 labels.
    expect(doc.sources).toHaveLength(8);

    const labels = labelTexts(doc);
    expect(labels[0]).toContain("literal: 100 slots");
    expect(labels[1]).toContain("optimized (default): 4 slots");
    for (const label of labels) {
      expect(label).toMatch(/spread \d+(\.\d+)?px/);
    }
  });

  it("measures more spread for the literal row at a hostile width", async () => {
    const doc = asDocument(await GcdCollapseV1.render({}, targetCtx(1031, 720)));
    const spread = (label: string): number =>
      Number(/spread (\d+(?:\.\d+)?)px/.exec(label)?.[1] ?? NaN);
    const [literalLabel, optimizedLabel] = labelTexts(doc);
    expect(spread(literalLabel)).toBeGreaterThan(spread(optimizedLabel));
  });

  it("the optimized string is dramatically shorter for the same proportions", async () => {
    const doc = asDocument(await GcdCollapseV1.render({}, targetCtx(1280, 720)));
    const [literalLabel, optimizedLabel] = labelTexts(doc);
    const chars = (label: string): number =>
      Number(/(\d+) chars/.exec(label)?.[1] ?? NaN);
    expect(chars(literalLabel)).toBeGreaterThan(chars(optimizedLabel) * 5);
  });

  it("already-coprime weights collapse to themselves", async () => {
    const doc = asDocument(
      await GcdCollapseV1.render({ weights: [1, 2, 1] }, targetCtx(1280, 720)),
    );
    const labels = labelTexts(doc);
    // literal [1,2,1] is ALREADY 4 slots — both rows agree.
    expect(labels[0]).toContain("4 slots");
    expect(labels[1]).toContain("4 slots");
  });

  it("fails fast on bad weights", async () => {
    await expect(
      GcdCollapseV1.render({ weights: [1] }, targetCtx(1280, 720)),
    ).rejects.toThrow(/2-6 positive integers/);
    await expect(
      GcdCollapseV1.render({ weights: [1, 0.5] }, targetCtx(1280, 720)),
    ).rejects.toThrow(/2-6 positive integers/);
  });
});
