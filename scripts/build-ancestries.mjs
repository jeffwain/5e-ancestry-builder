/**
 * Builds public/data/converted-ancestries.json from public/data/ancestries-*.mjs.
 *
 * The job this script exists to do — audit item 4 — is understand the nesting
 * the source uses:
 *
 *     lineage → sub-lineage → archetype
 *
 * Every tier contributes shared traits, and the whole chain must sum to 16. An
 * archetype never re-charges a trait an ancestor already granted, but the source
 * frequently *re-lists* one for readability. Without the de-duplication below,
 * re-conversion double-pays those and the totals drift back out (Undine ▸
 * Elemental reads +4, Returned ▸ Plasmoid +6, three Oread archetypes, and so on).
 *
 * Run:  node scripts/build-ancestries.mjs [--check]
 *       --check validates and reports without writing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import common from '../public/data/ancestries-common.mjs';
import uncommon from '../public/data/ancestries-uncommon.mjs';
import planar from '../public/data/ancestries-planar.mjs';
import awakened from '../public/data/ancestries-awakened.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const traitsPath = path.resolve(__dirname, '../public/data/traits.json');
const outPath = path.resolve(__dirname, '../public/data/converted-ancestries.json');

const POINT_BUDGET = 16;
const RECOMMENDED = 'RECOMMENDED: ';

// `flat` files a lineage's sub-lineages straight into the category, alphabetised,
// instead of under a heading of their own — Awakened lists every animal people
// by its friendly name, so Muul and Ysoki don't get headings.
const CATEGORIES = [
  {
    id: 'common',
    name: 'Common',
    description: 'The most populous humanoid races found throughout the world, adaptable and diverse.',
    type: 'Common ancestry',
  },
  {
    id: 'uncommon',
    name: 'Uncommon',
    description: 'Rarer peoples, each shaped by a distinct heritage — elves, gnomes, and goblinoids.',
    type: 'Uncommon ancestry',
  },
  {
    id: 'planar',
    name: 'Planar',
    description: 'The godlike, the planetouched, and the returned, whose power comes from an element, a plane, a bloodline, or death itself.',
    type: 'Planar ancestry',
  },
  {
    id: 'awakened-common',
    name: 'Awakened (Common)',
    description: 'The widespread animal peoples — felines, rats, birds, and lizards.',
    type: 'Awakened (Common) ancestry',
    flat: true,
  },
  {
    id: 'awakened-uncommon',
    name: 'Awakened (Uncommon)',
    description: 'Rarer animal peoples — frogs and salamanders, jackals, bulls and hippos, rabbits and squirrels, serpents, spiders, fungi, and the dragonborn.',
    type: 'Awakened (Uncommon) ancestry',
    flat: true,
  },
];

// ── trait vocabulary ─────────────────────────────────────────────────────────

const traitsData = JSON.parse(fs.readFileSync(traitsPath, 'utf8'));
const vocabulary = new Map();
(function collect(node) {
  if (Array.isArray(node)) return node.forEach(collect);
  if (node && typeof node === 'object') {
    if (typeof node.id === 'string' && typeof node.name === 'string' && 'points' in node) {
      vocabulary.set(node.id, node);
    }
    Object.values(node).forEach(collect);
  }
})(traitsData);

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);

// ── reference parsing ────────────────────────────────────────────────────────

/**
 * A source reference is one of:
 *   'trait-id'  |  'trait-id:option'
 *   ['trait-id:option', { points, name, description, note }]
 *   [null, { name, description, points }]        inline, no curated equivalent
 */
function parseRef(raw, where) {
  let spec = raw;
  let overrides = {};
  if (Array.isArray(raw)) {
    spec = raw[0];
    overrides = raw[1] || {};
  }

  if (spec === null || spec === undefined) {
    if (!overrides.name) {
      fail(where, 'inline trait has no name');
      return null;
    }
    return {
      key: `inline:${overrides.name}`,
      inline: true,
      displayName: overrides.name,
      points: overrides.points ?? 0,
      out: {
        name: overrides.name,
        description: overrides.description || '',
        points: overrides.points ?? 0,
      },
      note: overrides.note,
    };
  }

  const [id, option] = String(spec).split(':');
  const base = vocabulary.get(id);
  if (!base) {
    fail(where, `unknown trait id "${id}"`);
    return null;
  }

  let points;
  if (option) {
    const opt = (base.options || []).find((o) => o.id === option);
    if (!opt) {
      fail(where, `trait "${id}" has no option "${option}"`);
      return null;
    }
    points = opt.points ?? 0;
  } else if (base.options && base.requiresOption) {
    fail(where, `trait "${id}" requires an option but none was given`);
    return null;
  } else {
    points = base.points ?? 0;
  }

  if (overrides.points !== undefined) points = overrides.points;

  const out = { id };
  if (option) out.option = option;
  if (overrides.name) out.name = overrides.name;
  if (overrides.description) out.description = overrides.description;
  if (overrides.points !== undefined) out.points = overrides.points;

  const optionName = option ? (base.options || []).find((o) => o.id === option)?.name : null;
  const displayName = overrides.name || (optionName && base.requiresOption ? optionName : base.name);

  return { key: option ? `${id}:${option}` : id, points, out, displayName, note: overrides.note };
}

