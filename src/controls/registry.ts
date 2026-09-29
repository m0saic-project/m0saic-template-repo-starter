import type { StarterRegistryEntry } from "../registry-types";

/**
 * Chapter registry: `controls` — array order is the teaching order.
 *
 * The rich editor tier: everything past a text box. The props chapter (13-18)
 * taught the scalar surface; this one teaches the controls that make complex
 * values EDITABLE — option pills, repeating-row forms, tabbed series, and
 * auto-balancing weight groups. (Their composition with connection-backed
 * pickers — weighted cards, criteria filters — lives late in the
 * `connections` chapter, where the upstream context they need exists.)
 *
 * Recurring law, every lesson: the control is EDIT-time sugar. Render
 * receives plain data (often in more than one legal shape — flat vs nested
 * series, string[] vs {id,weight}[] items) and must normalize before
 * drawing, because a hand-authored file deserves exactly what the rich
 * editor produces.
 */
export const controlsRegistry: StarterRegistryEntry[] = [
  {
    slug: "static-options",
    templateId: "@m0saic-starter/controls/static-options/v1",
    exportName: "StaticOptionsV1",
  },
  {
    slug: "row-editors",
    templateId: "@m0saic-starter/controls/row-editors/v1",
    exportName: "RowEditorsV1",
  },
  {
    slug: "number-series",
    templateId: "@m0saic-starter/controls/number-series/v1",
    exportName: "NumberSeriesV1",
  },
  {
    slug: "weights",
    templateId: "@m0saic-starter/controls/weights/v1",
    exportName: "WeightsV1",
  },
  {
    slug: "group-fields",
    templateId: "@m0saic-starter/controls/group-fields/v1",
    exportName: "GroupFieldsV1",
  },
  {
    slug: "range",
    templateId: "@m0saic-starter/controls/range/v1",
    exportName: "RangeV1",
  },
  {
    slug: "draw-regions",
    templateId: "@m0saic-starter/controls/draw-regions/v1",
    exportName: "DrawRegionsV1",
  },
  {
    slug: "code-handoff",
    templateId: "@m0saic-starter/controls/code-handoff/v1",
    exportName: "CodeHandoffV1",
  },
  {
    slug: "m0-prop",
    templateId: "@m0saic-starter/controls/m0-prop/v1",
    exportName: "M0PropV1",
  },
  {
    slug: "panel-organization",
    templateId: "@m0saic-starter/controls/panel-organization/v1",
    exportName: "PanelOrganizationV1",
  },
  {
    slug: "dual-props",
    templateId: "@m0saic-starter/controls/dual-props/v1",
    exportName: "DualPropsV1",
  },
  {
    slug: "number-display",
    templateId: "@m0saic-starter/controls/number-display/v1",
    exportName: "NumberDisplayV1",
  },
];
