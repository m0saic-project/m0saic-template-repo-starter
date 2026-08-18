import { asDocument, targetCtx } from "../../../__testutils__/render";
import { PRESETS, StaticOptionsV1, TRACKS } from "./static-options";

const render = (
  props: Parameters<typeof StaticOptionsV1.render>[0] = {},
  w = 1280,
  h = 720,
) => StaticOptionsV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/static-options/v1", () => {
  it("preset declares BOTH options and oneOf; tracks declares options only", () => {
    const preset = StaticOptionsV1.propsSchema?.preset?.meta;
    expect(preset?.control?.options).toEqual(PRESETS);
    expect(preset?.constraints?.oneOf).toEqual(PRESETS.map((p) => p.value));
    const tracks = StaticOptionsV1.propsSchema?.tracks?.meta;
    expect(tracks?.control?.options).toEqual(TRACKS);
    expect(tracks?.constraints?.oneOf).toBeUndefined();
  });

  it("renders the picked preset and lit tracks", async () => {
    const t = text(await render({ preset: "premium", tracks: ["video"] })).replace(/\\n/g, " ");
    expect(t).toContain("Premium [picked]");
    expect(t).toContain("Video [on]");
    expect(t).toContain("STATIC OPTIONS");
  });

  it("an off-list TRACK renders; an off-list PRESET is refused — the fence is oneOf", async () => {
    const open = await render({ tracks: ["video", "director-commentary"] });
    expect(text(open).replace(/\\n/g, " ")).toContain("Director Commentary [on]");
    await expect(render({ preset: "lossless" })).rejects.toThrow(/must be one of/);
  });

  it("rejects malformed values", async () => {
    await expect(render({ tracks: [] })).rejects.toThrow(/1-6/);
    await expect(render({ tracks: ["Bad!"] })).rejects.toThrow(/lowercase slug/);
    await expect(render({ bandColor: "blue" })).rejects.toThrow(/#rrggbb/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
