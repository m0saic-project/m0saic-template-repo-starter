"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlsRegistry = void 0;
/**
 * Chapter registry: `controls` — array order is the teaching order.
 *
 * The rich editor tier: everything past a text box. The props chapter (13-18)
 * taught the scalar surface; this one teaches the controls that make complex
 * values EDITABLE — option pills, repeating-row forms, tabbed series,
 * auto-balancing weight groups, and the weighted card editor that composes
 * them with the connections chapter's pickers.
 *
 * Recurring law, every lesson: the control is EDIT-time sugar. Render
 * receives plain data (often in more than one legal shape — flat vs nested
 * series, string[] vs {id,weight}[] items) and must normalize before
 * drawing, because a hand-authored file deserves exactly what the rich
 * editor produces.
 */
exports.controlsRegistry = [
    {
        slug: "static-options",
        templateId: "@m0saic-starter/controls/static-options/v1",
        exportName: "StaticOptionsV1",
        title: "66 · Static Options",
        description: "The static option list: rows of value/label/description turn a string prop into segmented pills or a dropdown and a string[] into toggle pills. The lesson is the distinction — options is PRESENTATION, constraints.oneOf is VALIDATION, and they are independent: declare both for a true closed set, options alone to keep values open (the posture connection-backed props need).",
        tags: ["controls", "lesson"],
    },
    {
        slug: "row-editors",
        templateId: "@m0saic-starter/controls/row-editors/v1",
        exportName: "RowEditorsV1",
        title: "67 · Row Editors",
        description: "An array-of-objects prop that edits like a form: flavor objectRows + columns (text / number / color cells) renders repeating rows with add and remove, and palette seeds new rows' colors so additions arrive on-brand. Same columns contract cardList grows into cards. Render gets the plain array and draws the breakdown bar this pattern most often feeds.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "number-series",
        templateId: "@m0saic-starter/controls/number-series/v1",
        exportName: "NumberSeriesV1",
        title: "68 · Number Series",
        description: "Chart data edited as tabs of numeric rows: flavor numberSeries gives a json prop one tab per series, and the value round-trips flat (number[]) for one series and nested (number[][]) for several — render normalizes both, the tolerance that keeps hand-authored files working. numberList is the tab-less single-series sibling.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "weights",
        templateId: "@m0saic-starter/controls/weights/v1",
        exportName: "WeightsV1",
        title: "69 · Weights",
        description: "A distribution the user drags: flavor weights + a schema-declared label set renders a number[] as an auto-balancing slider group holding a constant 100, one weight per label by order. Field and render both normalize forgiving-ly, and the render's bands are a weightedSplit fed directly by the prop — drag a slider, move a wall.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "weighted-cards",
        templateId: "@m0saic-starter/controls/weighted-cards/v1",
        exportName: "WeightedCardsV1",
        title: "70 · Weighted Cards",
        description: "Weights at both depths: a weights column SHARING the multi-select's key gives each card an auto-balancing share group over its own chips (two cells, one array — even sets round-trip string[], customized {id,weight}[]), and interWeightProp names a sibling number[] weighing the cards against each other. Rows and chips in the render ARE those values.",
        tags: ["controls", "connections", "lesson"],
    },
];
