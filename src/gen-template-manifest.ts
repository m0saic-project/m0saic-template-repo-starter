import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type {
  MosaicTemplateRepoManifest,
  MosaicTemplateRepoManifestEntry
} from "@m0saic/types";

import { templateRegistry } from "./registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const REPO_ID = "@m0saic-starter";
const DISPLAY_NAME = "Template Repo Starter";
const DESCRIPTION = "Golden example 3P template repo for m0saic Make.";
const CURATOR = "m0saic";
const HOMEPAGE = "https://github.com/m0saic/template-repo-starter";

const TEMPLATES_DIR = "assets/templates";
const ENTRY_MODULE = "./dist/index.js";

/**
 * External repos follow:
 *   <repoId>/<slug>/v<major>
 *
 * Pre-release: starter repo defaults all templates to v1.
 */
const DEFAULT_MAJOR_VERSION = 1;

function encodeTemplateKey(templateKey: string): string {
  return templateKey.replaceAll("/", "__");
}

function absFromRepo(relPath: string): string {
  return path.join(ROOT, relPath);
}

function existsRepoRel(relPath: string): boolean {
  return fs.existsSync(absFromRepo(relPath));
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function isNonEmptyString(x: unknown): x is string {
  return typeof x === "string" && x.trim().length > 0;
}

function ensureSlug(slug: unknown, templateKeyHint: string): string {
  assert(
    isNonEmptyString(slug),
    `Template "${templateKeyHint}" must define a non-empty slug`
  );
  assert(
    /^[a-z0-9][a-z0-9-]*$/.test(slug),
    `Template "${templateKeyHint}" slug "${slug}" must match /^[a-z0-9][a-z0-9-]*$/`
  );
  return slug;
}

function ensureTags(tags: unknown, templateKey: string): string[] {
  assert(Array.isArray(tags), `Template "${templateKey}" must define tags: string[]`);
  assert(tags.length > 0, `Template "${templateKey}" must have at least one tag`);
  for (const tag of tags) {
    assert(
      isNonEmptyString(tag),
      `Template "${templateKey}" has an invalid tag (must be non-empty string)`
    );
  }
  return tags as string[];
}

function ensurePreviewPathsExist(
  preview: MosaicTemplateRepoManifestEntry["preview"] | undefined,
  templateKey: string
) {
  if (!preview) return;

  const check = (p: string | undefined, field: string) => {
    if (!p) return;
    assert(
      existsRepoRel(p),
      `Template "${templateKey}" preview.${field} points to missing file: "${p}"`
    );
  };

  check(preview.image, "image");
  check(preview.video, "video");
  check(preview.poster, "poster");
}

function buildPreviewFromConvention(
  templateKey: string
): MosaicTemplateRepoManifestEntry["preview"] | undefined {
  const encoded = encodeTemplateKey(templateKey);
  const baseDir = `${TEMPLATES_DIR}/${encoded}`;

  const image = `${baseDir}/preview.png`;
  const video = `${baseDir}/preview.mp4`;
  const poster = `${baseDir}/poster.png`;

  const preview: NonNullable<MosaicTemplateRepoManifestEntry["preview"]> = {};
  if (existsRepoRel(image)) preview.image = image;
  if (existsRepoRel(video)) preview.video = video;
  if (existsRepoRel(poster)) preview.poster = poster;

  return preview.image || preview.video || preview.poster ? preview : undefined;
}

function mergePreview(
  explicit: MosaicTemplateRepoManifestEntry["preview"] | undefined,
  fallback: MosaicTemplateRepoManifestEntry["preview"] | undefined
): MosaicTemplateRepoManifestEntry["preview"] | undefined {
  if (!explicit && !fallback) return undefined;

  const merged = {
    image: explicit?.image ?? fallback?.image,
    video: explicit?.video ?? fallback?.video,
    poster: explicit?.poster ?? fallback?.poster
  };

  return merged.image || merged.video || merged.poster ? merged : undefined;
}

// ---- FAIL: entry module must exist ----
assert(
  existsRepoRel(ENTRY_MODULE),
  `entryModule "${ENTRY_MODULE}" does not exist. Run "npm run build" to emit dist/.`
);

// ---- Load entry module exports to validate exportName ----
const entryAbs = absFromRepo(ENTRY_MODULE);
const entryUrl = pathToFileURL(entryAbs).href;
const entryExports: Record<string, unknown> = await import(entryUrl);

// ---- FAIL: duplicates in registry ----
const seenSlugs = new Set<string>();
const seenExports = new Set<string>();

for (const raw of templateRegistry as any[]) {
  const slug = ensureSlug(raw.slug, `${REPO_ID}/<unknown>/v${DEFAULT_MAJOR_VERSION}`);
  assert(!seenSlugs.has(slug), `Duplicate slug in registry.ts: "${slug}"`);
  seenSlugs.add(slug);

  assert(
    isNonEmptyString(raw.exportName),
    `Template "${REPO_ID}/${slug}/v${DEFAULT_MAJOR_VERSION}" must define exportName`
  );
  assert(
    !seenExports.has(raw.exportName),
    `Duplicate exportName in registry.ts: "${raw.exportName}"`
  );
  seenExports.add(raw.exportName);
}

// ---- Build manifest templates + validate each entry ----
const templates: MosaicTemplateRepoManifestEntry[] = (templateRegistry as any[]).map(
  (t): MosaicTemplateRepoManifestEntry => {
    const slug = ensureSlug(t.slug, `${REPO_ID}/<unknown>/v${DEFAULT_MAJOR_VERSION}`);
    const templateKey = `${REPO_ID}/${slug}/v${DEFAULT_MAJOR_VERSION}`;

    assert(
      Object.prototype.hasOwnProperty.call(entryExports, t.exportName),
      `Template "${templateKey}" exportName "${t.exportName}" is not exported by ${ENTRY_MODULE}`
    );

    const tags = ensureTags(t.tags, templateKey);

    // If registry provides explicit preview paths, they must exist.
    ensurePreviewPathsExist(t.preview, templateKey);

    // Merge explicit preview (if any) with conventional assets discovery.
    const preview = mergePreview(t.preview, buildPreviewFromConvention(templateKey));

    // If a video preview exists but no poster is provided,
    // use the video itself as the poster fallback.
    if (preview?.video && !preview.poster) {
      preview.poster = preview.video;
    }

    return {
      slug,
      templateKey,
      title: t.title,
      description: t.description,
      tags,
      preview
    };
  }
);

const manifest: MosaicTemplateRepoManifest = {
  schemaVersion: 1,
  repo: {
    schemaVersion: 1,
    repoId: REPO_ID,
    displayName: DISPLAY_NAME,
    description: DESCRIPTION,
    curator: CURATOR,
    homepage: HOMEPAGE,
    assets: {
      templatesDir: TEMPLATES_DIR
    }
  },
  entryModule: ENTRY_MODULE,
  templates
};

const outPath = path.join(ROOT, "template-manifest.json");
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

const previewCount = templates.filter((t) => t.preview).length;
console.log(
  `[gen-template-manifest] wrote ${path.relative(ROOT, outPath)} ` +
    `(${templates.length} templates, ${previewCount} with preview assets)`,
);