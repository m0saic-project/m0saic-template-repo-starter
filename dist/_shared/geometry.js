"use strict";
/**
 * Shared geometry helpers for the curriculum.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.outsideInSizes = outsideInSizes;
/**
 * The engine's OUTSIDE-IN remainder distribution for an equal split — the
 * exact, locked rule (`packages/dsl` pins it by test):
 *
 *   base = floor(totalPx / count); the remainder is handed out one pixel at
 *   a time in index order 0, N-1, 1, N-2, … — edges first, center last.
 *
 * `outsideInSizes(103, 4)` → `[26, 26, 25, 26]`. Deterministic arithmetic,
 * not a rendering quirk — a template can PREDICT its own tile sizes before
 * a single pixel renders. (To watch the rule live on any m0, flip the
 * viewer's "Show dimensions" toggle.)
 */
function outsideInSizes(totalPx, count) {
    if (!Number.isInteger(count) || count < 1) {
        throw new Error(`outsideInSizes: count must be a positive integer, got ${count}`);
    }
    const total = Math.max(0, Math.round(totalPx));
    const base = Math.floor(total / count);
    const sizes = new Array(count).fill(base);
    const remainder = total - base * count;
    const order = [];
    for (let lo = 0, hi = count - 1; lo <= hi; lo++, hi--) {
        order.push(lo);
        if (hi !== lo)
            order.push(hi);
    }
    for (let i = 0; i < remainder; i++) {
        sizes[order[i]] += 1;
    }
    return sizes;
}
