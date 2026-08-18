import { getConnectionOptionsFetcher } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { OptionsSelectV1 } from "./options-select";

const render = (
  props: Parameters<typeof OptionsSelectV1.render>[0] = {},
  w = 1280,
  h = 720,
) => OptionsSelectV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

const meta = OptionsSelectV1.propsSchema?.collections?.meta;

describe("@m0saic-starter/connections/options-select/v1", () => {
  it("declares the full wire: fetcher kind + the connectionId sibling", () => {
    expect(meta?.control?.optionsFromConnection).toEqual({
      kind: "starter-catalog-collections",
      connectionFromProp: "connectionId",
    });
    // The kind it names is really registered — the circuit is closed.
    expect(getConnectionOptionsFetcher("starter-catalog-collections")).toBeDefined();
    // The sibling the wire names really exists, with a working default.
    expect(OptionsSelectV1.propsSchema?.connectionId).toBeDefined();
    expect(OptionsSelectV1.defaultProps?.connectionId).toBe("starter-catalog@default");
  });

  it("renders a band per picked collection and names the wire", async () => {
    const doc = await render({ collections: ["features", "loops"] });
    // 2 bands x (tile + label) + wire plate (tile + label) + caption
    expect(doc.sources).toHaveLength(2 * 2 + 2 + 1);
    const t = text(doc).replace(/\\n/g, " ");
    expect(t).toContain("Features");
    expect(t).toContain("Loops");
    expect(t).toContain("wire: connectionId = starter-catalog@default");
    expect(t).toContain("OPTIONS FROM A CONNECTION");
  });

  it("a value the static world never heard of still renders — options are upstream-owned", async () => {
    const doc = await render({ collections: ["field-recordings"] });
    expect(text(doc)).toContain("Field Recordings");
  });

  it("rejects malformed values on both props", async () => {
    await expect(render({ collections: [] })).rejects.toThrow(/1-3/);
    await expect(render({ collections: ["Not A Slug!"] })).rejects.toThrow(/lowercase slug/);
    await expect(render({ connectionId: "no-profile" })).rejects.toThrow(/publisher.*profile/);
  });

  it("is deterministic", async () => {
    expect(await render({ collections: ["loops"] })).toEqual(await render({ collections: ["loops"] }));
  });
});
