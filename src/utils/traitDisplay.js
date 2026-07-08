/**
 * Single source of truth for turning a raw trait (+ selected options) into the
 * values the trait UI displays. Previously this derivation lived, slightly
 * differently, inside TraitCard, SummaryTraitCard and TraitTooltip — which had
 * drifted (en-dash vs hyphen cost ranges, and only SummaryTraitCard honoured
 * prebuilt-ancestry overrides). Centralising it keeps the three views in sync.
 */

export const POINT_BUDGET = 16;

/**
 * Point cost of a trait for budget math. Matches CharacterContext pointsSpent:
 * requiresOption traits use the selected option's cost when one is chosen.
 */
export function getTraitPointCost(trait, selectedOptions = {}) {
  let traitPoints = trait.points || 0;

  if (trait.requiresOption && trait.options) {
    const selectedOptionId = selectedOptions[trait.id];
    if (selectedOptionId) {
      const selectedOption = trait.options.find((o) => o.id === selectedOptionId);
      if (selectedOption) {
        traitPoints = selectedOption.points || 0;
      }
    }
  }

  return traitPoints;
}

// "Free" / "1 pt" / "N pts" — or null when there is no cost to show.
export function formatPointsLabel(points) {
  if (points === 0) return 'Free';
  if (points === undefined || points === null || points === '') return null;
  return points === 1 ? '1 pt' : `${points} pts`;
}

// True when this trait's cost/selection is driven by its options.
function isOptionDriven(trait) {
  return Boolean((trait.requiresOption || trait.hasOptions) && trait.options?.length);
}

/**
 * Resolve the cost to display: a number, a range string like "1–3", or null
 * (no cost). Honours ancestry pointsOverride and option selection / ranges.
 */
export function resolveDisplayCost(trait, selectedOptions = {}) {
  if (trait.pointsOverride !== undefined) return trait.pointsOverride;

  if (isOptionDriven(trait)) {
    const selectedId = selectedOptions[trait.id];
    if (selectedId) {
      const opt = trait.options.find((o) => o.id === selectedId);
      return opt?.points ?? trait.points ?? 0;
    }
    // requiresOption with nothing chosen yet → show the range of option costs.
    if (trait.requiresOption) {
      const costs = trait.options.map((o) => o.points || 0);
      const min = Math.min(...costs);
      const max = Math.max(...costs);
      return min === max ? min : `${min}–${max}`;
    }
  }

  if (trait.points === undefined || trait.points === null || trait.points === '') {
    return null;
  }
  return trait.points;
}

/**
 * Group selected traits by their type for summary views. Returns
 * [{ name, traits }] in insertion order. Previously duplicated in
 * AncestryOverview and the ancestry step's summary card.
 */
export function groupTraitsByType(selectedTraits, traitTypes = {}) {
  const grouped = {};
  selectedTraits.forEach((trait) => {
    const typeId = trait.type || 'unknown';
    if (!grouped[typeId]) {
      grouped[typeId] = {
        name: traitTypes[typeId]?.name || 'Custom Traits',
        traits: []
      };
    }
    grouped[typeId].traits.push(trait);
  });
  return Object.values(grouped);
}

/**
 * Shape traits-grouped-by-type into TraitGroupList `groups`
 * ([{ key, title, items: [{ key, trait, selectedOptions }] }]).
 */
export function groupsFromTraitsByType(traitsByType, selectedOptions) {
  return traitsByType.map((typeGroup) => ({
    key: typeGroup.name,
    title: typeGroup.name,
    items: typeGroup.traits.map((trait) => ({
      key: trait.id,
      trait,
      selectedOptions,
    })),
  }));
}

/**
 * Derive the display-ready fields for a trait. Returns primitives only; each
 * view composes the final name/cost presentation it wants (e.g. the tooltip
 * shows the option name with the trait as a "source", while a summary shows
 * "Trait (Option)").
 */
export function getTraitDisplay(trait, selectedOptions = {}) {
  const optionDriven = isOptionDriven(trait);
  const selectedOption = optionDriven
    ? (trait.options.find((o) => o.id === selectedOptions[trait.id]) || null)
    : null;

  // Ancestry overrides (set when a prebuilt ancestry customises a trait).
  const hasNameOverride = Boolean(trait.nameOverride);
  const baseName = trait.nameOverride || trait.name;
  const description = trait.descriptionOverride || trait.description;
  const summary = trait.summaryOverride || trait.summary;

  // Only surface the option's own description when the ancestry hasn't overridden
  // the description/summary out from under it.
  const optionDescription =
    selectedOption && !trait.descriptionOverride && !trait.summaryOverride
      ? selectedOption.description || null
      : null;

  return {
    id: trait.id,
    rawName: trait.name,
    baseName,
    hasNameOverride,
    selectedOption,
    description,
    summary,
    optionDescription,
    cost: resolveDisplayCost(trait, selectedOptions),
    restriction: trait.restriction?.label || trait.restriction || null,
    categoryName: trait.categoryName || null,
    type: trait.type || null,
  };
}
