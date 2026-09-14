import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { isValidM0String } from "@m0saic/dsl";
import { evaluateM0, toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  makeErrorMosaic,
  svgLabel,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/controls/m0-prop/v1` — the layout itself as a prop.
 *
 * ONE CONCEPT: `type: "m0"`. In m0saic the product IS the m0 string — so of
 * course a string of layout can be a VALUE. Declaring the type (instead of
 * `type: "string"`) tells the editor the value is grammar, not prose: Make
 * renders an m0-aware editor for it, and everyone downstream knows to
 * validate rather than trust.
 *
 * That validation is the lesson's second half. A prop that is grammar gets
 * the same discipline as any other untrusted input, with the DSL's own
 * tools: `isValidM0String` at the boundary (never regex, never trust), and
 * a report card — not a dead render — when the string doesn't parse.
 *
 * The render frames the user's layout: the m0 becomes a nested cell inside
 * a padded stage, drawn as a wireframe (one alternating tile per claim,
 * counted with `evaluateM0().frameCount` — the same binding rule the
 * quality chapter's real-capture lessons use). Bring your own geometry;
 * this template supplies the pixels.
 *
 * DEGRADE, DON'T REFUSE. Dictionary layouts run to many thousands of chars
 * and hundreds of claims, and every rung of the ladder still answers:
 *   - invalid grammar            → report card naming the validator;
 *   - beyond MAX_CHARS           → honest "beyond this lesson", never
 *                                  "does not parse" (the cap is the
 *                                  lesson's, not the grammar's);
 *   - over the claim budget      → the STATS CARD: the layout measured
 *                                  (chars, claims, floors, safe minimum)
 *                                  instead of drawn — a working render;
 *   - valid but infeasible here  → the floors card naming the safe
 *                                  minimum the framed layout needs.
 */

export type M0PropProps = {
  /** The layout to frame — a raw m0 string. */
  layout?: string;
  /** Accent fill (#rrggbb). */
  bandColor?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/m0-prop/v1";
/** Grammar has no cap; this LESSON stops wireframing somewhere sane. */
export const MAX_CHARS = 32000;
export const WIREFRAME_CLAIM_BUDGET = 120;

/** A friendly default: a little dashboard-ish arrangement. */
export const DEFAULT_LAYOUT = "3(2[1,1],1,2[1,2(1,1)])";

/** A darker twin of a #rrggbb colour. */
function shade(hex: string): MosaicColor {
  const n = parseInt(hex.slice(1), 16);
  const dim = (v: number) => Math.max(0, Math.round(v * 0.62));
  const hh = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}` as MosaicColor;
}

const propsSchema = definePropsSchema<M0PropProps>({
  layout: {
    type: "m0",
    required: false,
    description:
      "The layout to frame, as a raw m0 string. type m0 tells the editor this value is grammar, not prose — and the template validates it like any untrusted input.",
    meta: {
      ui: { label: "Layout", order: 1 },
    },
  },
  bandColor: {
    type: "string",
    required: false,
    description: "Accent fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#2e86c1" },
      ui: { label: "Band color", order: 2 },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 3 },
    },
  },
});

