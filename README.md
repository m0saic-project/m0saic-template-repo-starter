# m0saic Template Starter

The m0saic developer curriculum: a repo of **minimal example templates**, each
exercising exactly one knob of the template-authoring surface. Clone it, load
it in Mosaic, read the source, fork it into your own template repo.

**80 templates across 14 chapters** — see [CURRICULUM.md](CURRICULUM.md) for
the map and reading order.

> **Status.** Fourteen chapters are in: basics, geometry, props, controls,
> media, text, masks, compose, pipelines, data, surfaces, quality,
> connections, make. What is here is complete and tested; further chapters
> are additions, not holes.

## Use it (zero build)

`dist/` and `template-manifest.json` are **committed** — hosts load this repo
straight from a clone; `src/` is never read at load time.

- **App:** Templates page → **Add source** → pick this folder → accept the
  third-party consent prompt → templates appear. After any rebuild, press
  **Refresh repos**.
- **CLI:**

  ```
  m0saic make "@m0saic-starter/basics/hello-world/v1" --template-repo <path-to-this-repo> -w 1280 -h 720 -o hello.mp4
  ```

  (Quote the id in PowerShell — `@` starts splatting otherwise. Note
  `list-templates` does not see external repos; verify with
  `make --validate-only`.)

- **Smoke everything:** `node tools/smoke-render.mjs` (validate-only sweep
  over every template + tiny real renders into `test-output/`). Needs the
  `m0saic` CLI on PATH or `M0SAIC_CLI` set.

## Author mode (build / test / lint)

The `@m0saic/*` substrate this repo builds against is on npm, so author mode
is a plain install — no monorepo checkout, no links:

```
npm install
npm run verify     # build + lint + jest + loader-contract check + dep policy
m0saic doctor .    # the same conventions + fingerprints, from outside the build
```

The ranges in `package.json` track the CLI line (`@m0saic/types` `^0.2.0`
goes with `m0saic` 0.2.x); the language packages version on their own
(`@m0saic/dsl` `^2.0.0`, `@m0saic/dsl-stdlib` `^3.0.0`). Source for every
one of them: [m0saic-dsl/m0](https://github.com/m0saic-dsl/m0) (the
language) and
[m0saic-project/m0saic-packages](https://github.com/m0saic-project/m0saic-packages)
(the substrate).

The edit loop against a running Mosaic Desktop:
`edit → npm run build → Templates page → Refresh repos`. Prove it works with
`@m0saic-starter/basics/hot-reload-canary/v1` (flip its constant, rebuild,
refresh — the square must change color without an app restart).

## Repo map

```
src/<pack>/<slug>/v1/       one template + its co-located test
src/<pack>/registry.ts      chapter registry (array order = teaching order)
src/repo.ts                 repo descriptor + pack (chapter) list
src/index.ts                entry: exports `repo` + `templates[]`
template-manifest.json      GENERATED zero-exec browse surface (committed)
dist/                       GENERATED CommonJS build (committed)
assets/templates/<id>/      preview.png / preview.mp4 / poster.png per template
assets/media/               tiny committed media fixtures (see NOTICE.md)
tools/                      pure-Node checks + founder scripts (no install needed)
```

Rules of the road: CommonJS build only; export plain template objects — never
call `registerTemplate` yourself; deterministic renders (seeds as props); size
and duration come from `ctx.target`; rebuild before committing.

## Docs

| | |
|---|---|
| [CURRICULUM.md](CURRICULUM.md) | the chapter map and reading order |
| [docs/install.md](docs/install.md) | loading it in the app and rendering from the CLI |
| [docs/authoring.md](docs/authoring.md) | the loader contract, what `render` returns, the edit loop |
| [docs/style.md](docs/style.md) | the law — most of it exists because the alternative fails silently |
| [docs/security.md](docs/security.md) | what executes and when, the dep allowlist, id ownership |
| [docs/publish.md](docs/publish.md) | verify → commit `dist/` → tag |
| [CONTRIBUTING.md](CONTRIBUTING.md) | what belongs here, the one-test law, dep policy |
| [AGENTS.md](AGENTS.md) | entry point for coding agents |

## License

MIT — see `LICENSE`. `assets/media/bbb-2s.mp4` is a Big Buck Bunny excerpt,
(c) Blender Foundation, CC-BY 3.0 — see `NOTICE.md`.
