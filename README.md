# m0saic Template Repo Starter

Official example of a third-party template repository for **m0saic Make**.

This repo demonstrates the production-ready structure required for:

- Scalable template discovery (manifest-based)
- Zero-exec browsing
- Deterministic rendering
- External repo loading
- Preview asset resolution
- ESM execution at render time

This is a reusable template repository.

---

## Overview

A template repo contains:

- Typed templates
- A manual registry
- A generated `template-manifest.json`
- Preview assets
- A built ESM entry module

The manifest is the authoritative browse surface.  
Hosts must be able to list templates without importing code.

---

## Repository Structure

```
src/
  templates/
    hello-world/
      v1/
        hello-world.ts
        index.ts
  templates/index.ts
  registry.ts
  gen-template-manifest.ts
  index.ts

assets/
  templates/
    @m0saic-starter__hello-world__v1/
      preview.png
      preview.mp4
      poster.png

dist/                  ← compiled output
template-manifest.json ← generated
```

---

## Build

```
npm install
npm run build
```

Build does:

1. Compile TypeScript (`tsc`)
2. Execute `dist/gen-template-manifest.js`
3. Generate `template-manifest.json`

Build will fail if:

- A registry exportName does not exist in `dist/index.js`
- A template is not re-exported
- A templateKey is malformed

This is intentional. The manifest must always be valid.

---

## Template Registration

Templates must be added manually to:

```
src/registry.ts
```

Each entry defines:

- `templateId` (slug)
- `displayName`
- `description`
- `exportName`
- `defaultProps`
- `tags`

Example:

```ts
export const templateRegistry = [
  {
    templateId: "hello-world",
    displayName: "Hello World",
    description: "Minimal template example.",
    exportName: "HelloWorldV1",
    defaultProps: { text: "hello" },
    tags: ["example", "starter"]
  }
];
```

---

## Adding a New Template

1. Create:

```
src/templates/<slug>/v1/
```

2. Implement your template.
3. Re-export it from:

```
src/templates/index.ts
```

4. Ensure it is re-exported from:

```
src/index.ts
```

5. Add it to `registry.ts`.
6. (Optional) Add preview assets.
7. Run:

```
npm run build
```

---

## Preview Asset Convention

Preview assets live under:

```
assets/templates/<encoded-template-key>/
```

Encoding rule:

```
@repo/slug/v1 → @repo__slug__v1
```

Supported files:

- `preview.png` (preferred static preview)
- `preview.mp4` (short looping preview)
- `poster.png` (optional video poster)

The manifest generator automatically detects which files exist.

---

## Template Keys

External template repos must use:

```
<repoId>/<slug>/v<major>
```

Example:

```
@m0saic-starter/hello-world/v1
```

The manifest must explicitly include `templateKey`.  
Hosts must never derive IDs implicitly.

---

## Manifest Contract

`template-manifest.json` is the single entrypoint for this repo.

Hosts use it to:

- List templates
- Filter by tags
- Resolve preview assets
- Load the ESM entry module only when rendering

Browsing must not require importing code.

---

## Loading in m0saic Make

This repo can be loaded via:

- Local filesystem path
- Git clone
- Future template registry system

Only the manifest is required for browsing.

`entryModule` is imported only when rendering.

---

## Publishing

You may:

- Keep this repo public on GitHub
- Keep it private
- Publish it to npm (optional)

If publishing:

```
npm run build
npm publish
```

---

## Determinism Model

Templates must:

- Read all timing from `ctx.output`
- Declare capabilities explicitly
- Avoid hidden side effects

Same:

- Template version
- Props
- Dimensions
- Runtime

→ identical output.

---

## Links

- m0saic: https://github.com/m0saic-project/m0saic
- Docs: https://m0saic.io/docs
- Templates: https://m0saic.io/templates
- Discord: https://discord.gg/m88PVvx9

---

© 2026 m0saic LLC