export const M0PropV1 = defineMosaicTemplate<M0PropProps>({
  id: asTemplateId(ID),
  label: "28 · m0 Prop",
  version: 1,
  description:
    "The layout itself as a prop: type m0 tells the editor the value is grammar, not prose, and the template treats it like any untrusted input — isValidM0String at the boundary, a report card instead of a dead render when it doesn't parse. Valid layouts are framed and wireframed, one tile per claim; heavy layouts DEGRADE instead of failing — hundreds of claims get a measured stats card (chars, claims, floors), and a layout too big for this canvas gets the floors card naming its safe minimum. The grammar has no cap; only lessons and budgets do.",
  capabilities: { tier: "core" },
  tags: ["controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Paste any m0 into Layout — a valid string is framed as a wireframe; an invalid one gets a report card naming the problem, never a dead preview.",
  },

  propsSchema,
  defaultProps: {
    layout: DEFAULT_LAYOUT,
    bandColor: "#2e86c1",
    pageColor: "#1c2833",
  },

  async render(
    props: M0PropProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    for (const [key, value] of [
      ["bandColor", props.bandColor],
      ["pageColor", props.pageColor],
    ] as const) {
      if (value !== undefined && !HEX.test(value)) {
        throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
      }
    }
    const layout = (props.layout ?? DEFAULT_LAYOUT).trim();
    const { width, height } = ctx.target;
    const bandHex = props.bandColor ?? "#2e86c1";
    const band = bandHex as MosaicColor;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    // The boundary: grammar props are untrusted input. Report, don't die —
    // and DEGRADE, don't refuse: a real dictionary layout can run to many
    // thousands of chars and hundreds of claims, and every rung of this
    // ladder still returns a working document.
    if (layout.length === 0 || !isValidM0String(layout)) {
      return makeErrorMosaic(
        [
          `- the layout prop is not a valid m0 string`,
          `- validate with isValidM0String / validateM0String before shipping one`,
          `- try the default: ${DEFAULT_LAYOUT}`,
        ].join("\n"),
        { width, height, title: "Layout does not parse", errorCode: "STARTER_INVALID_M0_PROP" },
      );
    }
    if (layout.length > MAX_CHARS) {
      // Valid grammar, honestly out of this LESSON's scope — say that,
      // never "does not parse".
      return makeErrorMosaic(
        [
          `- this layout is valid m0, but at ${layout.length} chars it is beyond what this lesson renders (cap ${MAX_CHARS})`,
          `- the cap is the lesson's, not the grammar's — real templates set their own budget`,
        ].join("\n"),
        { width, height, title: "Layout larger than this lesson renders", errorCode: "STARTER_M0_PROP_TOO_LARGE" },
      );
    }

    // Measure the user's layout ON ITS OWN before composing anything.
    const own = evaluateM0(layout, { width, height });

    // Too many claims to wireframe? Still a working render: the stats card
    // — the layout measured, not drawn. (Hundreds of one-source-per-claim
    // tiles is a cost budget, not a validity question.)
    if (own.frameCount > WIREFRAME_CLAIM_BUDGET) {
      const statsRow = String(weightedSplit([8, 84, 8], "col", {
        mode: "literal",
        claimants: ["-", "1{1}", "-"],
      }));
      const statRows = String(weightedSplit([14, 14, 4, 14, 4, 14, 36], "row", {
        mode: "literal",
        claimants: ["-", statsRow, "-", statsRow, "-", statsRow, "-"],
      }));
      const statsM0 = toM0String(`${statRows}{6[-,-,-,-,-,1]}`, ID);
      const stats: MosaicSource[] = [];
      const line = (text: string) => {
        stats.push(makeColorTile(shade(bandHex)));
        stats.push(
          svgLabel(text, width * 0.78, height * 0.12, {
            color: "#eaeef2" as MosaicColor,
            maxPx: Math.round(height * 0.03),
            vAlign: "middle",
          }),
        );
      };
      line(`${layout.length} chars - ${own.frameCount} claims (wireframe budget is ${WIREFRAME_CLAIM_BUDGET})`);
      line(`feasibility ${own.feasibility.minWidthPx}x${own.feasibility.minHeightPx} - precision ${own.precision.maxSplitX}x${own.precision.maxSplitY}`);
      line(`safe minimum ${own.recommendedMin.width}x${own.recommendedMin.height}${own.feasible ? "" : " - above this canvas"}`);
      const statsHeading = fitSvgText(
        "M0 PROP - layout received and MEASURED; too many claims to wireframe here",
        width * 0.9,
        height * 0.07,
        { maxPx: Math.round(height * 0.03), maxLines: 1 },
      );
      const statsReadout = fitSvgLines(
        [
          "a heavy layout is not an error - this card is the degrade path: measured floors instead of a wireframe",
          "real consumers set their own claim budget; the grammar has no cap",
        ],
        width * 0.9,
        height * 0.09,
        { maxPx: Math.round(height * 0.026), widthFrac: 0.92 },
      );
      stats.push(
        svgTextSource([
          {
            text: statsHeading.text,
            fontSize: statsHeading.fontSize,
            color: "#eaeef2" as MosaicColor,
            vAlign: "top",
            padding: { top: 0.08 },
          },
          {
            text: statsReadout.text,
            fontSize: statsReadout.fontSize,
            color: "#7f8c9b" as MosaicColor,
            vAlign: "bottom",
            padding: { bottom: 0.12 },
          },
        ]),
      );
      return {
        kind: "mosaic_document",
        version: 1,
        m0: statsM0,
        assets: {},
        backgroundColor: page,
        sources: stats,
      };
    }

    // Frame the user's layout on a padded stage, wireframe-bound.
    const stage = String(weightedSplit([8, 84, 8], "col", {
      mode: "literal",
      claimants: ["-", layout, "-"],
    }));
    const rows = String(weightedSplit([8, 64, 28], "row", {
      mode: "literal",
      claimants: ["-", stage, "-"],
    }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const e = evaluateM0(String(m0), { width, height });
    // Valid but infeasible once framed at THIS canvas — the floors lessons'
    // territory. Name the number instead of handing the engine a doomed m0.
    if (!e.feasible) {
      return makeErrorMosaic(
        [
          `- this layout is valid, but framed on this stage its safe minimum is ${e.recommendedMin.width}x${e.recommendedMin.height}`,
          `- the canvas is ${width}x${height} - raise it, or hand over a lighter layout`,
          `- why nesting multiplies the floor: see the quality chapter's floors lessons`,
        ].join("\n"),
        { width, height, title: "Layout larger than this canvas", errorCode: "STARTER_M0_PROP_INFEASIBLE" },
      );
    }
    const sources: MosaicSource[] = [];
    // One alternating tile per claim — frameCount is the binding rule.
    // Subtract the caption's own claim, appended as the text source below.
    for (let i = 0; i < e.frameCount - 1; i++) {
      sources.push(makeColorTile(i % 2 === 0 ? band : shade(bandHex)));
    }

    const heading = fitSvgText(
      `M0 PROP - your ${layout.length}-char layout, framed and wireframed (${e.frameCount - 1} claims)`,
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.032), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        "type m0 = the value is grammar; the editor knows, and the template validates at the boundary like any untrusted input",
        "invalid strings get a report card, never a dead render - and claims are counted with evaluateM0().frameCount",
      ],
      width * 0.9,
      height * 0.09,
      { maxPx: Math.round(height * 0.026), widthFrac: 0.92 },
    );
    sources.push(
      svgTextSource([
        {
          text: heading.text,
          fontSize: heading.fontSize,
          color: "#eaeef2" as MosaicColor,
          vAlign: "top",
          padding: { top: 0.08 },
        },
        {
          text: readout.text,
          fontSize: readout.fontSize,
          color: "#7f8c9b" as MosaicColor,
          vAlign: "bottom",
          padding: { bottom: 0.12 },
        },
      ]),
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: page,
      sources,
    };
  },

  renderTutorial: lessonTutorial({
    title: "m0 Prop",
    lines: [
      "type m0: the layout itself is a value. The editor treats it as grammar, not prose - and so must the template.",
      "Validate at the boundary with isValidM0String; an invalid string gets a report card, never a dead render.",
      "Heavy layouts degrade, never fail: hundreds of claims become a measured stats card; an infeasible one names its safe minimum.",
    ],
    explore: [
      "Paste any m0 from another lesson's Geometry view",
      "Break it on purpose - the report card names the fix",
    ],
  }),
});

export default M0PropV1;
