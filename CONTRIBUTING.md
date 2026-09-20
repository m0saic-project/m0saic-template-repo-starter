# Contributing

This repo is a **teaching corpus**, so the bar is different from a normal
library: a template earns its place by making one idea obvious, not by being
capable.

## What belongs here

**One template, one concept.** 60–150 lines. If it needs two ideas, it is two
templates — or it belongs in your own repo rather than the curriculum.

Good additions look like:

- a knob of the authoring surface nothing here demonstrates yet,
- a rule that fails *silently* today and would have cost you an afternoon,
- a fix to a lesson that is wrong, unclear, or has drifted from the engine.

Less good: a beautiful template. Real templates showcase what m0saic can do;
these show how it works. Some of the best lessons here are visually dull on
purpose.

## Before you open a PR

```
npm run verify
```

Build, lint, tests, loader-contract check, dependency policy. It is the whole
gate — if it is green, review is about the teaching, not the plumbing.

For a new template you also need a preview asset, or `test:contract` fails:

```
npm run build && npm run previews && npm run build
```

Commit the regenerated `dist/`, `template-manifest.json`, and
`assets/templates/**` alongside your source. They are generated *and*
committed — that is what makes the repo loadable without a build step.

## The one-test law

**Every template ships a co-located `<slug>.test.ts`**, and the test asserts
what the lesson *claims*. If the header says "the caption prints the layout
decision", read the caption. A test that only proves `render()` resolved is
not a test of the lesson.

Same for a fix: if you correct a lesson, the test that would have caught it
comes with the fix.

## Dependencies

**Do not add any.** `dep-allowlist.json` mirrors the set a Mosaic host
actually resolves for an external repo. Anything else compiles on your machine
and fails at load in the app — the worst possible place to find out.

If a lesson genuinely needs something outside the list, that is a conversation
about the host's allowlist first, and a PR second.

## Style

[`docs/style.md`](docs/style.md) is the law, and most of it exists because the
alternative fails quietly. The short version:

- deterministic — no `Math.random()`, no clock, seeds are props
- size and duration from `ctx.target`, never `ctx.output`
- validate in `render` and fail with the prop name and the remedy
- real geometry: carve cells, do not float text over a full-canvas source
- rendered copy is ASCII (the bundled glyph font draws `→` as tofu)
- `export *` only in chapter index files

## Building, testing, linting

`npm install` pulls every `@m0saic/*` package the build needs from npm; there
is no monorepo to check out. `npm run verify` is the whole gate (build + lint
+ jest + loader-contract check + dep policy), and `m0saic doctor .` runs the
same template conventions from the CLI. A PR should pass both.

You can also read every template, load the committed `dist/` in Mosaic, and
render anything with the CLI using only a clone — a clear issue describing
the lesson (the concept, the rule that bites, what a reader should be able
to see) is a genuinely useful contribution too.

## Licensing

MIT in, MIT out. By contributing you agree your work ships under this repo's
[`LICENSE`](LICENSE).

**Do not add media you do not have the right to redistribute.** Fixtures are
tiny, committed, and attributed in [`NOTICE.md`](NOTICE.md); anything new goes
in the same place with its source and license. Prefer generating a fixture
over importing one.

## Forking this into your own repo

Change `repoId` in `src/repo.ts` to your own handle before publishing.
Template ids carry it, and two repos claiming the same ids collide in a host
that has both.

Note that `@m0saic-starter` is **not** a platform-reserved prefix — only
`@m0saic/` and `@m0saic-dev/` are. Keeping the starter's id on a fork is
therefore possible and is exactly what you should not do. See
[`docs/security.md`](docs/security.md).
