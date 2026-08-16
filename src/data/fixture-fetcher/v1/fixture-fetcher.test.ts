import type { MosaicEngineContext } from "@m0saic/types";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { FixtureFetcherV1, STARTER_FIXTURE_PAYLOAD } from "./fixture-fetcher";

type DataSource = { type: string; alias: string; variables: Record<string, unknown> };

const render = (
  props: Parameters<typeof FixtureFetcherV1.render>[0],
  ctx: MosaicEngineContext = targetCtx(1280, 720),
) => FixtureFetcherV1.render(props, ctx).then(asDocument);

const dataSourceOf = (doc: Awaited<ReturnType<typeof render>>) =>
  (doc.sources ?? []).find((s) => (s as { type?: string }).type === "data") as unknown as DataSource;

/** A ctx with a secret resolver — what tier:"capability" earns. */
const withSecrets = (values: Record<string, string>): MosaicEngineContext =>
  ({
    ...targetCtx(1280, 720),
    secrets: {
      has: async (ref: string) => ref in values,
      get: async (ref: string) => values[ref],
    },
  }) as unknown as MosaicEngineContext;

describe("@m0saic-starter/data/fixture-fetcher/v1", () => {
  it("publishes the payload as a data source under the alias", async () => {
    const block = dataSourceOf(await render({}));
    expect(block.type).toBe("data");
    expect(String(block.alias)).toBe("starterData");
    expect(block.variables).toEqual({ ...STARTER_FIXTURE_PAYLOAD });
  });

  it("declares the capability tier — without it ctx.secrets never arrives", () => {
    expect(FixtureFetcherV1.capabilities?.tier).toBe("capability");
  });

  it("keeps the data source out of the cell count", async () => {
    const doc = await render({});
    const painted = (doc.sources ?? []).filter((s) => (s as { type?: string }).type !== "data");
    // Four painted sources for the two-cell m0 (each cell carries a `{1}`
    // text overlay). The data source claims none of them.
    expect(painted).toHaveLength(4);
    expect(doc.sources).toHaveLength(5);
  });

  it("publishes a DERIVED marker for a secret, never the value", async () => {
    const doc = await render({ secretRef: "env:TOKEN" }, withSecrets({ "env:TOKEN": "hunter2xyz" }));
    const published = dataSourceOf(doc).variables;
    // The REF is echoed — a secret's name is not sensitive, only its value.
    expect(published.secret).toEqual({
      secretResolved: true,
      via: "secretRef",
      secretRef: "env:TOKEN",
      secretLength: 10,
    });
    // The cleartext must not survive anywhere in the document.
    expect(JSON.stringify(doc)).not.toContain("hunter2xyz");
  });

  // An unresolvable secret REPORTS rather than throws. Almost nobody opening
  // this lesson has a credential store configured, and replacing the canvas
  // with a stack trace the moment they type in the field taught nothing —
  // `secretResolved: false` is just as true a fact as the positive case.
  it("reports, rather than throws, when ctx.secrets is absent", async () => {
    const published = dataSourceOf(await render({ secretRef: "env:TOKEN" })).variables;
    const marker = published.secret as Record<string, unknown>;
    expect(marker.secretResolved).toBe(false);
    // Names BOTH causes: no host resolver, or the tier was dropped.
    expect(String(marker.reason)).toMatch(/ctx\.secrets absent/);
    expect(String(marker.reason)).toMatch(/capability/);
  });

  it("reports, rather than throws, when the secret does not resolve", async () => {
    const published = dataSourceOf(
      await render({ secretRef: "env:MISSING" }, withSecrets({})),
    ).variables;
    const marker = published.secret as Record<string, unknown>;
    expect(marker.secretResolved).toBe(false);
    // Every ref it actually tried, so a wrong one is visible on the canvas.
    expect(marker.tried).toEqual(["env:MISSING"]);
    // The reason names BOTH hosts' routes, because which one you have differs.
    expect(String(marker.reason)).toMatch(/env:NAME/);
    expect(String(marker.reason)).toMatch(/connection under Tools/);
  });

  it("treats an empty resolved value as not resolved", async () => {
    const published = dataSourceOf(
      await render({ secretRef: "env:BLANK" }, withSecrets({ "env:BLANK": "" })),
    ).variables;
    const marker = published.secret as Record<string, unknown>;
    expect(marker.secretResolved).toBe(false);
    expect(marker.tried).toEqual(["env:BLANK"]);
  });

  it("falls through to the CONNECTION when secretRef misses — the desktop route", async () => {
    // What a packaged app actually does: the user configures a connection
    // under Tools, and the connection MINTS the keychain ref. Order matches
    // the shipped github/repo-facts-fetcher: secretRef -> connection -> none.
    const ctx = {
      ...targetCtx(1280, 720),
      connections: { has: async () => true, get: async () => ({}) },
      secrets: {
        has: async (ref: string) => ref === "keychain:starter@local/token",
        get: async () => "from-the-keychain",
      },
    } as unknown as MosaicEngineContext;
    const published = dataSourceOf(
      await render({ secretRef: "env:MISSING", connectionId: "starter@local" }, ctx),
    ).variables;
    expect(published.secret).toEqual({
      secretResolved: true,
      via: "connection",
      connectionId: "starter@local",
      secretField: "token",
      secretLength: 17,
    });
  });

  it("an unregistered connection reports both refs it tried", async () => {
    const ctx = {
      ...targetCtx(1280, 720),
      connections: { has: async () => false, get: async () => undefined },
      secrets: { has: async () => false, get: async () => "" },
    } as unknown as MosaicEngineContext;
    const published = dataSourceOf(
      await render({ secretRef: "env:MISSING", connectionId: "nope@local" }, ctx),
    ).variables;
    const marker = published.secret as Record<string, unknown>;
    expect(marker.secretResolved).toBe(false);
    expect(marker.tried).toEqual(["env:MISSING", "keychain:nope@local/token"]);
  });

  it("still renders a full document when the secret fails", async () => {
    // The point of reporting instead of throwing: the lesson stays on screen.
    const doc = await render({ secretRef: "env:MISSING" }, withSecrets({}));
    expect(doc.sources).toHaveLength(5);
    expect(doc.m0).toBeTruthy();
  });

  it("mirrors the payload to a sidecar and declares it", async () => {
    const doc = await render({ payload: { a: 1 } });
    expect(doc.sidecars).toEqual({ starterData: { a: 1 } });
    expect(FixtureFetcherV1.sidecarsSchema?.starterData).toBeDefined();
  });

  it("rejects a bad alias and a non-object payload", async () => {
    await expect(render({ alias: "9lives" })).rejects.toThrow(/alias/);
    await expect(
      render({ payload: [1, 2] as unknown as Record<string, unknown> }),
    ).rejects.toThrow(/plain JSON object/);
  });

  it("renders identically twice", async () => {
    expect(JSON.stringify(await render({}))).toBe(JSON.stringify(await render({})));
  });
});
