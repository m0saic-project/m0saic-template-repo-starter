import { asDocument, targetCtx } from "../../../__testutils__/render";
import { EncodeMatrixV1 } from "./encode-matrix";

const render = (props: Parameters<typeof EncodeMatrixV1.render>[0]) =>
  EncodeMatrixV1.render(props, targetCtx(1280, 720)).then(asDocument);

describe("@m0saic-starter/pipelines/encode-matrix/v1", () => {
  it("declares transcode passes beside the geometry, not instead of it", async () => {
    const doc = await render({});
    expect(Object.keys(doc.encodes ?? {})).toEqual(["web", "mobile"]);
    // Still ONE document with ONE m0 — encodes are a separate axis.
    expect(doc.m0.length).toBeGreaterThan(0);
  });

  it("changes only what an encode is allowed to change", async () => {
    const encodes = (await render({})).encodes ?? {};
    const forbidden = ["fps", "durationMs", "target", "emit"];
    for (const entry of Object.values(encodes)) {
      for (const key of forbidden) {
        expect(entry as Record<string, unknown>).not.toHaveProperty(key);
      }
    }
  });

  it("keeps a resized encode on the master's aspect", async () => {
    // size on an encode is a scale pass: it STRETCHES. Changing the aspect
    // here would silently squash the picture.
    const mobile = (await render({})).encodes?.mobile as { size: { width: number; height: number } };
    expect(mobile.size).toEqual({ width: 640, height: 360 });
    expect(mobile.size.width / mobile.size.height).toBeCloseTo(1280 / 720, 5);
  });

  it("omits the field entirely when nothing is asked for", async () => {
    const doc = await render({ web: false, mobile: false });
    expect(doc.encodes).toBeUndefined();
    expect(JSON.stringify(doc.sources)).toContain("no encodes declared");
  });
});
