import { weightedSplit } from "@m0saic/dsl-stdlib";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { DEFAULT_LAYOUT, M0PropV1, MAX_CHARS, WIREFRAME_CLAIM_BUDGET } from "./m0-prop";

const render = (
  props: Parameters<typeof M0PropV1.render>[0] = {},
  w = 1280,
  h = 720,
) => M0PropV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/m0-prop/v1", () => {
  it("declares the layout as grammar: type m0", () => {
    expect(M0PropV1.propsSchema?.layout?.type).toBe("m0");
    expect(M0PropV1.defaultProps?.layout).toBe(DEFAULT_LAYOUT);
  });

  it("frames a valid layout and binds one tile per claim", async () => {
    const doc = await render({ layout: "2(1,1)" });
    // 2 claims + caption text source
    expect(doc.sources).toHaveLength(2 + 1);
    expect(text(doc)).toContain("2 claims");
    expect(String(doc.m0)).toContain("2(1,1)");
  });

  it("an invalid layout gets a report card, never a dead render", async () => {
    const doc = await render({ layout: "3(1,1" });
    const t = text(doc);
    expect(t).toContain("Layout does not parse");
    expect(t).toContain("isValidM0String");
    expect(t).toContain(DEFAULT_LAYOUT);
  });

  /**
   * The degrade ladder — heavy layouts are the founder's dictionary case:
   * many thousands of chars must NOT fail, they must land on a rung.
   */
  it("a dictionary-scale layout (10K+ chars) wireframes fine", async () => {
    // Donation-heavy, the way real dictionary strings get long: thousands
    // of passthrough slots, few claims, tiny floors (measured feasX = 2).
    const big = String(weightedSplit([4999, 1], "col", { mode: "literal" }));
    expect(big.length).toBeGreaterThan(10000); // the old cap would have lied about this one
    const doc = await render({ layout: big });
    expect(doc.kind).toBe("mosaic_document");
    expect(doc.sources).toHaveLength(2 + 1);
    expect(text(doc)).toContain("10005-char layout");
  });

  it("over the claim budget → the STATS CARD, still a working render", async () => {
    const wall = String(weightedSplit(Array(WIREFRAME_CLAIM_BUDGET + 30).fill(1), "col"));
    const doc = await render({ layout: wall });
    expect(doc.kind).toBe("mosaic_document");
    const t = text(doc).replace(/\\n/g, " ");
    expect(t).toContain("too many claims to wireframe");
    expect(t).toContain(`${WIREFRAME_CLAIM_BUDGET + 30} claims`);
    expect(t).toContain("safe minimum");
  });

  it("valid but infeasible at this canvas → the floors card, not a dead render", async () => {
    // A deep same-axis halving chain: few claims, huge feasibility floor.
    let chain = "2(1,1)";
    for (let i = 0; i < 11; i++) chain = `2(${chain},1)`;
    const doc = await render({ layout: chain });
    const t = text(doc);
    expect(t).toContain("Layout larger than this canvas");
    expect(t).toMatch(/safe minimum is \d+x\d+/);
  });

  it("beyond MAX_CHARS → honest 'beyond this lesson', never 'does not parse'", async () => {
    const huge = String(weightedSplit(Array(Math.ceil(MAX_CHARS / 2), ).fill(1), "col"));
    expect(huge.length).toBeGreaterThan(MAX_CHARS);
    const t = text(await render({ layout: huge }));
    expect(t).toContain("Layout larger than this lesson renders");
    expect(t).not.toContain("does not parse");
  });

  it("empty input still reports", async () => {
    expect(text(await render({ layout: "   " }))).toContain("Layout does not parse");
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
