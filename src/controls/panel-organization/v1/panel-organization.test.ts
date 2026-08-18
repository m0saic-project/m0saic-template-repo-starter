import { asDocument, targetCtx } from "../../../__testutils__/render";
import { PanelOrganizationV1 } from "./panel-organization";
import type { PanelOrganizationProps } from "./panel-organization";

const render = (
  props: Parameters<typeof PanelOrganizationV1.render>[0] = { title: "Field Notes" },
  w = 1280,
  h = 720,
) => PanelOrganizationV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

const meta = (key: keyof PanelOrganizationProps) => PanelOrganizationV1.propsSchema?.[key]?.meta?.ui;

describe("@m0saic-starter/controls/panel-organization/v1", () => {
  it("declares all four placement knobs", () => {
    expect(PanelOrganizationV1.propsSchema?.title?.required).toBe(true);
    expect(meta("accent")?.primary).toBe(true); // optional, pinned on top
    expect(meta("badgeText")?.visibleWhen).toEqual({ prop: "showBadge", equals: "true" });
    expect(meta("watermarkTag")?.hidden).toBe(true);
    expect(meta("frame")?.primary).toBeUndefined(); // the plain-optional control
  });

  it("hidden is not dead: the tag no panel shows still paints", async () => {
    const t = text(await render({ title: "T", watermarkTag: "agent-was-here" }));
    expect(t).toContain("watermarkTag: agent-was-here");
  });

  it("the gated prop renders only when its gate is on", async () => {
    const on = await render({ title: "T", showBadge: true, badgeText: "SOON" });
    expect(text(on)).toContain("SOON");
    const off = await render({ title: "T", showBadge: false, badgeText: "SOON" });
    expect(text(off)).not.toContain("SOON");
  });

  it("frame toggles the layout, badge changes source count", async () => {
    const framed = await render({ title: "T", frame: true, showBadge: false });
    const bare = await render({ title: "T", frame: false, showBadge: false });
    expect(framed.sources.length).toBe(bare.sources.length + 2);
  });

  it("rejects malformed values", async () => {
    await expect(render({ title: "" })).rejects.toThrow(/1-40 char/);
    await expect(render({ title: "T", accent: "red" })).rejects.toThrow(/#rrggbb/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
