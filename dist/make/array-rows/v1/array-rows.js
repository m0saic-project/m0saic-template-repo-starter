"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayRowsV1 = exports.nextSku = exports.DEFAULT_ITEMS = exports.ROW_PALETTE = exports.MAX_ROWS = void 0;
exports.parseItems = parseItems;
const types_1 = require("@m0saic/types");
const dsl_stdlib_1 = require("@m0saic/dsl-stdlib");
const template_utils_1 = require("@m0saic/template-utils");
const tutorial_1 = require("../../../_shared/tutorial");
const ID = "@m0saic-starter/make/array-rows/v1";
const HEX = /^#[0-9a-fA-F]{6}$/;
const INK = "#eaeef2";
const DIM = "#9aa7b4";
const CELL = "#243342";
const ADD = "#2e3d4d";
exports.MAX_ROWS = 6;
const QTY_MAX = 9999;
/** New rows seed their colour cell from this, in order. */
exports.ROW_PALETTE = ["#2e86c1", "#27ae60", "#ca6f1e", "#884ea0", "#c0392b", "#17a589"];
exports.DEFAULT_ITEMS = [
    { sku: "SKU-001", qty: 12, color: "#2e86c1" },
    { sku: "SKU-002", qty: 4, color: "#27ae60" },
    { sku: "SKU-003", qty: 30, color: "#ca6f1e" },
];
/** Parse + validate (editors may deliver a JSON string). */
function parseItems(raw) {
    const value = typeof raw === "string" ? JSON.parse(raw) : (raw !== null && raw !== void 0 ? raw : exports.DEFAULT_ITEMS);
    if (!Array.isArray(value) || value.length > exports.MAX_ROWS) {
        throw new Error(`${ID}: items must hold up to ${exports.MAX_ROWS} rows.`);
    }
    return value.map((entry, i) => {
        const e = entry;
        if (typeof e.sku !== "string" || e.sku.length === 0 || e.sku.length > 16) {
            throw new Error(`${ID}: items[${i}].sku must be a 1-16 char string.`);
        }
        if (!Number.isInteger(e.qty) || e.qty < 0 || e.qty > QTY_MAX) {
            throw new Error(`${ID}: items[${i}].qty must be an integer in [0, ${QTY_MAX}].`);
        }
        if (typeof e.color !== "string" || !HEX.test(e.color)) {
            throw new Error(`${ID}: items[${i}].color must be #rrggbb.`);
        }
        return { sku: e.sku, qty: e.qty, color: e.color };
    });
}
/** The SKU the add handle pre-fills for the row it would create. */
const nextSku = (items) => `SKU-${String(items.length + 1).padStart(3, "0")}`;
exports.nextSku = nextSku;
const propsSchema = (0, template_utils_1.definePropsSchema)({
    items: {
        // The 0.3.0 prop type: an array of objects, declared plainly - no cast.
        type: "array",
        required: false,
        description: "Up to 6 rows of {sku, qty, color}. flavor objectRows + columns edits them as a form; on the canvas every cell is a leaf handle (bindPropPath with a path AND a kind), an empty qty removes its row, and the empty last row adds one.",
        meta: {
            constraints: {
                jsonSchema: {
                    type: "array",
                    maxItems: exports.MAX_ROWS,
                    items: {
                        type: "object",
                        required: ["sku", "qty", "color"],
                        properties: {
                            sku: { type: "string", minLength: 1, maxLength: 16 },
                            qty: { type: "integer", minimum: 0, maximum: QTY_MAX },
                            color: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
                        },
                    },
                },
            },
            control: {
                flavor: "objectRows",
                columns: [
                    { key: "sku", kind: "text", label: "SKU", placeholder: "SKU-001" },
                    { key: "qty", kind: "number", label: "Qty" },
                    { key: "color", kind: "color", label: "Color" },
                ],
                palette: exports.ROW_PALETTE,
            },
            ui: { label: "Items", order: 1 },
        },
    },
    pageColor: {
        type: "string",
        required: false,
        description: "Backdrop as #rrggbb.",
        meta: {
            constraints: { isColor: true },
            control: { colorPicker: true, defaultColor: "#1c2833" },
            ui: { label: "Page color", order: 2 },
        },
    },
});
exports.ArrayRowsV1 = (0, template_utils_1.defineMosaicTemplate)({
    id: (0, types_1.asTemplateId)(ID),
    label: "85 · Array Rows",
    version: 1,
    description: "A type \"array\" prop, declared plainly and edited as rows: flavor objectRows + columns in the panel, and on the canvas every cell is a leaf handle - bindPropPath with a path AND a kind, onClear removing the row, and the empty last row bound as the add handle.",
    capabilities: { tier: "core" },
    tags: ["make", "lesson"],
    outputHints: {
        width: 1280,
        height: 720,
        fps: 30,
        durationMs: 2000,
        format: { kind: "image", container: "png" },
        note: "Static card. Double-click a cell to edit that leaf; clear a qty to remove its row; double-click the empty last row to add one.",
    },
    propsSchema,
    defaultProps: {
        items: exports.DEFAULT_ITEMS,
        pageColor: "#1c2833",
    },
    async render(props, ctx) {
        var _a;
        if (props.pageColor !== undefined && !HEX.test(props.pageColor)) {
            throw new Error(`${ID}: pageColor ${JSON.stringify(props.pageColor)} must be #rrggbb.`);
        }
        const items = parseItems(props.items);
        const page = ((_a = props.pageColor) !== null && _a !== void 0 ? _a : "#1c2833");
        const { width: W, height: H } = ctx.target;
        const px = (fx, fy, fw, fh) => ({
            x: Math.round(fx * W),
            y: Math.round(fy * H),
            w: Math.round(fw * W),
            h: Math.round(fh * H),
        });
        const label = (text, box, maxPx, color) => (0, template_utils_1.svgLabel)(text || " ", box.w, box.h, { maxPx: Math.round(maxPx * H), maxLines: 1, color });
        const pieces = [];
        const piece = (rect, importance, source) => pieces.push({ rect: { ...rect, importance }, source });
        // No backdrop rect: the DOCUMENT fills the canvas (backgroundColor below).
        const head = px(0.06, 0.05, 0.88, 0.08);
        piece(head, 2, label("ARRAY ROWS - a type array prop, every cell a leaf handle", head, 0.036, INK));
        // Column captions - static, not props.
        const hSku = px(0.14, 0.15, 0.4, 0.05);
        piece(hSku, 2, label("sku - string leaf", hSku, 0.02, DIM));
        const hQty = px(0.56, 0.15, 0.16, 0.05);
        piece(hQty, 2, label("qty - number leaf", hQty, 0.02, DIM));
        const hCol = px(0.06, 0.15, 0.06, 0.05);
        piece(hCol, 2, label("color", hCol, 0.02, DIM));
        // One row per item. Each cell binds THIS row's leaf: a path into the value
        // plus the leaf's kind - the schema has no per-leaf type to infer it from.
        const ROW_Y = 0.21;
        const ROW_H = 0.075;
        const ROW_STEP = 0.085;
        items.forEach((row, i) => {
            const y = ROW_Y + i * ROW_STEP;
            const chip = px(0.06, y, 0.06, ROW_H);
            piece(chip, 2, (0, template_utils_1.bindPropPath)((0, template_utils_1.makeColorTile)(row.color), "items", [i, "color"], "color"));
            const sku = px(0.14, y, 0.4, ROW_H);
            piece(sku, 1, (0, template_utils_1.makeColorTile)(CELL));
            piece(sku, 2, (0, template_utils_1.bindPropPath)(label(row.sku, sku, 0.032, INK), "items", [i, "sku"], "string"));
            const qty = px(0.56, y, 0.16, ROW_H);
            piece(qty, 1, (0, template_utils_1.makeColorTile)(CELL));
            // An EMPTY commit here removes the whole row - the panel's remove button, on the canvas.
            piece(qty, 2, (0, template_utils_1.bindPropPath)(label(String(row.qty), qty, 0.032, INK), "items", [i, "qty"], "number", { onClear: "remove-element" }));
        });
        // The add handle: an EMPTY rect bound to the row that does not exist yet.
        // "Bind even when the value is empty" - the rect is a handle to ADD, and
        // the seed pre-fills the SKU a reader would have typed anyway.
        if (items.length < exports.MAX_ROWS) {
            const y = ROW_Y + items.length * ROW_STEP;
            const add = px(0.14, y, 0.58, ROW_H);
            piece(add, 1, (0, template_utils_1.makeColorTile)(ADD));
            piece(add, 2, (0, template_utils_1.bindPropPath)(label("+ add a row - double-click", add, 0.026, DIM), "items", [items.length, "sku"], "string", {
                seedDraft: (0, exports.nextSku)(items),
            }));
        }
        const cap1 = px(0.06, 0.8, 0.88, 0.055);
        piece(cap1, 2, label('type "array" + flavor objectRows: rows in the panel; here each cell is a leaf handle - a path AND a kind', cap1, 0.021, DIM));
        const cap2 = px(0.06, 0.865, 0.88, 0.055);
        piece(cap2, 2, label("clear a qty to remove its row; the empty last row is bound to the row that does not exist yet", cap2, 0.021, DIM));
        const placed = (0, template_utils_1.placeInsetPieces)({ rootW: W, rootH: H, pieces });
        return {
            kind: "mosaic_document",
            version: 1,
            m0: (0, dsl_stdlib_1.toM0String)(placed.m0, ID),
            assets: {},
            backgroundColor: page,
            sources: placed.sources,
        };
    },
    renderTutorial: (0, tutorial_1.lessonTutorial)({
        title: "Array Rows",
        lines: [
            'type "array" is a first-class prop type since 0.3.0 - an array of objects, declared plainly, no cast.',
            "In the panel, flavor objectRows + columns edit it as rows. On the canvas, every cell is a LEAF handle: bindPropPath with a path AND a kind.",
            "onClear remove-element makes an empty qty delete its row; the empty last row is bound to the next index, so double-clicking it adds one.",
        ],
        explore: [
            "Double-click a SKU or a qty - that leaf, that row",
            "Clear a qty and commit - the row is gone",
            "Double-click the empty last row - a new row, SKU pre-filled",
        ],
    }),
});
exports.default = exports.ArrayRowsV1;
