import { registerTemplate } from "@m0saic/template-utils";
import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { NestedBadgeV1 } from "../../nested-badge/v1/nested-badge";
import { NestedTemplateV1 } from "./nested-template";

/**
 * The child is looked up by ID in the host's registry — so a test has to be
 * its own host. In the app and the CLI this happens for free: the loader
 * registers everything the entry module exports.
 */
describe("@m0saic-starter/compose/nested-template/v1 — before the child is registered", () => {
  it("fails with the missing id, not a mystery", async () => {
    await expect(NestedTemplateV1.render({}, targetCtx(1280, 720))).rejects.toThrow(
      /@m0saic-starter\/compose\/nested-badge\/v1.*not registered/,
    );
  });
});

describe("@m0saic-starter/compose/nested-template/v1", () => {
  beforeAll(() => {
    registerTemplate(NestedBadgeV1 as unknown as MosaicTemplate<MosaicTemplateProps>);
  });

  const render = (props: Parameters<typeof NestedTemplateV1.render>[0]) =>
    NestedTemplateV1.render(props, targetCtx(1280, 720)).then(asDocument);

  const badgeOf = (doc: { children?: Record<string, unknown> }) =>
    (doc.children ?? {})["badge"] as {
      kind: string;
      m0: string;
      size?: { width: number; height: number };
      sources: unknown[];
    };

  it("renders the child against the SLOT, not the parent canvas", async () => {
    const doc = await render({ slotPct: 30 });
    const badge = badgeOf(doc);
    expect(badge.kind).toBe("mosaic_document");
    // 30% of 1280 — the child's own ctx.target for this render.
    expect(badge.size).toEqual({ width: 384, height: 720 });
    expect(doc.sources?.[2]).toMatchObject({ type: "mosaic", ref: "badge" });
  });

  it("a different slot RE-RENDERS the child (it does not rescale it)", async () => {
    const narrow = badgeOf(await render({ slotPct: 20 }));
    const wide = badgeOf(await render({ slotPct: 50 }));
    expect(narrow.size).toEqual({ width: 256, height: 720 });
    expect(wide.size).toEqual({ width: 640, height: 720 });
    // The badge fitted its label for each box — different fitted font sizes.
    expect(JSON.stringify(narrow.sources)).not.toBe(JSON.stringify(wide.sources));
  });

  it("passes its own props down and nothing else", async () => {
    // One word on purpose: the child FITS what it is given, and a fitted
    // label may carry its own line breaks.
    const doc = await render({ badgeText: "handed" });
    expect(JSON.stringify(badgeOf(doc).sources)).toContain("handed");
  });

  it("reports every bad prop at once", async () => {
    await expect(
      NestedTemplateV1.render({ badgeText: "", slotPct: 33 }, targetCtx(1280, 720)),
    ).rejects.toThrow(/badgeText must be 1-24.*steps by 5/s);
  });

  it("renders the same document twice for the same inputs", async () => {
    const once = await render({ slotPct: 25 });
    const twice = await render({ slotPct: 25 });
    expect(JSON.stringify(once)).toBe(JSON.stringify(twice));
  });
});
