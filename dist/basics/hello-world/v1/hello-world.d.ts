/**
 * `@m0saic-starter/basics/hello-world/v1` — the repo's FRONT DOOR.
 *
 * The canonical m0saic hello-world card — the brand-pattern field wiping in,
 * the M assembling from its own rectangles, the wordmark, a greeting — with
 * THIS repo's subline under it. It is one call to `defineHelloWorldTemplate`
 * from `@m0saic/template-utils`; nothing here is hand-drawn, which is the
 * point: every template repo ships the same card, so `m0saic hello-world
 * --template-repo .` and Make's "Start here" land on something a newcomer
 * already recognises. Lesson 02 (`basics/anatomy`) is the smallest template
 * written by hand.
 *
 * The convention (`repo.helloWorld` in src/repo.ts names this id):
 *   · default chrome — keep this call; edit the subline in ONE place
 *     (`TEMPLATE_REPO.displayName`, or pass your own string below);
 *   · your own look — write your own template and point `repo.helloWorld`
 *     at it. The gate warns (never fails) while a repo names no front door.
 */
import type { HelloWorldProps } from "@m0saic/template-utils";
export declare const HELLO_WORLD_ID = "@m0saic-starter/basics/hello-world/v1";
export declare const HelloWorldV1: import("@m0saic/types").MosaicTemplate<HelloWorldProps, import("@m0saic/types").MosaicTemplateOutputs, import("@m0saic/types").MosaicTemplateUpstreamVariables, import("@m0saic/types").MosaicTemplateUpstreamData, import("@m0saic/types").MosaicTemplateSidecars>;
export default HelloWorldV1;
