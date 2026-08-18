import type {
  MosaicAssetManifest,
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asAssetId, asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  slugifyAssetKeyFromPath,
} from "@m0saic/template-utils";

import { svgLabel } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/media/time-ranges-medley/v1` — MANY windows, ONE prop.
 *
 * ONE CONCEPT: the `picker: "time-ranges"` control — the MULTI-range
 * sibling of time-range-clip's pair. Where the single window is two flat
 * number props matched by name, multiple windows are ONE `type: "json"`
 * prop whose value is `Array<{ startMs, endMs, label? }>`: the editor's
 * multi-range studio reads and writes the whole array through that one
 * prop, in one write. The shape is enforced twice — `constraints.jsonSchema`
 * documents it for the editor, render() gates it for real (collect-ALL,
 * with remedies).
 *
 * The medley renders every range side by side: one column per window,
 * each an ordinary media source with its own `clipStartMs` +
 * `clipDurationMs` — the same start+LENGTH conversion as the single-range
 * unit, mapped over an array.
 */

export type MedleyRange = { startMs: number; endMs: number; label?: string };
export type TimeRangesMedleyProps = {
  /** The video to pull windows from. */
  video?: string;
  /** The windows, ms, source-relative — one column each (1-6). */
  ranges?: MedleyRange[];
};

const ID = "@m0saic-starter/media/time-ranges-medley/v1";
const MAX_RANGES = 6;

const propsSchema = definePropsSchema<TimeRangesMedleyProps>({
  video: {
    type: "media",
    required: false,
    description: "The video to pull windows from.",
    meta: { control: { picker: "file", accept: ["video"] }, ui: { label: "Video" } },
  },
  ranges: {
    type: "json",
    required: false,
    description:
      "Windows within the source, milliseconds: an array of { startMs, endMs, label? }. Each renders as its own medley column (1-6).",
    meta: {
      constraints: {
        jsonSchema: {
          type: "array",
          minItems: 1,
          maxItems: MAX_RANGES,
          items: {
            type: "object",
            required: ["startMs", "endMs"],
            properties: {
              startMs: { type: "integer", minimum: 0 },
              endMs: { type: "integer", minimum: 1 },
              label: { type: "string" },
            },
          },
        },
      },
      control: { picker: "time-ranges", videoFromProp: "video" },
      ui: { label: "Ranges" },
    },
  },
});

export const TimeRangesMedleyV1 = defineMosaicTemplate<TimeRangesMedleyProps>({
  id: asTemplateId(ID),
  label: "35 · Time-Ranges Medley",
  version: 1,
  description:
    "The MULTI-range control: one type:\"json\" prop (Array<{startMs,endMs,label?}>) with picker:\"time-ranges\" — the editor's multi-range studio writes the whole array through it. Every window renders as its own medley column via clipStartMs + clipDurationMs, mapped over the array.",
  capabilities: { tier: "core" },
  tags: ["media", "playback", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Mark several ranges in the studio — the medley resplits, one column per window.",
  },

  propsSchema,
  defaultProps: { video: "", ranges: [{ startMs: 0, endMs: 1000 }] },

  async render(
    props: TimeRangesMedleyProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    const raw = (props.video ?? "").trim();
    const ranges = props.ranges ?? [{ startMs: 0, endMs: 1000 }];
    const { width, height } = ctx.target;

    if (raw.length === 0) {
      return {
        kind: "mosaic_document",
        version: 1,
        m0: toM0String("1", ID),
        assets: {},
        backgroundColor: "#0b0e11" as MosaicColor,
        sources: [
          svgLabel(
            "Pick a video (Video), then mark several ranges - one medley column each",
            width,
            height,
            {
              maxPx: Math.round(height * 0.04),
              maxLines: 2,
              color: "#7f8c9b" as MosaicColor,
            },
          ),
        ],
      };
    }

    const meta = ctx.media[asAssetId(raw)];
    if (!meta || meta.kind !== "video") {
      throw new Error(`${ID}: "${raw}" must be a probed video.`);
    }
    const sourceDurationMs = (meta as { durationMs?: number }).durationMs;

    // The jsonSchema above is editor documentation; THIS is the gate —
    // collect every problem across the whole array, then throw once.
    const problems: string[] = [];
    if (!Array.isArray(ranges) || ranges.length < 1 || ranges.length > MAX_RANGES) {
      problems.push(`ranges must be an array of 1-${MAX_RANGES} windows`);
    } else {
      ranges.forEach((r, i) => {
        if (typeof r !== "object" || r === null) {
          problems.push(`ranges[${i}] must be { startMs, endMs, label? }`);
          return;
        }
        const { startMs, endMs, label } = r as MedleyRange;
        if (!Number.isInteger(startMs) || startMs < 0) {
          problems.push(`ranges[${i}].startMs must be an integer >= 0`);
        }
        if (!Number.isInteger(endMs) || endMs <= (Number.isInteger(startMs) ? startMs : 0)) {
          problems.push(`ranges[${i}] needs integer endMs > startMs`);
        }
        if (typeof sourceDurationMs === "number" && Number.isInteger(endMs) && endMs > sourceDurationMs) {
          problems.push(`ranges[${i}].endMs ${endMs} is past the source's ${sourceDurationMs}ms`);
        }
        if (label !== undefined && (typeof label !== "string" || label.length > 12)) {
          problems.push(`ranges[${i}].label must be a string of up to 12 chars`);
        }
      });
    }
    if (problems.length > 0) {
      throw new Error(`${ID}: invalid ranges:\n- ${problems.join("\n- ")}`);
    }

    const key = String(slugifyAssetKeyFromPath(raw));
    const assets = {
      [key]: { kind: "file", path: raw, mediaType: "video" },
    } as unknown as MosaicAssetManifest;

    // One column per window over a caption band — the SAME start+LENGTH
    // conversion as time-range-clip, mapped over the array. Every column
    // references the SAME assetId: one file, many windows.
    // Grammar: 1-count splits are illegal — a single window IS the band.
    const strip =
      ranges.length === 1
        ? "1"
        : `${ranges.length}(${new Array<string>(ranges.length).fill("1").join(",")})`;
    const m0 = toM0String(
      String(weightedSplit([5, 1], "row", { claimants: [strip, "1"] })),
      ID,
    );
    const columns: MosaicSource[] = ranges.map(
      (r) =>
        ({
          type: "media",
          mediaType: "video",
          assetId: key,
          placement: { fit: "cover" },
          playback: {
            clipStartMs: r.startMs,
            clipDurationMs: r.endMs - r.startMs,
            loopMode: "loop",
          },
        }) as never,
    );

    const caption =
      `picker:"time-ranges" - ${ranges.length} window(s) through ONE json prop: ` +
      ranges
        .map((r) => `${r.label ?? `${r.startMs}-${r.endMs}`}(${r.endMs - r.startMs}ms)`)
        .join(" ");

    return {
      kind: "mosaic_document",
      version: 1,
      m0,
      assets,
      backgroundColor: "#0b0e11" as MosaicColor,
      sources: [
        ...columns,
        svgLabel(caption, width, Math.round(height / 6), {
          maxPx: Math.round(height * 0.022),
          maxLines: 2,
          color: "#7f8c9b" as MosaicColor,
        }),
      ],
    };
  },

  renderTutorial: lessonTutorial({
    title: "Time-Ranges Medley",
    lines: [
      "m0saic has TWO time controls: a pair of StartMs/EndMs numbers for ONE window, and a json prop for MANY.",
      "picker:\"time-ranges\" reads and writes the whole Array<{startMs, endMs, label?}> through that single prop.",
      "Each window becomes a media source with clipStartMs + clipDurationMs, all referencing the SAME assetId.",
    ],
    explore: [
      "Mark a second and third range - the medley resplits",
      "Drag any range's handles - only its column changes",
      "Give a range a label and find it on the caption",
      "Compare the sidebar with time-range-clip's",
    ],
  }),
});

export default TimeRangesMedleyV1;
