import type { MosaicTemplateRepoManifestEntry } from "@m0saic/types";

/**
 * Local authoring/build registry entry for this repo.
 *
 * - Inherits the canonical browse metadata shape from @m0saic/types
 *   (title/description/tags/preview).
 * - Adds repo-specific wiring needed to build the entry module.
 */
export type TemplateRegistryEntry =
  // Use manifest entry fields for browse metadata, but omit fields that are
  // computed by gen-template-manifest (templateKey) or renamed (slug).
  Omit<MosaicTemplateRepoManifestEntry, "templateKey"> & {
    /**
     * Local slug for this repo (maps 1:1 to MosaicTemplateRepoManifestEntry.slug).
     * Keep this stable; it is part of the templateKey.
     */
    slug: string;

    /**
     * Named export from the repo entry module (dist/index.js) that yields the template.
     * Example: export const helloWorld = ...
     */
    exportName: string;

    /**
     * Optional default props for docs/testing convenience inside this repo.
     * (The template itself still defines its own defaultProps at runtime.)
     */
    defaultProps?: Record<string, unknown>;
  };

export const templateRegistry: TemplateRegistryEntry[] = [
  {
    slug: "hello-world",
    title: "Hello World",
    description: "Minimal template that validates 3P loading in Make.",
    tags: ["example", "starter", "basic"],

    exportName: "HelloWorldV1",
    defaultProps: {
      text: "hello from a 3P template repo"
    }
  }
];