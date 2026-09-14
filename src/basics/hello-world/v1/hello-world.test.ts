import { resolvePropBindings } from "@m0saic/template-utils";
import { asDocument, defaultCtx } from "../../../__testutils__/render";
import { TEMPLATE_REPO } from "../../../repo";
import { HELLO_WORLD_ID, HelloWorldV1 } from "./hello-world";

type Labelled = { editor?: { label?: string } };
const allSources = (doc: ReturnType<typeof asDocument>): Labelled[] => {
  const kids = (doc as unknown as { children?: Record<string, { sources: Labelled[] }> }).children ?? {};
  return [...(doc.sources as Labelled[]), ...Object.values(kids).flatMap((d) => d.sources)];
};

describe(HELLO_WORLD_ID, () => {
  it("is the repo's front door — what `m0saic hello-world --template-repo .` renders", () => {
    expect(String(HelloWorldV1.id)).toBe(HELLO_WORLD_ID);
    expect(String(TEMPLATE_REPO.helloWorld)).toBe(HELLO_WORLD_ID);
  });

  it("wears this repo's subline as the caption default — one string, edited in repo.ts", () => {
    expect(HelloWorldV1.defaultProps?.caption).toBe(`by ${TEMPLATE_REPO.displayName}`);
    expect(HelloWorldV1.defaultProps?.greeting).toBe("Hello, world.");
    expect(HelloWorldV1.outputHints).toMatchObject({ width: 1920, height: 1080, format: { kind: "video", container: "mp4" } });
  });

  it("renders the canonical card: field, card, M, wordmark, greeting and the subline", async () => {
    const doc = asDocument(await HelloWorldV1.render({ ...HelloWorldV1.defaultProps }, defaultCtx));
    const labels = allSources(doc).map((s) => s.editor?.label ?? "");
    expect(labels).toEqual(expect.arrayContaining(["field", "card", "mark", "wordmark", "greeting", "caption"]));
  });

  it("binds the greeting and the subline — Make's double-click edits them in place", async () => {
    const doc = asDocument(await HelloWorldV1.render({ ...HelloWorldV1.defaultProps }, defaultCtx));
    const { byProp, rejected } = resolvePropBindings(doc, defaultCtx.target.width, defaultCtx.target.height, {
      propsSchema: HelloWorldV1.propsSchema,
    });
    expect(rejected).toEqual([]);
    expect(byProp.greeting).toHaveLength(1);
    expect(byProp.caption).toHaveLength(1);
  });

  it("ships a tutorial page — the repo's law: every lesson has a voice in Make", async () => {
    expect(typeof HelloWorldV1.renderTutorial).toBe("function");
    const page = await HelloWorldV1.renderTutorial!(HelloWorldV1.defaultProps ?? {}, defaultCtx);
    expect(page).toBeTruthy();
  });

  it("is deterministic — identical props, identical document", async () => {
    const a = await HelloWorldV1.render({}, defaultCtx);
    const b = await HelloWorldV1.render({}, defaultCtx);
    expect(a).toEqual(b);
  });
});
