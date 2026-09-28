# Ancestry source

`ancestries-common.mjs`, `ancestries-uncommon.mjs`, `ancestries-planar.mjs` and
`ancestries-awakened.mjs` hold the 27 lineages, one file per ancestry type.

Awakened is every animal people. Each is subtitled with a plain "-folk"
descriptor (Mrrshan — Catfolk) rather than a description.
Its sub-lineages (the Muul, the Ysoki) are listed flat and alphabetised rather
than under a heading of their own; the inheritance is unchanged.
The one file builds two categories by `type`: Awakened (Common) — Aven, Iruxi,
Mrrshan, Ysoki — and Awakened (Uncommon) for the rest. A sub-lineage
can set its own `type` to file apart from its lineage, which is how Ysoki's
ratfolk are Common while Harengon, Kercpa and Osphrani are Uncommon.

These files are the **source of truth**. `scripts/build-ancestries.mjs` turns them
into `converted-ancestries.json`. Edit here, never there.

Rebuild with `npm run ancestries`; `npm run ancestries:check` validates without
writing.

## The nesting model

```
lineage        an umbrella with its own shared traits      (Muul)
  sublineage   adds its own shared traits on top           (Kashrishi)
    archetype  adds only its differentiating traits        (Trogloshi)
      variant  a "Choose from…" list under an archetype    (Ysoki ▸ Ratfolk)
```

Every tier's traits are paid, and the whole chain sums to exactly **16**.

Every ancestry has at least one archetype. One with nothing to choose between
(Loxodon, Anadi) keeps its common traits — size, speed, darkvision — in
`shared` and carries the rest in a single archetype of the same name, so it can
be picked and used like any other. The build fails on an ancestry with no
archetypes, unless it is a `stub` or `overlay`.

An archetype never re-charges a trait an ancestor already granted — but the
source often **re-lists** one for readability. The build script drops those
duplicates. Leave the repeats in place, so a lineage stays checkable
line-by-line against how it is written.

## Display text

- `subtitle` — one short line shown under the name in the ancestries index.
  Every ancestry that appears in the index has one.
- `summary` — the longer line under the name on the ancestry's own entry.

## Trait references

| Form | Meaning |
|---|---|
| `'trait-id'` | a curated trait from `traits.json` |
| `'trait-id:option'` | a trait plus its selected option |
| `['trait-id:option', { … }]` | with per-ancestry overrides |

Override keys:

- `points` → `pointsOverride`, when this lineage prices the trait differently
- `name` → `nameOverride`
- `description` → `descriptionOverride`
- `note` → provenance for the build report; never shipped in the JSON

`notes: [...]` on a lineage or archetype records a judgement call for the report.
`empty: true` marks an archetype that is defined but left blank.

A `notion:` key on a lineage records where that page was originally transcribed
from. It is historical provenance only — the build ignores it.
