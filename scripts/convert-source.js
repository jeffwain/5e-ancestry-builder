import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths
const sourcePath = path.resolve('w:/5e/homebrew/hightouch; The Dice Monster\'s Ancestries.json');
const traitsPath = path.resolve(__dirname, '../public/data/traits.json');
const outputDir = path.resolve(__dirname, 'output');
const outputTraitsPath = path.resolve(outputDir, 'converted-traits.json');
const outputAncestriesPath = path.resolve(outputDir, 'converted-ancestries.json');

// ── Markup conversion ──

function stripNote(text) {
  const match = text.match(/\{@note\s+(\d+)\}\s*$/);
  const points = match ? parseInt(match[1], 10) : null;
  const cleaned = text.replace(/\s*\{@note\s+\d+\}\s*$/, '').trim();
  return { cleaned, points };
}

function convertMarkup(text) {
  if (typeof text !== 'string') return text;

  let result = text;

  // {@spell name|source#c} -> [name]()
  result = result.replace(/\{@spell\s+([^|}]+?)(?:\|[^}]*)?\}/g, '[$1]()');

  // {@condition name|source} -> [name]()
  result = result.replace(/\{@condition\s+([^|}]+?)(?:\|[^}]*)?\}/g, '[$1]()');

  // {@action name} -> name
  result = result.replace(/\{@action\s+([^}]+?)\}/g, '$1');

  // {@skill name} -> name
  result = result.replace(/\{@skill\s+([^}]+?)\}/g, '$1');

  // {@damage X} -> X
  result = result.replace(/\{@damage\s+([^}]+?)\}/g, '$1');

  // {@dice X} -> X
  result = result.replace(/\{@dice\s+([^}]+?)\}/g, '$1');

  // {@dc N} -> DC N
  result = result.replace(/\{@dc\s+([^}]+?)\}/g, 'DC $1');

  // {@bold X} -> **X**
  result = result.replace(/\{@bold\s+([^}]+?)\}/g, '**$1**');

  // {@b X} -> **X**
  result = result.replace(/\{@b\s+([^}]+?)\}/g, '**$1**');

  // {@i X} -> *X*
  result = result.replace(/\{@i\s+([^}]+?)\}/g, '*$1*');

  // {@sense X} -> X
  result = result.replace(/\{@sense\s+([^}]+?)\}/g, '$1');

  // {@note N} - strip entirely (points already extracted)
  result = result.replace(/\s*\{@note\s+\d+\}\s*/g, '');

  // Catch any remaining {@tag content} patterns
  result = result.replace(/\{@\w+\s+([^|}]+?)(?:\|[^}]*)?\}/g, '$1');

  return result.trim();
}

