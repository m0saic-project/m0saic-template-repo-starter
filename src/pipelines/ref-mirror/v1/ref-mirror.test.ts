import { findStableKeys } from "@m0saic/dsl-stdlib";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { RefMirrorV1 } from "./ref-mirror";

const render = (props: Parameters<typeof RefMirrorV1.render>[0]) =>
  RefMirrorV1.render(props, targetCtx(1280, 720)).then(asDocument);

const refs = (doc: { sources?: unknown[] }) =>
  (doc.sources ?? []).filter((s) => (s as { type?: string }).type === "ref") as {
    flattenedStableKey: string;
    placement?: { fit?: string };
  }[];

describe("@m0saic-starter/pipelines/ref-mirror/v1", () => {
  it("draws the target ONCE and mirrors it three times", async () => {
    const doc = await render({});
    // One real source, three refs — the mirrors carry no content of their own.
    expect((doc.sources ?? [])[0]).toMatchObject({ type: "text" });
    expect(refs(doc)).toHaveLength(3);
  });

  it("points every mirror at the key the m0 ACTUALLY produced", async () => {
    const doc = await render({});
    // The key is a coordinate the flattened geometry decides. Recomputing it
    // here is the whole point: a hand-written "r/fc0" would be wrong, because
    // weightedSplit expands this layout into a run.
    const expected = findStableKeys(doc.m0, (f) => f.kind === "frame", {
      width: 1280,
      height: 720,
    })[0];
    expect(expected).not.toBe("r/fc0");
    expect(refs(doc).map((r) => r.flattenedStableKey)).toEqual([expected, expected, expected]);
  });

  it("re-derives the key when the canvas changes the geometry", async () => {
    const wide = await render({});
    const small = await RefMirrorV1.render({}, targetCtx(640, 360)).then(asDocument);
    for (const doc of [wide, small]) {
      const keys = findStableKeys(doc.m0, (f) => f.kind === "frame", {
        width: 1280,
        height: 720,
      });
      expect(refs(doc)[0].flattenedStableKey).toBe(keys[0]);
    }
  });

  it("decorates the copies only — the target keeps its own treatment", async () => {
    const contained = await render({ mirrorFit: "contain" });
    const covered = await render({ mirrorFit: "cover" });
    expect(refs(contained).every((r) => r.placement?.fit === "contain")).toBe(true);
    expect(refs(covered).every((r) => r.placement?.fit === "cover")).toBe(true);
    // The hero is byte-identical across both — only the mirrors changed.
    expect(JSON.stringify((contained.sources ?? [])[0])).toBe(
      JSON.stringify((covered.sources ?? [])[0]),
    );
  });

  it("targets a text source, not a colour tile", async () => {
    // A mirror only pays off against a target with a real intermediate;
    // color= is nearly free, so N lavfi tiles would beat it.
    const doc = await render({});
    expect((doc.sources ?? [])[0]).toMatchObject({ renderMode: { kind: "image" } });
  });

  it("reports bad props at once", async () => {
    await expect(
      RefMirrorV1.render({ word: "", mirrorFit: "stretch" as never }, targetCtx(1280, 720)),
    ).rejects.toThrow(/word must be 1-12.*mirrorFit must be one of/s);
  });
});
