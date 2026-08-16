import { asDocument, targetCtx } from "../../../__testutils__/render";
import { RenderLiteV1 } from "./render-lite";

const ctx = targetCtx(1280, 720);

const real = (props: Parameters<typeof RenderLiteV1.render>[0]) =>
  RenderLiteV1.render(props, ctx).then(asDocument);

/** renderLite is optional on the type, so narrow before every call. */
const lite = (props: Parameters<typeof RenderLiteV1.render>[0]) => {
  const fn = RenderLiteV1.renderLite;
  if (typeof fn !== "function") throw new Error("renderLite must be declared");
  return asDocument(fn(props, ctx) as never);
};

describe("@m0saic-starter/surfaces/render-lite/v1", () => {
  it("declares the lite surface at all — the whole point of the lesson", () => {
    expect(typeof RenderLiteV1.renderLite).toBe("function");
  });

  it("render builds the real N-by-N grid; lite builds one card", async () => {
    const grid = await real({ tiles: 4 });
    expect(grid.sources).toHaveLength(16);
    // N rows, each an N-column split.
    expect(grid.m0).toBe("4[4(1,1,1,1),4(1,1,1,1),4(1,1,1,1),4(1,1,1,1)]");

    // The stand-in is a single tile with its copy on the attached overlay:
    // two sources total, no matter how dense the real render would be.
    const card = lite({ tiles: 8 });
    expect(card.m0).toBe("1{1}");
    expect(card.sources).toHaveLength(2);
  });

  it("the lite card states the cost it is standing in for", () => {
    const card = lite({ tiles: 5 });
    const text = JSON.stringify(card.sources);
    expect(text).toContain("5x5 = 25 tiles");
  });

  it("grid density tracks the knob", async () => {
    for (const tiles of [2, 3, 6, 8]) {
      const doc = await real({ tiles });
      expect(doc.sources).toHaveLength(tiles * tiles);
    }
  });

  it("both entry points reject the same bad props — one shared gate", async () => {
    await expect(real({ tiles: 99 })).rejects.toThrow(/out of range/);
    expect(() => lite({ tiles: 99 })).toThrow(/out of range/);

    await expect(real({ accentColor: "red" })).rejects.toThrow(/#rrggbb/);
    expect(() => lite({ accentColor: "red" })).toThrow(/#rrggbb/);
  });

  it("is deterministic — same props, same document", async () => {
    const a = await real({ tiles: 4, accentColor: "#2471a3" });
    const b = await real({ tiles: 4, accentColor: "#2471a3" });
    expect(a).toEqual(b);
  });

  it("checkerboards by (row + col) parity in source-binding order", async () => {
    const doc = await real({ tiles: 2, accentColor: "#111111", panelColor: "#222222" });
    const fills = (doc.sources ?? []).map((s) => JSON.stringify(s));
    // row0: accent, panel | row1: panel, accent
    expect(fills[0]).toContain("#111111");
    expect(fills[1]).toContain("#222222");
    expect(fills[2]).toContain("#222222");
    expect(fills[3]).toContain("#111111");
  });
});
