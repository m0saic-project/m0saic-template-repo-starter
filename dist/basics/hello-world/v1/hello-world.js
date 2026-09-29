"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorldV1 = exports.HELLO_WORLD_ID = void 0;
const template_utils_1 = require("@m0saic/template-utils");
const types_1 = require("@m0saic/types");
const repo_1 = require("../../../repo");
const tutorial_1 = require("../../../_shared/tutorial");
exports.HELLO_WORLD_ID = "@m0saic-starter/basics/hello-world/v1";
/** The canonical card, built by the factory. */
const card = (0, template_utils_1.defineHelloWorldTemplate)({
    id: exports.HELLO_WORLD_ID,
    // The subline — the muted line under the greeting. One string, one edit.
    subline: `by ${repo_1.TEMPLATE_REPO.displayName}`,
    catalog: true,
});
// Spelled out as a literal (not just `card`) on purpose: the repo's
// NO-INSTALL contract check (`npm run test:contract`) loads this module with
// the whole substrate stubbed to an identity proxy, so a factory call alone
// would read as an options bag. The structural fields it asserts — a
// render() function, a props schema — live HERE; with the real substrate
// installed they are exactly the factory's own.
exports.HelloWorldV1 = (0, template_utils_1.defineMosaicTemplate)({
    ...card,
    id: (0, types_1.asTemplateId)(exports.HELLO_WORLD_ID),
    propsSchema: { ...template_utils_1.HELLO_WORLD_PROPS_SCHEMA_BARE },
    defaultProps: { ...card.defaultProps },
    render: (props, ctx) => card.render(props, ctx),
    // The repo's own law (src/props-conventions.test.ts): every lesson ships a
    // tutorial page — Make has no prose surface, so this is the lesson's voice.
    // The core card has none; the starter's copy is a lesson, so it gets one.
    renderTutorial: (0, tutorial_1.lessonTutorial)({
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
exports.default = exports.HelloWorldV1;
