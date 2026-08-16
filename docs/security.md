# Security — what executes, and when

A template repo is **code**. Loading one runs it on your machine. This page
says exactly where the line is, for this repo and any other.

---

## Browsing executes nothing

`template-manifest.json` is plain JSON — ids, titles, descriptions, packs,
preview paths. A host can populate its entire browse UI from it without
importing a single line of repo code, and that is why the file is committed
rather than derived at load.

So: **browsing a repo is safe. Loading one is a decision.**

## Loading executes everything

When you add a repo as a source, the host imports `dist/index.js` and runs it,
then calls `render` (and `renderLite` / `renderCover` / `renderTutorial`) as
you use the templates. That is ordinary Node — module top-level code runs at
import.

Mosaic shows a **third-party consent prompt** before the first load, and the
Make page keeps a banner up for third-party templates. Both are real warnings,
not ceremony. Treat adding a template repo like installing a dependency,
because it is one.

This repo is first-party to the m0saic project and has no network calls, no
filesystem writes outside the render workspace, and no dynamic code. You are
welcome to verify that rather than take it on faith — `src/` is the whole
story and `dist/` is its build.

## The dependency allowlist limits the blast radius

`dep-allowlist.json` mirrors the set a host actually resolves for an external
repo:

```
@m0saic/types  @m0saic/template-utils  @m0saic/dsl-stdlib
@m0saic/platform  @m0saic/dsl  sharp  @twemoji/svg
```

Anything outside it does not resolve at load. That is a genuine constraint on
what template code can reach — but it is **not a sandbox**. Allowlisted
packages are real packages, and Node builtins reachable through them are
reachable. The allowlist narrows the surface; it does not seal it.

`tools/check-deps.mjs` enforces the list in this repo, so a stray import fails
`npm run verify` instead of failing in someone's app.

## Template ids are claims, and only some are protected

Two prefixes are **reserved** for first-party templates:

```
@m0saic/       @m0saic-dev/
```

An external repo that tries to register an id under either is rejected. Beyond
that, ids are first-come: the registry tracks per-id ownership, so a second
repo cannot overwrite an id another source already registered — but nothing
stops an unclaimed id from being claimed by whoever loads first.

**`@m0saic-starter` is NOT reserved.** A hostile repo could publish templates
under this repo's namespace, and a user who loaded it before this one would
get those. Nothing in the platform prevents that, so:

- **Forks must change `repoId` in `src/repo.ts`.** Keeping `@m0saic-starter`
  on a fork is impersonation whether or not you meant it, and it collides in
  any host that has both loaded.
- Trust a repo because of where you got it, not because of the ids it uses.

## Media fixtures

`assets/media/` holds tiny committed fixtures so lessons render without asking
you for files. They are attributed in [`../NOTICE.md`](../NOTICE.md) —
`bbb-2s.mp4` is a Big Buck Bunny excerpt, © Blender Foundation, CC-BY 3.0. The
rest are generated.

## Reporting something

If you find a template here that reaches outside what this page describes,
that is a bug and worth reporting. For issues in Mosaic itself — the consent
flow, the allowlist, id ownership — report against the m0saic project rather
than this repo.
