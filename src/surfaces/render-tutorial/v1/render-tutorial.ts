import type {
  MosaicColor,
  MosaicDocument,
  MosaicDocumentPipeline,
  MosaicEngineContext,
  MosaicPipelineStep,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";

/**
 * `@m0saic-starter/surfaces/render-tutorial/v1` — the lesson that IS its
 * tutorial.
 *
 * ONE CONCEPT: `renderTutorial` returns a renderable the user WATCHES in
 * place — and a real walkthrough is a PIPELINE of pages, each declaring its
 * own `durationMs`. The tutorial owns its timing:
 *
 *   NEVER read `ctx.target.durationMs` in a tutorial.
 *
 * The host passes no form duration, because a tutorial is not rendered into
 * a window — it is scrubbed. Its natural page durations are the whole
 * timeline. Geometry from `ctx.target` is right and expected; DURATION from
 * `ctx.target` is the bug.
 *
 * Every other template in this repo hands `lessonTutorial()` some copy and
 * gets the curriculum's standard ONE-page card. This is the only lesson that
 * builds its own, because building one is the thing being taught — and the
 * shape difference is the point: the standard page is a single
 * `mosaic_document`; a walkthrough is a `mosaic_pipeline` whose steps are
 * pages.
 *
 * The rest of the contract, briefly:
 *   - Invoked with the template's OWN `defaultProps`, never the user's
 *     working props, so the walkthrough reads the same regardless of editor
 *     state. (A cover gets the working props — which at the only moment it
 *     shows ARE the defaults.)
 *   - OPT-IN: no tutorial declared means the "?" pill does not appear.
 *   - An erroring tutorial renders an error mosaic rather than failing
 *     silently — the user clicked, so silence would read as a dead button.
 *     This is the opposite of `renderCover`, on purpose.
 *   - Deterministic, browser-safe, no `ctx.media`.
 *   - The tutorial substitutes only the STAGE. The real document keeps
 *     feeding save, geometry edits and the Make button, so "view-only" holds
 *     by construction instead of by discipline.
 */

export type RenderTutorialProps = {
  /** Headline on the rendered card (the tutorial ignores this). */
  title?: string;
  /** Page background (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/surfaces/render-tutorial/v1";
const PAGE_BG = "#0b0e11";
const BAND_BG = "#151d26";
const ACCENT = "#f2a03d";
const INK = "#eaeef2";
const INK_DIM = "#7f8c9b";

/**
 * The pages, with their own durations. Longer page, longer read — the
 * numbers are the timeline, and nothing outside this file influences them.
 */
const PAGES: { name: string; heading: string; lines: string[]; durationMs: number }[] = [
  {
    name: "what",
    heading: "A tutorial is watched",
    lines: [
      "renderTutorial returns a renderable the user scrubs in place.",
      "It is never rendered to a file, and never runs on the CLI path.",
    ],
    durationMs: 3200,
  },
  {
    name: "timing",
    heading: "It owns its timing",
    lines: [
      "Each page declares its own durationMs; the pipeline total is their sum.",
      "Never read ctx.target.durationMs - the host passes no form duration.",
    ],
    durationMs: 4000,
  },
  {
    name: "optin",
    heading: "Opt-in, and loud on failure",
    lines: [
      "No tutorial declared means no pill appears - hosts synthesize nothing.",
      "A tutorial that throws shows an error card, because the user clicked.",
    ],
    durationMs: 3600,
  },
];

const propsSchema = definePropsSchema<RenderTutorialProps>({
  title: {
    type: "string",
    required: false,
    description: "Headline on the rendered card.",
    meta: { ui: { label: "Title", order: 1 } },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Page background as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: PAGE_BG },
      ui: { label: "Page color", order: 2 },
    },
  },
});

