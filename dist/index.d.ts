/**
 * Entry module for the `@m0saic-starter` template repo.
 *
 * A host (Mosaic Desktop, or the CLI's `--template-repo`) imports THIS file
 * and reads two exports:
 *
 *   • `repo`      — a MosaicTemplateRepoDescriptor: who this repo is.
 *   • `templates` — the array of templates to register.
 *
 * `getTemplates()` is accepted in place of `templates` for lazy repos.
 * Nothing else is required — THE HOST does the registering, so this file
 * must NOT call `registerTemplate` itself. (Built-in packs register on
 * import because they're loaded a different way; an external repo that
 * self-registers would double-register.)
 *
 * `template-manifest.json` mirrors this list so the app can populate its
 * browse UI WITHOUT executing any of this code — the build's manifest
 * generator asserts the two can't drift.
 */
import type { MosaicTemplate, MosaicTemplateProps } from "@m0saic/types";
import { TEMPLATE_PACKS, TEMPLATE_REPO } from "./repo";
export declare const repo: import("@m0saic/types").MosaicTemplateRepoDescriptor;
/** Every template in the curriculum, chapter by chapter, in teaching order. */
export declare const templates: MosaicTemplate<MosaicTemplateProps>[];
export * from "./basics";
export * from "./geometry";
export * from "./props";
export * from "./media";
export * from "./text";
export * from "./masks";
export * from "./compose";
export * from "./pipelines";
export * from "./data";
export * from "./surfaces";
export * from "./quality";
export { TEMPLATE_PACKS, TEMPLATE_REPO };
