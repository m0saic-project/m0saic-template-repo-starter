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
export declare const controlsRegistry: StarterRegistryEntry[];
