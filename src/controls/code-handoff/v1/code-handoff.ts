import type {
  MosaicCodeValue,
  MosaicColor,
  MosaicDocument,
  MosaicEngineContext,
  MosaicSource,
} from "@m0saic/types";
import { asTemplateId } from "@m0saic/types";
import { toM0String, weightedSplit } from "@m0saic/dsl-stdlib";
import {
  defineMosaicTemplate,
  definePropsSchema,
  makeColorTile,
  svgLabel,
} from "@m0saic/template-utils";

import { fitSvgLines, fitSvgText, svgTextSource } from "../../../_shared/svg-text";
import { lessonTutorial } from "../../../_shared/tutorial";

/**
 * `@m0saic-starter/controls/code-handoff/v1` — a prop that flows the OTHER
 * way: code passed FROM the template TO the user.
 *
 * ONE CONCEPT: `type: "code"` is a HANDOFF type. Most props are the user
 * talking to the template; this one is the template talking back. The
 * value is a `MosaicCodeValue` — `{ language, code }` — shipped by the
 * AUTHOR in `defaultProps`, and the editor renders it as a read-only,
 * selectable, copyable code window (no onChange — it is not an input).
 * `render()` may ignore the prop entirely; it is informational.
 *
 * Why a template would talk back: some workflows need the user to run
 * something OUTSIDE the app — the production first-adopter is the
 * page-capture template, which hands the user a browser snippet to run on
 * the page they want captured, whose output comes back through the
 * template's other props. The handoff prop closes that loop inside the
 * editor: instructions live next to the props they feed, in a window made
 * for copying, with the language attached.
 *
 * This lesson's handoff is honest to the pattern: the exact CLI command
 * that renders THIS template headless. Copy it out of the editor, run it
 * in a terminal, and compare — the same document either way. The render
 * USES the prop only to draw the card about it; ignoring it entirely
 * (as the page-capture template does) is equally correct.
 */

