import { asDocument, targetCtx } from "../../../__testutils__/render";
import { ThemeProviderV1, publishedTokensOf } from "./theme-provider";

const render = (props: Parameters<typeof ThemeProviderV1.render>[0]) =>
  ThemeProviderV1.render(props, targetCtx(1280, 720)).then(asDocument);

const dataSource = (doc: { sources?: unknown[] }) =>
  (doc.sources ?? []).find((s) => (s as { type?: string }).type === "data") as {
    type: string;
    alias: string;
    variables: Record<string, unknown>;
  };

describe("@m0saic-starter/compose/theme-provider/v1", () => {
  it("publishes a token block on the channel — that IS the payload", async () => {
    const doc = await render({});
    const published = dataSource(doc);
    expect(published.alias).toBe("theme");
    expect(published.variables.accent).toBe("#EF7525");
    // A data source paints nothing; the swatches beside it are a courtesy.
    expect(doc.sources?.length).toBeGreaterThan(1);
  });

  it("re-skins the whole publication from one prop", async () => {
    const dark = dataSource(await render({ mode: "dark" }));
    const light = dataSource(await render({ mode: "light" }));
    const hc = dataSource(await render({ mode: "high-contrast" }));

    expect(light.variables.surface).not.toBe(dark.variables.surface);
    expect(hc.variables.textPrimary).toBe("#ffffff");
    // Same shape every time — a consumer can't tell which mode it got.
    expect(Object.keys(light.variables).sort()).toEqual(Object.keys(dark.variables).sort());
  });

  it("publishes under whatever alias it is given", async () => {
    const doc = await render({ alias: "brand" });
    expect(dataSource(doc).alias).toBe("brand");
    // ...and the reader helper finds it only under that name.
    expect(publishedTokensOf(doc, "brand")).toBeDefined();
    expect(publishedTokensOf(doc, "theme")).toBeUndefined();
  });

  it("refuses an alias the channel can't carry", async () => {
    await expect(ThemeProviderV1.render({ alias: "2bad!" }, targetCtx(1280, 720))).rejects.toThrow(
      /alias .* must start with a letter/,
    );
  });

  it("paints its swatches in the palette it publishes", async () => {
    const doc = await render({ mode: "light" });
    const tokens = dataSource(doc).variables;
    expect(doc.backgroundColor).toBe(tokens.surfaceApp);
  });
});
