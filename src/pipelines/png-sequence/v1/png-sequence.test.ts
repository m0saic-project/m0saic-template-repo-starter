import { asPipeline, targetCtx } from "../../../__testutils__/render";
import { PngSequenceV1 } from "./png-sequence";

const render = (props: Parameters<typeof PngSequenceV1.render>[0]) =>
  PngSequenceV1.render(props, targetCtx(640, 360)).then(asPipeline);

describe("@m0saic-starter/pipelines/png-sequence/v1", () => {
  it("is a fan-out of images, one step per frame", async () => {
    const p = await render({ frames: 4 });
    expect(p.emit).toBe("multi");
    expect(p.steps).toHaveLength(4);
    for (const step of p.steps) {
      expect((step as { file: { format: unknown } }).file.format).toEqual({
        kind: "image",
        container: "png",
      });
    }
  });

  it("zero-pads names so a folder listing SORTS", async () => {
    const p = await render({ frames: 12 });
    expect(p.steps[0].name).toBe("frame-01");
    expect(p.steps[11].name).toBe("frame-12");
    // The failure this prevents: "frame-10" sorting before "frame-2".
    const sorted = [...p.steps.map((s) => String(s.name))].sort();
    expect(sorted).toEqual(p.steps.map((s) => String(s.name)));
  });

  it("pads to the width the largest index needs, not a fixed 3", async () => {
    expect((await render({ frames: 6 })).steps[0].name).toBe("frame-1");
    expect((await render({ frames: 10 })).steps[0].name).toBe("frame-01");
  });

  it("gives every frame the CLI's label token", async () => {
    const p = await render({ frames: 3, prefix: "shot" });
    expect(p.steps.every((s) => s.label === "shot")).toBe(true);
    expect(p.steps.map((s) => s.name)).toEqual(["shot-1", "shot-2", "shot-3"]);
  });

  it("refuses a prefix that would not survive a filename", async () => {
    await expect(PngSequenceV1.render({ prefix: "my frames/" }, targetCtx(640, 360))).rejects.toThrow(
      /filename-safe/,
    );
  });
});