/** One page: a heading band over a body band. Real rects, not floating text. */
function buildPage(
  page: (typeof PAGES)[number],
  width: number,
  height: number,
  fps: number,
  pageBg: MosaicColor,
): MosaicDocument {
  const bands = [1, 2];
  const m0 = weightedSplit(bands, "row", { claimants: ["1{1}", "1{1}"] });
  const headH = height / 3;
  const bodyH = (height * 2) / 3;

  const heading = fitSvgText(page.heading, width * 0.86, headH * 0.62, {
    maxPx: Math.round(height * 0.1),
    maxLines: 1,
  });
  const body = fitSvgLines(page.lines, width * 0.86, bodyH * 0.6, {
    maxPx: Math.round(height * 0.042),
    widthFrac: 0.9,
  });

  return {
    kind: "mosaic_document",
    version: 1,
    m0,
    assets: {},
    backgroundColor: pageBg,
    size: { width, height },
    fps,
    // The page's own duration. This is the line the lesson is about.
    durationMs: page.durationMs,
    sources: [
      makeColorTile(BAND_BG as MosaicColor),
      svgTextSource([
        { text: heading.text, fontSize: heading.fontSize, color: ACCENT as MosaicColor },
      ]),
      makeColorTile(pageBg),
      svgTextSource([
        { text: body.text, fontSize: body.fontSize, color: INK as MosaicColor },
      ]),
    ],
  };
}

export const RenderTutorialV1 = defineMosaicTemplate<RenderTutorialProps>({
  id: asTemplateId(ID),
  label: "70 · Render Tutorial",
  version: 1,
  description:
    "The only lesson in this repo that builds its own tutorial instead of using the standard page — because building one is what it teaches. Three pages as a pipeline, each declaring its own durationMs, proving the rule that a tutorial owns its timing and never reads ctx.target.durationMs.",
  capabilities: { tier: "core" },
  tags: ["surfaces", "tutorial", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Press the ? pill - the walkthrough is three pages long, and it decides how long.",
  },

  propsSchema,
  defaultProps: {
    title: "Press the ? pill",
    pageColor: PAGE_BG,
  },

  async render(
    props: RenderTutorialProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(
        `${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`,
      );
    }
    const { width, height } = ctx.target;
    const pageBg = (props.pageColor ?? PAGE_BG) as MosaicColor;

    const title = fitSvgText(props.title ?? "Press the ? pill", width * 0.86, height * 0.3, {
      maxPx: Math.round(height * 0.12),
      maxLines: 1,
    });
    const total = PAGES.reduce((sum, p) => sum + p.durationMs, 0);
    const note = fitSvgText(
      `The tutorial is ${PAGES.length} pages and ${(total / 1000).toFixed(1)}s - its own, not this card's.`,
      width * 0.86,
      height * 0.2,
      { maxPx: Math.round(height * 0.04), maxLines: 2 },
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String("1{1}", ID),
      assets: {},
      backgroundColor: pageBg,
      sources: [
        makeColorTile(pageBg),
        svgTextSource([
          { text: title.text, fontSize: title.fontSize, color: ACCENT as MosaicColor },
          {
            text: note.text,
            fontSize: note.fontSize,
            color: INK_DIM as MosaicColor,
            vAlign: "bottom",
            padding: { bottom: 0.26 },
          },
        ]),
      ],
    };
  },

  /**
   * The bespoke walkthrough: pages as pipeline steps, each with its own
   * duration, cut between. `fps` comes from `ctx.target` (geometry-ish, and
   * the host's canvas); `durationMs` does NOT.
   */
  renderTutorial(
    _props: RenderTutorialProps,
    ctx: MosaicEngineContext,
  ): MosaicDocumentPipeline {
    const { width, height } = ctx.target;
    const fps = ctx.target.fps ?? 30;
    const pageBg = PAGE_BG as MosaicColor;

    const steps: MosaicPipelineStep[] = PAGES.map((page) => ({
      name: page.name,
      durationMs: page.durationMs,
      file: buildPage(page, width, height, fps, pageBg),
    }));

    return {
      kind: "mosaic_pipeline",
      version: 1,
      fps,
      durationMs: steps.reduce((sum, step) => sum + step.durationMs, 0),
      defaultTransition: { type: "cut" },
      backgroundColor: pageBg,
      steps,
    };
  },
});

export default RenderTutorialV1;
