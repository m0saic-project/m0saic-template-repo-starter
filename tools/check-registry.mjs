#!/usr/bin/env node
/**
 * Build-time registry gate.
 *
 * Stage 1 — load the freshly built `templates` first-party so every template
 * passes through `defineMosaicTemplate`, the seam that enforces the
 * DEFINITION-TIME conventions: defaultProps ("a knob shows what it does"),
 * colorProps (isColor + colorPicker), noLocalPaths (no absolute paths in
 * defaults), browseSurface (description + tags), propLabels (ui.label, a
 * warning). A throw-posture violation throws here, naming the template, the
 * knobs, and the fix — the build fails before the template can load in Mosaic
 * Desktop or the CLI.
 *
 * Stage 2 — render every template at its `defaultProps` on its hinted canvas
 * and audit the RENDER-TIME conventions: rendersAtDefaults, bindingsSound
 * (every editor.binding resolves), bindingsCover (a prop drawn as text is
 * bound to its rect — a warning), svgGlyphCoverage (svg text only uses
 * characters the font has). Templates whose required inputs have no default
 * are skipped, not failed.
 *
 * Same gate as the m0saic monorepo's `packages/templates/tools/check-registry.mjs`.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
process.env.M0SAIC_CLI ??= "/usr/bin/false";

// `--sweep`: also render every template on the standard canvases (1080p
// landscape / portrait / square) for the `canvasEnvelope` rule. Off by
// default — a build gate renders once; the sweep is a few times the cost.
const SWEEP = process.argv.includes("--sweep");

let templates;
let templateUtils;
try {
  ({ templates } = require("../dist/index.js")); // side effect: defineMosaicTemplate() for every template
  templateUtils = require("@m0saic/template-utils");
} catch (err) {
  const message = err && err.message ? err.message : String(err);
  console.error(`\n[check-registry] ✗ the built templates refused to load:\n\n${message}\n`);
  console.error("[check-registry] Fix the template above, then rebuild. (tools/check-registry.mjs)");
  process.exit(1);
}

const count = Array.isArray(templates) ? templates.length : 0;
const printFindings = (label, findings) => {
  for (const f of findings) {
    console.error(`  ${label} ${f.templateId} — ${f.convention}: ${f.violations.map((v) => v.key).join(", ")}`);
    for (const v of f.violations.slice(0, 4)) console.error(`      ${v.detail}`);
    if (f.violations.length > 4) console.error(`      …+${f.violations.length - 4} more`);
  }
};

// ── Stage 1: definition time ───────────────────────────────────────────────
const recorded = typeof templateUtils.listTemplateConventionFindings === "function"
  ? templateUtils.listTemplateConventionFindings().filter((f) => !f.external)
  : [];
const errors1 = recorded.filter((f) => f.severity === "error");
const warnings1 = recorded.filter((f) => f.severity === "warning");
if (count === 0 || errors1.length > 0) {
  console.error(`[check-registry] ✗ ${count} templates exported, ${errors1.length} convention error(s) recorded.`);
  printFindings("✗", errors1);
  process.exit(1);
}
const warnedKnobs = warnings1.reduce((n, f) => n + f.violations.length, 0);
console.log(`[check-registry] ✓ ${count} templates — definition-time conventions hold` +
  (warnings1.length ? ` (${warnings1.length} template(s) carry ${warnedKnobs} warning knob(s): ${[...new Set(warnings1.map((f) => f.convention))].join(", ")})` : "") + ".");

// ── Stage 2: render time ───────────────────────────────────────────────────
if (typeof templateUtils.auditRenderedTemplate !== "function") {
  console.warn("[check-registry] ⚠ this @m0saic/template-utils has no auditRenderedTemplate — render-time conventions not checked.");
  process.exit(0);
}
// A host registers every template of a repo before rendering any of them
// (a lesson may invoke a sibling by id through the registry). Do the same
// here, first-party, so nested invocations resolve exactly as they do in
// Mosaic Desktop and the CLI.
for (const template of templates) templateUtils.registerTemplate(template);
const errors2 = [];
const warnings2 = [];
const skipped = [];
let rendered = 0;
for (const template of templates) {
  const audit = await templateUtils.auditRenderedTemplate(template, SWEEP ? { sweepCanvases: templateUtils.STANDARD_SWEEP_CANVASES } : {});
  if (audit.skipped) {
    skipped.push(`${audit.templateId}: ${audit.skipped}`);
    continue;
  }
  rendered++;
  for (const f of audit.findings) (f.severity === "error" ? errors2 : warnings2).push(f);
  for (const note of audit.notes) console.warn(`  ⚠ ${audit.templateId}: ${note}`);
}
if (warnings2.length) {
  console.warn(`[check-registry] ⚠ ${warnings2.length} render-time warning(s) (record posture — fix when you touch the template):`);
  printFindings("⚠", warnings2);
}
if (errors2.length) {
  console.error(`[check-registry] ✗ ${errors2.length} render-time convention error(s):`);
  printFindings("✗", errors2);
  console.error("[check-registry] Fix the template(s) above, then rebuild. (tools/check-registry.mjs)");
  process.exit(1);
}
if (SWEEP) console.log(`[check-registry] (sweep) each template was also rendered on ${templateUtils.STANDARD_SWEEP_CANVASES.length} standard canvases for the canvasEnvelope rule.`);
console.log(`[check-registry] ✓ ${rendered} templates rendered at their defaults — render-time conventions hold (${skipped.length} skipped: inputs required).`);
