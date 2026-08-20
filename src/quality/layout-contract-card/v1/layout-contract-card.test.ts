import { assertLayout } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import {
  LayoutContractCardV1,
  LAYOUT_CONSTRAINTS,
  LAYOUT_RELATIONS,
} from "./layout-contract-card";

const ctx = targetCtx(1280, 720);

const render = (
  props: Parameters<typeof LayoutContractCardV1.render>[0],
  c = ctx,
) => LayoutContractCardV1.render(props, c).then(asDocument);

type Stamped = { editor?: { layoutContract?: { ok: boolean; violations: { detail: string }[] } } };
const contract = (doc: unknown) => (doc as Stamped).editor?.layoutContract;
const colorsOf = (doc: unknown) =>
  ((doc as { sources?: Array<{ color?: string }> }).sources ?? []).map((s) => s?.color);

// The contract view's palette (from template-utils' contract wireframe).
const GREEN = "#2ea043@0.30";
const RED = "#f85149@0.35";

describe("@m0saic-starter/quality/layout-contract-card/v1", () => {
  it("is FREE when debug is off — the document comes back untouched", async () => {
    // Stretch 2 breaks the relation; with the gate off nothing runs, so
    // there is no stamp and no contract view. That is what makes it shippable.
    const doc = await render({ stretchCard: 2 });
    expect(doc.kind).toBe("mosaic_document");
    expect(contract(doc)).toBeUndefined();
    expect(colorsOf(doc)).not.toContain(GREEN);
  });

  it("PASS is drawn: four green cards + the header, stamped ok", async () => {
    const doc = await render({ stretchCard: 1, debugLayout: true });
    expect(contract(doc)?.ok).toBe(true);
    // Every rule member renders green — 4 cards + the header constraint.
    expect(colorsOf(doc).filter((c) => c === GREEN)).toHaveLength(5);
    expect(colorsOf(doc)).not.toContain(RED);
  });

  it("FAIL is drawn: the stretched card red AMONG the green survivors", async () => {
    const doc = await render({ stretchCard: 1.5, debugLayout: true });
    const stamp = contract(doc);
    expect(stamp?.ok).toBe(false);
    expect(stamp?.violations[0].detail).toContain("card");
    // One offender red; the other members stay green around it.
    expect(colorsOf(doc)).toContain(RED);
    expect(colorsOf(doc)).toContain(GREEN);
  });

  it("holds at the boundary — uniform passes, a 1.5x card does not", async () => {
    expect(contract(await render({ stretchCard: 1, debugLayout: true }))?.ok).toBe(true);
    expect(contract(await render({ stretchCard: 1.5, debugLayout: true }))?.ok).toBe(false);
  });

  it("is canvas-INDEPENDENT — one declaration, every size", async () => {
    for (const [w, h] of [
      [1280, 720],
      [1080, 1920],
      [640, 360],
      [3840, 2160],
    ] as const) {
      const c = targetCtx(w, h);
      expect(contract(await render({ stretchCard: 1, debugLayout: true }, c))?.ok).toBe(true);
      expect(contract(await render({ stretchCard: 2, debugLayout: true }, c))?.ok).toBe(false);
    }
  });

  it("assertLayout is the CI sibling — same contract, throws instead", async () => {
    // This is how a test suite enforces a layout invariant without rendering
    // a contract view: the pure check, wired to fail the run.
    const good = await render({ stretchCard: 1 });
    expect(() =>
      assertLayout(good, ctx, "test", { constraints: LAYOUT_CONSTRAINTS, relations: LAYOUT_RELATIONS }),
    ).not.toThrow();

    const bad = await render({ stretchCard: 2 });
    expect(() =>
      assertLayout(bad, ctx, "test", { constraints: LAYOUT_CONSTRAINTS, relations: LAYOUT_RELATIONS }),
    ).toThrow(/layout contract violated/);
  });

  it("rejects bad props", async () => {
    await expect(render({ stretchCard: 99 })).rejects.toThrow(/out of range/);
    await expect(render({ cardColor: "blue" })).rejects.toThrow(/#rrggbb/);
  });

  it("is deterministic", async () => {
    const a = await render({ stretchCard: 1, debugLayout: true });
    const b = await render({ stretchCard: 1, debugLayout: true });
    expect(a).toEqual(b);
  });
});
