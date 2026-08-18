import { getConnectionOptionsFetcher } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { CriteriaFilterV1, describeFilter, parseFilter } from "./criteria-filter";

const render = (
  props: Parameters<typeof CriteriaFilterV1.render>[0] = {},
  w = 1280,
  h = 720,
) => CriteriaFilterV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/connections/criteria-filter/v1", () => {
  it("declares the catalog: four kinds, idSet wired to the connection", () => {
    const meta = CriteriaFilterV1.propsSchema?.filter?.meta;
    expect(meta?.control?.flavor).toBe("criteriaFilter");
    const criteria = meta?.control?.criteria ?? [];
    expect(criteria.map((c) => c.kind)).toEqual(["search", "idSet", "number", "boolean"]);
    const idSet = criteria.find((c) => c.kind === "idSet");
    expect(idSet?.optionsFromConnection).toEqual({
      kind: "starter-catalog-collections",
      connectionFromProp: "connectionId",
    });
    expect(getConnectionOptionsFetcher("starter-catalog-collections")).toBeDefined();
    expect(CriteriaFilterV1.defaultProps?.connectionId).toBe("starter-catalog@default");
  });

  it("renders one clause per SET criterion, in catalog order", async () => {
    const t = text(await render()).replace(/\\n/g, " ");
    expect(t).toContain('drone');
    expect(t).toContain("includes Shorts");
    expect(t).toContain("under 60s");
    expect(t).toContain("3 criteria AND-ed");
  });

  it("absent key means UNSET — the empty query is a working state", async () => {
    const doc = await render({ filter: {} });
    expect(text(doc)).toContain("matching everything");
  });

  it("value shapes follow the kinds, and BETWEEN alone carries value2", () => {
    expect(describeFilter(parseFilter({ duration: { modifier: "BETWEEN", value: 10, value2: 60 } }))).toEqual([
      { label: "Duration", clause: "between 10s and 60s" },
    ]);
    expect(() => parseFilter({ duration: { modifier: "LESS_THAN", value: 30, value2: 60 } })).toThrow(/only rides BETWEEN/);
    expect(() => parseFilter({ duration: { modifier: "BETWEEN", value: 60, value2: 10 } })).toThrow(/value2/);
  });

  it("unknown criteria and malformed entries are refused with names", () => {
    expect(() => parseFilter({ mood: "upbeat" } as never)).toThrow(/not in this template's criteria catalog/);
    expect(() => parseFilter({ collections: { modifier: "NEAR", value: ["shorts"] } })).toThrow(/modifier/);
    expect(() => parseFilter({ collections: { modifier: "INCLUDES", value: [] } })).toThrow(/non-empty/);
    expect(() => parseFilter({ featured: "yes" } as never)).toThrow(/boolean/);
  });

  it("accepts the same value as a JSON string", async () => {
    const f = { search: "sunrise" };
    expect(await render({ filter: f })).toEqual(await render({ filter: JSON.stringify(f) }));
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