function parseList(list, where) {
  return (list || []).map((raw, i) => parseRef(raw, `${where}[${i}]`)).filter(Boolean);
}

/**
 * Drop references already granted further up the chain, and exact repeats within
 * the list itself. Returns { kept, dropped }.
 */
function dedupe(refs, inheritedKeys) {
  const seen = new Set(inheritedKeys);
  const kept = [];
  const dropped = [];
  for (const ref of refs) {
    if (seen.has(ref.key)) {
      dropped.push(ref);
      continue;
    }
    seen.add(ref.key);
    kept.push(ref);
  }
  return { kept, dropped };
}

const sum = (refs) => refs.reduce((n, r) => n + (r.points || 0), 0);

// ── build ────────────────────────────────────────────────────────────────────

const report = [];

/**
 * Turn one lineage/sub-lineage into an app-shaped ancestry.
 * `inherited` is the resolved shared chain from every tier above it.
 */
function buildAncestry(node, inherited, trail) {
  const where = trail.join(' ▸ ');
  const own = parseList(node.shared, `${where} shared`);
  const { kept: ownKept, dropped: ownDropped } = dedupe(own, inherited.map((r) => r.key));
  const shared = [...inherited, ...ownKept];
  const sharedTotal = sum(shared);

  ownDropped.forEach((r) =>
    report.push({ kind: 'dedupe', where, detail: `shared re-lists inherited "${r.key}"` })
  );

  const archetypes = (node.archetypes || []).map((arch) => {
    const aWhere = `${where} ▸ ${arch.name}`;
    const refs = parseList(arch.traits, aWhere);
    const { kept, dropped } = dedupe(refs, shared.map((r) => r.key));
    dropped.forEach((r) =>
      report.push({ kind: 'dedupe', where: aWhere, detail: `re-lists inherited "${r.key}" (${r.points} pts) — dropped` })
    );

    const archTotal = sum(kept);
    const total = sharedTotal + archTotal;

    report.push({
      kind: 'total',
      where: aWhere,
      shared: sharedTotal,
      archetype: archTotal,
      total,
      delta: total - POINT_BUDGET,
      empty: Boolean(arch.empty),
      designed: Boolean(arch.designed),
      priced: Boolean(arch.priced),
      notes: arch.notes || [],
    });

    // Item 8: archetypes the source leaves blank are filled in here, and every trait
    // in them is marked RECOMMENDED: — the convention traits.json already uses
    // for curated suggestions — so a designed archetype is never mistaken for
    // something the source actually says.
    const traits = kept.map((r) => {
      if (!arch.designed) return r.out;
      // Size is dictated by the lineage's build rule, not by me — leave it plain.
      if (r.out.id === 'size-medium' || r.out.id === 'size-small') return r.out;
      const label = r.out.name || r.displayName || '';
      if (label.startsWith(RECOMMENDED)) return r.out;
      return { ...r.out, name: `${RECOMMENDED}${label}` };
    });

    const out = { id: arch.id, name: arch.name, traits };
    if (arch.designed) out.designed = true;
    return out;
  });

  // An ancestry with nothing to choose between still has one archetype, named
  // for itself and carrying its traits (Porcein, Loxodon), so it can be picked.
  if (!archetypes.length && !node.overlay && !node.stub) {
    fail(where, 'has no archetypes — give it one of the same name holding its traits');
  }

  const ancestry = {
    id: node.id,
    name: node.name,
    subtitle: node.subtitle || '',
    summary: node.summary || '',
    description: node.description || '',
    traits: shared.map((r) => r.out),
    archetypes,
  };
  if (node.descriptors) ancestry.descriptors = node.descriptors;
  if (node.overlay) ancestry.overlay = true;
  if (node.stub) ancestry.stub = true;
  return ancestry;
}

const all = [...common, ...uncommon, ...planar, ...awakened];
// A sub-lineage may carry its own `type` to file under a different category than
// its lineage (Ysoki's ratfolk are Awakened (Common), its other folk Uncommon).
const typeOf = (sub, lineage) => sub.type || lineage.type;

