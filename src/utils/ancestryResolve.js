/**
 * Resolution of ancestry trait references against the trait vocabulary.
 * Moved out of AncestryCard so data logic isn't exported from a component
 * file (react-refresh) and can be shared by pages without importing UI.
 */

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
