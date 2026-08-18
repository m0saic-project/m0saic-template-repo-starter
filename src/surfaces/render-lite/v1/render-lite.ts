import type {
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
} from "@m0saic/template-utils";

import { fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/surfaces/render-lite/v1` — the preview stand-in.
 *
 * ONE CONCEPT: `renderLite` is a SECOND entry point. Hosts that draw a
 * preview — the editor's live canvas, template selection — call it INSTEAD
 * of `render`. `render` runs only when a human commits to a Make.
 *
 * The dispatch rule, which is the whole surface:
 *
 *   renderLite ABSENT  -> hosts fall back to `render` (historical behavior;
 *                         a preview must always show SOMETHING).
 *   renderLite PRESENT -> the preview shows this, and only this.
 *
 * Note the asymmetry with the other two optional surfaces: `renderCover` and
 * `renderTutorial` return null when absent and are NEVER synthesized, but
 * `renderLite` falls back. Absent cover means "no cover"; absent lite means
 * "use render".
 *
 * WHY IT EXISTS: a `tier: "capability"` template whose `render` does real
 * work — spawns a process, writes files, fetches the network — would run all
 * of that just from being SELECTED in a picker. `renderLite` returns a cheap
 * card instead, so the editor shows feedback rather than starting a
 * thirty-minute job. It MUST NOT perform `render`'s side effects.
 *
 * Being honest about this lesson: this template is `tier: "core"` and its
 * `render` is cheap, so it does not NEED a lite path — core-tier templates
 * rarely do. It declares one anyway because the seam is otherwise invisible,
 * and a seam you cannot see is a seam you will get wrong. Watch it directly:
 * poke the Tiles knob and the preview stays a single card; press Make and
 * the real grid renders. That gap IS the surface.
 *
 * Constraints shared by all three optional surfaces: deterministic,
 * side-effect-free, browser-safe, sized off `ctx.target`, and NEVER reading
 * `ctx.media` (hosts pass an empty registry — no probe pass runs).
 */

export type RenderLiteProps = {
  /** Grid density for the real render — N by N tiles. */
  tiles?: number;
  /** Grid fill (#rrggbb). */
  accentColor?: string;
  /** Alternating fill, and the lite card's background (#rrggbb). */
  panelColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/surfaces/render-lite/v1";
const MIN_TILES = 2;
const MAX_TILES = 8;

const propsSchema = definePropsSchema<RenderLiteProps>({
  tiles: {
    type: "number",
    required: false,
    description: `Grid density for the real render, ${MIN_TILES}-${MAX_TILES} per side.`,
    meta: {
      constraints: { min: MIN_TILES, max: MAX_TILES },
      ui: { label: "Tiles", order: 1 },
    },
  },
  accentColor: {
    type: "string",
    required: false,
    description: "Grid fill as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#2471a3" },
      ui: { label: "Accent color", order: 2 },
    },
  },
  panelColor: {
    type: "string",
    required: false,
    description: "Alternating fill, and the lite card background, as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Panel color", order: 3 },
    },
  },
});

/** Shared validation — both entry points must agree on what the props mean. */
function resolve(props: RenderLiteProps): {
  tiles: number;
  accent: MosaicColor;
  panel: MosaicColor;
} {
  for (const [key, value] of [
    ["accentColor", props.accentColor],
    ["panelColor", props.panelColor],
  ] as const) {
    if (value !== undefined && !HEX.test(value)) {
      throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
    }
  }
  const tiles = Math.round(props.tiles ?? 6);
  if (tiles < MIN_TILES || tiles > MAX_TILES) {
    throw new Error(
      `${ID}: tiles ${tiles} out of range ${MIN_TILES}-${MAX_TILES}.`,
    );
  }
  return {
    tiles,
    accent: (props.accentColor ?? "#2471a3") as MosaicColor,
    panel: (props.panelColor ?? "#1c2833") as MosaicColor,
  };
}

export const RenderLiteV1 = defineMosaicTemplate<RenderLiteProps>({
  id: asTemplateId(ID),
  label: "67 · Render Lite",
  version: 1,
  description:
    "The preview stand-in. Declares renderLite so the editor draws a cheap card while you poke props, and the real N-by-N grid renders only on Make — the one surface that falls back to render when absent, instead of vanishing.",
  capabilities: { tier: "core" },
  tags: ["surfaces", "preview", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Preview shows the lite card; Make renders the grid. The difference is the lesson.",
  },

  propsSchema,
  defaultProps: {
    tiles: 6,
    accentColor: "#2471a3",
    panelColor: "#1c2833",
  },

  /**
   * The real thing: an N by N checkerboard, built row of columns.
   *
   * `ctx` goes unread here because the grid is expressed in WEIGHTS — it
   * fills whatever canvas it is handed, at any aspect, with no pixel math to
   * get wrong. (`renderLite` below does read `ctx.target`: its card has
   * fitted copy, and nothing soft-wraps.)
   */
  async render(
    props: RenderLiteProps,
    _ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const { tiles, accent, panel } = resolve(props);

    // Grid grammar: an equal row split whose every claimant is an equal
    // column split. `weightedSplit([1,1,1], "row")` is "3[1,1,1]"; feeding
    // each slot a column split gives "N[N(...),N(...),...]".
    const ones = new Array<number>(tiles).fill(1);
    const rowM0 = String(weightedSplit(ones, "col"));
    const m0 = weightedSplit(ones, "row", { claimants: ones.map(() => rowM0) });

    // Sources bind in DSL walk order: row 0 left-to-right, then row 1, ...
    // so a checker is just (row + col) parity.
    const sources = [];
    for (let r = 0; r < tiles; r++) {
      for (let c = 0; c < tiles; c++) {
        sources.push(makeColorTile((r + c) % 2 === 0 ? accent : panel));
      }
    }

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      sources,
    };
  },

  /**
   * The stand-in. Cheap, deterministic, and deliberately NOT the render —
   * one tile with a card on its attached overlay, sized off the same
   * `ctx.target` the real render would use.
   *
   * `makeStubMosaic(label, {width, height, note})` from @m0saic/template-utils
   * is the one-line version of this card; it is spelled out here so the
   * shape is visible, and so the copy can be fitted with the same svg
   * rasterizer every other lesson in this repo uses.
   */
  renderLite(props: RenderLiteProps, ctx: MosaicEngineContext): MosaicDocument {
    const { tiles, accent, panel } = resolve(props);
    const { width, height } = ctx.target;

    const title = fitSvgText("Preview stand-in", width * 0.86, height * 0.3, {
      maxPx: Math.round(height * 0.11),
      maxLines: 1,
    });
    // ASCII only: the bundled glyph font draws exotic codepoints as tofu.
    const note = fitSvgText(
      `renderLite drew this. Make renders ${tiles}x${tiles} = ${tiles * tiles} tiles.`,
      width * 0.86,
      height * 0.24,
      { maxPx: Math.round(height * 0.05), maxLines: 2 },
    );

    return {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String("1{1}", ID),
      assets: {},
      sources: [
        makeColorTile(panel),
        svgTextSource([
          { text: title.text, fontSize: title.fontSize, color: accent },
          {
            text: note.text,
            fontSize: note.fontSize,
            color: "#d5dbdb" as MosaicColor,
            vAlign: "bottom",
            padding: { bottom: 0.28 },
          },
        ]),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Render Lite",
    lines: [
      "renderLite is a second entry point: preview hosts call it INSTEAD of render, and render runs only on an explicit Make.",
      "Absent, it falls back to render - unlike renderCover and renderTutorial, which simply do not happen. Only lite has a fallback.",
      "It exists for capability-tier templates whose render spawns processes or fetches; it must never do render's side effects.",
    ],
    explore: [
      "Change Tiles - the preview card updates, no grid renders",
      "Press Make - now the real N-by-N grid appears",
    ],
  }),
});

export default RenderLiteV1;
