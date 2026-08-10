import type {
  MosaicTemplatePackDescriptor,
  MosaicTemplateRepoDescriptor,
} from "@m0saic/types";
import { asRepoId } from "@m0saic/types";

/**
 * Who this repo is. The entry module (src/index.ts) re-exports this as
 * `repo` — one of the two exports every Mosaic host requires from an
 * external template repo (the other is `templates`).
 *
 * Forks: change `repoId` to your own handle before publishing — template ids
 * start with it, and id ownership in a running host is first-registrant-wins
 * per id. `@m0saic-starter` is the id namespace of THIS curated repo.
 */
export const TEMPLATE_REPO: MosaicTemplateRepoDescriptor = {
  repoId: asRepoId("@m0saic-starter"),
  displayName: "m0saic Template Starter",
  schemaVersion: 1,
  description:
    "The m0saic developer curriculum: minimal example templates, each exercising exactly one knob of the template-authoring surface. Clone it, load it, read it, fork it.",
  curator: "m0saic",
  homepage: "https://github.com/m0saic-project/m0saic-template-repo-starter",
  assets: { templatesDir: "assets/templates" },
};

/**
 * The curriculum chapters, in TEACHING ORDER — this array's order flows
 * verbatim into template-manifest.json `packs[]`, which is what browse UIs
 * and CURRICULUM.md follow. Each pack id doubles as the src/<pack>/ folder
 * name and the `<pack>` segment of member template ids.
 */
export const TEMPLATE_PACKS: MosaicTemplatePackDescriptor[] = [
  {
    id: "basics",
    title: "Basics",
    description:
      "Hello world, the hot-reload loop, color tiles, and sizing off ctx.target — the smallest possible templates that still do everything right.",
  },
];
