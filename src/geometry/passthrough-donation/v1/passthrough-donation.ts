import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { lessonTutorial } from "../../../_shared/tutorial";

import { svgLabel } from "../../../_shared/svg-text";

/**
 * `@m0saic-starter/geometry/passthrough-donation/v1` — `0` is not a gap,
 * it's a donation.
 *
 * ONE CONCEPT: PASSTHROUGH SLOTS DONATE FORWARD. In `4(1,0,0,1)` there are
 * four slots but only TWO rendered tiles: the first `1` claims its single
 * slot (25%), then the two `0`s hand their slots to the NEXT claimant —
 * the final `1` renders 0+0+1 = three slots wide (75%).
 *
 * That's the entire mechanism behind weighted splits: a weight of N is
 * spelled as (N-1) passthroughs followed by one claimant, which is exactly
 * what `weightedSplit([1, 3], "col")` emits. This template writes the raw
 * string by hand so the donation is visible, and labels each rendered tile
 * with the slots it ended up owning.
 *
 * (`-` is the OTHER empty token, with the opposite meaning: a null claims
 * its space and paints nothing. The Learn page's fundamentals teach it
 * interactively; lattice-gutters' "split" mode shows nulls spelling gutters
 * in template code.)
 */

export type PassthroughDonationProps = {
  /** How many passthrough slots donate into the second tile (1-8). */
  donatedSlots?: number;
};

const ID = "@m0saic-starter/geometry/passthrough-donation/v1";

const propsSchema = definePropsSchema<PassthroughDonationProps>({
  donatedSlots: {
    type: "number",
    required: false,
    description: "How many `0` slots donate forward into the second tile (1-8).",
    meta: {
      constraints: { min: 1, max: 8 },
      control: { step: 1 },
      ui: { label: "Donated slots" },
    },
  },
});

export const PassthroughDonationV1 = defineMosaicTemplate<PassthroughDonationProps>({
  id: asTemplateId(ID),
  label: "Passthrough Donation",
  version: 1,
  description:
    "4(1,0,0,1) has four slots but two tiles: each 0 donates its slot FORWARD to the next claimant. The labels print each tile's slot arithmetic — this is the mechanism weighted splits are made of.",
  capabilities: { tier: "core" },
  tags: ["geometry", "passthrough", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Crank Donated slots up and watch the right tile absorb them.",
  },

  propsSchema,
  defaultProps: { donatedSlots: 2 },

  async render(
    props: PassthroughDonationProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const donated = props.donatedSlots ?? 2;
    if (!Number.isInteger(donated) || donated < 1 || donated > 8) {
      throw new Error(`${ID}: donatedSlots must be an integer 1-8, got ${donated}.`);
    }

    const { width, height } = ctx.target;
    const totalSlots = donated + 2;

    // The raw spelling, by hand, so the donation is visible:
    // one claimant, `donated` passthroughs, one claimant.
    const tokens = ["1", ...new Array<string>(donated).fill("0"), "1"];
    const row = `${totalSlots}(${tokens.join(",")})`;
    // Labels mirror the same row on the attached overlay.
    const m0 = toM0String(`${row}{${row}}`, ID);

    const leftFrac = 1 / totalSlots;
    const rightFrac = (donated + 1) / totalSlots;
    const leftW = width * leftFrac;
    const rightW = width * rightFrac;

    const pct = (f: number): string => `${Math.round(f * 100)}%`;

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        makeColorTile("#7d6608" as MosaicColor),
        makeColorTile("#1e8449" as MosaicColor),
        svgLabel(`1 slot = ${pct(leftFrac)}`, leftW, height, {
          maxPx: Math.round(height * 0.045),
          maxLines: 3,
        }),
        svgLabel(
          `${new Array<string>(donated).fill("0").join("+")}+1 = ${donated + 1} slots = ${pct(rightFrac)}`,
          rightW,
          height,
          { maxPx: Math.round(height * 0.045), maxLines: 2 },
        ),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Passthrough Donation",
    lines: [
      "A 0 slot donates its space FORWARD to the next claimant: 4(1,0,0,1) is four slots but two tiles - 25% and 75%.",
      "That is the whole mechanism behind weighted splits: a weight of N is spelled as N-1 zeros followed by one claimant.",
    ],
    explore: [
      "Crank Donated slots and watch the right tile absorb them",
      "Geometry view - the zeros are visible as slots, not tiles",
    ],
  }),
});

export default PassthroughDonationV1;
