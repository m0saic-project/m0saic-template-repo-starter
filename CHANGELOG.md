# Changelog — the CONVENTIONS, not the commits

What a template in this repo must now do differently, and which m0saic line introduced it. This repo
is the teaching surface: it always carries the LATEST conventions, so it is allowed to break in ways
`@m0saic/templates` never is. If your own repo lags, that is fine — `m0saic doctor .` reports which
line you meet, and a template gets fixed at its next `vN`.

Entries are newest first. Each says: the rule, what it replaces, and what a template must change.

---

## Requires m0saic 0.3.0

⚠️ **This release does not build against 0.2.0.** `bindings` and `canvas` are new
`MosaicTemplate` fields; `npm install` must resolve `@m0saic/types` and `@m0saic/template-utils` at
`^0.3.0`. (`^0.2.0` does not admit 0.3.0 — a caret on `0.x` pins the minor.)

### `bindingsDeclared` — every prop is accounted for  · THROWS

Every prop that CAN carry a canvas handle is either **bound** on the rect that shows it, or **named
in `template.bindings.unbound`** with the reason it has none:

```ts
bindings: { unbound: { fps: "timing", gap: "geometry — a split weight, never drawn" } }
```

Accountable: free-text and colour `string`, `number`, `media`, one element of a basic list, one leaf
of `json` / `list` / `array`, and a regions-picker `rect`. Never accountable: booleans, closed sets
(`oneOf` / `options`), `group` containers, the `m0` family, `code`, and anything `hidden` or
`consumer: "human"`.

A binding **anywhere in the tree counts** — a nested child reaches the parent's props. A **stale**
declaration is itself a violation: naming a prop that cannot carry a handle, one that is in fact
bound, or leaving the reason empty.

One limit by design: the audit renders at `defaultProps`, so a rect you only create when a prop is
non-empty reads as unbound. Bind it unconditionally — "bind even when the value is empty" is the
existing rule, and it is what makes an empty media slot a **drop target**.

### `canvasFill` — the canvas is filled by the DOCUMENT  · THROWS

A root document must not carry a static, opaque, full-canvas colour source. Use
`document.backgroundColor`: a base rect is a click target covering everything, selected in Make any
time the pointer is not on a smaller tile.

Still fine, and never flagged: a curtain wipe (`overlay.enable` / `window`), a scrim
(`overlay.alpha`), a masked shape, a rounded card (`effects`), an inset fill (`placement`).

Two declared exceptions, and they mean different things:

- `canvas: { baseRect: "<why>" }` — the rect IS the subject (a lesson about full-rect nodes, a
  tutorial surface).
- `defaultProps.useNestedBackgroundColor = true` — this template is COMPOSED INTO another, whose slot
  its own `backgroundColor` cannot fill. When on, wrap the layout once: `F{<m0>}` prepends exactly one
  full-canvas frame (it canonicalizes to `1{…}`) and the colour source goes first.

An empty `baseRect` reason is refused — a checkbox is not a statement.

### Output kind is the TEMPLATE's answer, per props

A template that accepts media has no fixed kind. Declare it with `resolveOutputHints(props)`, and let
`outputHints.format` be that function's value at `defaultProps` — which for an empty media slot means
**image**, even when the template is "for" video:

```ts
resolveOutputHints: (props) => formatFor(mediaLooksLikeVideo(props.media)),
```

`_shared/output-kind.ts` has the helpers. Pure and prop-only: the resolver runs before any probe, so
a path's extension is the evidence available.

### Conventions are versioned

`m0saic doctor .` now answers *which line* a repo meets rather than pass/fail:

```
conventions: meets 0.2.0 (shipped at 0.2.0).
  behind 0.3.0: bindingsDeclared, canvasFill
```

A template that fails a rule NEWER than the line it shipped at is not broken — it met the conventions
of its day, and the fix is its next `vN`.

### Read the lesson, not just the rule

Each 0.3.0 convention has a template in the `make` chapter that exists to be opened in Make — the rule
as a card a reader can double-click:

| Rule | Lesson |
|---|---|
| `bindingsCover` reads NUMBERS in their honest spellings | 82 · `make/bound-numbers/v1` |
| one rect, two props — `bindProps`, never a second `bindProp` | 83 · `make/composite-line/v1` |
| `bindingsDeclared` — what an honest non-binding looks like | 84 · `make/declared-unbound/v1` |
| `type: "array"` declared plainly, edited as `objectRows`, leaf handles | 85 · `make/array-rows/v1` |
| `canvasFill` — the one declared `canvas.baseRect` | 81 · `make/prop-bindings/v1` |

`tools/new-template.mjs` scaffolds to these rules: the generated template fills its canvas with
`document.backgroundColor` and paints no full-frame rect.
