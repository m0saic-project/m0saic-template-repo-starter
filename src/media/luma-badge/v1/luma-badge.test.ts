import { asDocument, targetCtx } from "../../../__testutils__/render";
import { LumaBadgeV1 } from "./luma-badge";

const IMG = "assets/media/epoch-m-1024x1024.png";
const ctxFor = (luma: number | null) => {
  const base = targetCtx(1280, 720, {
    media: { [IMG]: { kind: "image", width: 1024, height: 1024 } } as never,
  });
  if (luma === null) return base;
  return {
    ...base,
    analysis: {
      regionLuminance: async () => ({ overallAvgLuma: luma, buckets: [], durationMs: 0 }),
    },
  } as never;
};

describe("@m0saic-starter/media/luma-badge/v1", () => {
  it("bright corner → dark badge", async () => {
    const doc = asDocument(await LumaBadgeV1.render({ image: IMG }, ctxFor(220)));
    const all = JSON.stringify(doc.sources);
    expect(all).toContain("= 220");
    expect(all).toContain("dark badge on bright pixels");
  });

  it("dark corner → light badge", async () => {
    const doc = asDocument(await LumaBadgeV1.render({ image: IMG }, ctxFor(30)));
    expect(JSON.stringify(doc.sources)).toContain("light badge on dark pixels");
  });

  it("no analysis surface → STATED degradation, render still succeeds", async () => {
    const doc = asDocument(await LumaBadgeV1.render({ image: IMG }, ctxFor(null)));
    expect(JSON.stringify(doc.sources)).toContain("analysis unavailable");
  });

  it("empty image renders the prompt", async () => {
    const doc = asDocument(await LumaBadgeV1.render({}, targetCtx(1280, 720)));
    expect(JSON.stringify(doc.sources)).toContain("reads the pixels");
  });
});
