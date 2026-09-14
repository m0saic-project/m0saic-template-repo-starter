import type {
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  bindProp,
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  svgLabel,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/controls/group-fields/v1` — related props that travel as
 * ONE value.
 *
 * ONE CONCEPT: `type: "group"` + `fields`. Three loose props (`name`,
 * `role`, `accent`) would work — but they are one IDEA (who is on screen),
 * and splitting them invites half-edits: a saved preset that carries the
 * name but not the accent, an agent that writes two of three. A group prop
 * declares the nested definitions under `fields`, the editor renders them
 * as one fieldset, and the VALUE is one object written in one edit —
 * whole or not at all.
 *
 * The nested definitions are ordinary prop definitions — same types, same
 * meta, same controls (the accent field below carries a colorPicker like
 * any top-level color prop). Grouping changes the SHAPE of the value, not
 * the vocabulary. Render validates the object as a unit, which is the
 * other half of the win: one guard for one idea.
 */

export type SpeakerGroup = { name: string; role: string; accent: string };

export type GroupFieldsProps = {
  /** Who is on screen — one object, one edit. */
  speaker?: SpeakerGroup;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/group-fields/v1";

const DEFAULT_SPEAKER: SpeakerGroup = {
  name: "Ada Lehtinen",
  role: "Field Producer",
  accent: "#2e86c1",
};

/** Validate the group as a UNIT — whole or not at all. */
export function parseSpeaker(raw: GroupFieldsProps["speaker"]): SpeakerGroup {
  const value = raw ?? DEFAULT_SPEAKER;
  if (typeof value !== "object" || value === null) {
    throw new Error(`${ID}: speaker must be an object.`);
  }
  const s = value as Partial<SpeakerGroup>;
  if (typeof s.name !== "string" || s.name.length === 0 || s.name.length > 40) {
    throw new Error(`${ID}: speaker.name must be a 1-40 char string.`);
  }
  if (typeof s.role !== "string" || s.role.length === 0 || s.role.length > 40) {
    throw new Error(`${ID}: speaker.role must be a 1-40 char string.`);
  }
  if (typeof s.accent !== "string" || !HEX.test(s.accent)) {
    throw new Error(`${ID}: speaker.accent must be #rrggbb.`);
  }
  return { name: s.name, role: s.role, accent: s.accent };
}

const propsSchema = definePropsSchema<GroupFieldsProps>({
  speaker: {
    type: "group",
    required: false,
    description:
      "Who is on screen. One group value — name, role, accent — edited as one fieldset and written in one edit, whole or not at all.",
    fields: {
      name: {
        type: "string",
        required: true,
        description: "Display name on the lower third.",
        meta: { ui: { label: "Name", order: 1 } },
      },
      role: {
        type: "string",
        required: true,
        description: "Second line — role, title, or affiliation.",
        meta: { ui: { label: "Role", order: 2 } },
      },
      accent: {
        type: "string",
        required: true,
        description: "Accent bar color as #rrggbb.",
        meta: {
          constraints: { isColor: true },
          control: { colorPicker: true, defaultColor: "#2e86c1" },
          ui: { label: "Accent", order: 3 },
        },
      },
    },
    meta: {
      ui: { label: "Speaker", order: 1 },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 2 },
    },
  },
});

/** A darker twin of a #rrggbb colour. */
function shade(hex: string): MosaicColor {
  const n = parseInt(hex.slice(1), 16);
  const dim = (v: number) => Math.max(0, Math.round(v * 0.62));
  const hh = (v: number) => v.toString(16).padStart(2, "0");
  return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}` as MosaicColor;
}

export const GroupFieldsV1 = defineMosaicTemplate<GroupFieldsProps>({
  id: asTemplateId(ID),
  label: "24 · Group Fields",
  version: 1,
  description:
    "Related props that travel as one value: type group + fields nests ordinary prop definitions (same types, same controls — the accent is a normal colorPicker) under a single prop, the editor renders one fieldset, and the value is one object written in one edit — whole or not at all. Render validates it as a unit too: one guard for one idea. Drawn as the lower third this shape most often is.",
  capabilities: { tier: "core" },
  tags: ["controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    format: { kind: "image", container: "png" },
    note: "Edit Speaker: one fieldset, three fields, one value. Save the file and look — the props carry a single speaker object.",
  },

  propsSchema,
  defaultProps: {
    speaker: DEFAULT_SPEAKER,
    pageColor: "#1c2833",
  },

  async render(
    props: GroupFieldsProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
    }
    const speaker = parseSpeaker(props.speaker);
    const { width, height } = ctx.target;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;
    const accent = speaker.accent as MosaicColor;

    // The lower third this shape most often is: accent bar, name plate,
    // role strip, docked low-left over "footage" (a plain backdrop here).
    const namePlate = String(weightedSplit([2, 58, 40], "col", {
      mode: "literal",
      claimants: ["1", "1{1}", "-"],
    }));
    const rolePlate = String(weightedSplit([2, 44, 54], "col", {
      mode: "literal",
      claimants: ["1", "1{1}", "-"],
    }));
    const third = String(weightedSplit([52, 12, 3, 8, 25], "row", {
      mode: "literal",
      claimants: ["-", namePlate, "-", rolePlate, "-"],
    }));
    const stage = String(weightedSplit([6, 88, 6], "col", {
      mode: "literal",
      claimants: ["-", third, "-"],
    }));
    const m0 = toM0String(`${stage}{6[-,-,-,-,-,1]}`, ID);

    const sources: MosaicSource[] = [];
    sources.push(makeColorTile(accent));
    sources.push(makeColorTile(shade("#1c2833")));
    sources.push(
      bindProp(svgLabel(speaker.name, width * 0.5, height * 0.11, {
        color: "#eaeef2" as MosaicColor,
        maxPx: Math.round(height * 0.05),
        vAlign: "middle",
      }), "speaker.name"),
    );
    sources.push(makeColorTile(accent));
    sources.push(makeColorTile(shade("#1c2833")));
    sources.push(
      bindProp(svgLabel(speaker.role, width * 0.38, height * 0.075, {
        color: "#b9c4cf" as MosaicColor,
        maxPx: Math.round(height * 0.03),
        vAlign: "middle",
      }), "speaker.role"),
    );

    const heading = fitSvgText(
      "GROUP FIELDS - three fields, one value, one edit",
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.036), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        "type group + fields: nested ordinary definitions (the accent is a normal colorPicker) rendered as one fieldset",
        "the value is one object - whole or not at all; render guards it as a unit for the same reason",
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
    title: "Group Fields",
    lines: [
      "type group + fields nests ordinary prop definitions under one prop - same types, same meta, same controls, one fieldset in the editor.",
      "The value is ONE object written in one edit. No half-edited presets, no agent writing two fields of three.",
      "Validate the group as a unit at render - one guard for one idea.",
    ],
    explore: [
      "Edit Speaker - three fields, one fieldset",
      "Change the accent - a nested colorPicker, like any top-level one",
    ],
  }),
});

export default GroupFieldsV1;
