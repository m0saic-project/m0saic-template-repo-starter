import { evaluateM0 } from "@m0saic/dsl-stdlib";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { KPI_OVERVIEW_REAL } from "./real/kpi-overview.m0";
import { THEMING_REAL } from "./real/theming.m0";
import { WhyTheFloorsCrossV1 } from "./why-the-floors-cross";

const render = (
  props: Parameters<typeof WhyTheFloorsCrossV1.render>[0],
  w = 1280,
  h = 720,
) => WhyTheFloorsCrossV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

const floors = (m0: unknown, w = 1280, h = 720) => {
  const e = evaluateM0(String(m0), { width: w, height: h });
  return {
    fx: e.feasibility.minWidthPx,
    fy: e.feasibility.minHeightPx,
    px: e.precision.maxSplitX,
    py: e.precision.maxSplitY,
    e,
  };
};

describe("@m0saic-starter/quality/why-the-floors-cross/v1", () => {
  /** The title claim: one card precision-high, six in a strip cross over. */
  it("dashboard: the floors cross at the nesting step, at real scale", async () => {
    const doc = await render({ layout: "dashboard" });
    const { fx, px } = floors(doc.m0);
    expect(fx).toBeGreaterThan(px);
    expect(fx).toBeGreaterThan(500);
    const t = text(doc).replace(/\\n/g, " ");
    expect(t).toContain("FEASIBILITY RUNS HIGH");
    const card = /one card: feas (\d+)px wide, prec (\d+)/.exec(t);
    expect(card).not.toBeNull();
    expect(Number(card![2])).toBeGreaterThan(Number(card![1])); // alone: precision-high
  });

  it("sidebar-page: design-pixel ruler, silently off at 1280", async () => {
    const doc = await render({ layout: "sidebar-page" });
    const { fx, px, e } = floors(doc.m0);
    expect(px).toBe(1440);
    expect(px).toBeGreaterThan(fx);
    expect([e.feasible, e.meetsPrecision]).toEqual([true, false]);
    expect(text(doc)).toContain("already silently off");
  });

  it("even-grid: floors equal and cheap", async () => {
    const doc = await render({ layout: "even-grid" });
    const { fx, px } = floors(doc.m0);
    expect(fx).toBe(px);
    expect(text(doc)).toContain("FLOORS EQUAL");
  });

  /**
   * The real captures, measured live — these LOCK the numbers the lesson
   * cites everywhere (docs, tutorial, curriculum). If a re-capture ever
   * changes them, this fails and the prose must be updated with it.
   */
  it("real-kpi-strip ships the flattened production m0 with its true floors", async () => {
    const doc = await render({ layout: "real-kpi-strip" }, 1920, 1080);
    expect(String(doc.m0)).toBe(KPI_OVERVIEW_REAL.m0); // bare, untouched
    const { fx, fy, px, py } = floors(doc.m0, 1920, 1080);
    expect([fx, fy]).toEqual([934, 117]);
    expect([px, py]).toEqual([193, 121]);
    expect([fx > px, fy > py]).toEqual([true, false]); // feasibility-dominant on X
    expect(doc.sources).toHaveLength(74); // one wireframe tile per claim
  });

  it("real-theming ships its flattened m0: precision-dominant, silently off at 1280", async () => {
    const doc = await render({ layout: "real-theming" }, 1920, 1080);
    expect(String(doc.m0)).toBe(THEMING_REAL.m0);
    const { fx, fy, px, py } = floors(doc.m0, 1920, 1080);
    expect([fx, fy]).toEqual([663, 313]);
    expect([px, py]).toEqual([1920, 1080]);
    expect(doc.sources).toHaveLength(45);

    // At the lesson's default canvas the real design is already silently off.
    const small = await render({ layout: "real-theming" }, 1280, 720);
    const e = floors(small.m0, 1280, 720).e;
    expect([e.feasible, e.meetsPrecision]).toEqual([true, false]);
  });

  /** The floors belong to the shape, not the canvas. */
  it("the numbers hold still when the canvas moves", async () => {
    for (const [layout, w2, h2] of [
      ["dashboard", 960, 540], // 640 wide is BELOW its 680px floor — see next test
      ["real-kpi-strip", 3840, 2160],
    ] as const) {
      const base = floors((await render({ layout }, 1280, 720)).m0, 1280, 720);
      const other = floors((await render({ layout }, w2, h2)).m0, w2, h2);
      expect([layout, other.fx, other.px]).toEqual([layout, base.fx, base.px]);
    }
  });

  it("the synthetic caption reports measured flattened floors as WxH pairs", async () => {
    const doc = await render({ layout: "dashboard" });
    const { fx, fy, px, py, e } = floors(doc.m0);
    const t = text(doc).replace(/\\n/g, " ");
    expect(t).toContain(
      `flattened floors at 1280x720: feasibility ${fx}x${fy}   precision ${px}x${py}   safe minimum ${e.recommendedMin.width}x${e.recommendedMin.height}`,
    );
  });

  /**
   * skipAutoCompact is load-bearing: GCD reduction would rewrite the card
   * anatomy and collapse [320,1120] to [2,7]; and the real captures must
   * ship byte-identical to what production flattened.
   */
  it("ships the authored rulers — compaction does not rewrite them", async () => {
    const sidebar = await render({ layout: "sidebar-page" });
    expect(String(sidebar.m0)).toMatch(/^1440\(/);
    const dashboard = await render({ layout: "dashboard" });
    expect(String(dashboard.m0)).toMatch(/^100\[/);
  });

  it("binds one source per claimed block plus the caption on synthetic layouts", async () => {
    // title chip + 6 cards x (bg+icon+label+value+delta) + caption = 32;
    // sidebar + content + caption = 3; 12 columns + caption = 13.
    expect((await render({ layout: "dashboard" })).sources).toHaveLength(32);
    expect((await render({ layout: "sidebar-page" })).sources).toHaveLength(3);
    expect((await render({ layout: "even-grid" })).sources).toHaveLength(13);
  });

  /** Below the feasibility floor it reports instead of shipping a doomed m0. */
  it("reports below the layout's floor", async () => {
    const sidebar = await render({ layout: "sidebar-page" }, 480, 270);
    expect(text(sidebar)).toContain("Below this layout's floor");
    const kpi = await render({ layout: "real-kpi-strip" }, 480, 270);
    expect(text(kpi)).toContain("Below this layout's floor");
    // The synthetic dashboard's 680px floor is REAL: a 640-wide canvas is
    // under it, exactly like a real kpi strip under 934.
    const dash = await render({ layout: "dashboard" }, 640, 360);
    expect(text(dash)).toContain("Below this layout's floor");
  });

  it("rejects bad props", async () => {
    await expect(render({ layout: "poster" as never })).rejects.toThrow(/must be one of/);
    await expect(render({ bandColor: "blue" })).rejects.toThrow(/#rrggbb/);
  });

  it("is deterministic", async () => {
    const a = await render({ layout: "real-kpi-strip" });
    const b = await render({ layout: "real-kpi-strip" });
    expect(a).toEqual(b);
  });
});
