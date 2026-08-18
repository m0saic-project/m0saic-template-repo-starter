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
    title: "19 · Static Options",
    description:
      "The static option list: rows of value/label/description turn a string prop into segmented pills or a dropdown and a string[] into toggle pills. The lesson is the distinction — options is PRESENTATION, constraints.oneOf is VALIDATION, and they are independent: declare both for a true closed set, options alone to keep values open (the posture connection-backed props need).",
    tags: ["controls", "lesson"],
  },
  {
    slug: "row-editors",
    templateId: "@m0saic-starter/controls/row-editors/v1",
    exportName: "RowEditorsV1",
    title: "20 · Row Editors",
    description:
      "An array-of-objects prop that edits like a form: flavor objectRows + columns (text / number / color cells) renders repeating rows with add and remove, and palette seeds new rows' colors so additions arrive on-brand. Same columns contract cardList grows into cards. Render gets the plain array and draws the breakdown bar this pattern most often feeds.",
    tags: ["controls", "lesson"],
  },
  {
    slug: "number-series",
    templateId: "@m0saic-starter/controls/number-series/v1",
    exportName: "NumberSeriesV1",
    title: "21 · Number Series",
    description:
      "Chart data edited as tabs of numeric rows: flavor numberSeries gives a json prop one tab per series, and the value round-trips flat (number[]) for one series and nested (number[][]) for several — render normalizes both, the tolerance that keeps hand-authored files working. numberList is the tab-less single-series sibling.",
    tags: ["controls", "lesson"],
  },
  {
    slug: "weights",
    templateId: "@m0saic-starter/controls/weights/v1",
    exportName: "WeightsV1",
    title: "22 · Weights",
    description:
      "A distribution the user drags: flavor weights + a schema-declared label set renders a number[] as an auto-balancing slider group holding a constant 100, one weight per label by order. Field and render both normalize forgiving-ly, and the render's bands are a weightedSplit fed directly by the prop — drag a slider, move a wall.",
    tags: ["controls", "lesson"],
  },
];
