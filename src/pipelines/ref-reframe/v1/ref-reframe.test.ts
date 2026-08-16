import { findStableKeys } from "@m0saic/dsl-stdlib";

import { asPipeline, targetCtx } from "../../../__testutils__/render";
import { RefReframeV1 } from "./ref-reframe";

const render = (props: Parameters<typeof RefReframeV1.render>[0]) =>
  RefReframeV1.render(props, targetCtx(1280, 720)).then(asPipeline);

const refOf = (p: Awaited<ReturnType<typeof render>>) =>
  ((p.steps[1] as { file: { sources: unknown[] } }).file.sources ?? []).find(
    (s) => (s as { type?: string }).type === "ref",
  ) as {
    flattenedStableKey: string;
    placement?: { fit?: string };
    playback?: { loopMode?: string };
    stepIndex: number;
  };

describe("@m0saic-starter/pipelines/ref-reframe/v1", () => {
  it("mirrors into a slot with a DIFFERENT shape", async () => {
    const p = await render({});
    const source = (p.steps[0] as { file: { size: { width: number; height: number } } }).file.size;
    const slot = (p.steps[1] as { file: { size: { width: number; height: number } } }).file.size;
    // Wide target, tall slot — the mismatch is the lesson.
    expect(source.width / source.height).toBeGreaterThan(1);
    expect(slot.width / slot.height).toBeLessThan(1);
  });

  it("points at a key the PRODUCER's geometry really has", async () => {
    const p = await render({});
    const producer = p.steps[0] as {
      file: { m0: string; size: { width: number; height: number } };
    };
    // A key is a coordinate in ONE document's flattened geometry, so it has to
    // be asked of the producer at the producer's canvas. A guessed literal
    // (say "r/fr0") type-checks, renders, and resolves to nothing.
    const keys = findStableKeys(producer.file.m0, (f) => f.kind === "frame", producer.file.size);
    expect(keys.length).toBeGreaterThan(0);
    expect(keys).toContain(refOf(p).flattenedStableKey);
  });

  it("carries the reframing on the REF, not the target", async () => {
    const contained = refOf(await render({ fit: "contain" }));
    const covered = refOf(await render({ fit: "cover" }));
    expect(contained.placement?.fit).toBe("contain");
    expect(covered.placement?.fit).toBe("cover");
    expect(contained.stepIndex).toBe(0);
  });

  it("hands the tail to loopMode", async () => {
    for (const loopMode of ["loop", "freeze", "cut"] as const) {
      expect(refOf(await render({ loopMode })).playback?.loopMode).toBe(loopMode);
    }
  });

  it("makes the consumer outlive its target so the tail is real", async () => {
    const p = await render({ tailMs: 400 });
    expect(p.steps[1].durationMs).toBe(p.steps[0].durationMs + 400);
  });

  it("says so when there is no tail to fill", async () => {
    const p = await render({ tailMs: 0 });
    expect(p.steps[1].durationMs).toBe(p.steps[0].durationMs);
    expect(JSON.stringify(p.steps[1])).toContain("no tail");
  });

  it("gives the TARGET motion, or the tail cannot be read", async () => {
    // loop / freeze / cut are indistinguishable when the mirrored pixels never
    // change — a still target makes this template's second knob invisible. The
    // producer therefore counts, and the number is the readout.
    const p = await render({});
    const producerSources = (p.steps[0] as { file: { sources: unknown[] } }).file
      .sources as Array<{ layers?: Array<{ content?: { kind?: string } }> }>;
    const animated = producerSources.some((s) =>
      (s.layers ?? []).some((l) => l.content?.kind === "expr"),
    );
    expect(animated).toBe(true);
  });
});
