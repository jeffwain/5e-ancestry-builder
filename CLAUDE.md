# Project Instructions

## Rules

- Do not remove or change CSS styles. Use existing classes and styles. Strive for reuse. If styles are missing, you can add new files and styles and classes to components, but do not edit existing styles.

## Ancestry data is generated

`public/data/converted-ancestries.json` is **generated — never edit it by hand.**
Hand edits are silently overwritten on the next build.

- Source of truth: `public/data/ancestries-*.mjs` — one hand-maintained file per
  ancestry type (`common`, `uncommon`, `versatile`). See
  `public/data/ancestries-README.md` for the reference format.
- Rebuild: `npm run ancestries` — also writes `scripts/ancestry-report.md`
  and `.json`. `npm run ancestries:check` validates without writing.
- The build fails on any trait id or option that doesn't exist in
  `traits.json`, so that file is the trait vocabulary the source must reference.

Ancestries nest as `lineage → sub-lineage → archetype`. Every tier's traits are
paid and the whole chain sums to 16. The source often *re-lists* a trait an
archetype already inherited; the build drops those duplicates, so leave the
repeats in place.

The source files' naming is canonical when it disagrees with the builder.

When a trait is priced differently for different ancestries (Out of Sight at 1 or
2, Traversal at 0, 1 or 2), the test is what it does for that ancestry: a **core
feature** of what the ancestry *is* takes the higher price, a **rider** on an
ancestry about something else takes the lower. Goblin's Out of Sight is core (2)
because it sits with Ambush and Nimble Escape; everywhere else it is a rider (1).
