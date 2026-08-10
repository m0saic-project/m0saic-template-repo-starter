import type { MosaicTextSource } from "@m0saic/types";
import { evaluateM0 } from "@m0saic/dsl-stdlib";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { InsetRecoveryV1 } from "./inset-recovery";

describe("@m0saic-starter/geometry/inset-recovery/v1", () => {
  it("keeps the string coarse while chips carry recovery insets", async () => {
    const doc = asDocument(await InsetRecoveryV1.render({}, targetCtx(1280, 720)));

    // 3 chips + the caption.
    expect(doc.sources).toHaveLength(4);

    // The composed string's precision stays bounded by the lattice basis —
    // nowhere near the canvas-scale precision raw pixel rects would demand.
    const prec = evaluateM0(doc.m0, { width: 1280, height: 720 }).precision;
    expect(prec.maxSplitX).toBeLessThanOrEqual(120);
    expect(prec.maxSplitY).toBeLessThanOrEqual(120);

    // Off-lattice chips carry placement.inset (the recovery); every chip
    // source is a lavfi color tile.
    const chips = (doc.sources ?? []).filter((s) => s.type === "lavfi");
    expect(chips).toHaveLength(3);
    const withInset = chips.filter(
      (s) => (s as { placement?: { inset?: unknown } }).placement?.inset !== undefined,
    );
    expect(withInset.length).toBeGreaterThan(0);
  });

  it("prints both precision floors, and the raw spelling's is far higher", async () => {
    const doc = asDocument(await InsetRecoveryV1.render({}, targetCtx(1280, 720)));
    const captionSource = (doc.sources ?? []).find(
      (s) => s.type === "text",
    ) as MosaicTextSource;
    const caption = (
      (captionSource.layers[0]?.content as { text?: string }).text ?? ""
    ).replace(/\n/g, " ");

    const m = /placeInsetPieces: precision (\d+)x(\d+) - placeRects same chips: (\d+)x(\d+)/.exec(
      caption,
    );
    expect(m).not.toBeNull();
    const [, insetX, , rawX] = m as RegExpExecArray;
    expect(Number(insetX)).toBeLessThanOrEqual(120);
    expect(Number(rawX)).toBeGreaterThan(Number(insetX) * 2);
  });

  it("is deterministic per target", async () => {
    const a = await InsetRecoveryV1.render({}, targetCtx(1280, 720));
    const b = await InsetRecoveryV1.render({}, targetCtx(1280, 720));
    expect(a).toEqual(b);
  });

  it("fails fast on a malformed color", async () => {
    await expect(
      InsetRecoveryV1.render({ chipColor: "gold" }, targetCtx(1280, 720)),
    ).rejects.toThrow(/#rrggbb/);
  });
});
