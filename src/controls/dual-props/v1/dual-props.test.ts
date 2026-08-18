import { asDocument, targetCtx } from "../../../__testutils__/render";
import { DualPropsV1 } from "./dual-props";
import type { DualPropsProps } from "./dual-props";

const render = (
  props: Parameters<typeof DualPropsV1.render>[0] = {},
  w = 1280,
  h = 720,
) => DualPropsV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/dual-props/v1", () => {
  it("declares the dual pairs: agent canonical, human derived via syncsTo", () => {
    const ui = (k: keyof DualPropsProps) => DualPropsV1.propsSchema?.[k]?.meta?.ui;
    const control = (k: keyof DualPropsProps) => DualPropsV1.propsSchema?.[k]?.meta?.control;
    expect(ui("holdSec")?.consumer).toBe("agent");
    expect(ui("reduceMotion")?.consumer).toBe("agent");
    expect(ui("speed")?.consumer).toBe("human");
    expect(control("speed")?.syncsTo).toEqual([
      {
        prop: "holdSec",
        map: { kind: "linear", humanMin: 1, humanMax: 10, propMin: 12, propMax: 1.2 },
      },
    ]);
    expect(control("animate")?.syncsTo).toEqual([
      { prop: "reduceMotion", map: { kind: "boolInvert" } },
    ]);
    // The human keys are editor-only: no defaults shipped for them.
    expect(DualPropsV1.defaultProps?.speed).toBeUndefined();
    expect(DualPropsV1.defaultProps?.animate).toBeUndefined();
  });

  /** THE law: the human key never reaches render. */
  it("render reads only the canonical pair — bogus human values change nothing", async () => {
    const canonical = await render({ holdSec: 6, reduceMotion: true });
    const withHumanNoise = await render({
      holdSec: 6,
      reduceMotion: true,
      speed: 9999,
      animate: true,
    } as never);
    expect(withHumanNoise).toEqual(canonical);
  });

  it("renders the canonical values on the card", async () => {
    const t = text(await render({ holdSec: 3.6, reduceMotion: false }));
    expect(t).toContain("holdSec = 3.6");
    expect(t).toContain("motion on");
    const t2 = text(await render({ holdSec: 3.6, reduceMotion: true }));
    expect(t2).toContain("motion reduced");
  });

  it("rejects malformed canonical values", async () => {
    await expect(render({ holdSec: 0.1 })).rejects.toThrow(/\[1\.2, 12\]/);
    await expect(render({ reduceMotion: "yes" as never })).rejects.toThrow(/boolean/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
