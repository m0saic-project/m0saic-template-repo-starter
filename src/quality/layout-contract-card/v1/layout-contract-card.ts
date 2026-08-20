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
import type { LayoutConstraint, RelationalConstraint } from "@m0saic/template-utils";

import { fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/quality/layout-contract-card/v1` — invariants that
 * outlive the string, DRAWN.
 *
 * ONE CONCEPT: the m0 a template returns is exact but DISPOSABLE. Change the
 * canvas or a prop and the whole geometry tree is re-addressed — tile order
 * and stableKeys are per-string, so they cannot carry authored intent. The
 * one thing that survives every regeneration is the LABEL you stamp on a
 * source (`editor: { label }`).
 *
 * A constraint targets a KIND, not a node. This card tags four rail tiles
 * `"card"` and ONE relation line constrains all four:
 *
 *   { label: "card", equal: "size" }
 *
 * "wherever the cards land, they are all the same size." Canvas-INDEPENDENT
 * by construction — one declaration holds at every size, which is the whole
 * point, because the bug you are hunting only appears at some sizes.
 *
 * THE GATE, now visual: `withLayoutContract(doc, ctx, { debug })` with
 * `debug` falsy returns your document UNTOUCHED — same reference, no parse,
 * no allocation. That is why a shipped template can leave the call in
 * permanently. Turn it on and the render becomes the CONTRACT VIEW:
 *
 *   - rules hold  -> every rule member drawn GREEN, the banner naming each
 *     rule with its measured result ("card equal size OK - spread 0.4%").
 *   - rule broken -> the offender drawn RED among the green survivors, the
 *     banner naming the label and the number that broke.
 *
 * A contract that silently no-ops on success is indistinguishable from a
 * contract that never ran; the green view is the proof it ran.
 *
 * Three ways to run the same check, by audience:
 *   checkLayout()        - the pure evaluator; loop on it in a layout search.
 *   withLayoutContract() - the dev tripwire; draws the contract view.
 *   assertLayout()       - the throwing sibling, for tests and CI. This
 *                          template's test uses it (see the .test.ts).
 *
 * Watch it work: turn Debug layout on (four green cards). Then set Stretch
 * card to 1.5 — one red card among the green.
 */

export type LayoutContractCardProps = {
  /** Width multiplier on the THIRD card. 1 = uniform; past ~1.02 the equal-size rule fires. */
  stretchCard?: number;
  /** Run the layout contract and render the contract view. */
  debugLayout?: boolean;
  /** Card fill (#rrggbb). */
  cardColor?: string;
  /** Header fill (#rrggbb). */
  headerColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/quality/layout-contract-card/v1";
const CARDS = 4;
const MIN_S = 1;
const MAX_S = 3;
/** Card weight in rail units; gaps are 1 unit. */
const CARD_W = 10;

/** The contract. One relation covers all four cards; one constraint, the header. */
const RELATIONS: RelationalConstraint[] = [{ label: "card", equal: "size" }];
const CONSTRAINTS: LayoutConstraint[] = [{ label: "header", maxHeightFrac: 0.35 }];

const propsSchema = definePropsSchema<LayoutContractCardProps>({
  stretchCard: {
    type: "number",
    required: false,
    description: `Width multiplier on the third card (${MIN_S}-${MAX_S}). 1 keeps the rail uniform; anything past ~1.02 breaks the equal-size rule (tolerance 2%).`,
    meta: {
      constraints: { min: MIN_S, max: MAX_S },
      control: { flavor: "slider", step: 0.1 },
      ui: { label: "Stretch card", order: 1 },
    },
  },
  debugLayout: {
    type: "boolean",
    required: false,
    description:
      "Run the layout contract and render the CONTRACT VIEW: members green with the measured rule when it holds, the offender red among them when it breaks. Off (default) returns the document untouched.",
    meta: { ui: { label: "Debug layout", order: 2 } },
  },
  cardColor: {
    type: "string",
    required: false,
    description: "Card fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#2e86c1" },
      ui: { label: "Card color", order: 3 },
    },
  },
  headerColor: {
    type: "string",
    required: false,
    description: "Header fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#8e44ad" },
      ui: { label: "Header color", order: 4 },
    },
  },
});

/** Exported so the test can assert the same contract the template ships. */
export const LAYOUT_RELATIONS = RELATIONS;
export const LAYOUT_CONSTRAINTS = CONSTRAINTS;

export const LayoutContractCardV1 = defineMosaicTemplate<LayoutContractCardProps>({
  id: asTemplateId(ID),
  label: "70 · Layout Contract Card",
  version: 1,
  description:
    "Ratio invariants authored against LABELS, which survive every m0 the template regenerates. One relation makes four cards equal; debug on DRAWS the contract — green members with the measured rule, or the stretched card red among them.",
  capabilities: { tier: "core" },
  tags: ["quality", "contracts", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Debug layout on = four green cards + the measured rule. Stretch card 1.5 = one red among green. Any canvas.",
  },

  propsSchema,
  defaultProps: {
    stretchCard: 1,
    debugLayout: false,
    cardColor: "#2e86c1",
    headerColor: "#8e44ad",
  },

  async render(
    props: LayoutContractCardProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    for (const [key, value] of [
      ["cardColor", props.cardColor],
      ["headerColor", props.headerColor],
    ] as const) {
      if (value !== undefined && !HEX.test(value)) {
        throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
      }
    }
    const stretch = Math.round((props.stretchCard ?? 1) * 10) / 10;
    if (stretch < MIN_S || stretch > MAX_S) {
      throw new Error(`${ID}: stretchCard ${stretch} out of range ${MIN_S}-${MAX_S}.`);
    }
    const { width, height } = ctx.target;

    // The rail: four cards, gaps between. The THIRD card carries the stretch.
    // Weights are rail units, not pixels — the same string reflows anywhere.
    const railWeights: number[] = [];
    const railClaimants: string[] = [];
    for (let i = 0; i < CARDS; i++) {
      if (i > 0) {
        railWeights.push(1);
        railClaimants.push("-");
      }
      railWeights.push(i === 2 ? Math.round(CARD_W * stretch) : CARD_W);
      railClaimants.push("1");
    }
    const railM0 = weightedSplit(railWeights, "col", { claimants: railClaimants });

    // Header band (tile + caption overlay), a gap, the card rail, breathing room.
    const m0 = weightedSplit([4, 1, 7, 2], "row", {
      claimants: ["1{1}", "-", String(railM0), "-"],
    });

    const heading = fitSvgText("One label, one rule, four cards", width * 0.86, height * 0.16, {
      maxPx: Math.round(height * 0.07),
      maxLines: 1,
    });
    const spreadPct = ((stretch - 1) / stretch) * 100;
    const note = fitSvgText(
      stretch === 1
        ? 'all four tiles are tagged "card" - equal size holds everywhere'
        : `third card ${stretch.toFixed(1)}x wide - spread ${spreadPct.toFixed(0)}% breaks the 2% rule`,
      width * 0.86,
      height * 0.12,
      { maxPx: Math.round(height * 0.032), maxLines: 2 },
    );

    // The LABEL is the durable identity. Everything else about this document
    // is re-derived the moment a prop or the canvas changes.
    const cardTile = (): MosaicSource =>
      ({ ...makeColorTile((props.cardColor ?? "#2e86c1") as MosaicColor), editor: { label: "card" } } as MosaicSource);
    const sources: MosaicSource[] = [
      { ...makeColorTile((props.headerColor ?? "#8e44ad") as MosaicColor), editor: { label: "header" } } as MosaicSource,
      svgTextSource([
        { text: heading.text, fontSize: heading.fontSize, color: "#eaeef2" as MosaicColor },
        {
          text: note.text,
          fontSize: note.fontSize,
          color: "#d5dbdb" as MosaicColor,
          vAlign: "bottom",
          padding: { bottom: 0.1 },
        },
      ]),
      cardTile(),
      cardTile(),
      cardTile(),
      cardTile(),
    ];

    const doc: MosaicDocument = {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      sources,
      backgroundColor: "#1c2833" as MosaicColor,
    };

    // Debug off -> `doc` comes back by reference, untouched. Debug on -> the
    // contract runs, stamps `editor.layoutContract`, and the render becomes
    // the contract view: green members + measured rules, or the offender red.
    return withLayoutContract(doc, ctx, {
      templateId: ID,
      relations: RELATIONS,
      constraints: CONSTRAINTS,
      debug: props.debugLayout,
    });
  },

  renderTutorial: lessonTutorial({
    title: "Layout Contract Card",
    lines: [
      "The m0 is disposable - it re-addresses every node on any change - so intent rides on the LABEL you stamp, the one identity that survives.",
      "A rule targets a KIND, not a node: tag four tiles \"card\" and one equal-size line constrains all four, at every canvas.",
      "Debug on DRAWS the contract: members green with the measured rule when it holds, the offender red among them when it breaks.",
      "Off returns your document untouched, same reference - zero cost in shipped code.",
    ],
    explore: [
      "Turn Debug layout on - four green cards + the measured spread",
      "Set Stretch card to 1.5 - one red card among the green",
    ],
  }),
});

export default LayoutContractCardV1;
