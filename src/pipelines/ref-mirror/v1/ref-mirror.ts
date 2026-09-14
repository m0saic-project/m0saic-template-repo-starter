import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
  MosaicTextSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { findStableKeys, toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  solidBackground,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/pipelines/ref-mirror/v1` — draw a cell once, show it in
 * several places.
 *
 * ONE CONCEPT: `{ type: "ref", flattenedStableKey }` is a MIRROR of another
 * cell's rendered pixels. The target renders once; every ref reads that same
 * intermediate and decorates its own copy. N mirrors, N decoration chains,
 * ONE decode.
 *
 * The key is a StableKey in the FLATTENED document — `"r"` is the root cell,
 * `"r/fc0"` the first cell of a split, `"r/gcolc4/fc0"` an inner cell of a
 * nested one. It is a coordinate the m0 decides, not a name you invent, so
 * this template ASKS: `findStableKeys(m0, f => f.kind === "frame")` returns
 * them in source order and the hero is the first.
 *
 * Guessing is the trap. This lesson's layout looks like a 5:1 row split, but
 * `weightedSplit` expands it into the run `6[0,0,0,0,2(…),1]` — so the hero
 * sits at `r/gcolc4/fc0`, and a hand-written `"r/fc0"` would resolve to
 * nothing (`MOSAIC_REF_NOT_FOUND`).
 *
 * The decoration is what makes a mirror useful. `placement`, `effects`,
 * `mask`, `visual`, `playback` on the REF apply to that copy only, so the
 * same pixels can be a full-bleed hero in one cell and a contained thumbnail
 * in another.
 *
 * Two limits worth knowing before you reach for it:
 *
 *   - A ref cannot target a `data` source (they occupy no cell) or another
 *     ref (chains are rejected: `MOSAIC_REF_TARGET_NOT_SUPPORTED`).
 *   - For a plain colour, DON'T. `color=` is essentially free, so N lavfi
 *     tiles beat a mirror. Refs pay off against targets with a real
 *     intermediate: media, text-as-image, nested mosaics.
 */

export type RefMirrorProps = {
  /** Word drawn once in the hero cell, then mirrored. */
  word?: string;
  /** How the mirrors fit their cells. */
  mirrorFit?: "contain" | "cover";
};

const ID = "@m0saic-starter/pipelines/ref-mirror/v1";
const FITS = ["contain", "cover"] as const;
const HERO_BG = "#EF7525" as MosaicColor;
const INK = "#17202a" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

const propsSchema = definePropsSchema<RefMirrorProps>({
  word: {
    type: "string",
    required: false,
    description: "Drawn ONCE in the hero cell. The three cells beside it are mirrors of those very pixels, not re-renders.",
    meta: { control: { placeholder: "MIRROR" }, ui: { label: "Word" } },
  },
  mirrorFit: {
    type: "string",
    required: false,
    description: "Placement on the MIRRORS only — the hero is untouched. Same pixels, different treatment per copy.",
    meta: { constraints: { oneOf: [...FITS] }, ui: { label: "Mirror fit" } },
  },
});

export const RefMirrorV1 = defineMosaicTemplate<RefMirrorProps>({
  id: asTemplateId(ID),
  label: "59 · Ref Mirror",
  version: 1,
  description:
    "A ref source mirrors another cell's rendered pixels by flattenedStableKey: the target renders once and every mirror reads the same intermediate, decorating its own copy. N mirrors, one decode.",
  capabilities: { tier: "core" },
  tags: ["pipelines", "refs", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "The three right-hand cells are the left one's pixels — flip Mirror fit and only they change.",
  },

  propsSchema,
  defaultProps: { word: "MIRROR", mirrorFit: "contain" },

  async render(
    props: RefMirrorProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const word = (props.word ?? "MIRROR").trim();
    const mirrorFit = props.mirrorFit ?? "contain";

    const problems: string[] = [];
    if (word.length < 1 || word.length > 12) {
      problems.push(`word must be 1-12 characters, got ${JSON.stringify(word)}`);
    }
    if (!FITS.includes(mirrorFit as (typeof FITS)[number])) {
      problems.push(`mirrorFit must be one of ${FITS.join(" | ")}, got ${JSON.stringify(mirrorFit)}`);
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;

    // Hero on the left, three mirrors stacked on the right, caption band
    // underneath. The hero's key falls out of THIS string: r/fc0.
    const top = String(
      weightedSplit([1, 1], "col", {
        claimants: ["1", String(weightedSplit([1, 1, 1], "row", { claimants: ["1", "1", "1"] }))],
      }),
    );
    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: [top, "1"] })),
      ID,
    );

    // ASK the m0 for the key instead of guessing it. `findStableKeys` walks
    // the FLATTENED geometry in source order, so the first painted frame is
    // the hero — and the answer survives any change to the string above.
    // (Guessing looks fine until a weightedSplit expands into a run: this
    // very layout reads `6[0,0,0,0,2(...),1]`, so the hero is NOT "r/fc0".)
    const heroKey = findStableKeys(m0, (f) => f.kind === "frame", { width, height })[0];

    // A drawtext card: text-as-image is a real intermediate, which is exactly
    // the kind of target a mirror pays off against (a colour tile would not).
    const hero: MosaicSource = {
      type: "text",
      renderMode: { kind: "image" },
      visual: { backgroundColor: solidBackground(HERO_BG) },
      layers: [
        {
          content: { kind: "literal", text: word },
          style: { fontSize: Math.round(height * 0.16), fontColor: INK },
        },
      ],
    } as MosaicTextSource;

    const mirror = (): MosaicSource =>
      ({
        type: "ref",
        // The coordinate, not a name: the m0 above decides it.
        flattenedStableKey: heroKey,
        placement: { fit: mirrorFit },
      }) as unknown as MosaicSource;

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        hero,
        mirror(),
        mirror(),
        mirror(),
        svgLabel(
          `3 mirrors of ${heroKey} - drawn once, decorated three times (fit "${mirrorFit}")`,
          width,
          Math.round(height / 6),
          { maxPx: Math.round(height * 0.028), maxLines: 2, color: INK_DIM },
        ),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Ref Mirror",
    lines: [
      "A ref mirrors another cell's rendered PIXELS: the target renders once and every ref reads that same intermediate.",
      "flattenedStableKey is a coordinate in the flattened geometry - \"r\" the root, \"r/fc0\" a split's first cell. The m0 decides it.",
      "placement, effects, mask and playback on the REF decorate that copy alone - full-bleed here, contained there.",
      "Not for flat colours: color= is nearly free. Refs pay off against media, text-as-image and nested mosaics.",
    ],
    explore: [
      "Flip Mirror fit - only the three copies change",
      "Change Word: all four cells follow, from one render",
      "Read the caption for the key the m0 produced",
    ],
  }),
});

export default RefMirrorV1;
