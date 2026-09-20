# Install

`dist/` and `template-manifest.json` are **committed**, so a clone is ready to
load. There is no build step for using this repo.

```
git clone <this repo>
```

---

## In Mosaic Desktop

1. **Templates** page → **Add source** → pick the cloned folder.
2. Accept the third-party consent prompt. It is telling you the truth: loading
   an external repo runs its code on your machine. See
   [`security.md`](security.md).
3. The templates appear, grouped by chapter.

After pulling or rebuilding, press **Refresh repos** — the host caches the
loaded module.

## From the CLI

**PowerShell:**

```powershell
m0saic make "@m0saic-starter/basics/hello-world/v1" --template-repo . -w 1280 -h 720 -o hello.mp4
```

**zsh / bash:**

```bash
m0saic make '@m0saic-starter/basics/hello-world/v1' --template-repo . -w 1280 -h 720 -o hello.mp4
```

**Quote the id in both.** A bare `@` starts splatting in PowerShell, and the
id is not a filename in either shell.

`--template-repo` takes the repo root — the folder with
`template-manifest.json` in it, not `dist/`.

### Checking a template exists

`list-templates` only knows about built-in packs; it cannot see external
repos. Use a validate-only render instead — it resolves the id and parses the
props without encoding anything:

```
m0saic make "@m0saic-starter/basics/hello-world/v1" --template-repo . --validate-only
```

### Overriding props

```
m0saic make "@m0saic-starter/media/image-card/v1" --template-repo . --props '{"image":"/abs/path/pic.png"}' -o card.mp4
```

Use **absolute paths** — the render runs in its own workspace directory, so a
relative path resolves somewhere you did not mean. On Windows prefer
`--props-file <file.json>`: quoting JSON through cmd and PowerShell differs
enough to waste real time.

### Render everything at once

```
node tools/smoke-render.mjs
```

Sweeps every template with `--validate-only`, then renders a curated handful
into `test-output/`. Needs the `m0saic` CLI on `PATH`, or `M0SAIC_CLI` set to
a command or a path to the CLI's `dist/index.js`.

## Rendering the data chain

Three of the `data` templates form a chain, and Make invokes one template at a
time — so opening the adapter or the card alone shows them with nothing
upstream, by construction. The chain file is the only way to see it whole:

```
m0saic make examples/data-chain/starter-data-chain.mosaicx --template-repo . -o chain.mp4
```

## Building it yourself

Only needed if you intend to *change* templates. Every `@m0saic/*` package
the build needs installs from npm — see [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

```
npm install
npm run verify
m0saic doctor .
```
