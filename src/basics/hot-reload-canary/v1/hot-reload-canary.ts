import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicTextLayer,
  MosaicTextSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  solidBackground,
} from "@m0saic/template-utils";

import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/basics/hot-reload-canary/v1` — prove the edit loop works.
 *
 * ONE CONCEPT: the external-repo development loop —
 * edit → `npm run build` → "Refresh repos" in the app → new code, no restart.
 *
 * The fill comes from the module constant {@link CANARY_COLOR}, not from a
 * prop default. That distinction is the whole lesson: a prop default can be
 * masked by a prop bag the editor is already holding, so changing it proves
 * nothing. Changing this CONSTANT can only show up if the running process
 * genuinely re-evaluated this file — which is exactly what you're verifying.
 *
 * ## Verify the loop
 *
 * 1. `npm run build` here; add this repo on the app's Templates page.
 * 2. Open this template in Make — it renders RED.
 * 3. Change `CANARY_COLOR` below to `CANARY_BLUE`.
 * 4. `npm run build` again.
 * 5. Templates page → "Refresh repos". Reopen it in Make: BLUE.
 *
 * If step 5 still shows red, the repo is probably building ESM — the reload
 * path can only refresh a CommonJS module graph (see tsconfig.json's note).
 */

/** The canary's two colors, exported so the test can pin the exact values. */
export const CANARY_RED = "#c0392b";
export const CANARY_BLUE = "#2471a3";

/**
 * THE ONE LINE TO FLIP when verifying the reload loop. Swap `CANARY_RED` for
 * `CANARY_BLUE`, rebuild, refresh — the app must follow.
 */
export const CANARY_COLOR: string = CANARY_RED;

/** Human-readable name for the current constant, printed on the square. */
export function canaryColorLabel(color: string): string {
  if (color === CANARY_RED) return "RED";
  if (color === CANARY_BLUE) return "BLUE";
  return color.toUpperCase();
}

export type HotReloadCanaryProps = {
  /**
   * Optional fill OVERRIDE (#rrggbb). Unset — the deterministic default —
   * uses the module constant, which is what makes this a reload canary.
   */
  color?: string;
};

const propsSchema = definePropsSchema<HotReloadCanaryProps>({
  color: {
    type: "string",
    required: false,
    description:
      "Optional fill override (#rrggbb). Unset: the CANARY_COLOR constant baked into the template source.",
    // The picker meta only shapes the CONTROL — defaultProps still omits
    // `color`, which is what keeps this template a reload canary.
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: CANARY_RED },
      ui: { label: "Override fill" },
    },
  },
});

export const HotReloadCanaryV1 = defineMosaicTemplate<HotReloadCanaryProps>({
  id: asTemplateId("@m0saic-starter/basics/hot-reload-canary/v1"),
  label: "Hot-Reload Canary",
  version: 1,
  description:
    "A solid square whose fill comes from a CONSTANT in the template source, not a prop default. Flip the constant, rebuild, hit Refresh repos — the running app must follow without a restart. This is how you verify your edit loop.",
  capabilities: { tier: "core" },
  tags: ["basics", "starter", "smoke"],

  outputHints: {
    width: 720,
    height: 720,
    fps: 30,
    durationMs: 1000,
    note: "Square canvas — the canary is a solid fill, so the aspect only has to be unmistakable.",
  },

  propsSchema,
  // `color` deliberately absent — see the module doc. Its deterministic
  // default is the constant, resolved in render().
  defaultProps: {},

  async render(
    props: HotReloadCanaryProps,
    _ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    if (props.color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(props.color)) {
      throw new Error(
        `@m0saic-starter/basics/hot-reload-canary/v1: color ` +
          `${JSON.stringify(props.color)} must be a #rrggbb hex color.`,
      );
    }

    const fill = props.color ?? CANARY_COLOR;

    // xExpr / yExpr are ffmpeg drawtext expressions, and supplying them
    // OVERRIDES hAlign/vAlign entirely — so centering is spelled
    // `(w-text_w)/2`, not `hAlign: "center"` (which the expr would ignore).
    const layers: MosaicTextLayer[] = [
      {
        content: { kind: "literal", text: canaryColorLabel(fill) },
        style: { fontSize: 96, fontColor: "#ffffff" as MosaicColor },
        placement: { xExpr: "(w-text_w)/2", yExpr: "h*0.44-text_h/2" },
      },
      {
        content: { kind: "literal", text: "basics/hot-reload-canary/v1" },
        style: { fontSize: 24, fontColor: "#ffffff" as MosaicColor },
        placement: { xExpr: "(w-text_w)/2", yExpr: "h*0.62-text_h/2" },
      },
    ];

    return {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String("F", "@m0saic-starter/basics/hot-reload-canary/v1"),
      assets: {},
      sources: [
        {
          type: "text",
          visual: { backgroundColor: solidBackground(fill as MosaicColor) },
          layers,
        } as MosaicTextSource,
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Hot-Reload Canary",
    lines: [
      "Proves your edit loop works: the fill comes from a CONSTANT in the template source, not a prop default - so a color change can only appear if the app truly re-evaluated your rebuilt code.",
      "The loop: edit the constant, npm run build, press Refresh repos. No app restart.",
      "A prop default cannot prove this - the editor may hold a stale prop bag that masks it.",
    ],
    explore: [
      "Flip CANARY_COLOR to CANARY_BLUE in the source, rebuild, Refresh repos",
      "Set a color override prop, then clear it - the constant returns",
    ],
  }),
});

export default HotReloadCanaryV1;
