import { getHostConnection, listRegisteredHostConnectionIds } from "@m0saic/template-utils";

import { asDocument, targetCtx } from "../../../__testutils__/render";
import { HostConnectionV1 } from "./host-connection";

const render = (
  props: Parameters<typeof HostConnectionV1.render>[0] = {},
  w = 1280,
  h = 720,
) => HostConnectionV1.render(props, targetCtx(w, h)).then(asDocument);

const text = (doc: unknown) => JSON.stringify(doc);

describe("@m0saic-starter/connections/host-connection/v1", () => {
  it("the connection this lesson teaches is really registered", () => {
    expect(listRegisteredHostConnectionIds()).toContain("starter-catalog@default");
    const reg = getHostConnection("starter-catalog@default");
    expect(reg?.schema.publisher).toBe("starter-catalog");
    expect(typeof reg?.probe.probe).toBe("function");
  });

  it("renders the Settings card the REAL schema produces, not a mockup", async () => {
    const t = text(await render()).replace(/\\n/g, " ");
    expect(t).toContain("starter-catalog@default");
    expect(t).toContain("BASE URL");
    expect(t).toContain("API KEY");
    expect(t).toContain("keychain");
    expect(t).toContain("configured");
    // The secret input echoes the real UI's redaction; the url shows its placeholder.
    expect(t).toContain("<set - type to replace>");
    expect(t).toContain("http://127.0.0.1:4977");
    expect(t).toContain("reachable (v1) + authenticated");
    expect(t).toContain("REGISTERED ON IMPORT");
  });

  it("binds card bg + title/status/desc + input rows per field + probe banner + caption", async () => {
    const doc = await render();
    // cardBg, title, statusTile, statusText, desc,
    // 2 fields x (label + boxTile + boxText), bannerTile, bannerText, caption
    expect(doc.sources).toHaveLength(1 + 4 + 2 * 3 + 2 + 1);
  });

  it("rejects bad props", async () => {
    await expect(render({ bandColor: "blue" })).rejects.toThrow(/#rrggbb/);
  });

  it("is deterministic", async () => {
    expect(await render()).toEqual(await render());
  });
});
