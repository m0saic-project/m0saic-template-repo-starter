"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiSelectV1 = void 0;
exports.parseMixes = parseMixes;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const svg_text_1 = require("../../../_shared/svg-text");
const tutorial_1 = require("../../../_shared/tutorial");
const fetchers_1 = require("../../fetchers");
const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9-]+$/;
const ID = "@m0saic-starter/connections/multi-select/v1";
const MAX_MIXES = 4;
const MAX_CHIPS = 6;
const DEFAULT_MIXES = [
    { label: "Opening", itemIds: ["sunrise-timelapse", "big-buck-bunny"] },
    { label: "Ambient", itemIds: ["ember-glow", "soft-gradient", "ink-in-water"] },
];
/** A darker twin of a #rrggbb colour. */
function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const dim = (v) => Math.max(0, Math.round(v * 0.62));
    const hh = (v) => v.toString(16).padStart(2, "0");
    return `#${hh(dim((n >> 16) & 0xff))}${hh(dim((n >> 8) & 0xff))}${hh(dim(n & 0xff))}`;
}
const titleCase = (slug) => slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
/** Parse + validate the prop (editors may deliver a JSON string). */
function parseMixes(raw) {
    const value = typeof raw === "string" ? JSON.parse(raw) : (raw !== null && raw !== void 0 ? raw : DEFAULT_MIXES);
    if (!Array.isArray(value) || value.length < 1 || value.length > MAX_MIXES) {
        throw new Error(`${ID}: mixes must hold 1-${MAX_MIXES} entries.`);
    }
    return value.map((entry, i) => {
        const e = entry;
        if (typeof e.label !== "string" || e.label.length === 0 || e.label.length > 24) {
            throw new Error(`${ID}: mixes[${i}].label must be a 1-24 char string.`);
        }
        if (!Array.isArray(e.itemIds) || e.itemIds.length < 1 || e.itemIds.length > MAX_CHIPS) {
            throw new Error(`${ID}: mixes[${i}].itemIds must hold 1-${MAX_CHIPS} ids.`);
        }
        for (const id of e.itemIds) {
            if (typeof id !== "string" || !SLUG.test(id)) {
                throw new Error(`${ID}: mixes[${i}] id ${JSON.stringify(id)} must be a lowercase slug.`);
            }
        }
        return { label: e.label, itemIds: [...e.itemIds] };
    });
}
const propsSchema = (0, template_utils_1.definePropsSchema)({
    connectionId: {
        type: "string",
        required: false,
        description: "The sibling wire (lesson 76): which configured connection profile every card's chip picker resolves against.",
        meta: {
            ui: { label: "Connection", order: 1 },
        },
    },
    mixes: {
        type: "json",
        required: false,
        description: "The mixes: repeating cards, each a label plus catalog items picked as chips from the grouped connection modal. Plain JSON at render — Array<{label, itemIds}>.",
        meta: {
            constraints: {
                jsonSchema: {
                    type: "array",
                    minItems: 1,
                    maxItems: MAX_MIXES,
                    items: {
                        type: "object",
                        required: ["label", "itemIds"],
                        properties: {
                            label: { type: "string", minLength: 1, maxLength: 24 },
                            itemIds: {
                                type: "array",
                                minItems: 1,
                                maxItems: MAX_CHIPS,
                                items: { type: "string", pattern: "^[a-z0-9-]+$" },
                            },
                        },
                    },
                },
            },
            control: {
                flavor: "cardList",
                columns: [
                    { key: "label", kind: "text", label: "Mix", placeholder: "Opening" },
                    {
                        key: "itemIds",
                        kind: "connectionMultiSelect",
                        label: "Items",
                        optionsFromConnection: { kind: fetchers_1.ITEMS_KIND, connectionFromProp: "connectionId" },
                        groupByKey: "group",
                    },
                ],
            },
            ui: { label: "Mixes", order: 2 },
        },
    },
    bandColor: {
        type: "string",
        required: false,
        description: "Accent fill as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#2e86c1" },
            ui: { label: "Band color", order: 3 },
        },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Backdrop as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Page color", order: 4 },
        },
    },
});
exports.MultiSelectV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "78 · Connection Multi-Select",
    version: 1,
    description: "Cards of chips, each chip a rich pick: a json prop with flavor cardList renders as a repeating card editor, and a connectionMultiSelect column gives every card a chips row backed by the connection's options — with groupByKey sectioning the picker modal by an option field (the catalog's collections). The value stays boring on purpose: plain Array<{label, itemIds}> JSON, identical whether it was picked from the modal or typed by hand — which is exactly why CLI and app renders agree.",
    capabilities: { tier: "core" },
    tags: ["connections", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Edit Mixes: add a card, open its Items chips — the modal arrives sectioned Shorts / Features / Loops via groupByKey.",
    },
    propsSchema,
    defaultProps: {
        connectionId: "starter-catalog@default",
        mixes: DEFAULT_MIXES,
        bandColor: "#2e86c1",
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a, _b;
        for (const [key, value] of [
            ["bandColor", props.bandColor],
            ["pageColor", props.pageColor],
        ]) {
            if (value !== undefined && !HEX.test(value)) {
                throw new Error(`${ID}: ${key} ${JSON.stringify(value)} must be #rrggbb.`);
            }
        }
        const mixes = parseMixes(props.mixes);
        const { width, height } = ctx.target;
        const bandHex = (_a = props.bandColor) !== null && _a !== void 0 ? _a : "#2e86c1";
        const band = bandHex;
        const page = ((_b = props.pageColor) !== null && _b !== void 0 ? _b : "#1c2833");
        // One row per mix: label plate, then a chip per picked item.
        const mixRow = (m) => {
            // 4 pad + 20 label + 4 gap = 28; the chips share the remaining 72,
            // each chip followed by a 2-slot gap.
            const chips = m.itemIds;
            const chipW = Math.floor(72 / chips.length) - 2;
            const weights = [4, 20, 4, ...chips.flatMap(() => [chipW, 2])];
            const claimants = ["-", "1{1}", "-", ...chips.flatMap(() => ["1{1}", "-"])];
            const rem = 100 - weights.reduce((a, b) => a + b, 0);
            if (rem > 0) {
                weights.push(rem);
                claimants.push("-");
            }
            return String((0, dsl_stdlib_1.weightedSplit)(weights, "col", { mode: "literal", claimants }));
        };
        const bandWeights = [8, ...mixes.flatMap(() => [Math.floor(64 / mixes.length), 6])];
        const bandClaimants = ["-", ...mixes.flatMap((m) => [mixRow(m), "-"])];
        bandWeights.push(100 - bandWeights.reduce((a, b) => a + b, 0));
        bandClaimants.push("-");
        const rows = String((0, dsl_stdlib_1.weightedSplit)(bandWeights, "row", { mode: "literal", claimants: bandClaimants }));
        const m0 = (0, dsl_stdlib_1.toM0String)(`${rows}{6[-,-,-,-,-,1]}`, ID);
        const rowH = (height * 0.64) / mixes.length;
        const sources = [];
        for (const m of mixes) {
            sources.push((0, template_utils_1.makeColorTile)(band));
            sources.push((0, template_utils_1.svgLabel)(m.label, width * 0.18, rowH, {
                color: "#eaeef2",
                maxPx: Math.round(height * 0.036),
                vAlign: "middle",
            }));
            for (const id of m.itemIds) {
                sources.push((0, template_utils_1.makeColorTile)(shade(bandHex)));
                sources.push((0, template_utils_1.svgLabel)(titleCase(id), width * 0.1, rowH, {
                    color: "#b9c4cf",
                    maxPx: Math.round(height * 0.02),
                    maxLines: 3,
                    vAlign: "middle",
                }));
            }
        }
        const chipCount = mixes.reduce((a, m) => a + m.itemIds.length, 0);
        const heading = (0, svg_text_1.fitSvgText)(`CONNECTION MULTI-SELECT - ${mixes.length} card${mixes.length === 1 ? "" : "s"}, ${chipCount} chips, one boring JSON value`, width * 0.9, height * 0.07, { maxPx: Math.round(height * 0.034), maxLines: 1 });
        const readout = (0, svg_text_1.fitSvgLines)([
            `flavor cardList + a connectionMultiSelect column (kind "${fetchers_1.ITEMS_KIND}") - groupByKey "group" sections the modal by collection`,
            "render parses the same JSON a text editor would produce - rich picking is edit-time sugar, not a render dependency",
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
        title: "Connection Multi-Select",
        lines: [
            "flavor cardList renders a json prop as repeating cards; a connectionMultiSelect column gives each card chips backed by the connection's options.",
            "groupByKey names an option field to section the picker modal by - the catalog's items arrive grouped under their collections.",
            "The value is plain Array<{label, itemIds}> JSON either way. Rich picking is edit-time sugar; render sees what a text editor would send.",
        ],
        explore: [
            "Add a card, open its chips - the modal is sectioned by collection",
            "Paste the same JSON by hand - identical render",
        ],
    }),
});
exports.default = exports.MultiSelectV1;
