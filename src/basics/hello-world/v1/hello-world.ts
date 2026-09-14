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
import {
  HELLO_WORLD_PROPS_SCHEMA,
  defineHelloWorldTemplate,
  defineMosaicTemplate,
} from "@m0saic/template-utils";
import { asTemplateId } from "@m0saic/types";
import { TEMPLATE_REPO } from "../../../repo";

export const HELLO_WORLD_ID = "@m0saic-starter/basics/hello-world/v1";

/** The canonical card, built by the factory. */
const card = defineHelloWorldTemplate({
  id: HELLO_WORLD_ID,
  label: "01 · Hello World",
  // The subline — the muted line under the greeting. One string, one edit.
  subline: `by ${TEMPLATE_REPO.displayName}`,
  tags: ["basics", "starter", "brand", "hello"],
  description:
    "The canonical m0saic hello-world card with this repo's subline: the brand field wipes in, a navy card rises, the M assembles from its own rectangles, then the wordmark and your greeting. The repo's front door — what `m0saic hello-world --template-repo .` renders.",
});

// Spelled out as a literal (not just `card`) on purpose: the repo's
// NO-INSTALL contract check (`npm run test:contract`) loads this module with
// the whole substrate stubbed to an identity proxy, so a factory call alone
// would read as an options bag. The structural fields it asserts — a numeric
// version, a render() function, a props schema — live HERE; with the real
// substrate installed they are exactly the factory's own.
export const HelloWorldV1 = defineMosaicTemplate<HelloWorldProps>({
  ...card,
  id: asTemplateId(HELLO_WORLD_ID),
  version: 1,
  propsSchema: { ...HELLO_WORLD_PROPS_SCHEMA },
  defaultProps: { ...card.defaultProps },
  render: (props, ctx) => card.render(props, ctx),
});

export default HelloWorldV1;
