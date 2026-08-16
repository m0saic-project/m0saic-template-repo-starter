import { assertLayout } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { LayoutContractCardV1, LAYOUT_CONSTRAINTS } from "./layout-contract-card";

const ctx = targetCtx(1280, 720);

const render = (
  props: Parameters<typeof LayoutContractCardV1.render>[0],
  c = ctx,
) => LayoutContractCardV1.render(props, c).then(asDocument);

type Stamped = { editor?: { layoutContract?: { ok: boolean; violations: { detail: string }[] } } };
const contract = (doc: unknown) => (doc as Stamped).editor?.layoutContract;

describe("@m0saic-starter/quality/layout-contract-card/v1", () => {
  it("is FREE when debug is off — the document comes back untouched", async () => {
    // Weight 9 breaks both constraints; with the gate off nothing runs, so
    // there is no stamp and no error card. That is what makes it shippable.
    const doc = await render({ sidebarWeight: 9 });
    expect(doc.kind).toBe("mosaic_document");
    expect(contract(doc)).toBeUndefined();
    expect(doc.labels).toBeUndefined();
  });

  it("passes inside the contract and stamps the result", async () => {
    const doc = await render({ sidebarWeight: 3, debugLayout: true });
    expect(contract(doc)?.ok).toBe(true);
    // The stamp backfills the label map from the source tags.
    expect(Object.values(doc.labels ?? {})).toEqual(
      expect.arrayContaining(["sidebar", "body"]),
    );
  });

  it("fires past the line, naming the label and the number", async () => {
    const doc = await render({ sidebarWeight: 5, debugLayout: true });
    const stamp = contract(doc);
    expect(stamp?.ok).toBe(false);
    expect(stamp?.violations[0].detail).toContain("sidebar");
    expect(stamp?.violations[0].detail).toContain("40.0%");
  });

  it("holds at the boundary — 40% is allowed, 50% is not", async () => {
    expect(contract(await render({ sidebarWeight: 4, debugLayout: true }))?.ok).toBe(true);
    expect(contract(await render({ sidebarWeight: 5, debugLayout: true }))?.ok).toBe(false);
  });

  it("is canvas-INDEPENDENT — one declaration, every size", async () => {
    for (const [w, h] of [
      [1280, 720],
      [1080, 1920],
      [640, 360],
      [3840, 2160],
    ] as const) {
      const c = targetCtx(w, h);
      expect(contract(await render({ sidebarWeight: 3, debugLayout: true }, c))?.ok).toBe(true);
      expect(contract(await render({ sidebarWeight: 7, debugLayout: true }, c))?.ok).toBe(false);
    }
  });

  it("assertLayout is the CI sibling — same contract, throws instead", async () => {
    // This is how a test suite enforces a layout invariant without rendering
    // an error card: the pure check, wired to fail the run.
    const good = await render({ sidebarWeight: 3 });
    expect(() =>
      assertLayout(good, ctx, "test", { constraints: LAYOUT_CONSTRAINTS }),
    ).not.toThrow();

    const bad = await render({ sidebarWeight: 7 });
    expect(() =>
      assertLayout(bad, ctx, "test", { constraints: LAYOUT_CONSTRAINTS }),
    ).toThrow(/layout contract violated/);
  });

  it("rejects bad props", async () => {
    await expect(render({ sidebarWeight: 99 })).rejects.toThrow(/out of range/);
    await expect(render({ sidebarColor: "purple" })).rejects.toThrow(/#rrggbb/);
  });

  it("is deterministic", async () => {
    const a = await render({ sidebarWeight: 3, debugLayout: true });
    const b = await render({ sidebarWeight: 3, debugLayout: true });
    expect(a).toEqual(b);
  });
});
