import { asDocument, targetCtx } from "../../../__testutils__/render";
import { CodeHandoffV1, RUN_COMMAND, parseHandoff } from "./code-handoff";

const render = (
  props: Parameters<typeof CodeHandoffV1.render>[0] = {},
  w = 1280,
  h = 720,
) => CodeHandoffV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/controls/code-handoff/v1", () => {
  it("declares the handoff: type code, payload shipped in defaultProps", () => {
    expect(CodeHandoffV1.propsSchema?.runCommand?.type).toBe("code");
    expect(CodeHandoffV1.defaultProps?.runCommand).toEqual(RUN_COMMAND);
    // The payload names this very template — the loop is self-contained.
    expect(RUN_COMMAND.code).toContain("@m0saic-starter/controls/code-handoff/v1");
    expect(RUN_COMMAND.language).toBe("bash");
  });

  it("renders the direction card with the command and the contrasting input", async () => {
    const t = text(await render()).replace(/\\n/g, " ");
    expect(t).toContain("TEMPLATE -> YOU");
    expect(t).toContain("m0saic make");
    expect(t).toContain("Rendered in the app");
    expect(t).toContain("CODE HANDOFF");
  });

  it("still validates the handoff shape — defaults are not exempt from the law", () => {
    expect(() => parseHandoff({ language: "Not Valid!", code: "x" } as never)).toThrow(/language/);
    expect(() => parseHandoff({ language: "bash", code: "" } as never)).toThrow(/1-4000/);
  });

  it("rejects a malformed input prop", async () => {
    await expect(render({ label: "" })).rejects.toThrow(/1-40 char/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