function toKebabCase(str) {
  return str
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Build existing trait lookup ──

function buildTraitLookup(traitsData) {
  const lookup = new Map(); // normalized name -> { id, trait }
  const idLookup = new Map(); // id -> trait

  function processTraits(traits) {
    for (const trait of traits) {
      const normName = trait.name.toLowerCase().trim();
      // Store by normalized name
      if (!lookup.has(normName)) {
        lookup.set(normName, trait);
      }
      // Store by ID
      idLookup.set(trait.id, trait);
    }
  }

  for (const [typeKey, typeObj] of Object.entries(traitsData.traitTypes)) {
    for (const [catKey, catObj] of Object.entries(typeObj.categories)) {
      if (catObj.traits) {
        processTraits(catObj.traits);
      }
    }
  }

  return { lookup, idLookup };
}

// Additional name mappings for traits that have different names in source vs traits.json
const NAME_OVERRIDES = {
  'darkvision': 'darkvision-60',
  'constructed form': 'constructed-form',
  'powerful build': 'powerful-build',
  'stout build': 'stout-build',
  'nimble': 'nimble',
  'small stealth': 'small-stealth',
  'fury of the small': 'fury-of-small',
  'out of sight': 'out-of-sight',
  'swim speed': 'swim-speed',
  'climb speed': 'climb-speed',
  'tooth and nail': 'tooth-nail',
  'tooth and tail': 'tooth-tail',
  'beak and claw': 'beak-claw',
  'hold breath': 'hold-breath',
  'amphibious': 'amphibious',
  'vigilant rest': 'vigilant-rest',
  'toxin resilience': 'toxin-resilience',
  'magic resistance': 'magic-resistance',
  'brave': 'brave',
  'keen smell': 'keen-smell',
  'keen sight': 'keen-sight',
  'agile fall': 'agile-fall',
  'trance': 'trance',
  'charm resistance': 'charm-resistance',
  'pack tactics': 'pack-tactics',
  'roar': 'roar',
  'traversal': 'traversal',
  'leap': 'leap',
  'speech of beast and leaf': 'speech-beast-leaf',
  'prehensile limb, trunk': 'prehensile-limb',
  'telepathy': 'telepathy',
  'endurance': 'endurance',
  'creativity': 'creativity',
  'quick learner': 'quick-learner',
  'lucky': 'lucky',
};

// ── Process a single entry into a trait ──

function processEntry(entry, traitLookup) {
  if (entry.type !== 'entries' || !entry.name) return null;
  // Skip "Description" entries
  if (entry.name === 'Description') return null;

  // Combine all string entries
  const rawEntries = (entry.entries || [])
    .filter(e => typeof e === 'string')
    .join(' ');

  // If entries contain a list, append list items
  const listEntries = (entry.entries || [])
    .filter(e => typeof e === 'object' && e.type === 'list')
    .flatMap(l => (l.items || []).map(i => convertMarkup(i)));

  // Extract points from the last text entry that has {@note N}
  let points = 0;
  const allTextEntries = (entry.entries || []).filter(e => typeof e === 'string');
  for (const txt of allTextEntries) {
    const { points: p } = stripNote(txt);
    if (p !== null) points = p;
  }

  // Convert markup in the combined text
  let description = allTextEntries.map(t => {
    const { cleaned } = stripNote(t);
    return convertMarkup(cleaned);
  }).join(' ').trim();

  // Append list items to description
  if (listEntries.length > 0) {
    description += '\n' + listEntries.map(item => `- ${item}`).join('\n');
  }

  // Create summary (first sentence, max ~150 chars)
  const firstSentence = description.split(/\.\s/)[0];
  const summary = firstSentence.length > 150
    ? firstSentence.substring(0, 147) + '...'
    : firstSentence + (firstSentence.endsWith('.') ? '' : '.');

  const name = entry.name;
  const normName = name.toLowerCase().trim();

  // Try to match to existing trait
  let matchedId = null;
  let isExisting = false;

  // Check direct name override mapping first
  if (NAME_OVERRIDES[normName]) {
    matchedId = NAME_OVERRIDES[normName];
    isExisting = true;
  }

  // Check name lookup
  if (!matchedId && traitLookup.lookup.has(normName)) {
    matchedId = traitLookup.lookup.get(normName).id;
    isExisting = true;
  }

  // Check if name starts with a known trait (e.g., "Cantrip (Elemental), Fire" -> not a direct match)
  // Handle specific patterns
  if (!matchedId) {
    // Check for "X, Y" or "X (Y)" patterns
    const baseName = normName.replace(/\s*[\(,].*$/, '').trim();
    if (NAME_OVERRIDES[baseName]) {
      matchedId = NAME_OVERRIDES[baseName];
      isExisting = true;
    } else if (traitLookup.lookup.has(baseName)) {
      matchedId = traitLookup.lookup.get(baseName).id;
      isExisting = true;
    }
  }

  const id = matchedId || toKebabCase(name);

  const traitRef = { id };

  // If it's an existing trait but with custom data, add overrides
  if (isExisting) {
    const existing = traitLookup.idLookup.get(matchedId);
    if (existing) {
      // Only add overrides if they differ from existing
      if (name !== existing.name) traitRef.name = name;
      if (description && description !== existing.description) traitRef.description = description;
      if (summary && summary !== existing.summary) traitRef.summary = summary;
      if (points !== existing.points) traitRef.points = points;
    }
  } else {
    // New trait - full object
    traitRef.name = name;
    traitRef.summary = summary;
    traitRef.description = description;
    traitRef.points = points;
    traitRef._isNew = true;
  }

  return traitRef;
}

// ── Main ──

function main() {
  // Read source data
  console.log('Reading source data...');
  const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const traitsData = JSON.parse(fs.readFileSync(traitsPath, 'utf8'));

  // Build lookup
  const traitLookup = buildTraitLookup(traitsData);
  console.log(`Loaded ${traitLookup.lookup.size} existing traits by name, ${traitLookup.idLookup.size} by ID`);

  // Process races -> ancestries
  const ancestries = [];
  const newTraits = [];
  const raceMap = new Map(); // race name -> ancestry entry

  for (const race of (sourceData.race || [])) {
    const ancestryId = toKebabCase(race.name);
    const traits = [];

    // Process size from the race object
    if (race.size) {
      for (const s of race.size) {
        if (s === 'M') traits.push({ id: 'size-medium' });
        else if (s === 'S') traits.push({ id: 'size-small' });
      }
    }

    // Process entries
    for (const entry of (race.entries || [])) {
      const trait = processEntry(entry, traitLookup);
      if (trait) {
        if (trait._isNew) {
          const { _isNew, ...cleanTrait } = trait;
          newTraits.push({ ...cleanTrait, _ancestry: race.name });
          traits.push({ id: cleanTrait.id });
        } else {
          traits.push(trait);
        }
      }
    }

    const ancestry = {
      id: ancestryId,
      name: race.name,
      traits,
      archetypes: []
    };

    // Add fluff as description if available
    if (race.fluff && race.fluff.entries) {
      const fluffText = race.fluff.entries
        .filter(e => typeof e === 'string')
        .map(e => convertMarkup(e))
        .join('\n\n');
      if (fluffText) {
        ancestry.description = fluffText;
        // Create summary from first sentence
        const firstSentence = fluffText.split(/\.\s/)[0];
        ancestry.summary = firstSentence.length > 150
          ? firstSentence.substring(0, 147) + '...'
          : firstSentence + (firstSentence.endsWith('.') ? '' : '.');
      }
    }

    ancestries.push(ancestry);
    raceMap.set(race.name, ancestry);
  }

  // Process subraces -> archetypes
  for (const subrace of (sourceData.subrace || [])) {
    const parentAncestry = raceMap.get(subrace.raceName);
    if (!parentAncestry) {
      console.warn(`Warning: No parent race found for subrace "${subrace.name}" (raceName: "${subrace.raceName}")`);
      continue;
    }

    const archetypeId = toKebabCase(subrace.name);
    const traits = [];

    for (const entry of (subrace.entries || [])) {
      const trait = processEntry(entry, traitLookup);
      if (trait) {
        if (trait._isNew) {
          const { _isNew, ...cleanTrait } = trait;
          newTraits.push({ ...cleanTrait, _ancestry: `${subrace.raceName} > ${subrace.name}` });
          traits.push({ id: cleanTrait.id });
        } else {
          traits.push(trait);
        }
      }
    }

    const archetype = {
      id: archetypeId,
      name: subrace.name,
      traits
    };

    // Add fluff as description
    if (subrace.fluff && subrace.fluff.entries) {
      const fluffText = subrace.fluff.entries
        .filter(e => typeof e === 'string')
        .map(e => convertMarkup(e))
        .join('\n\n');
      if (fluffText) {
        archetype.description = fluffText;
      }
    }

    parentAncestry.archetypes.push(archetype);
  }

  // Separate new traits by whether they came from a race or subrace
  const uniqueNewTraits = [];
  const seenIds = new Set();
  for (const t of newTraits) {
    if (!seenIds.has(t.id)) {
      seenIds.add(t.id);
      uniqueNewTraits.push(t);
    }
  }

  // Output
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(outputTraitsPath, JSON.stringify(uniqueNewTraits, null, 2));
  console.log(`\nWrote ${uniqueNewTraits.length} new traits to ${outputTraitsPath}`);

  fs.writeFileSync(outputAncestriesPath, JSON.stringify(ancestries, null, 2));
  console.log(`Wrote ${ancestries.length} ancestries to ${outputAncestriesPath}`);

  // Summary
  console.log('\n── Summary ──');
  console.log(`Ancestries: ${ancestries.length}`);
  const totalArchetypes = ancestries.reduce((sum, a) => sum + a.archetypes.length, 0);
  console.log(`Archetypes: ${totalArchetypes}`);
  console.log(`New traits (not in existing traits.json): ${uniqueNewTraits.length}`);
  console.log(`Matched to existing traits: ${newTraits.length === 0 ? 'all' : `${ancestries.reduce((sum, a) => {
    const traitCount = a.traits.filter(t => !t._isNew).length;
    const archTraitCount = a.archetypes.reduce((s, ar) => s + ar.traits.filter(t => !t._isNew).length, 0);
    return sum + traitCount + archTraitCount;
  }, 0)}`}`);

  // List new traits
  if (uniqueNewTraits.length > 0) {
    console.log('\nNew traits:');
    for (const t of uniqueNewTraits) {
      console.log(`  - ${t.id} (${t.points}pts) [from: ${t._ancestry}]`);
    }
  }

  // List ancestries and their archetypes
  console.log('\nAncestries & Archetypes:');
  for (const a of ancestries) {
    console.log(`  ${a.name} (${a.traits.length} traits)`);
    for (const ar of a.archetypes) {
      console.log(`    └─ ${ar.name} (${ar.traits.length} traits)`);
    }
  }
}

main();
