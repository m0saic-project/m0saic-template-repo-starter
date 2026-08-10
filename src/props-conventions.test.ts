import { templates } from "./index";

/**
 * Repo-wide props-surface conventions — enforced over EVERY exported
 * template, so a new chapter can't quietly drift from the law.
 *
 * Current law:
 *  1. Color props are real color controls. Any `string` OR `string[]` prop
 *     that looks like a color (name contains "color", or its description
 *     mentions #rrggbb) must declare `constraints.isColor` AND
 *     `control.colorPicker`. The app renders a swatch picker for scalars
 *     and a swatch-per-row list editor for arrays.
 */

type AnyPropDef = {
  type?: string;
  description?: string;
  meta?: {
    constraints?: { isColor?: boolean };
    control?: { colorPicker?: boolean };
  };
  fields?: Record<string, AnyPropDef>;
};

function collectProps(
  defs: Record<string, AnyPropDef>,
  prefix: string,
  out: Array<[string, AnyPropDef]>,
): void {
  for (const [name, def] of Object.entries(defs)) {
    out.push([`${prefix}${name}`, def]);
    if (def.fields) collectProps(def.fields, `${prefix}${name}.`, out);
  }
}

describe("props-surface conventions (whole repo)", () => {
  it("every color prop declares isColor + colorPicker", () => {
    const violations: string[] = [];
    for (const template of templates) {
      const schema = (template.propsSchema ?? {}) as Record<string, AnyPropDef>;
      const props: Array<[string, AnyPropDef]> = [];
      collectProps(schema, "", props);
      for (const [name, def] of props) {
        const looksLikeColor =
          /color/i.test(name) || /#rrggbb/i.test(def.description ?? "");
        if (!looksLikeColor) continue;
        const hasIsColor = def.meta?.constraints?.isColor === true;
        const hasPicker = def.meta?.control?.colorPicker === true;

        if (def.type !== "string" && def.type !== "string[]") continue;
        if (!hasIsColor || !hasPicker) {
          violations.push(
            `${String(template.id)} :: ${name} — color prop missing ` +
              `${hasIsColor ? "" : "constraints.isColor "}` +
              `${hasPicker ? "" : "control.colorPicker"}`.trim(),
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
