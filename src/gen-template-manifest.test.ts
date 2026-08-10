import * as fs from "node:fs";
import * as path from "node:path";

import { buildStarterManifest } from "./gen-template-manifest";

/**
 * Manifest freshness: the committed template-manifest.json must be exactly
 * what the current source builds. A drifted manifest means someone edited
 * templates (or the registry) without running `npm run build` — the browse
 * surface would lie about the code.
 */
describe("template-manifest.json freshness", () => {
  it("matches buildStarterManifest() output exactly", () => {
    const committedPath = path.resolve(__dirname, "..", "template-manifest.json");
    const committed = JSON.parse(fs.readFileSync(committedPath, "utf8"));
    expect(committed).toEqual(JSON.parse(JSON.stringify(buildStarterManifest())));
  });
});
