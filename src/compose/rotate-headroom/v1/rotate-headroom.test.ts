import { asDocument, targetCtx } from "../../../__testutils__/render";
import { RotateHeadroomV1 } from "./rotate-headroom";

const render = (props: Parameters<typeof RotateHeadroomV1.render>[0]) =>
  RotateHeadroomV1.render(props, targetCtx(1280, 720)).then(asDocument);

type Tile = { type: string; ref?: string; effects?: { rotate?: number } };
const tileOf = (doc: { sources?: unknown[] }): Tile => (doc.sources ?? [])[0] as Tile;
const childOf = (doc: { children?: Record<string, unknown> }) =>
  (doc.children ?? {})["card"] as { m0: string; size: { width: number; height: number } };

describe("@m0saic-starter/compose/rotate-headroom/v1", () => {
  it("in-place puts the rotation on the card itself, with no child at all", async () => {
    const doc = await render({ angle: 20, mode: "in-place" });
    expect(tileOf(doc).type).toBe("text");
    expect(tileOf(doc).effects?.rotate).toBe(20);
    expect(doc.children).toBeUndefined();
  });

  it("headroom moves the rotation onto a child sized to the rotated bounds", async () => {
    const angle = 30;
    const doc = await render({ angle, mode: "headroom" });
    expect(tileOf(doc)).toMatchObject({ type: "mosaic", ref: "card", effects: { rotate: angle } });

    // W' = w|cos| + h|sin|, H' = w|sin| + h|cos| for the 704x396 card.
    const rad = (angle * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    // The card is 55% of the CARD AREA (everything above the caption band),
    // not of the whole canvas.
    const card = { width: Math.round(1280 * 0.55), height: Math.round(600 * 0.55) };
    expect(childOf(doc).size).toEqual({
      width: Math.ceil(card.width * cos + card.height * sin),
      height: Math.ceil(card.width * sin + card.height * cos),
    });
    // The child is bigger than the card in both axes — that IS the headroom.
    expect(childOf(doc).size.width).toBeGreaterThan(card.width);
    expect(childOf(doc).size.height).toBeGreaterThan(card.height);
  });

  it("spends no padding at 0 degrees (the child collapses to one cell)", async () => {
    const doc = await render({ angle: 0, mode: "headroom" });
    // The card is 55% of the CARD AREA (everything above the caption band),
    // not of the whole canvas.
    const card = { width: Math.round(1280 * 0.55), height: Math.round(600 * 0.55) };
    expect(childOf(doc).size).toEqual(card); // rotated bounds of 0 deg = the card
    expect(childOf(doc).m0).toBe("1"); // no gutters, so no null cells
  });

  it("draws the same card in both modes — only the buffer differs", async () => {
    const inPlace = await render({ angle: 25, mode: "in-place" });
    const headroom = await render({ angle: 25, mode: "headroom" });
    const cardIn = tileOf(inPlace) as unknown as { layers: unknown[]; visual: unknown };
    const cardChild = (headroom.children?.["card"] as { sources: unknown[] }).sources[0] as {
      layers: unknown[];
      visual: unknown;
    };
    expect(JSON.stringify(cardChild.layers)).toBe(JSON.stringify(cardIn.layers));
    expect(JSON.stringify(cardChild.visual)).toBe(JSON.stringify(cardIn.visual));
    // ...and the child's copy carries no rotation of its own.
    expect((cardChild as { effects?: unknown }).effects).toBeUndefined();
  });

  it("grows the parent's centered box with the angle", async () => {
    const flat = await render({ angle: 0, mode: "headroom" });
    const tilted = await render({ angle: 40, mode: "headroom" });
    // More angle → a bigger box → different gutter weights in the parent m0.
    expect(tilted.m0).not.toBe(flat.m0);
  });

  it("reports both bad props at once", async () => {
    await expect(
      RotateHeadroomV1.render({ angle: 90, mode: "spin" as never }, targetCtx(1280, 720)),
    ).rejects.toThrow(/angle must be -45\.\.45.*mode must be one of/s);
  });
});