const categories = CATEGORIES.map((cat) => {
  const lineages = all.filter((l) =>
    l.sublineages?.length ? l.sublineages.some((sub) => typeOf(sub, l) === cat.type) : l.type === cat.type
  );
  const out = { id: cat.id, name: cat.name, description: cat.description, ancestries: [], subcategories: [] };

  for (const lineage of lineages) {
    if (lineage.sublineages?.length) {
      const lineageShared = parseList(lineage.shared, `${lineage.name} shared`);
      const ancestries = lineage.sublineages
        .filter((sub) => typeOf(sub, lineage) === cat.type)
        .map((sub) => buildAncestry(sub, lineageShared, [lineage.name, sub.name]));
      if (cat.flat) {
        out.ancestries.push(...ancestries);
        continue;
      }
      out.subcategories.push({
        id: lineage.id,
        name: lineage.name,
        description: lineage.description || '',
        ancestries,
      });
    } else {
      out.ancestries.push(buildAncestry(lineage, [], [lineage.name]));
    }
  }

  if (cat.flat) out.ancestries.sort((a, b) => a.name.localeCompare(b.name));
  if (!out.subcategories.length) delete out.subcategories;
  if (!out.ancestries.length) delete out.ancestries;
  return out;
});

// ── report ───────────────────────────────────────────────────────────────────

const totals = report.filter((r) => r.kind === 'total');
const dedupes = report.filter((r) => r.kind === 'dedupe');

const onBudget = totals.filter((r) => r.delta === 0 && !r.empty);
const over = totals.filter((r) => r.delta > 0);
const under = totals.filter((r) => r.delta < 0 && !r.empty);
const empties = totals.filter((r) => r.empty);

const lines = [];
lines.push('# Ancestry conversion report');
lines.push('');
lines.push(`Built from ${all.length} lineages.`);
lines.push('');
lines.push(`- ${onBudget.length} archetypes land on exactly ${POINT_BUDGET}`);
lines.push(`- ${over.length} over budget`);
lines.push(`- ${under.length} under budget`);
lines.push(`- ${empties.length} still empty`);
lines.push(`- ${dedupes.length} re-listed traits dropped`);
lines.push('');

if (dedupes.length) {
  lines.push('## Re-listed traits dropped (item 4)');
  lines.push('');
  dedupes.forEach((d) => lines.push(`- **${d.where}** — ${d.detail}`));
  lines.push('');
}

const fmt = (r) => {
  const tags = [
    r.delta > 0 ? `**+${r.delta}**` : r.delta < 0 ? `**${r.delta}**` : 'on budget',
    r.designed ? '_designed_' : null,
    r.priced ? '_priced_' : null,
  ].filter(Boolean).join(' · ');
  return `- ${r.where} — ${r.shared} + ${r.archetype} = **${r.total}** — ${tags}`;
};

if (over.length) {
  lines.push('## Over budget — carried across as the source writes them');
  lines.push('');
  over.forEach((r) => lines.push(fmt(r)));
  lines.push('');
}
if (under.length) {
  lines.push('## Under budget — carried across as the source writes them');
  lines.push('');
  under.forEach((r) => lines.push(fmt(r)));
  lines.push('');
}
if (empties.length) {
  lines.push('## Still empty');
  lines.push('');
  empties.forEach((r) => lines.push(`- ${r.where}`));
  lines.push('');
}
lines.push('## On budget');
lines.push('');
onBudget.forEach((r) => lines.push(fmt(r)));
lines.push('');

const notes = totals.filter((r) => r.notes?.length);
if (notes.length) {
  lines.push('## Judgement calls');
  lines.push('');
  notes.forEach((r) => r.notes.forEach((n) => lines.push(`- **${r.where}** — ${n}`)));
  lines.push('');
}

const reportText = lines.join('\n');
const reportPath = path.resolve(__dirname, 'ancestry-report.md');
const reportJsonPath = path.resolve(__dirname, 'ancestry-report.json');

if (problems.length) {
  console.error('Unresolved references:\n' + problems.map((p) => '  ' + p).join('\n'));
  process.exitCode = 1;
}

const check = process.argv.includes('--check');
if (!check && !problems.length) {
  const payload = {
    version: '3.0',
    _generated: 'DO NOT EDIT BY HAND. Built from public/data/ancestries-*.mjs by `npm run ancestries`; hand edits are overwritten.',
    source: 'Ancestry types',
    categories,
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
  fs.writeFileSync(reportPath, reportText);
  fs.writeFileSync(reportJsonPath, JSON.stringify({ totals, dedupes }, null, 2) + '\n');
  console.log(`Wrote ${path.relative(process.cwd(), outPath)}`);
  console.log(`Wrote ${path.relative(process.cwd(), reportPath)}`);
} else {
  fs.writeFileSync(reportPath, reportText);
}

console.log(
  `\n${onBudget.length} on budget · ${over.length} over · ${under.length} under · ` +
  `${empties.length} empty · ${dedupes.length} duplicates dropped`
);
