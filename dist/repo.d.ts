import type { MosaicTemplatePackDescriptor, MosaicTemplateRepoDescriptor } from "@m0saic/types";
/**
 * Who this repo is. The entry module (src/index.ts) re-exports this as
 * `repo` — one of the two exports every Mosaic host requires from an
 * external template repo (the other is `templates`).
 *
 * Forks: change `repoId` to your own handle before publishing — template ids
 * start with it, and id ownership in a running host is first-registrant-wins
 * per id. `@m0saic-starter` is the id namespace of THIS curated repo.
 */
export declare const TEMPLATE_REPO: MosaicTemplateRepoDescriptor;
/**
 * The curriculum chapters, in TEACHING ORDER — this array's order flows
 * verbatim into template-manifest.json `packs[]`, which is what browse UIs
 * and CURRICULUM.md follow. Each pack id doubles as the src/<pack>/ folder
 * name and the `<pack>` segment of member template ids.
 */
export declare const TEMPLATE_PACKS: MosaicTemplatePackDescriptor[];
