import { asPipeline, targetCtx } from "../../../__testutils__/render";
import { RefAcrossStepsV1 } from "./ref-across-steps";

const render = (props: Parameters<typeof RefAcrossStepsV1.render>[0], durationMs = 2000) =>
  RefAcrossStepsV1.render(props, targetCtx(1280, 720, { durationMs })).then(asPipeline);

const handleOf = (step: unknown) =>
  (step as { file: { variables: { hero: { stepIndex: number; flattenedStableKey: string } } } })
    .file.variables.hero;

const refOf = (step: unknown) =>
  ((step as { file: { sources: unknown[] } }).file.sources ?? []).find(
    (s) => (s as { type?: string }).type === "ref",
  ) as { flattenedStableKey: string; stepIndex: number } | undefined;

describe("@m0saic-starter/pipelines/ref-across-steps/v1", () => {
  it("mirrors an earlier step's cell with a BACK-EDGE", async () => {
    const p = await render({});
    const ref = refOf(p.steps[1]);
    expect(ref?.stepIndex).toBe(0);
    // Strictly earlier than the consuming step — a forward ref is an error.
    expect(ref!.stepIndex).toBeLessThan(1);
    // The key comes from the producer's own m0, not from a literal here.
    const handle = handleOf(p.steps[0]);
    expect(ref?.flattenedStableKey).toBe(handle.flattenedStableKey);
  });

  it("publishes the handle the consumer would otherwise have to guess", async () => {
    const p = await render({});
    // The producer owns the geometry, so the key is right by construction —
    // and it ASKS its own m0 for it rather than hardcoding a guess.
    const hero = handleOf(p.steps[0]);
    expect(hero.stepIndex).toBe(0);
    expect(hero.flattenedStableKey).toMatch(/^r\//);
  });

  it("keeps the producer OUT of the deliverable by default", async () => {
    const hidden = await render({ keepProducer: false });
    const shipped = await render({ keepProducer: true });
    expect(hidden.steps[0].intermediate).toBe(true);
    expect(shipped.steps[0].intermediate).toBe(false);
  });

  it("stitches to ctx.target either way — intermediates don't count", async () => {
    const hidden = await render({ keepProducer: false }, 2000);
    // Only the consumer is an output step, so it carries the whole clip.
    expect(hidden.steps[1].durationMs).toBe(2000);

    const shipped = await render({ keepProducer: true }, 2000);
    const outputMs = shipped.steps
      .filter((s) => !s.intermediate)
      .reduce((n, s) => n + s.durationMs, 0);
    expect(outputMs).toBe(2000);
  });

  it("renders the word once, in the producer", async () => {
    const p = await render({ word: "ONCE" });
    expect(JSON.stringify(p.steps[0])).toContain("ONCE");
    expect(JSON.stringify(p.steps[1])).not.toContain("ONCE");
  });
});
