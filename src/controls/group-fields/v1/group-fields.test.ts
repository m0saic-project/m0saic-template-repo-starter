import { asDocument, targetCtx } from "../../../__testutils__/render";
import { GroupFieldsV1, parseSpeaker } from "./group-fields";

const render = (
  props: Parameters<typeof GroupFieldsV1.render>[0] = {},
  w = 1280,
  h = 720,
) => GroupFieldsV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/group-fields/v1", () => {
  it("declares a group with ordinary nested definitions", () => {
    const def = GroupFieldsV1.propsSchema?.speaker;
    expect(def?.type).toBe("group");
    expect(Object.keys(def?.fields ?? {})).toEqual(["name", "role", "accent"]);
    // Nested definitions carry ordinary controls — the accent is a real colorPicker.
    expect(def?.fields?.accent?.meta?.control?.colorPicker).toBe(true);
  });

  it("renders the lower third from the one object", async () => {
    const t = text(
      await render({ speaker: { name: "Iris Vale", role: "Narrator", accent: "#27ae60" } }),
    ).replace(/\\n/g, " ");
    expect(t).toContain("Iris Vale");
    expect(t).toContain("Narrator");
    expect(t).toContain("#27ae60");
    expect(t).toContain("GROUP FIELDS");
  });

  it("guards the group as a UNIT — whole or not at all", () => {
    expect(() => parseSpeaker({ name: "A", role: "", accent: "#123456" } as never)).toThrow(/speaker\.role/);
    expect(() => parseSpeaker({ name: "A", role: "B", accent: "green" } as never)).toThrow(/speaker\.accent/);
    expect(() => parseSpeaker("nope" as never)).toThrow(/must be an object/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
