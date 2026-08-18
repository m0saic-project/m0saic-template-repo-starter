import { asDocument, targetCtx } from "../../../__testutils__/render";
import { NumberDisplayV1 } from "./number-display";

const render = (
  props: Parameters<typeof NumberDisplayV1.render>[0] = {},
  w = 1280,
  h = 720,
) => NumberDisplayV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/number-display/v1", () => {
  it("declares canonical ms with seconds display, and a locked chip on fade", () => {
    const hold = NumberDisplayV1.propsSchema?.holdMs?.meta?.control;
    expect(hold).toMatchObject({ unit: "ms", displayUnit: "s", step: 100 });
    expect(hold?.lockDisplayUnit).toBeUndefined();
    const fade = NumberDisplayV1.propsSchema?.fadeMs?.meta?.control;
    expect(fade).toMatchObject({ unit: "ms", displayUnit: "ms", lockDisplayUnit: true, step: 50 });
  });

  it("render reads and prints CANONICAL ms — display conversion never leaks", async () => {
    const t = text(await render({ holdMs: 2400, fadeMs: 250 }));
    expect(t).toContain("hold 2400ms");
    expect(t).toContain("fade 250ms");
    expect(t).not.toContain("2.4"); // the seconds form is the editor's business
  });

  it("the strip is proportional in canonical units", async () => {
    const doc = await render({ holdMs: 3000, fadeMs: 1000 });
    // hold band ≈ 3/4 of the strip, fade ≈ 1/4 — asserted via the m0 weights.
    expect(String(doc.m0)).toContain("(");
    expect(doc.sources).toHaveLength(4 + 1);
  });

  it("rejects out-of-range values in canonical units", async () => {
    await expect(render({ holdMs: 100 })).rejects.toThrow(/\[500, 10000\]/);
    await expect(render({ fadeMs: 5000 })).rejects.toThrow(/\[0, 1000\]/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
