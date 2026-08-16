import { asDocument, targetCtx } from "../../../__testutils__/render";
import { SidecarJsonV1 } from "./sidecar-json";

const render = (
  props: Parameters<typeof SidecarJsonV1.render>[0],
  width = 1280,
  height = 720,
) => SidecarJsonV1.render(props, targetCtx(width, height)).then(asDocument);

const factsOf = (doc: Awaited<ReturnType<typeof render>>) =>
  (doc.sidecars as { renderFacts: Record<string, unknown> }).renderFacts;

describe("@m0saic-starter/data/sidecar-json/v1", () => {
  it("attaches the sidecar AND declares it — both halves", async () => {
    const doc = await render({});
    expect(doc.sidecars).toHaveProperty("renderFacts");
    expect(SidecarJsonV1.sidecarsSchema?.renderFacts?.description).toMatch(/renderFacts\.json/);
  });

  it("carries the note into the file", async () => {
    expect(factsOf(await render({ note: "for the docs" }))).toMatchObject({ note: "for the docs" });
  });

  it("derives geometry from ctx.target, not from a constant", async () => {
    const facts = factsOf(await render({}, 640, 360));
    expect(facts.canvas).toEqual({ width: 640, height: 360 });
    expect(facts.timing).toEqual({ fps: 30, durationMs: 2000, frames: 60 });
  });

  it("omits geometry when asked to", async () => {
    const facts = factsOf(await render({ includeGeometry: false }));
    expect(facts).not.toHaveProperty("canvas");
    expect(facts).not.toHaveProperty("timing");
  });

  it("rejects an over-long note", async () => {
    await expect(render({ note: "x".repeat(121) })).rejects.toThrow(/120 characters/);
  });

  it("writes the same file twice — no clock, no counter", async () => {
    expect(JSON.stringify(factsOf(await render({})))).toBe(JSON.stringify(factsOf(await render({}))));
  });
});
