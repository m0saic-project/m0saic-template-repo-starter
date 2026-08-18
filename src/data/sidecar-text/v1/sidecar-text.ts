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

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/data/sidecar-text/v1` — a sidecar that isn't JSON.
 *
 * ONE CONCEPT: a sidecar value of the form `{ kind: "text", ext, content }`
 * writes `{output-basename}.{key}.{ext}` verbatim — the content string,
 * byte for byte, with no JSON wrapper. That is what makes real formats
 * possible: `.srt`, `.vtt`, `.md`, `.csv`.
 *
 * WHY IT MATTERS. Captions are the case that proves it. A burned-in subtitle
 * is pixels: unsearchable, untranslatable, and stuck at one size forever. The
 * SAME cue list emitted as a `.vtt` beside the video is a real caption track
 * a player can style, a search engine can index, and a translator can edit.
 * Burn when you must; ship the text file always.
 *
 * `ext` IS THE WHOLE FORMAT DECISION. Nothing validates that the content
 * matches the extension — writing malformed WebVTT under `ext: "vtt"` gets
 * you a malformed file, not an error. Serialise carefully; a test that
 * asserts the first line of the output is cheap insurance.
 *
 * SAME RULES AS JSON SIDECARS: declared in `sidecarsSchema`, attached to the
 * document, suppressed in design mode. `data/sidecar-json` covers those.
 */

export type SidecarTextProps = {
  /** One caption line per row, `startMs|endMs|text`. */
  cues?: string[];
  /** Caption format to emit. */
  format?: "vtt" | "srt";
};

const ID = "@m0saic-starter/data/sidecar-text/v1";
const FORMATS = ["vtt", "srt"] as const;
const PANEL = "#17202a" as MosaicColor;
const ACCENT = "#EF7525" as MosaicColor;
const INK = "#ecf0f1" as MosaicColor;
const INK_DIM = "#7f8c9b" as MosaicColor;

const DEFAULT_CUES = [
  "0|1200|A sidecar carries the words",
  "1200|2400|the pixels only show",
];

type Cue = { startMs: number; endMs: number; text: string };

/** `startMs|endMs|text` → a cue. Returns null for a row that can't parse. */
function parseCue(row: string): Cue | null {
  const parts = row.split("|");
  if (parts.length < 3) return null;
  const startMs = Number(parts[0]);
  const endMs = Number(parts[1]);
  const text = parts.slice(2).join("|").trim();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
  if (endMs <= startMs || startMs < 0 || text.length === 0) return null;
  return { startMs, endMs, text };
}

/** `hh:mm:ss` + a fractional separator that differs between the two formats. */
function stamp(ms: number, sep: "." | ","): string {
  const total = Math.max(0, Math.round(ms));
  const h = String(Math.floor(total / 3_600_000)).padStart(2, "0");
  const m = String(Math.floor((total % 3_600_000) / 60_000)).padStart(2, "0");
  const s = String(Math.floor((total % 60_000) / 1000)).padStart(2, "0");
  const frac = String(total % 1000).padStart(3, "0");
  return `${h}:${m}:${s}${sep}${frac}`;
}

/** Serialise cues to WebVTT or SubRip. The `\n` endings are deliberate:
 *  both formats are line-based and CRLF is a portability trap. */
export function serializeCues(cues: readonly Cue[], format: "vtt" | "srt"): string {
  const sep = format === "vtt" ? "." : ",";
  const blocks = cues.map((cue, i) => {
    const timing = `${stamp(cue.startMs, sep)} --> ${stamp(cue.endMs, sep)}`;
    // SubRip numbers its cues from 1; WebVTT does not need to.
    return format === "srt"
      ? `${i + 1}\n${timing}\n${cue.text}`
      : `${timing}\n${cue.text}`;
  });
  return format === "vtt"
    ? `WEBVTT\n\n${blocks.join("\n\n")}\n`
    : `${blocks.join("\n\n")}\n`;
}

const propsSchema = definePropsSchema<SidecarTextProps>({
  cues: {
    type: "string[]",
    required: false,
    description:
      "One cue per row as startMs|endMs|text. Rows that cannot parse are named in the error rather than silently dropped.",
    meta: { ui: { label: "Cues" } },
  },
  format: {
    type: "string",
    required: false,
    description:
      "vtt or srt. It picks the serialiser AND the file extension — nothing checks that the two agree, so they are set together here.",
    meta: { constraints: { oneOf: [...FORMATS] }, ui: { label: "Format" } },
  },
});

export const SidecarTextV1 = defineMosaicTemplate<SidecarTextProps>({
  id: asTemplateId(ID),
  label: "63 · Sidecar Text",
  version: 1,
  description:
    "A sidecar value of { kind: \"text\", ext, content } writes the string verbatim as {output-basename}.{key}.{ext} — the way real formats ship. Captions are the case that proves it: burned-in subtitles are pixels, a .vtt beside the video is a track a player can style and a search engine can read.",
  capabilities: { tier: "core" },
  tags: ["data", "sidecars", "captions", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2400,
    note: "Render to out.mp4 and open out.captions.vtt beside it.",
  },

  propsSchema,
  defaultProps: { cues: DEFAULT_CUES, format: "vtt" },

  sidecarsSchema: {
    captions: {
      type: "object",
      required: false,
      description:
        "Caption track written verbatim as {output-basename}.captions.vtt (or .srt) next to the deliverable.",
    },
  },

  async render(props: SidecarTextProps, ctx: MosaicEngineContext): Promise<MosaicDocument> {
    const rows = props.cues ?? DEFAULT_CUES;
    const format = props.format ?? "vtt";

    const problems: string[] = [];
    if (!Array.isArray(rows) || rows.length === 0) {
      problems.push("cues must be a non-empty array of startMs|endMs|text rows");
    }
    if (!FORMATS.includes(format as (typeof FORMATS)[number])) {
      problems.push(`format must be one of ${FORMATS.join(" | ")}, got ${JSON.stringify(format)}`);
    }
    const cues: Cue[] = [];
    if (Array.isArray(rows)) {
      rows.forEach((row, i) => {
        const cue = parseCue(String(row));
        // Name the row that failed — a caption silently missing from a file
        // nobody opens until publication is the worst possible failure.
        if (cue === null) problems.push(`cues[${i}] is not "startMs|endMs|text" with endMs > startMs: ${JSON.stringify(row)}`);
        else cues.push(cue);
      });
    }
    if (problems.length > 0) throw new Error(`${ID}: ${problems.join("; ")}.`);

    const { width, height } = ctx.target;
    const content = serializeCues(cues, format);
    const preview = content.split("\n").slice(0, 4).join("   ");

    return {
      kind: "mosaic_document",
      version: 1,
      m0: toM0String(
        String(weightedSplit([1, 2, 2], "row", { claimants: ["1{1}", "1{1}", "1{1}"] })),
        ID,
      ),
      assets: {},
      backgroundColor: PANEL,
      sources: [
        makeColorTile(ACCENT),
        svgLabel(`out.captions.${format}`, width, Math.round(height / 5), {
          maxPx: Math.round(height * 0.06),
          maxLines: 1,
          color: PANEL,
        }),
        makeColorTile(PANEL),
        svgLabel(`${cues.length} cues, ${content.length} bytes`, width, Math.round((height * 2) / 5), {
          maxPx: Math.round(height * 0.05),
          maxLines: 1,
          color: INK,
        }),
        makeColorTile(PANEL),
        svgLabel(preview, width, Math.round((height * 2) / 5), {
          maxPx: Math.round(height * 0.03),
          maxLines: 4,
          color: INK_DIM,
        }),
      ],
      // The verbatim half: content lands byte for byte under this extension.
      sidecars: { captions: { kind: "text", ext: format, content } },
    };
  },

  renderTutorial: lessonTutorial({
    title: "Sidecar Text",
    lines: [
      "A sidecar of { kind: \"text\", ext, content } writes the string verbatim as {basename}.{key}.{ext} - no JSON wrapper.",
      "That is how real formats ship: .srt, .vtt, .md, .csv beside the deliverable.",
      "Burned-in subtitles are pixels - unsearchable, untranslatable, one size forever. The same cues as a .vtt are a real track.",
      "Nothing checks content against ext. Malformed WebVTT under ext \"vtt\" is a malformed file, not an error.",
    ],
    explore: [
      "Render to a file and open the .vtt beside it",
      "Switch Format to srt: numbered cues, comma stamps",
      "Give a cue endMs below startMs - the row is named",
    ],
  }),
});

export default SidecarTextV1;
