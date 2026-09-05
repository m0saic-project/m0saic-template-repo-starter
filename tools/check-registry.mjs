#!/usr/bin/env node
/**
 * Build-time registry gate: load the freshly built `templates` first-party so
 * every template passes through `defineMosaicTemplate` — the seam that enforces
 * the template conventions (today: the default-props contract, "a knob shows
 * what it does": every optional boolean / closed-set knob carries a
 * `defaultProps` value, every plain string / number knob a default or a
 * `meta.control.placeholder`). A template that hides a default throws here,
 * naming the knobs and the fix, and the build fails — before the template can
 * load in Mosaic Desktop or the CLI.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

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
const findings = typeof templateUtils.listTemplateConventionFindings === "function"
  ? templateUtils.listTemplateConventionFindings().filter((f) => !f.external)
  : [];
if (count === 0 || findings.length > 0) {
  console.error(`[check-registry] ✗ ${count} templates exported, ${findings.length} convention finding(s) recorded.`);
  for (const f of findings) console.error(`  • ${f.templateId}: ${f.violations.map((v) => v.key).join(", ")}`);
  process.exit(1);
}
console.log(`[check-registry] ✓ ${count} templates — every optional knob shows its effective default.`);
