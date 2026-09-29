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
 *
 * Where its WORDS live (the m0saic 0.3.1 template convention): not here. The
 * label, description, tags and each prop's label / hint sit in
 * `hello-world.catalog.json` beside this file — a template's code declares
 * what it IS, its catalog sidecar how it is described, because that may
 * change after the code ships. `catalog: true` asks the factory for exactly
 * that shape.
 */
import type { HelloWorldProps } from "@m0saic/template-utils";
import {
  HELLO_WORLD_PROPS_SCHEMA_BARE,
  defineHelloWorldTemplate,
  defineMosaicTemplate,
} from "@m0saic/template-utils";
import { asTemplateId } from "@m0saic/types";
import { TEMPLATE_REPO } from "../../../repo";
import { lessonTutorial } from "../../../_shared/tutorial";

export const HELLO_WORLD_ID = "@m0saic-starter/basics/hello-world/v1";

/** The canonical card, built by the factory. */
const card = defineHelloWorldTemplate({
  id: HELLO_WORLD_ID,
  // The subline — the muted line under the greeting. One string, one edit.
  subline: `by ${TEMPLATE_REPO.displayName}`,
  catalog: true,
});

// Spelled out as a literal (not just `card`) on purpose: the repo's
// NO-INSTALL contract check (`npm run test:contract`) loads this module with
// the whole substrate stubbed to an identity proxy, so a factory call alone
// would read as an options bag. The structural fields it asserts — a
// render() function, a props schema — live HERE; with the real substrate
// installed they are exactly the factory's own.
export const HelloWorldV1 = defineMosaicTemplate<HelloWorldProps>({
  ...card,
  id: asTemplateId(HELLO_WORLD_ID),
  propsSchema: { ...HELLO_WORLD_PROPS_SCHEMA_BARE },
  defaultProps: { ...card.defaultProps },
  render: (props, ctx) => card.render(props, ctx),

  // The repo's own law (src/props-conventions.test.ts): every lesson ships a
  // tutorial page — Make has no prose surface, so this is the lesson's voice.
  // The core card has none; the starter's copy is a lesson, so it gets one.
  renderTutorial: lessonTutorial({
    title: "Hello, world - the front door",
    lines: [
      "Every template repo opens with this card: the brand field wipes in, the M assembles, the wordmark and greeting land. One call to defineHelloWorldTemplate.",
      "The subline is the only line that is yours. It reads the repo's displayName from src/repo.ts, so renaming the repo re-labels the card.",
      "src/repo.ts names this id as repo.helloWorld - the front door that `m0saic hello-world --template-repo .` renders.",
    ],
    explore: [
      "Edit Greeting and Caption in the props panel",
      "Flip Sweep and Mark reveal; turn Animate off for a still",
      "Read the source: src/basics/hello-world/",
      "Then lesson 02, basics/anatomy: the smallest hand-written template",
    ],
  }),
});

export default HelloWorldV1;
