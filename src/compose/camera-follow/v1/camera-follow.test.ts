import { asDocument, targetCtx } from "../../../__testutils__/render";
import { CameraFollowV1 } from "./camera-follow";

const render = (props: Parameters<typeof CameraFollowV1.render>[0], durationMs = 6000) =>
  CameraFollowV1.render(props, targetCtx(1280, 720, { durationMs })).then(asDocument);

type WorldTile = {
  effects?: { camera?: { zoom: number | string; focusX: string; focusY: string } };
};
const worldTileOf = (doc: { sources?: unknown[] }): WorldTile =>
  (doc.sources ?? [])[0] as WorldTile;
const worldOf = (doc: { children?: Record<string, unknown> }) =>
  (doc.children ?? {})["world"] as {
    m0: string;
    size: { width: number; height: number };
    sources: { mask?: { localPath: string } }[];
  };

describe("@m0saic-starter/compose/camera-follow/v1", () => {
  it("compiles the walk into per-frame focus EXPRESSIONS", async () => {
    const camera = worldTileOf(await render({ zoom: 2, pullBack: false })).effects?.camera;
    // Strings, not numbers — the walk lives in ffmpeg.
    expect(typeof camera?.focusX).toBe("string");
    expect(camera?.focusX).toContain("t"); // time-dependent
    expect(camera?.focusY).not.toBe(camera?.focusX); // a diagonal walk moves both
    // With no pull-back the zoom is just the number it was handed.
    expect(camera?.zoom).toBe(2);
  });

  it("zoom 1 means NO camera, not a broken one", async () => {
    const doc = await render({ zoom: 1 });
    expect(worldTileOf(doc).effects).toBeUndefined();
    expect(JSON.stringify(doc.sources)).toContain("returned undefined");
  });

  it("gives the world its own declared coordinate space", async () => {
    const world = worldOf(await render({}));
    // Everything above the caption band — declared, not inferred, because
    // the targets and the viewport math are all in this space.
    expect(world.size).toEqual({ width: 1280, height: 600 });
    expect(world.sources.length).toBe(10); // 9 cells + the debug layer
  });

  it("draws one hollow viewport rect per target, in one source", async () => {
    const withRects = worldOf(await render({ showViewport: true }));
    const without = worldOf(await render({ showViewport: false }));
    expect(without.sources).toHaveLength(9);
    expect(without.m0).not.toContain("{"); // no overlay layer at all

    const path = withRects.sources[9].mask?.localPath ?? "";
    // 3 targets x (outer + inner) subpaths — the winding rule making frames.
    expect((path.match(/M /g) ?? []).length).toBe(6);
  });

  it("the pull-back animates the ZOOM too, not just the focus", async () => {
    const held = worldTileOf(await render({ pullBack: true })).effects?.camera;
    const stopped = worldTileOf(await render({ pullBack: false })).effects?.camera;
    expect(held?.focusX).not.toBe(stopped?.focusX); // extra hold/centre keys
    // The zoom's TYPE changes: a constant without a pull-back, a compiled
    // expression with one (holds, eases to 1, then holds the full view).
    expect(typeof stopped?.zoom).toBe("number");
    expect(typeof held?.zoom).toBe("string");
    expect(String(held?.zoom)).toContain("t");
  });

  it("spreads settle times across whatever duration it is given", async () => {
    const short = asDocument(await CameraFollowV1.render({}, targetCtx(1280, 720, { durationMs: 4000 })));
    const long = asDocument(await CameraFollowV1.render({}, targetCtx(1280, 720, { durationMs: 8000 })));
    expect(JSON.stringify(short.sources)).toContain("1s, 2s, 3s");
    expect(JSON.stringify(long.sources)).toContain("2s, 4s, 6s");
  });

  it("refuses a zoom it cannot honor", async () => {
    await expect(CameraFollowV1.render({ zoom: 9 }, targetCtx(1280, 720))).rejects.toThrow(
      /zoom must be 1-3/,
    );
  });
});
