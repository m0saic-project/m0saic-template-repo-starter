import type { MosaicEngineContext } from "@m0saic/types";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { PureAdapterV1, summarize } from "./pure-adapter";

type DataSource = { type: string; alias: string; variables: Record<string, unknown> };

/** A ctx carrying an upstream block, as a pipeline step would hand it over. */
const withUpstream = (upstreamData: Record<string, unknown>): MosaicEngineContext =>
  ({ ...targetCtx(1280, 720), upstreamData }) as unknown as MosaicEngineContext;

const render = (
  props: Parameters<typeof PureAdapterV1.render>[0],
  ctx: MosaicEngineContext = targetCtx(1280, 720),
) => PureAdapterV1.render(props, ctx).then(asDocument);

const publishedBy = (doc: Awaited<ReturnType<typeof render>>) =>
  (doc.sources ?? []).find((s) => (s as { type?: string }).type === "data") as unknown as DataSource;

describe("@m0saic-starter/data/pure-adapter/v1", () => {
  it("summarizes a series", () => {
    expect(summarize([3, 5, 8, 13, 21])).toEqual({ count: 5, min: 3, max: 21, mean: 10, total: 50 });
  });

  it("ignores non-finite entries and rounds the mean", () => {
    expect(summarize([1, NaN, 2])).toEqual({ count: 2, min: 1, max: 2, mean: 1.5, total: 3 });
    expect(summarize([1, 1, 2]).mean).toBe(1.33);
  });

  it("reads the input alias and publishes the derived block", async () => {
    const doc = await render({}, withUpstream({ starterData: { series: [2, 4] } }));
    const block = publishedBy(doc);
    expect(String(block.alias)).toBe("seriesStats");
    expect(block.variables).toMatchObject({ count: 2, mean: 3, upstreamArrived: true });
  });

  it("does not forward the raw input — an adapter is not a passthrough", async () => {
    const doc = await render({}, withUpstream({ starterData: { series: [2, 4], secretish: "raw" } }));
    expect(publishedBy(doc).variables).not.toHaveProperty("secretish");
  });

  it("degrades to an empty well-shaped block with no upstream", async () => {
    const block = publishedBy(await render({}));
    expect(block.variables).toMatchObject({ count: 0, total: 0, upstreamArrived: false });
  });

  it("stays core tier — reshaping needs no capability", () => {
    expect(PureAdapterV1.capabilities?.tier).toBe("core");
  });

  it("follows seriesKey to another key in the block", async () => {
    const doc = await render(
      { seriesKey: "latencies" },
      withUpstream({ starterData: { latencies: [10, 30] } }),
    );
    expect(publishedBy(doc).variables).toMatchObject({ count: 2, max: 30 });
  });

  it("rejects a bad alias and an empty series key", async () => {
    await expect(render({ outputAlias: "has-dash" })).rejects.toThrow(/outputAlias/);
    await expect(render({ seriesKey: "" })).rejects.toThrow(/seriesKey/);
  });

  it("is pure: same input, same output", async () => {
    const ctx = withUpstream({ starterData: { series: [1, 2, 3] } });
    expect(JSON.stringify(await render({}, ctx))).toBe(JSON.stringify(await render({}, ctx)));
  });
});
