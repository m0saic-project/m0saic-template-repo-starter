import { registerTemplate, MOSAIC_THEME_ALIAS } from "@m0saic/template-utils";
import type { MosaicEngineContext, MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { ThemeProviderV1 } from "../../theme-provider/v1/theme-provider";
import { ThemeTokensV1 } from "./theme-tokens";

const PROVIDER = "@m0saic-starter/compose/theme-provider/v1";

/** A ctx with a producer's block already on the channel — what a pipeline
 *  hands a consumer in production. */
const themedCtx = (tokens: Record<string, unknown>): MosaicEngineContext =>
  ({
    ...targetCtx(1280, 720),
    upstreamData: { [MOSAIC_THEME_ALIAS]: tokens },
  }) as unknown as MosaicEngineContext;

const swatches = (doc: { sources?: unknown[] }): string[] =>
  (doc.sources ?? [])
    .filter((s) => (s as { type?: string }).type === "lavfi")
    .map((s) => String((s as { color?: string }).color));

describe("@m0saic-starter/compose/theme-tokens/v1", () => {
  beforeAll(() => {
    // The consumer looks the provider up BY ID, so a test has to be its own
    // host — the app and CLI register the repo's templates for free.
    registerTemplate(ThemeProviderV1 as unknown as MosaicTemplate<MosaicTemplateProps>);
  });

  it("source \"local\" ignores every channel", async () => {
    const doc = asDocument(
      await ThemeTokensV1.render({ source: "local" }, themedCtx({ accent: "#ff00aa" })),
    );
    // Even with a producer on the channel, local means local.
    expect(swatches(doc)[0]).toBe("#EF7525");
    expect(JSON.stringify(doc.sources)).toContain("no channel consulted");
  });

  it("source \"upstream\" merges what a pipeline published, per key", async () => {
    const doc = asDocument(
      await ThemeTokensV1.render({ source: "upstream" }, themedCtx({ accent: "#ff00aa" })),
    );
    expect(swatches(doc)[0]).toBe("#ff00aa"); // upstream accent
    expect(swatches(doc)[1]).toBe("#f0a15e"); // local accentSoft, untouched
  });

  it("source \"upstream\" says so when nothing arrived", async () => {
    const doc = asDocument(
      await ThemeTokensV1.render({ source: "upstream" }, targetCtx(1280, 720)),
    );
    expect(swatches(doc)[0]).toBe("#EF7525");
    expect(JSON.stringify(doc.sources)).toContain("no pipeline here");
  });

  it("source \"provider\" calls a producer by id and merges what it published", async () => {
    const dark = asDocument(
      await ThemeTokensV1.render(
        { source: "provider", providerId: PROVIDER, mode: "dark" },
        targetCtx(1280, 720),
      ),
    );
    const light = asDocument(
      await ThemeTokensV1.render(
        { source: "provider", providerId: PROVIDER, mode: "light" },
        targetCtx(1280, 720),
      ),
    );
    // The mode rides along to the provider, so the sheet re-skins.
    expect(swatches(light)[2]).not.toBe(swatches(dark)[2]); // surface
    expect(light.backgroundColor).not.toBe(dark.backgroundColor);
    expect(JSON.stringify(light.sources)).toContain("(themed)");
  });

  it("degrades to local when the provider isn't registered here", async () => {
    // A missing id must never kill the preview — it is the common case while
    // someone is typing one in.
    const doc = asDocument(
      await ThemeTokensV1.render(
        { source: "provider", providerId: "@nobody/does-not-exist/v1" },
        targetCtx(1280, 720),
      ),
    );
    expect(swatches(doc)[0]).toBe("#EF7525");
    expect(JSON.stringify(doc.sources)).toContain("not registered here");
  });

  it("honours a non-default alias on both halves", async () => {
    const doc = asDocument(
      await ThemeTokensV1.render(
        { source: "provider", providerId: PROVIDER, alias: "brand", mode: "high-contrast" },
        targetCtx(1280, 720),
      ),
    );
    // The provider published under "brand" and the consumer read that name.
    expect(swatches(doc)[0]).toBe("#ff8c1a");
  });

  it("reports every bad prop at once", async () => {
    await expect(
      ThemeTokensV1.render(
        { source: "sideways" as never, mode: "sepia" as never, accentFallback: "orange" },
        targetCtx(1280, 720),
      ),
    ).rejects.toThrow(/source must be one of.*mode must be one of.*accentFallback/s);
  });
});
