"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlsRegistry = void 0;
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
exports.controlsRegistry = [
    {
        slug: "static-options",
        templateId: "@m0saic-starter/controls/static-options/v1",
        exportName: "StaticOptionsV1",
        title: "19 · Static Options",
        description: "The static option list: rows of value/label/description turn a string prop into segmented pills or a dropdown and a string[] into toggle pills. The lesson is the distinction — options is PRESENTATION, constraints.oneOf is VALIDATION, and they are independent: declare both for a true closed set, options alone to keep values open (the posture connection-backed props need).",
        tags: ["controls", "lesson"],
    },
    {
        slug: "row-editors",
        templateId: "@m0saic-starter/controls/row-editors/v1",
        exportName: "RowEditorsV1",
        title: "20 · Row Editors",
        description: "An array-of-objects prop that edits like a form: flavor objectRows + columns (text / number / color cells) renders repeating rows with add and remove, and palette seeds new rows' colors so additions arrive on-brand. Same columns contract cardList grows into cards. Render gets the plain array and draws the breakdown bar this pattern most often feeds.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "number-series",
        templateId: "@m0saic-starter/controls/number-series/v1",
        exportName: "NumberSeriesV1",
        title: "21 · Number Series",
        description: "Chart data edited as tabs of numeric rows: flavor numberSeries gives a json prop one tab per series, and the value round-trips flat (number[]) for one series and nested (number[][]) for several — render normalizes both, the tolerance that keeps hand-authored files working. numberList is the tab-less single-series sibling.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "weights",
        templateId: "@m0saic-starter/controls/weights/v1",
        exportName: "WeightsV1",
        title: "22 · Weights",
        description: "A distribution the user drags: flavor weights + a schema-declared label set renders a number[] as an auto-balancing slider group holding a constant 100, one weight per label by order. Field and render both normalize forgiving-ly, and the render's bands are a weightedSplit fed directly by the prop — drag a slider, move a wall.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "group-fields",
        templateId: "@m0saic-starter/controls/group-fields/v1",
        exportName: "GroupFieldsV1",
        title: "23 · Group Fields",
        description: "Related props that travel as one value: type group + fields nests ordinary prop definitions (same types, same controls — the accent is a normal colorPicker) under a single prop, edited as one fieldset and written in one edit, whole or not at all. Render guards the object as a unit: one guard for one idea. Drawn as the lower third this shape most often is.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "range",
        templateId: "@m0saic-starter/controls/range/v1",
        exportName: "RangeV1",
        title: "24 · Range",
        description: "A number allowed to be a range: flavor range gives one prop three intents readable off the value shape — a flat number, { low, high } to sample fresh per use, or { low, high, once: true } to sample once and reuse (once is never written false). The control records intent; what a 'use' means belongs to the template, and sampling belongs to templates with a seed prop.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "draw-regions",
        templateId: "@m0saic-starter/controls/draw-regions/v1",
        exportName: "DrawRegionsV1",
        title: "25 · Draw Regions",
        description: "The user marks an area on the LIVE preview and the template receives geometry — the handshake is the product. picker \"regions\" arms draw mode (rect, plus ellipse/brush mask carving); the wire is plain px JSON, identical from draw mode, --props, or an agent. What a template does with the areas — blur, redact, AI target boxes — is its own concern; this lesson shows the receipt, chips in draw order, with zero regions as the working base case.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "code-handoff",
        templateId: "@m0saic-starter/controls/code-handoff/v1",
        exportName: "CodeHandoffV1",
        title: "26 · Code Handoff",
        description: "A prop that flows the OTHER way: type code is a handoff — { language, code } shipped by the author in defaultProps, shown as a read-only, selectable, copyable code window (not an input), ignorable by render. For workflows where the user must run something outside the app; this lesson hands you the CLI command that renders itself headless.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "m0-prop",
        templateId: "@m0saic-starter/controls/m0-prop/v1",
        exportName: "M0PropV1",
        title: "27 · m0 Prop",
        description: "The layout itself as a prop: type m0 tells the editor the value is grammar, not prose — and the template treats it like any untrusted input: isValidM0String at the boundary, a report card instead of a dead render when it doesn't parse, and valid layouts framed as a wireframe with one tile per claim. Bring your own geometry; the template supplies the pixels.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "panel-organization",
        templateId: "@m0saic-starter/controls/panel-organization/v1",
        exportName: "PanelOrganizationV1",
        title: "28 · Panel Organization",
        description: "The props panel is authored, not emitted: the top group is required props plus optional ones pinned with ui.primary; ui.visibleWhen skips a control until its sibling gate matches (string-coerced); ui.hidden removes the control while the prop stays fully render-effective — hidden is not dead. Render paints them all regardless: placement is an editor conversation.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "dual-props",
        templateId: "@m0saic-starter/controls/dual-props/v1",
        exportName: "DualPropsV1",
        title: "29 · Dual Props",
        description: "One knob for humans, one truth for everyone: canonical props marked consumer \"agent\" hold what render reads (surfaced under the Agent props escape); friendly props marked \"human\" + syncsTo are derived views the editor inverse-maps to position and writes back through (linear with invertible ranges, boolInvert, identity). The human key never reaches render, so dials and files can never disagree.",
        tags: ["controls", "lesson"],
    },
    {
        slug: "number-display",
        templateId: "@m0saic-starter/controls/number-display/v1",
        exportName: "NumberDisplayV1",
        title: "30 · Number Display",
        description: "The stored unit and the shown unit are different decisions: unit names the canonical scale, displayUnit converts only the editor's field, lockDisplayUnit freezes the unit chip where a swap could silently rescale a value, and step is authored canonical. Render reads canonical ms and prints it — presentation never leaks into meaning.",
        tags: ["controls", "lesson"],
    },
];
