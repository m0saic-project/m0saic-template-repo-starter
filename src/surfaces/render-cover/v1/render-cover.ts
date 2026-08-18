import type {
  MosaicAssetManifest,
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  makeErrorMosaic,
  slugifyAssetKeyFromPath,
} from "@m0saic/template-utils";

import { fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/surfaces/render-cover/v1` — the first impression.
 *
 * ONE CONCEPT: `renderCover` is a polished welcome page shown when a
 * template is opened with PURE DEFAULT props, before the user has touched
 * anything. It buys a friendly first frame WITHOUT weakening `render`.
 *
 * The problem it solves, exactly: a template that requires media should fail
 * fast when it has none — that is the correct `render` contract, and this
 * one keeps it (open with no Clip and Make gives you a report card naming
 * what is missing). But it means the editor's very first frame is an error,
 * which reads as "this template is broken" when it merely wants a video.
 * The cover puts a welcome there instead, and `render` stays strict. Neither
 * surface compromises for the other; that is the entire design.
 *
 * LIFECYCLE (the host's half of the contract, worth knowing before you
 * wonder why your cover "won't show"):
 *   - Shown only on a pure-default open. An `--props` open skips it, because
 *     supplying props means you already know what this template wants.
 *   - The FIRST prop edit dismisses it. That flag is deliberately not derived
 *     from `props === defaults`, so edit-then-undo does not resurrect it on
 *     its own — but dismissal is NOT one-way: the host gives the cover its
 *     own pill beside the "?" and you can reopen it whenever you like. Write
 *     a cover you would not mind someone going back to.
 *   - OPT-IN ONLY. A template without a cover gets no cover: hosts return
 *     null and fall through to the normal preview path in silence. They
 *     never synthesize a generic one. Same for an ERRORING cover — silence,
 *     because an error card about the cover would recreate the very
 *     broken-first-impression problem the cover exists to fix.
 *
 * (`renderTutorial` errors do the opposite and render an error mosaic: the
 * user explicitly clicked the "?" pill, so a silent no-op reads as a dead
 * button. Two surfaces, two error postures, both on purpose.)
 *
 * REAL GEOMETRY, not floating text: the page is three carved bands with
 * their copy on attached overlays. Onboarding content gets no exemption from
 * the rect thesis — a cover is a document like any other.
 */

export type RenderCoverProps = {
  /** Absolute path to a video file. Required by `render`. */
  clip?: string;
  /** Cover and caption accent (#rrggbb). */
  accentColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/surfaces/render-cover/v1";
const ACCENT = "#e67e22";
const INK = "#0b0e11";

const propsSchema = definePropsSchema<RenderCoverProps>({
  clip: {
    type: "media",
    required: false,
    description: "The video to play. render() needs this; the cover does not.",
    meta: {
      control: { picker: "file", accept: ["video"] },
      ui: { label: "Clip", order: 1 },
    },
  },
  accentColor: {
    type: "string",
    required: false,
    description: "Cover and caption accent as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: ACCENT },
      ui: { label: "Accent color", order: 2 },
    },
  },
});

export const RenderCoverV1 = defineMosaicTemplate<RenderCoverProps>({
  id: asTemplateId(ID),
  label: "60 · Render Cover",
  version: 1,
  description:
    "A friendly first frame for a template that fails fast. render() still reports exactly what is missing when it has no clip; renderCover puts a welcome page there instead on a pure-default open — opt-in, dismissed by the first prop edit, never synthesized by the host.",
  capabilities: { tier: "core" },
  tags: ["surfaces", "onboarding", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 3000,
    note: "Open with no props to see the cover. Set Clip, and render plays it.",
  },

  propsSchema,
  defaultProps: {
    accentColor: ACCENT,
  },

  /**
   * Strict on purpose. No clip is a real problem, and it says so — the
   * fail-fast contract the cover exists to protect.
   */
  async render(
    props: RenderCoverProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const { width, height } = ctx.target;

    if (props.accentColor !== undefined && !HEX.test(props.accentColor)) {
      throw new Error(
        `${ID}: accentColor ${JSON.stringify(props.accentColor)} must be #rrggbb.`,
      );
    }

    const raw = (props.clip ?? "").trim();
    if (raw === "") {
      // Renders, exits clean, and names the remedy. The cover means this
      // card is not what greets a first-time user.
      return makeErrorMosaic("- clip is required - pick a video file", {
        width,
        height,
        title: "This template needs a clip",
        errorCode: "STARTER_CLIP_REQUIRED",
      });
    }

    // No probe here on purpose: ctx.media and the asset pipeline get their
    // own chapter (media/image-card). This lesson is about the surface.
    const key = String(slugifyAssetKeyFromPath(raw));
    const assets = {
      [key]: { kind: "file", path: raw, mediaType: "video" },
    } as unknown as MosaicAssetManifest;

    return {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String("1", ID),
      assets,
      backgroundColor: INK as MosaicColor,
      sources: [
        {
          type: "media",
          mediaType: "video",
          assetId: key,
          placement: { fit: "contain" },
        } as never,
      ],
    };
  },

  /**
   * The welcome. Ignores props entirely — at the only moment a cover shows,
   * the working props ARE the defaults, so there is nothing to read.
   * Deterministic, no ctx.media, sized off ctx.target.
   */
  renderCover(_props: RenderCoverProps, ctx: MosaicEngineContext): MosaicDocument {
    const { width, height } = ctx.target;

    // Three real bands: title, instruction, hint.
    const bands = [3, 2, 1];
    const m0 = weightedSplit(bands, "row", {
      claimants: ["1{1}", "1{1}", "1{1}"],
    });
    const total = bands.reduce((n, b) => n + b, 0);
    const bandH = (weight: number) => (height * weight) / total;

    const title = fitSvgText("Drop in a clip", width * 0.86, bandH(3) * 0.6, {
      maxPx: Math.round(height * 0.13),
      maxLines: 1,
    });
    const step = fitSvgText(
      "Set the Clip field to any video file, then press Make.",
      width * 0.86,
      bandH(2) * 0.7,
      { maxPx: Math.round(height * 0.05), maxLines: 2 },
    );
    // ASCII only - the bundled glyph font renders arrows and dashes as tofu.
    const hint = fitSvgText(
      "Editing any prop hides this cover - the pill above reopens it.",
      width * 0.86,
      bandH(1) * 0.6,
      { maxPx: Math.round(height * 0.033), maxLines: 1 },
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      sources: [
        makeColorTile(INK as MosaicColor),
        svgTextSource([
          { text: title.text, fontSize: title.fontSize, color: ACCENT as MosaicColor },
        ]),
        makeColorTile("#111820" as MosaicColor),
        svgTextSource([
          { text: step.text, fontSize: step.fontSize, color: "#eaeef2" as MosaicColor },
        ]),
        makeColorTile(INK as MosaicColor),
        svgTextSource([
          { text: hint.text, fontSize: hint.fontSize, color: "#7f8c9b" as MosaicColor },
        ]),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Render Cover",
    lines: [
      "renderCover is the welcome page shown on a pure-default open, so a template can fail fast in render WITHOUT a broken-looking first frame.",
      "Opt-in only: no cover declared means no cover happens. Hosts never synthesize one, and a cover that throws falls through in silence.",
      "The first prop edit dismisses it, but not one-way: the cover gets its own pill beside the ? and you can reopen it whenever.",
    ],
    explore: [
      "Press Make with no Clip - render reports what is missing",
      "Set Clip, then Make - the strict path was never weakened",
    ],
  }),
});

export default RenderCoverV1;
