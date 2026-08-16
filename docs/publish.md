# Publishing a release

This repo is consumed by **clone**, not by npm. A release is a tag on a commit
whose `dist/` is current — nothing is uploaded anywhere.

That makes the whole discipline one rule: **the build output in the commit
must match the source in the commit.** A tag whose `dist/` is stale hands
every user a repo that quietly renders the previous version.

---

## The sequence

```
npm run build && npm run previews && npm run build
npm run verify
git add -A
git commit -m "..."
git tag vYYYY.MM.N
```

`previews` only mints assets for templates that lack them, and the second
build is what writes their paths into the manifest. Skip it when nothing new
was added.

**Commit the generated files.** `dist/`, `template-manifest.json`, and
`assets/templates/**` are generated *and* tracked — that is what makes the
repo loadable with no build step. A commit that changes `src/` without them is
incomplete.

## Version format

```
vYYYY.MM.N        v2026.08.1   v2026.08.2   v2026.09.1
```

Calendar versioning, `N` restarting each month. There is no public API to
semver here — the meaningful question is "how current is this curriculum",
which a date answers and `1.4.2` does not.

Template **ids** carry their own `/v1` and are independent of the repo tag. A
template id only changes when its behavior changes incompatibly.

## Before tagging

- [ ] `npm run verify` green
- [ ] every template has a preview asset (`test:contract` covers this)
- [ ] `CURRICULUM.md` has a `## <pack>` heading for every declared pack
      (`check:deps` covers this)
- [ ] ordinals are contiguous and match array position (the manifest generator
      covers this)
- [ ] you have **looked at** any new or re-minted preview

That last one is not automatable and has caught real defects — a first-frame
still that was blank, and a fail-fast template whose browse card was its own
error card. Both passed every check above.

## Cross-platform

The merge platform is Windows; day-to-day authoring here happens on macOS.
Before tagging, run `npm run verify` on Windows too. What differs in practice
is path handling and shell quoting in the tools, not the templates themselves
— but that is exactly the kind of thing that only shows up on the other
machine.

`.gitattributes` pins line endings (`* text=auto eol=lf`, binaries `-text`),
so a rebuild on either platform should produce a clean diff. **A `dist/` diff
that is nothing but line endings means that pinning has slipped** — fix it
rather than committing the churn.

## After tagging

Users pull and press **Refresh repos**. There is no publish step, no registry,
and nothing to yank — a bad release is fixed by the next commit, which is
worth remembering as a reason not to rush the tag rather than a reason to
relax about it.
