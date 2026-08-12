import { asDocument, targetCtx } from "../../../__testutils__/render";
import { FitTextV1 } from "./fit-text";

const LONG =
  "Nothing soft-wraps in a text source, so the template measures the glyphs and picks the size itself.";

/** The one svg text layer that carries the copy (source index 1). */
function fitted(doc: { sources?: unknown[] }): { text: string; fontSize: number } {
  const src = (doc.sources ?? [])[1] as {
    layers: { content: { text: string }; style: { fontSize: number } }[];
  };
  return { text: src.layers[0].content.text, fontSize: src.layers[0].style.fontSize };
}

describe("@m0saic-starter/text/fit-text/v1", () => {
  it("fit-block spends LINES; one-line spends SIZE", async () => {
    const block = fitted(
      asDocument(await FitTextV1.render({ copy: LONG, mode: "fit-block" }, targetCtx(1280, 720))),
    );
    const oneLine = fitted(
      asDocument(await FitTextV1.render({ copy: LONG, mode: "one-line" }, targetCtx(1280, 720))),
    );

    expect(block.text).toContain("\n"); // wrapped
    expect(oneLine.text).not.toContain("\n"); // refused to wrap
    // The whole trade in one assertion: refusing to wrap costs font size.
    expect(oneLine.fontSize).toBeLessThan(block.fontSize);
  });

  it("unfitted ignores the box entirely (that is the failure mode)", async () => {
    const wide = fitted(
      asDocument(
        await FitTextV1.render(
          { copy: LONG, mode: "unfitted", boxWidthPct: 100 },
          targetCtx(1280, 720),
        ),
      ),
    );
    const narrow = fitted(
      asDocument(
        await FitTextV1.render(
          { copy: LONG, mode: "unfitted", boxWidthPct: 40 },
          targetCtx(1280, 720),
        ),
      ),
    );
    // Same size at both box widths — nothing measured anything.
    expect(narrow.fontSize).toBe(wide.fontSize);
    expect(narrow.fontSize).toBe(Math.round(720 * 0.1));
    expect(narrow.text).toBe(LONG);
  });

  it("a narrower box shrinks the fitted size (never grows it)", async () => {
    const sizes: number[] = [];
    for (const boxWidthPct of [100, 80, 60, 40]) {
      const doc = asDocument(
        await FitTextV1.render({ copy: LONG, mode: "one-line", boxWidthPct }, targetCtx(1280, 720)),
      );
      sizes.push(fitted(doc).fontSize);
    }
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeLessThanOrEqual(sizes[i - 1]);
    }
    expect(sizes[sizes.length - 1]).toBeLessThan(sizes[0]);
  });

  it("a full-width box drops the side gutters instead of splitting on zero", async () => {
    const full = asDocument(
      await FitTextV1.render({ boxWidthPct: 100 }, targetCtx(1280, 720)),
    );
    const inset = asDocument(
      await FitTextV1.render({ boxWidthPct: 60 }, targetCtx(1280, 720)),
    );
    // 100% has no `-` gutters at all; 60% has one on each side.
    expect(full.m0).not.toContain("-");
    expect(inset.m0).toContain("-");
    // Sources are the same three either way: panel, copy, caption.
    expect(full.sources).toHaveLength(3);
    expect(inset.sources).toHaveLength(3);
  });

  it("reports every bad prop at once", async () => {
    await expect(
      FitTextV1.render(
        { copy: "  ", mode: "shrink" as never, boxWidthPct: 55 },
        targetCtx(1280, 720),
      ),
    ).rejects.toThrow(/copy must not be empty.*mode must be one of.*steps by 10/s);
  });

  it("renders the same document twice for the same inputs", async () => {
    const once = asDocument(await FitTextV1.render({ copy: LONG }, targetCtx(1280, 720)));
    const twice = asDocument(await FitTextV1.render({ copy: LONG }, targetCtx(1280, 720)));
    expect(JSON.stringify(once)).toBe(JSON.stringify(twice));
  });
});
