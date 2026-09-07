# Ancestry source

`ancestries-common.mjs`, `ancestries-uncommon.mjs` and `ancestries-versatile.mjs`
hold the 26 lineages, one file per ancestry type.

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

An archetype never re-charges a trait an ancestor already granted — but the
source often **re-lists** one for readability. The build script drops those
duplicates. Leave the repeats in place, so a lineage stays checkable
line-by-line against how it is written.

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
