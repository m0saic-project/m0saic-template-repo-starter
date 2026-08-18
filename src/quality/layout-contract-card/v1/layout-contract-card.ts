import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  withLayoutContract,
} from "@m0saic/template-utils";
import type { LayoutConstraint } from "@m0saic/template-utils";

import { fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/quality/layout-contract-card/v1` — invariants that
 * outlive the string.
 *
 * ONE CONCEPT: the m0 a template returns is exact but DISPOSABLE. Change the
 * canvas or a prop and the whole geometry tree is re-addressed — tile order
 * and stableKeys are per-string, so they cannot carry authored intent. The
 * one thing that survives every regeneration is the LABEL you stamp on a
 * source (`editor: { label }`).
 *
 * So you assert against the label:
 *
 *   { label: "sidebar", maxWidthFrac: 0.4 }
 *
 * "wherever the sidebar lands, it never takes more than 40% of the width."
 * Canvas-INDEPENDENT by construction — one declaration holds at every size,
 * which is the whole point, because the bug you are hunting only appears at
 * some sizes.
 *
 * A constraint targets a KIND, not a node. Tag twelve grid cells `"cell"` and
 * one line constrains all twelve.
 *
 * THE GATE: `withLayoutContract(doc, ctx, { debug })` with `debug` falsy
 * returns your document UNTOUCHED — same reference, no parse, no allocation.
 * That is why a shipped template can leave the call in permanently: it costs
 * nothing until someone flips the knob. Turn it on and a violation renders a
 * LAYOUT_CONTRACT error card at exactly the canvas that broke, instead of a
 * plausible-looking wrong picture.
 *
 * Three ways to run the same check, by audience:
 *   checkLayout()        - the pure evaluator; loop on it in a layout search.
 *   withLayoutContract() - the dev tripwire; renders the violation.
 *   assertLayout()       - the throwing sibling, for tests and CI. This
 *                          template's test uses it (see the .test.ts).
 *
 * Watch it fire: set Sidebar weight to 5 (half the width) and turn Debug
 * layout on.
 */

export type LayoutContractCardProps = {
  /** Sidebar share, in tenths of the canvas width. */
  sidebarWeight?: number;
  /** Run the layout contract and render violations. */
  debugLayout?: boolean;
  /** Sidebar fill (#rrggbb). */
  sidebarColor?: string;
  /** Body fill (#rrggbb). */
  bodyColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/quality/layout-contract-card/v1";
const TOTAL = 10;
const MIN_W = 1;
const MAX_W = 9;

/** The contract. Fractions of the canvas, so it holds at any size. */
const CONSTRAINTS: LayoutConstraint[] = [
  { label: "sidebar", maxWidthFrac: 0.4 },
  { label: "body", minWidthFrac: 0.5 },
];

const propsSchema = definePropsSchema<LayoutContractCardProps>({
  sidebarWeight: {
    type: "number",
    required: false,
    description: `Sidebar share in tenths of the width (${MIN_W}-${MAX_W}). Past 4 it breaks the contract.`,
    meta: {
      constraints: { min: MIN_W, max: MAX_W },
      ui: { label: "Sidebar weight", order: 1 },
    },
  },
  debugLayout: {
    type: "boolean",
    required: false,
    description: "Run the layout contract. Off (default) returns the document untouched.",
    meta: { ui: { label: "Debug layout", order: 2 } },
  },
  sidebarColor: {
    type: "string",
    required: false,
    description: "Sidebar fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#8e44ad" },
      ui: { label: "Sidebar color", order: 3 },
    },
  },
  bodyColor: {
    type: "string",
    required: false,
    description: "Body fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Body color", order: 4 },
    },
  },
});

/** Exported so the test can assert the same contract the template ships. */
export const LAYOUT_CONSTRAINTS = CONSTRAINTS;

export const LayoutContractCardV1 = defineMosaicTemplate<LayoutContractCardProps>({
  id: asTemplateId(ID),
  label: "70 · Layout Contract Card",
  version: 1,
  description:
    "Ratio invariants authored against LABELS, which survive every m0 the template regenerates — unlike tile order and stableKeys, which do not. Push the sidebar past 40% with the contract on and the render becomes the violation report, at exactly the canvas that broke.",
  capabilities: { tier: "core" },
  tags: ["quality", "contracts", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Sidebar weight 5 + Debug layout on = the contract fires. Any canvas.",
  },

  propsSchema,
  defaultProps: {
    sidebarWeight: 3,
    debugLayout: false,
    sidebarColor: "#8e44ad",
    bodyColor: "#1c2833",
  },

  async render(
    props: LayoutContractCardProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    for (const [key, value] of [
      ["sidebarColor", props.sidebarColor],
      ["bodyColor", props.bodyColor],
    ] as const) {
      if (value !== undefined && !HEX.test(value)) {
        throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
      }
    }
    const weight = Math.round(props.sidebarWeight ?? 3);
    if (weight < MIN_W || weight > MAX_W) {
      throw new Error(`${ID}: sidebarWeight ${weight} out of range ${MIN_W}-${MAX_W}.`);
    }
    const { width, height } = ctx.target;

    const m0 = weightedSplit([weight, TOTAL - weight], "col", {
      claimants: ["1", "1{1}"],
    });

    const frac = weight / TOTAL;
    const caption = fitSvgText(
      `sidebar ${(frac * 100).toFixed(0)}% of width - contract allows up to 40%`,
      width * 0.5,
      height * 0.2,
      { maxPx: Math.round(height * 0.035), maxLines: 2 },
    );

    // The LABEL is the durable identity. Everything else about this document
    // is re-derived the moment a prop or the canvas changes.
    const sources: MosaicSource[] = [
      { ...makeColorTile((props.sidebarColor ?? "#8e44ad") as MosaicColor), editor: { label: "sidebar" } } as MosaicSource,
      { ...makeColorTile((props.bodyColor ?? "#1c2833") as MosaicColor), editor: { label: "body" } } as MosaicSource,
      svgTextSource([
        {
          text: caption.text,
          fontSize: caption.fontSize,
          color: "#d5dbdb" as MosaicColor,
        },
      ]),
    ];

    const doc: MosaicDocument = {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      sources,
    };

    // Debug off → `doc` comes back by reference, untouched. Debug on → the
    // contract runs, stamps `editor.layoutContract`, and replaces the
    // document with a violation card if an invariant broke.
    return withLayoutContract(doc, ctx, {
      templateId: ID,
      constraints: CONSTRAINTS,
      debug: props.debugLayout,
    });
  },

  renderTutorial: lessonTutorial({
    title: "Layout Contract Card",
    lines: [
      "The m0 is disposable - it re-addresses every node on any change - so intent rides on the LABEL you stamp, the one identity that survives.",
      "Constraints are canvas-INDEPENDENT fractions, so one line holds at every size. That matters: the bug you are hunting only shows at some sizes.",
      "debug falsy returns your document untouched, same reference - so the call can stay in a shipped template at zero cost.",
    ],
    explore: [
      "Set Sidebar weight to 5, turn Debug layout on",
      "Resize the canvas - the same contract still holds",
    ],
  }),
});

export default LayoutContractCardV1;
