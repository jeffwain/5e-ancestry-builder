/**
 * Resolution of ancestry trait references against the trait vocabulary.
 * Moved out of AncestryCard so data logic isn't exported from a component
 * file (react-refresh) and can be shared by pages without importing UI.
 */
import { getTraitDisplay, POINT_BUDGET } from './traitDisplay';

// Resolve a trait reference to its full data
// - If trait has just an ID, look it up in allTraits
// - If trait has overrides (name, description, etc.), store them separately
// - If trait has no ID, it's a custom trait - use as-is
// - Custom overrides from ancestry go into specific override fields
export function resolveTrait(trait, allTraits) {
  // No ID means it's a fully custom trait
  if (!trait.id) {
    return trait;
  }

  // Look up base trait from database
  const baseTrait = allTraits[trait.id];

  // If not found in database, generate a display name from the ID if missing
  if (!baseTrait) {
    if (!trait.name && trait.id) {
      return { ...trait, name: trait.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) };
    }
    return trait;
  }

  // Start with base trait
  const resolved = { ...baseTrait };

  // Handle specific overrides from ancestry definition
  if (trait.name && trait.name !== baseTrait.name) {
    resolved.nameOverride = trait.name;
  }
  if (trait.description && trait.description !== baseTrait.description) {
    resolved.descriptionOverride = trait.description;
  }
  if (trait.summary && trait.summary !== baseTrait.summary) {
    resolved.summaryOverride = trait.summary;
  }
  if (trait.points !== undefined && trait.points !== baseTrait.points) {
    resolved.pointsOverride = trait.points;
  }

  return resolved;
}

// Collect all resolved traits for an ancestry + archetype combo
// Returns { traits: [...], options: { traitId: optionId, ... } }
export function getResolvedTraitsAndOptions(ancestry, archetype, allTraits) {
  const options = {};

  const resolveTraitWithOptions = (traitDef) => {
    const resolved = resolveTrait(traitDef, allTraits);
    if (traitDef.option && resolved.id) {
      options[resolved.id] = traitDef.option;
    }
    return resolved;
  };

  const ancestryTraits = (ancestry.traits || []).map(t => resolveTraitWithOptions(t));
  const archetypeTraits = (archetype.traits || []).map(t => resolveTraitWithOptions(t));
  const combinedTraits = [...ancestryTraits, ...archetypeTraits];

  return { traits: combinedTraits, options };
}

// The build marks every trait of a designed archetype "RECOMMENDED: …" (and
// traits.json uses the same prefix for curated suggestions), so a suggestion is
// never taken for something the source says.
export const RECOMMENDED_PREFIX = 'RECOMMENDED: ';

const optionsOf = (raw) => (raw.option && raw.id ? { [raw.id]: raw.option } : {});

/** True when a trait reference shows under a RECOMMENDED: name. */
export function isRecommendedTrait(raw, allTraits) {
  if (!raw) return false;
  const resolved = resolveTrait(raw, allTraits);
  return Boolean((resolved.nameOverride || resolved.name)?.startsWith(RECOMMENDED_PREFIX));
}

/** Point total of a list of trait references, as the builder would count them. */
export function sumTraitCost(traits, allTraits) {
  let total = 0;
  for (const raw of traits || []) {
    if (!raw) continue;
    const cost = getTraitDisplay(resolveTrait(raw, allTraits), optionsOf(raw)).cost;
    if (typeof cost === 'number') total += cost;
  }
  return total;
}

/**
 * What still needs a look in a built ancestry: how many of its trait references
 * are only RECOMMENDED, and which archetypes don't come to the full budget.
 */
export function ancestryIssues(ancestry, allTraits) {
  const shared = sumTraitCost(ancestry.traits, allTraits);
  let recommended = (ancestry.traits || []).filter((raw) => isRecommendedTrait(raw, allTraits)).length;
  const offBudget = [];
  for (const archetype of ancestry.archetypes || []) {
    recommended += (archetype.traits || []).filter((raw) => isRecommendedTrait(raw, allTraits)).length;
    const total = shared + sumTraitCost(archetype.traits, allTraits);
    if (total !== POINT_BUDGET) offBudget.push({ name: archetype.name, total });
  }
  return { recommended, offBudget };
}

/**
 * Split out traits that exclude one another — an ancestry offering Small or
 * Medium Size lists both. Loading both would make the choice for the player,
 * so neither is loaded: `choices` names what is left for them to pick and
 * `openCategories` the categories that must stay empty until they do —
 * unless another trait already settles it (Stout Build requires Medium Size),
 * in which case the required side stays and the choice isn't a choice.
 */
export function withoutOpenChoices(traits) {
  const ids = new Set(traits.map((trait) => trait.id));
  const conflicted = traits.filter((trait) => trait.excludes?.some((id) => ids.has(id)));
  if (conflicted.length === 0) return { traits, choices: [], openCategories: [] };

  const conflictedIds = new Set(conflicted.map((trait) => trait.id));
  const required = new Set(
    traits
      .filter((trait) => !conflictedIds.has(trait.id))
      .flatMap((trait) => trait.requires || [])
  );

  // A required side stays; everything else in the conflict is left out, and is
  // only the player's to choose when nothing required has already excluded it.
  const drop = new Set(conflicted.filter((trait) => !required.has(trait.id)).map((trait) => trait.id));
  const open = conflicted.filter((trait) => drop.has(trait.id) && !trait.excludes.some((id) => required.has(id)));

  return {
    traits: traits.filter((trait) => !drop.has(trait.id)),
    choices: open.map((trait) => trait.nameOverride || trait.name),
    openCategories: [...new Set(open.map((trait) => trait.categoryId).filter(Boolean))],
  };
}
