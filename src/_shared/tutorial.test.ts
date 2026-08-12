import type { MosaicTextSource } from "@m0saic/types";

import { targetCtx } from "../__testutils__/render";
import { TUTORIAL_BUDGET, lessonTutorial } from "./tutorial";

describe("lessonTutorial — the standard curriculum tutorial page", () => {
  const render = lessonTutorial({
    title: "Sample Lesson",
    lines: ["First teaching line.", "Second teaching line."],
    explore: ["Poke knob A", "Resize the canvas"],
  });

  it("builds a branded page: header fill, square M glyph, title, body, try-list, footer", async () => {
    const doc = await render({}, targetCtx(1280, 720));

    expect(doc.kind).toBe("mosaic_document");
    // 6 pieces: header band, logo, title, body, try, footer.
    expect(doc.sources).toHaveLength(6);

    const logo = (doc.sources ?? []).find(
      (s) =>
        s.type === "lavfi" &&
        (s as { mask?: { kind?: string } }).mask?.kind === "inline-mask",
    ) as { mask?: { bounds?: { width: number; height: number } } };
    expect(logo).toBeDefined();
    // Square design space — and the piece rect is square by construction.
    expect(logo.mask?.bounds?.width).toBe(logo.mask?.bounds?.height);

    const texts = (doc.sources ?? [])
      .filter((s) => s.type === "text")
      .map(
        (s) =>
          ((s as MosaicTextSource).layers[0]?.content as { text?: string }).text ?? "",
      );
    expect(texts.join("\n")).toContain("Sample Lesson");
    expect(texts.join("\n")).toContain("First teaching line.");
    expect(texts.join("\n")).toContain("- Poke knob A");
    expect(texts.join("\n")).toContain("Close this tutorial");
  });

  it("owns its duration and sizes off ctx.target", async () => {
    const doc = await render({}, targetCtx(1280, 720, { durationMs: 987654 }));
    expect(doc.durationMs).toBe(12000);
    expect(doc.size).toEqual({ width: 1280, height: 720 });
  });

  it("is deterministic", async () => {
    const a = await render({}, targetCtx(1280, 720));
    const b = await render({}, targetCtx(1280, 720));
    expect(a).toEqual(b);
  });
  it("refuses a tutorial that has grown into documentation", () => {
    // The budget is a gate, not advice: prose drifts a paragraph per
    // revision until the page overflows its own box, which is exactly how
    // this limit came to exist. Failing at IMPORT time means the build and
    // the test run catch it, not a user pressing "?".
    const long = "x".repeat(TUTORIAL_BUDGET.maxLineChars + 1);
    expect(() =>
      lessonTutorial({ title: "Too Long", lines: [long], explore: ["ok"] }),
    ).toThrow(/over budget: longest line/);

    expect(() =>
      lessonTutorial({
        title: "Too Many",
        lines: new Array(TUTORIAL_BUDGET.maxLines + 1).fill("short line"),
        explore: ["ok"],
      }),
    ).toThrow(/over budget: \d+ lines/);

    expect(() =>
      lessonTutorial({
        title: "Chatty Try",
        lines: ["fine"],
        explore: ["y".repeat(TUTORIAL_BUDGET.maxExploreChars + 1)],
      }),
    ).toThrow(/longest Try item/);

    // The error names the fix, not just the sin.
    expect(() =>
      lessonTutorial({ title: "Too Long", lines: [long], explore: [] }),
    ).toThrow(/top-level orientation/);
  });
});
