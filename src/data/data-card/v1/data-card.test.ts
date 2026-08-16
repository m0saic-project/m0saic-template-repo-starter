import type { MosaicEngineContext } from "@m0saic/types";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { DataCardV1 } from "./data-card";

const withUpstream = (upstreamData: Record<string, unknown>): MosaicEngineContext =>
  ({ ...targetCtx(1280, 720), upstreamData }) as unknown as MosaicEngineContext;

const render = (
  props: Parameters<typeof DataCardV1.render>[0],
  ctx: MosaicEngineContext = targetCtx(1280, 720),
) => DataCardV1.render(props, ctx).then(asDocument);

/** Every literal drawn on the card, in source order. */
const textsOf = (doc: Awaited<ReturnType<typeof render>>): string[] =>
  (doc.sources ?? []).flatMap((s) => {
    const layers = (s as { layers?: Array<{ content?: { text?: string } }> }).layers ?? [];
    return layers.map((l) => l.content?.text ?? "").filter((t) => t.length > 0);
  });

describe("@m0saic-starter/data/data-card/v1", () => {
  it("draws the upstream block's values", async () => {
    const texts = textsOf(
      await render({}, withUpstream({ seriesStats: { count: 5, min: 3, max: 21, mean: 10, total: 50 } })),
    );
    expect(texts).toEqual(expect.arrayContaining(["5", "3", "21", "10", "50"]));
  });

  it("names the alias it read", async () => {
    const texts = textsOf(await render({}, withUpstream({ seriesStats: { count: 1 } })));
    expect(texts.some((t) => t.includes('ctx.upstreamData["seriesStats"]'))).toBe(true);
  });

  it("falls back to sample numbers so the card is drawable with no chain", async () => {
    const texts = textsOf(await render({}));
    expect(texts.some((t) => t.includes("drawing sample numbers"))).toBe(true);
    expect(texts).toEqual(expect.arrayContaining(["5", "21"]));
  });

  it("reports the gap when the fallback is off", async () => {
    const texts = textsOf(await render({ sampleData: false }));
    expect(texts.some((t) => t === 'no "seriesStats" upstream')).toBe(true);
    // Missing values read as a dash rather than a plausible zero.
    expect(texts.filter((t) => t === "-")).toHaveLength(5);
  });

  it("shows a dash for a key the block does not carry", async () => {
    const texts = textsOf(await render({}, withUpstream({ seriesStats: { count: 2 } })));
    expect(texts).toContain("2");
    expect(texts.filter((t) => t === "-")).toHaveLength(4);
  });

  it("declares what it consumes", () => {
    expect(DataCardV1.upstreamDataSchema?.seriesStats?.variables.count?.type).toBe("number");
  });

  it("reads whatever alias it is pointed at", async () => {
    const texts = textsOf(
      await render({ alias: "other" }, withUpstream({ other: { total: 7 }, seriesStats: { total: 99 } })),
    );
    expect(texts).toContain("7");
    expect(texts).not.toContain("99");
  });

  it("rejects an empty alias and an over-long title", async () => {
    await expect(render({ alias: "" })).rejects.toThrow(/alias/);
    await expect(render({ title: "x".repeat(41) })).rejects.toThrow(/title/);
  });
});
