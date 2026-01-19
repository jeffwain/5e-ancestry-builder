import { useState, useEffect, useMemo } from 'react';

/**
 * Hook to load and organize trait data from the JSON file
 * Handles core attributes, heritage categories (flat), and culture categories
 */
export function useTraitData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTraits() {
      try {
        const response = await fetch('/data/traits.json');
        if (!response.ok) {
          throw new Error(`Failed to load traits: ${response.status}`);
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTraits();
  }, []);

  // Core attributes section - has name, description, and categories as direct children
  const coreSection = useMemo(() => {
    if (!data?.coreAttributes) return null;
    const { name, description, ...categories } = data.coreAttributes;
    return { name, description, categories };
  }, [data]);

  // Heritage section - has name, description, and categories under .categories
  const heritageSection = useMemo(() => {
    if (!data?.heritage) return null;
    return {
      name: data.heritage.name,
      description: data.heritage.description,
      categories: data.heritage.categories || {}
    };
  }, [data]);

  // Culture section - has name, description, and categories under .categories
  const cultureSection = useMemo(() => {
    if (!data?.culture) return null;
    return {
      name: data.culture.name,
      description: data.culture.description,
      categories: data.culture.categories || {}
    };
  }, [data]);

  // Flat map of ALL traits by ID for quick lookup
  const allTraits = useMemo(() => {
    if (!data) return {};
    const traitMap = {};

    // Helper to add traits with metadata
    const addTraits = (traits, categoryId, categoryName, type, label = null) => {
      if (!traits) return;
      for (const trait of traits) {
        traitMap[trait.id] = {
          ...trait,
          categoryId,
          categoryName,
          type,
          label // e.g. "Planar Ancestry", "Bestial Ancestry"
        };
      }
    };

    // Core attributes - categories are direct children (excluding name, description)
    if (data.coreAttributes) {
      const { name, description, ...categories } = data.coreAttributes;
      for (const [catId, category] of Object.entries(categories)) {
        addTraits(category.traits, catId, category.name, 'core');
      }
    }

    // Heritage - categories are under .categories property
    if (data.heritage?.categories) {
      for (const [catId, category] of Object.entries(data.heritage.categories)) {
        addTraits(category.traits, catId, category.name, 'heritage', category.label);
      }
    }

    // Culture - categories are under .categories property
    if (data.culture?.categories) {
      for (const [catId, category] of Object.entries(data.culture.categories)) {
        addTraits(category.traits, catId, category.name, 'culture');
      }
    }

    return traitMap;
  }, [data]);

  // Get traits marked as default (should be auto-selected)
  const defaultTraits = useMemo(() => {
    return Object.values(allTraits).filter(t => t.default === true);
  }, [allTraits]);

  // Get all required categories (categories with required: true)
  const requiredCategories = useMemo(() => {
    if (!data) return [];
    const required = [];
    // Check core attributes - categories are direct children
    if (data.coreAttributes) {
      const { name, description, ...categories } = data.coreAttributes;
      for (const [catId, category] of Object.entries(categories)) {
        if (category.required) {
          required.push({
            categoryId: catId,
            categoryName: category.name,
            type: 'core',
            traitIds: category.traits?.map(t => t.id) || []
          });
        }
      }
    }
    // Check heritage categories - under .categories property
    if (data.heritage?.categories) {
      for (const [catId, category] of Object.entries(data.heritage.categories)) {
        if (category.required) {
          required.push({
            categoryId: catId,
            categoryName: category.name,
            type: 'heritage',
            traitIds: category.traits?.map(t => t.id) || []
          });
        }
      }
    }
    // Check culture categories - under .categories property
    if (data.culture?.categories) {
      for (const [catId, category] of Object.entries(data.culture.categories)) {
        if (category.required) {
          required.push({
            categoryId: catId,
            categoryName: category.name,
            type: 'culture',
            traitIds: category.traits?.map(t => t.id) || []
          });
        }
      }
    }
    return required;
  }, [data]);

  // Get all traits as a flat array (useful for searching)
  const allTraitsArray = useMemo(() => {
    return Object.values(allTraits);
  }, [allTraits]);

  // Check if a trait can be selected given current selections
  const canSelectTrait = (traitId, selectedTraitIds) => {
    const trait = allTraits[traitId];
    if (!trait) return { canSelect: false, reason: 'Trait not found' };

    // Check excludes - can't select if any excluded trait is selected
    if (trait.excludes?.length > 0) {
      const conflicting = trait.excludes.find(id => selectedTraitIds.includes(id));
      if (conflicting) {
        const conflictingTrait = allTraits[conflicting];
        return {
          canSelect: false,
          reason: `Conflicts with ${conflictingTrait?.name || conflicting}`
        };
      }
    }

    // Check requires - can't select if prerequisites not met
    if (trait.requires?.length > 0) {
      const missing = trait.requires.filter(id => !selectedTraitIds.includes(id));
      if (missing.length > 0) {
        const missingNames = missing.map(id => allTraits[id]?.name || id).join(', ');
        return {
          canSelect: false,
          reason: `Requires ${missingNames}`
        };
      }
    }

    return { canSelect: true, reason: null };
  };

  // Get traits that would be excluded if a trait is selected
  const getExcludedBy = (traitId) => {
    const trait = allTraits[traitId];
    if (!trait?.excludes) return [];
    return trait.excludes.map(id => allTraits[id]).filter(Boolean);
  };

  // Get traits that are required by a trait
  const getRequiredBy = (traitId) => {
    const trait = allTraits[traitId];
    if (!trait?.requires) return [];
    return trait.requires.map(id => allTraits[id]).filter(Boolean);
  };

  // Get a prebuilt ancestry with its traits resolved
  const getPrebuiltWithTraits = (ancestryId) => {
    if (!data?.prebuiltAncestries) return null;
    const prebuilt = data.prebuiltAncestries.find(p => p.id === ancestryId);
    if (!prebuilt) return null;

    return {
      ...prebuilt,
      traits: prebuilt.traitIds
        .map(id => allTraits[id])
        .filter(Boolean)
    };
  };

  return {
    // Section data (name, description, categories)
    coreSection,
    heritageSection,
    cultureSection,
    prebuiltAncestries: data?.prebuiltAncestries || [],
    allTraits,
    allTraitsArray,
    defaultTraits,
    requiredCategories,

    // Helpers
    canSelectTrait,
    getExcludedBy,
    getRequiredBy,
    getPrebuiltWithTraits,

    // Status
    loading,
    error
  };
}
