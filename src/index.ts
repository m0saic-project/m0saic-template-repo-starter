import type { MosaicTemplateRepoDescriptor } from "@m0saic/types";

import { HelloWorldV1 } from "./templates/index.js";

// Repo descriptor (useful programmatically; manifest is canonical for browsing)
export const repo: MosaicTemplateRepoDescriptor = {
  schemaVersion: 1,
  repoId: "@m0saic-starter",
  displayName: "Template Repo Starter",
  description: "Golden example 3P template repo for m0saic Make.",
  curator: "m0saic",
  homepage: "https://github.com/m0saic/template-repo-starter",
  assets: {
    templatesDir: "assets/templates"
  }
};

// Canonical executable templates exposed by this repo.
// (Manifest is canonical for browsing; this is canonical for execution wiring.)
export const templates = [HelloWorldV1];

// Named exports MUST match registry.ts exportName
export { HelloWorldV1 };