/**
 * Schema definition for Ancestry exports
 * Ensures consistency between saved files and expected import format
 */

export const ANCESTRY_SCHEMA_VERSION = "1.0.0";

/**
 * Base template for an empty ancestry export
 */
export const ANCESTRY_TEMPLATE = {
  version: ANCESTRY_SCHEMA_VERSION,
  name: "Custom Ancestry",
  description: "",
  traits: [],
  meta: {
    pointsSpent: 0,
    created: null
  }
};

/**
 * Creates a standardized export object from character state
 * @param {Object} params
 * @param {Array} params.selectedTraits - Array of full trait objects
 * @param {Object} params.selectedOptions - Map of traitId -> optionId
 * @param {string} params.ancestryName - Name of the ancestry
 * @param {number} params.pointsSpent - Total points spent
 * @returns {Object} Formatted JSON object matching schema
 */
export function createAncestryExport({
  selectedTraits,
  selectedOptions,
  ancestryName,
  pointsSpent,
}) {
  return {
    version: ANCESTRY_SCHEMA_VERSION,
    name: ancestryName || "Custom Ancestry",
    description: `Custom ancestry created with ${pointsSpent} points.`,
    traits: selectedTraits.map(t => formatTraitForExport(t, selectedOptions)),
    meta: {
      pointsSpent,
      created: new Date().toISOString(),
      platform: "5e-ancestry-builder"
    }
  };
}

/**
 * Formats a single trait for export, keeping essential data and selected options
 */
function formatTraitForExport(trait, selectedOptions) {
  const exportTrait = {
    id: trait.id,
    type: trait.type,
    name: trait.name,
    points: trait.points,
    categoryId: trait.categoryId
  };

  // Add selected option if exists
  if (selectedOptions[trait.id]) {
    exportTrait.selectedOption = selectedOptions[trait.id];

    // If we have options data, include the option name for readability/debugging
    // (Note: Import logic should rely on IDs, this is just for human readability of the JSON)
    if (trait.options) {
      const option = trait.options.find(o => o.id === selectedOptions[trait.id]);
      if (option) {
        exportTrait.optionName = option.name;
        // If option overrides points, include that
        if (option.points !== undefined) {
          exportTrait.points = option.points;
        }
      }
    }
  }

  return exportTrait;
}
