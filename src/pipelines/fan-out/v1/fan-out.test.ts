import { asPipeline, targetCtx } from "../../../__testutils__/render";
import { FanOutV1 } from "./fan-out";

const render = (props: Parameters<typeof FanOutV1.render>[0]) =>
  FanOutV1.render(props, targetCtx(1280, 720)).then(asPipeline);

const sizeOf = (step: unknown) =>
  (step as { file: { size: { width: number; height: number } } }).file.size;

describe("@m0saic-starter/pipelines/fan-out/v1", () => {
  it("emits one file per step, each at its OWN canvas", async () => {
    const p = await render({});
    expect(p.emit).toBe("multi");
    expect(sizeOf(p.steps[0])).toEqual({ width: 1280, height: 720 });
    expect(sizeOf(p.steps[1])).toEqual({ width: 720, height: 1280 });
  });

  it("names every step — the name IS the filename basis", async () => {
    const p = await render({ includeSquare: true });
    expect(p.steps.map((s) => s.name)).toEqual(["landscape", "portrait", "square"]);
    // Duplicate names would be a planner error, so uniqueness is the contract.
    expect(new Set(p.steps.map((s) => s.name)).size).toBe(3);
  });

  it("re-LAYS OUT per shape instead of scaling one design", async () => {
    const p = await render({});
    const landscape = (p.steps[0] as { file: { m0: string } }).file.m0;
    const portrait = (p.steps[1] as { file: { m0: string } }).file.m0;
    // A column split for the wide one, a row split for the tall one.
    expect(landscape).not.toBe(portrait);
    expect(landscape).toContain("(");
    expect(portrait).toContain("[");
  });

  it("derives the variants from ctx.target, not a hardcoded 1920", async () => {
    const p = await FanOutV1.render({}, targetCtx(640, 360)).then(asPipeline);
    expect(sizeOf(p.steps[0])).toEqual({ width: 640, height: 360 });
  });

  it("carries a label for the CLI's output pattern", async () => {
    const p = await render({ title: "Launch" });
    expect(p.steps.every((s) => s.label === "Launch")).toBe(true);
  });
});
