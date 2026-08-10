/**
 * Shared geometry helpers for the curriculum.
 */
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
export declare function outsideInSizes(totalPx: number, count: number): number[];
