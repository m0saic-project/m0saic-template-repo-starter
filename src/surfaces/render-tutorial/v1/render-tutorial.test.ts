import { asDocument, asPipeline, targetCtx } from "../../../__testutils__/render";
import { RenderTutorialV1 } from "./render-tutorial";

const ctx = targetCtx(1280, 720, { durationMs: 9999 });

const tutorial = () => {
  const fn = RenderTutorialV1.renderTutorial;
  if (typeof fn !== "function") throw new Error("renderTutorial must be declared");
  return asPipeline(fn(RenderTutorialV1.defaultProps ?? {}, ctx) as never);
};

describe("@m0saic-starter/surfaces/render-tutorial/v1", () => {
  it("builds a PIPELINE of pages, not the standard single-document page", () => {
    const pipe = tutorial();
    expect(pipe.kind).toBe("mosaic_pipeline");
    expect(pipe.steps).toHaveLength(3);
    expect(pipe.steps.map((s) => s.name)).toEqual(["what", "timing", "optin"]);
  });

  it("owns its timing — total is the sum of the pages, NOT ctx.target", () => {
    const pipe = tutorial();
    const sum = pipe.steps.reduce((n, s) => n + (s.durationMs ?? 0), 0);
    expect(sum).toBe(3200 + 4000 + 3600);
    expect(pipe.durationMs).toBe(sum);
    // ctx.target.durationMs is 9999 here on purpose: if the tutorial ever
    // starts reading it, this is the line that fails.
    expect(pipe.durationMs).not.toBe(9999);
  });

  it("every page carries its own duration", () => {
    for (const step of tutorial().steps) {
      const page = asDocument(step.file as never);
      expect(page.durationMs).toBe(step.durationMs);
      expect(page.durationMs).toBeGreaterThan(0);
    }
  });

  it("pages are real geometry — a heading band over a body band", () => {
    for (const step of tutorial().steps) {
      const page = asDocument(step.file as never);
      // [1,2] weights: heading claimant, then one donating "0", then body.
      expect(page.m0).toBe("3[1{1},0,1{1}]");
      expect(page.sources).toHaveLength(4);
    }
  });

  it("takes GEOMETRY from ctx.target even though it refuses the duration", () => {
    const wide = RenderTutorialV1.renderTutorial as NonNullable<
      typeof RenderTutorialV1.renderTutorial
    >;
    const pipe = asPipeline(wide({}, targetCtx(1920, 1080)) as never);
    const page = asDocument(pipe.steps[0].file as never);
    expect(page.size).toEqual({ width: 1920, height: 1080 });
  });

  it("tutorial copy is ASCII — exotic codepoints render as tofu", () => {
    const text = JSON.stringify(tutorial());
    expect(/[^\x00-\x7F]/.test(text)).toBe(false);
  });

  it("render itself is a plain card and still honors ctx.target", async () => {
    const doc = await RenderTutorialV1.render({}, ctx).then(asDocument);
    expect(doc.kind).toBe("mosaic_document");
    expect(doc.m0).toBe("1{1}");
  });

  it("is deterministic", () => {
    expect(tutorial()).toEqual(tutorial());
  });
});
