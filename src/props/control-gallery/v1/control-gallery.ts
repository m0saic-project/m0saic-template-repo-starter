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

import { fitSvgLines, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/props/control-gallery/v1` — the `meta` surface, one knob
 * per affordance.
 *
 * ONE CONCEPT: `meta` is how a prop shapes its CONTROL. The type picks the
 * widget; meta refines it:
 *   - `control.placeholder` — ghost text in an empty field.
 *   - `flavor: "url"`       — semantic hint; the editor renders a URL-ish
 *                             field (still a plain string on the wire).
 *   - `constraints.min/max` + `control.step` — a bounded, stepped number.
 *   - `constraints.oneOf`   — an enum select.
 *   - `ui.label`            — the human name over the raw prop key.
 *
 * THE REAL DEMO IS THE SIDEBAR. The canvas just renders the spec sheet —
 * each prop, its declaration, and its current value — so the form on the
 * right and the sheet on the left describe each other.
 */

export type ControlGalleryProps = {
  /** Ghost text demo (ASCII, up to 24 chars). */
  nickname?: string;
  /** flavor:"url" demo. */
  homepage?: string;
  /** Bounded + stepped number demo (0-100, step 5). */
  strength?: number;
  /** Enum select demo. */
  season?: "spring" | "summer" | "autumn" | "winter";
};

const ID = "@m0saic-starter/props/control-gallery/v1";
const SEASONS = ["spring", "summer", "autumn", "winter"] as const;

const propsSchema = definePropsSchema<ControlGalleryProps>({
  nickname: {
    type: "string",
    required: false,
    description: "Ghost-text demo: the placeholder shows until you type.",
    meta: { control: { placeholder: "type a nickname..." }, ui: { label: "Nickname" } },
  },
  homepage: {
    type: "string",
    required: false,
    description: "flavor:\"url\" demo — semantic hint, still a plain string on the wire.",
    meta: { control: { flavor: "url", placeholder: "https://example.com" }, ui: { label: "Homepage" } },
  },
  strength: {
    type: "number",
    required: false,
    description: "Bounded + stepped number demo (0-100, step 5).",
    meta: { constraints: { min: 0, max: 100 }, control: { step: 5 }, ui: { label: "Strength" } },
  },
  season: {
    type: "string",
    required: false,
    description: "Enum select demo.",
    meta: { constraints: { oneOf: [...SEASONS] }, ui: { label: "Season" } },
  },
});

export const ControlGalleryV1 = defineMosaicTemplate<ControlGalleryProps>({
  id: asTemplateId(ID),
  label: "18 · Control Gallery",
  version: 1,
  description:
    "The meta surface, one knob per affordance: placeholder ghost text, flavor:\"url\", bounded+stepped numbers, an enum select, and ui.label. The real demo is the sidebar; the canvas renders the spec sheet.",
  capabilities: { tier: "core" },
  tags: ["props", "controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Look RIGHT: every row of the form is one meta affordance. The canvas is just the spec sheet.",
  },

  propsSchema,
  defaultProps: { nickname: "", homepage: "", strength: 50, season: "summer" },

  async render(
    props: ControlGalleryProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const nickname = props.nickname ?? "";
    const homepage = props.homepage ?? "";
    const strength = props.strength ?? 50;
    const season = props.season ?? "summer";

    if (nickname.length > 24 || !/^[\x20-\x7E]*$/.test(nickname)) {
      throw new Error(`${ID}: nickname must be ASCII, up to 24 chars.`);
    }
    if (homepage !== "" && !/^https?:\/\/[\x21-\x7E]+$/.test(homepage)) {
      throw new Error(
        `${ID}: homepage must be empty or an http(s) URL (flavor:"url" is an editor hint, not validation - render() is still the gate).`,
      );
    }
    if (!Number.isFinite(strength) || strength < 0 || strength > 100) {
      throw new Error(`${ID}: strength must be a number 0-100.`);
    }
    if (!(SEASONS as readonly string[]).includes(season)) {
      throw new Error(`${ID}: season must be one of ${SEASONS.join(" | ")}.`);
    }

    const { width, height } = ctx.target;

    // The spec sheet: one row per prop + a strength meter row.
    const lines = [
      `nickname   control.placeholder   ${nickname === "" ? "(empty - ghost text shows)" : `"${nickname}"`}`,
      `homepage   flavor:"url"          ${homepage === "" ? "(empty)" : homepage}`,
      `strength   min 0 max 100 step 5  ${strength}`,
      `season     constraints.oneOf     "${season}"`,
    ];
    const meter =
      strength === 0
        ? "-"
        : strength === 100
          ? "1"
          : String(
              weightedSplit([Math.round(strength), 100 - Math.round(strength)], "col", {
                claimants: ["1", "-"],
              }),
            );
    const m0 = toM0String(
      String(weightedSplit([4, 1], "row", { claimants: ["1", meter] })),
      ID,
    );

    // The sheet keeps ONE ROW PER PROP — fitSvgLines preserves line breaks
    // (svgLabel would re-wrap the columns into a paragraph).
    const sheet = fitSvgLines(lines, Math.round(width * 0.9), Math.round((height * 4) / 5), {
      maxPx: Math.round(height * 0.034),
      widthFrac: 0.7,
    });

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets: {},
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        svgTextSource([
          { text: sheet.text, fontSize: sheet.fontSize, color: "#c8d2dc" as MosaicColor },
        ]),
        ...(strength > 0 ? [makeColorTile("#EF7525" as MosaicColor)] : []),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Control Gallery",
    lines: [
      "The prop TYPE picks the widget; meta refines it - placeholder, flavor, min/max with step, oneOf, ui.label.",
      "The real demo is the SIDEBAR; the canvas just prints the spec sheet.",
      "flavor is an editor hint, not validation - render() still gates the value itself.",
    ],
    explore: [
      "Match each sidebar field to its spec-sheet row",
      "Step Strength with the arrows - it moves by 5",
      "Type a non-URL into Homepage and read the remedy",
    ],
  }),
});

export default ControlGalleryV1;