export type CodeHandoffProps = {
  /** The handoff: read-only in the editor, shipped by the author. */
  runCommand?: MosaicCodeValue;
  /** A normal input prop, to make the direction contrast visible. */
  label?: string;
  /** Backdrop (#rrggbb). */
  pageColor?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = "@m0saic-starter/controls/code-handoff/v1";

/** The handoff payload — authored HERE, shipped via defaultProps. */
export const RUN_COMMAND: MosaicCodeValue = {
  language: "bash",
  code: [
    "# Render this exact template from a terminal — no app needed:",
    "m0saic make @m0saic-starter/controls/code-handoff/v1 \\",
    "  --template-repo . \\",
    '  --props \'{"label":"Rendered headless"}\' \\',
    "  -o code-handoff.mp4",
  ].join("\n"),
};

/** Validate the handoff shape (defaults are still validated — house law). */
export function parseHandoff(raw: CodeHandoffProps["runCommand"]): MosaicCodeValue {
  const value = raw ?? RUN_COMMAND;
  if (typeof value !== "object" || value === null) {
    throw new Error(`${ID}: runCommand must be { language, code }.`);
  }
  const s = value as Partial<MosaicCodeValue>;
  if (typeof s.language !== "string" || !/^[a-z0-9+#-]{1,24}$/.test(s.language)) {
    throw new Error(`${ID}: runCommand.language must be a short lowercase language id.`);
  }
  if (typeof s.code !== "string" || s.code.length === 0 || s.code.length > 4000) {
    throw new Error(`${ID}: runCommand.code must be a 1-4000 char string.`);
  }
  return { language: s.language, code: s.code };
}

const propsSchema = definePropsSchema<CodeHandoffProps>({
  runCommand: {
    type: "code",
    required: false,
    description:
      "Template-to-user handoff: the exact CLI command that renders this template headless. Read-only and copyable in the editor; render uses it only to draw the card.",
    meta: {
      ui: { label: "Run it yourself", order: 1 },
    },
  },
  label: {
    type: "string",
    required: false,
    description: "A normal INPUT prop, for contrast — this one flows user to template.",
    meta: {
      ui: { label: "Label", order: 2 },
    },
  },
  pageColor: {
    type: "string",
    required: false,
    description: "Backdrop as #rrggbb.",
    meta: {
      constraints: { isColor: true },
      control: { colorPicker: true, defaultColor: "#1c2833" },
      ui: { label: "Page color", order: 3 },
    },
  },
});

export const CodeHandoffV1 = defineMosaicTemplate<CodeHandoffProps>({
  id: asTemplateId(ID),
  label: "27 · Code Handoff",
  version: 1,
  description:
    "A prop that flows the other way: type code is a HANDOFF — { language, code } shipped by the author in defaultProps, rendered by the editor as a read-only, selectable, copyable code window (no onChange; not an input), which render() may ignore entirely. For workflows where the user must run something outside the app — the production first-adopter hands the user a browser capture snippet whose output returns through other props. This lesson hands you the CLI command that renders itself headless.",
  capabilities: { tier: "core" },
  tags: ["controls", "lesson"],

  outputHints: {
    width: 1280,
    height: 720,
    fps: 30,
    durationMs: 2000,
    note: "Open 'Run it yourself' — a copyable window, not an input. Copy the command into a terminal and render this template without the app.",
  },

  propsSchema,
  defaultProps: {
    runCommand: RUN_COMMAND,
    label: "Rendered in the app",
    pageColor: "#1c2833",
  },

  async render(
    props: CodeHandoffProps,
    ctx: MosaicEngineContext,
  ): Promise<MosaicDocument> {
    if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
      throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
    }
    const label = props.label ?? "Rendered in the app";
    if (typeof label !== "string" || label.length === 0 || label.length > 40) {
      throw new Error(`${ID}: label must be a 1-40 char string.`);
    }
    const handoff = parseHandoff(props.runCommand);
    const { width, height } = ctx.target;
    const page = (props.pageColor ?? "#1c2833") as MosaicColor;

    const lines = handoff.code.split("\n").slice(0, 6).map((l) =>
      l.length > 64 ? `${l.slice(0, 61)}...` : l,
    );

    // The direction card: TEMPLATE -> YOU header, language badge, the
    // command lines, and the user's own label below for contrast.
    const headerRow = String(weightedSplit([4, 34, 2, 14, 46], "col", {
      mode: "literal",
      claimants: ["-", "1", "-", "1{1}", "-"],
    }));
    const lineRow = String(weightedSplit([4, 92, 4], "col", {
      mode: "literal",
      claimants: ["-", "1", "-"],
    }));
    const cardRows = String(weightedSplit(
      [6, 12, 4, ...lines.map(() => 8), 100 - 6 - 12 - 4 - lines.length * 8],
      "row",
      { mode: "literal", claimants: ["-", headerRow, "-", ...lines.map(() => lineRow), "-"] },
    ));
    const stage = String(weightedSplit([8, 84, 8], "col", {
      mode: "literal",
      claimants: ["-", `1{${cardRows}}`, "-"],
    }));
    const labelRow = String(weightedSplit([8, 84, 8], "col", {
      mode: "literal",
      claimants: ["-", "1{1}", "-"],
    }));
    const rows = String(weightedSplit([5, 52, 4, 10, 29], "row", {
      mode: "literal",
      claimants: ["-", stage, "-", labelRow, "-"],
    }));
    const m0 = toM0String(`${rows}{6[-,-,-,-,-,1]}`, ID);

    const sources: MosaicSource[] = [];
    sources.push(makeColorTile("#10161d" as MosaicColor)); // card bg
    sources.push(
      svgLabel("TEMPLATE -> YOU: run this outside the app", width * 0.32, height * 0.07, {
        color: "#eaeef2" as MosaicColor,
        maxPx: Math.round(height * 0.024),
        vAlign: "middle",
      }),
    );
    sources.push(makeColorTile("#2e86c1" as MosaicColor)); // language badge
    sources.push(
      svgLabel(handoff.language, width * 0.1, height * 0.06, {
        color: "#eaeef2" as MosaicColor,
        maxPx: Math.round(height * 0.022),
        vAlign: "middle",
      }),
    );
    for (const line of lines) {
      sources.push(
        svgLabel(line.length === 0 ? " " : line, width * 0.72, height * 0.045, {
          color: "#b9c4cf" as MosaicColor,
          maxPx: Math.round(height * 0.022),
          vAlign: "middle",
        }),
      );
    }
    sources.push(makeColorTile("#1d5378" as MosaicColor));
    sources.push(
      svgLabel(label, width * 0.7, height * 0.09, {
        color: "#eaeef2" as MosaicColor,
        maxPx: Math.round(height * 0.034),
        vAlign: "middle",
      }),
    );

    const heading = fitSvgText(
      "CODE HANDOFF - the template talking back, read-only and copyable",
      width * 0.9,
      height * 0.07,
      { maxPx: Math.round(height * 0.032), maxLines: 1 },
    );
    const readout = fitSvgLines(
      [
        "type code = a handoff: shipped in defaultProps, shown as a copyable window (no onChange), ignorable by render",
        "the loop: copy the command, run it in a terminal, feed results back through the ordinary input props",
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
    title: "Code Handoff",
    lines: [
      "type code flows FROM the template TO the user: { language, code } shipped in defaultProps, shown as a read-only copyable window.",
      "It is not an input - no onChange - and render() may ignore it. Use it when the user must run something outside the app.",
      "The loop closes through ordinary props: hand out the command, the user runs it, the results come back as inputs.",
    ],
    explore: [
      "Copy 'Run it yourself' into a terminal - same render, no app",
      "Contrast with Label right below it: that one IS an input",
    ],
  }),
});

export default CodeHandoffV1;
