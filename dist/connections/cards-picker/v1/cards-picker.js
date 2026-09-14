"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardsPickerV1 = void 0;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const fetchers_1 = require("../../fetchers");
const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9-]+$/;
const ID = "@m0saic-starter/connections/cards-picker/v1";
const MAX_ITEMS = 6;
/** Deterministic poster palette — id hash picks a stable pair. */
const POSTERS = [
    ["#2e86c1", "#1b4f72"],
    ["#28b463", "#186a3b"],
    ["#ca6f1e", "#784212"],
    ["#884ea0", "#4a235a"],
    ["#c0392b", "#641e16"],
    ["#17a589", "#0b5345"],
];
function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
const titleCase = (slug) => slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const propsSchema = (0, template_utils_1.definePropsSchema)({
    connectionId: {
        type: "string",
        required: false,
        description: "The sibling wire (lesson 76): which configured connection profile the artwork picker resolves against.",
        meta: {
            ui: { label: "Connection", order: 1 },
        },
    },
    itemIds: {
        type: "string[]",
        required: false,
        description: "Catalog items to feature, picked by artwork. The expanded picker renders wide cover-fit cards with art resolved lazily from the connection; without images it degrades to a text list.",
        meta: {
            constraints: { minItems: 1, maxItems: MAX_ITEMS },
            control: {
                picker: "cards",
                cardAspect: "wide",
                cardFit: "cover",
                optionsFromConnection: { kind: fetchers_1.ITEMS_KIND, connectionFromProp: "connectionId" },
            },
            ui: { label: "Items", order: 2 },
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
exports.CardsPickerV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "77 · Cards Picker",
    version: 1,
    description: "Pick upstream results by their artwork: picker \"cards\" turns a string[] prop's connection-backed multi-select into an image-card grid. cardAspect and cardFit are declared by the template because they are properties of the connection kind being queried (wide cover-fit for catalog stills); the heavy art itself rides a companion images fetcher, resolved lazily per visible page as data URIs, never inlined into the options list. At render the prop is a plain string[] — the artwork's only job was making the pick rich.",
    capabilities: { tier: "core" },
    tags: ["connections", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Open the Items picker with the example server running — an artwork grid, sectioned and searchable. Kill the server: same picker, text rows.",
    },
    propsSchema,
    defaultProps: {
        connectionId: "starter-catalog@default",
        itemIds: ["big-buck-bunny", "sunrise-timelapse", "ember-glow"],
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b;
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const itemIds = (_a = props.itemIds) !== null && _a !== void 0 ? _a : ["big-buck-bunny", "sunrise-timelapse", "ember-glow"];
        if (!Array.isArray(itemIds) || itemIds.length < 1 || itemIds.length > MAX_ITEMS) {
            throw new Error(`${ID}: itemIds must hold 1-${MAX_ITEMS} ids.`);
        }
        for (const id of itemIds) {
            if (typeof id !== "string" || !SLUG.test(id)) {
                throw new Error(`${ID}: itemIds entry ${JSON.stringify(id)} must be a lowercase slug.`);
            }
        }
        const { width, height } = ctx.target;
        const page = ((_b = props.pageColor) !== null && _b !== void 0 ? _b : "#1c2833");
        // A shelf of wide poster cards — one per picked id, deterministic
        // stand-in art (hash -> palette pair), title strip on each card.
        const n = itemIds.length;
        const cardW = Math.floor((100 - 4 * (n + 1)) / n);
        const pad = Math.floor((100 - n * cardW - 4 * (n - 1)) / 2);
        const card = String((0, dsl_stdlib_1.weightedSplit)([72, 28], "row", {
            mode: "literal",
            claimants: ["1", "1{1}"],
        }));
        const weights = [pad, ...Array.from({ length: n - 1 }, () => [cardW, 4]).flat(), cardW, 100 - pad - n * cardW - 4 * (n - 1)];
        const claimants = ["-", ...Array.from({ length: n - 1 }, () => [card, "-"]).flat(), card, "-"];
        const shelf = String((0, dsl_stdlib_1.weightedSplit)(weights, "col", { mode: "literal", claimants }));
        const rows = String((0, dsl_stdlib_1.weightedSplit)([16, 48, 36], "row", {
            mode: "literal",
            claimants: ["-", shelf, "-"],
        }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const sources = [];
        for (const id of itemIds) {
            const [art, strip] = POSTERS[hash(id) % POSTERS.length];
            sources.push((0, template_utils_1.makeColorTile)(art), (0, template_utils_1.makeColorTile)(strip));
            sources.push((0, template_utils_1.svgLabel)(titleCase(id), (width * 0.86) / n, height * 0.12, {
                color: "#eaeef2",
                maxPx: Math.round(height * 0.026),
                maxLines: 2,
                vAlign: "middle",
            }));
        }
        const heading = (0, svg_text_1.fitSvgText)(`CARDS PICKER - ${n} item${n === 1 ? "" : "s"} picked by artwork, rendered from plain ids`, width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.034), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            `picker "cards" + cardAspect "wide" + cardFit "cover" - shape and fit belong to the CONNECTION KIND (${fetchers_1.ITEMS_KIND})`,
            "art rides the companion images fetcher: lazy, per visible page, data URIs - options stay light; no images -> text list",
        ], width * 0.9, height * 0.09, { maxPx: Math.round(height * 0.026), widthFrac: 0.92 });
        sources.push((0, svg_text_1.svgTextSource)([
            {
                text: heading.text,
                fontSize: heading.fontSize,
                color: "#eaeef2",
                vAlign: "top",
                padding: { top: 0.08 },
            },
            {
                text: readout.text,
                fontSize: readout.fontSize,
                color: "#7f8c9b",
                vAlign: "bottom",
                padding: { bottom: 0.12 },
            },
        ]));
        return {
            kind: "mosaic_document",
            version: 1,
            m0,
            assets: {},
            backgroundColor: page,
            sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Cards Picker",
        lines: [
            "picker \"cards\" turns a connection-backed string[] multi-select into an artwork grid; without images it degrades to the text list.",
            "cardAspect and cardFit are the template's call because they describe the CONNECTION KIND: wide cover-fit stills here; logos would be contain.",
            "Heavy art never rides the options list - a companion images fetcher resolves it lazily, per visible page, as data URIs keyed by value.",
        ],
        explore: [
            "Open the Items picker with the server on - artwork grid",
            "Pick 6, pick 1 - the shelf re-lays out from the plain ids",
        ],
    }),
});
exports.default = exports.CardsPickerV1;
