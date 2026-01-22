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

  // Dynamically build all sections from traitTypes
  const sections = useMemo(() => {
    if (!data?.traitTypes) return [];

    return Object.entries(data.traitTypes).map(([typeId, type]) => ({
      id: typeId,
      name: type.name,
      description: type.description,
      categories: type.categories || {},
      settings: type.settings || {}
    }));
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

    // Load in all trait types and categories
    if (data.traitTypes) {
      for (const [typeId, type] of Object.entries(data.traitTypes)) {
        if (type.categories) {
          for (const [catId, category] of Object.entries(type.categories)) {
            addTraits(category.traits, catId, category.name, type.name, category.label);
          }
        }
      }
    }

    return traitMap;
  }, [data]);

  // Get traits marked as default (should be auto-selected)
  const defaultTraits = useMemo(() => {
    return Object.values(allTraits).filter(t => t.default === true);
  }, [allTraits]);

  // Get all required categories and required traits
  const { requiredCategories, requiredTraits } = useMemo(() => {
    if (!data) return { requiredCategories: [], requiredTraits: [] };

    const requiredCategories = [];
    const requiredTraits = [];

    // Loop through all trait types and categories
    if (data.traitTypes) {
      for (const [typeId, type] of Object.entries(data.traitTypes)) {
        if (type.categories) {
          for (const [catId, category] of Object.entries(type.categories)) {

            // These are "required" categories that must have at least one trait selected
            if (category.required) {
              requiredCategories.push({
                categoryId: catId,
                categoryName: category.name,
                type: typeId,
                traitIds: category.traits?.map(t => t.id) || []
              });
            }

            // These are "required traits" that must be selected within their category
            // before other traits in the same category can be selected
            if (category.requiredTrait) {
              requiredTraits.push({
                traitId: category.requiredTrait,
                categoryId: catId,
                categoryName: category.name,
                type: typeId,
                traitIds: category.traits?.map(t => t.id) || []
              });
            }
          }
        }
      }
    }

    return { requiredCategories, requiredTraits };
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
    // Section data - all sections dynamically loaded
    sections,
    prebuiltAncestries: data?.prebuiltAncestries || [],
    allTraits,
    allTraitsArray,
    defaultTraits,
    requiredCategories,
    requiredTraits,

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
