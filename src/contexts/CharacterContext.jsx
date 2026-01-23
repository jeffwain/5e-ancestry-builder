import { createContext, useContext, useReducer, useMemo, useCallback } from 'react';

// Initial state
const initialState = {
  selectedTraits: [],      // Array of full trait objects
  selectedOptions: {},     // Map of trait ID -> selected option ID (for traits with choices)
  loadedPrebuilt: null,    // Track which prebuilt was loaded
  ancestryName: '',        // Custom ancestry name
  allTraits: {},           // Trait lookup map for getting names
  requiredCategories: [],  // Categories that require at least one trait selected
  requiredTraits: {},      // Map of traitId -> category info for traits required by their category
  traitTypes: {}           // Metadata for trait types (id -> name mapping)
};

// Action types
const ActionTypes = {
  SELECT_TRAIT: 'SELECT_TRAIT',
  DESELECT_TRAIT: 'DESELECT_TRAIT',
  SET_TRAIT_OPTION: 'SET_TRAIT_OPTION',
  LOAD_PREBUILT: 'LOAD_PREBUILT',
  SET_DEFAULTS: 'SET_DEFAULTS',
  SET_ALL_TRAITS: 'SET_ALL_TRAITS',
  SET_REQUIRED_CATEGORIES: 'SET_REQUIRED_CATEGORIES',
  SET_REQUIRED_TRAITS: 'SET_REQUIRED_TRAITS',
  SET_TRAIT_TYPES: 'SET_TRAIT_TYPES',
  SET_ANCESTRY_NAME: 'SET_ANCESTRY_NAME',
  RESET: 'RESET'
};

// Reducer
function characterReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SELECT_TRAIT: {
      const trait = action.payload;
      // Don't add duplicates
      if (state.selectedTraits.some(t => t.id === trait.id)) {
        return state;
      }
      
      // If this trait has excludes, remove any conflicting traits
      let newTraits = [...state.selectedTraits];
      if (trait.excludes?.length > 0) {
        newTraits = newTraits.filter(t => !trait.excludes.includes(t.id));
      }
      
      return {
        ...state,
        selectedTraits: [...newTraits, trait]
      };
    }

    case ActionTypes.DESELECT_TRAIT: {
      const traitId = action.payload;
      const trait = state.selectedTraits.find(t => t.id === traitId);
      
      // Also remove any traits that require this one
      let newTraits = state.selectedTraits.filter(t => t.id !== traitId);
      if (trait) {
        newTraits = newTraits.filter(t => !t.requires?.includes(traitId));
      }
      
      // Remove option selection if any
      const newOptions = { ...state.selectedOptions };
      delete newOptions[traitId];
      
      return {
        ...state,
        selectedTraits: newTraits,
        selectedOptions: newOptions
      };
    }

    case ActionTypes.SET_TRAIT_OPTION: {
      const { traitId, optionId } = action.payload;
      return {
        ...state,
        selectedOptions: {
          ...state.selectedOptions,
          [traitId]: optionId
        }
      };
    }

    case ActionTypes.LOAD_PREBUILT: {
      let traits = [...action.payload.traits];

      // Check for missing required categories and add defaults
      if (state.requiredCategories.length > 0 && Object.keys(state.allTraits).length > 0) {
        state.requiredCategories.forEach(reqCat => {
          // Check if any selected trait is in this category
          const hasTrait = traits.some(t => t.categoryId === reqCat.categoryId);
          
          if (!hasTrait) {
            // Find default trait for this category in allTraits
            const defaultTrait = Object.values(state.allTraits).find(t => 
              t.categoryId === reqCat.categoryId && t.default === true
            );
            
            if (defaultTrait) {
              traits.push(defaultTrait);
            }
          }
        });
      }

      return {
        ...state,
        selectedTraits: traits,
        selectedOptions: action.payload.options || {},
        loadedPrebuilt: action.payload.id,
        ancestryName: action.payload.name || state.ancestryName
      };
    }

    case ActionTypes.SET_DEFAULTS: {
      // Only set defaults if no traits are selected yet
      if (state.selectedTraits.length > 0) {
        return state;
      }
      return {
        ...state,
        selectedTraits: action.payload
      };
    }

    case ActionTypes.SET_ALL_TRAITS: {
      return {
        ...state,
        allTraits: action.payload
      };
    }

    case ActionTypes.SET_REQUIRED_CATEGORIES: {
      return {
        ...state,
        requiredCategories: action.payload
      };
    }

    case ActionTypes.SET_REQUIRED_TRAITS: {
      return {
        ...state,
        requiredTraits: action.payload
      };
    }

    case ActionTypes.SET_TRAIT_TYPES: {
      return {
        ...state,
        traitTypes: action.payload
      };
    }

    case ActionTypes.SET_ANCESTRY_NAME: {
      return {
        ...state,
        ancestryName: action.payload
      };
    }

    case ActionTypes.RESET: {
      return { 
        ...initialState, 
        allTraits: state.allTraits,
        requiredCategories: state.requiredCategories,
        requiredTraits: state.requiredTraits,
        traitTypes: state.traitTypes
      };
    }

    default:
      return state;
  }
}

// Generate warnings based on current state (soft validation)
function generateWarnings(selectedTraits, selectedOptions, requiredCategories) {
  const warnings = [];
  const selectedTraitIds = selectedTraits.map(t => t.id);

  // Check required categories - must have at least one trait selected
  for (const reqCat of requiredCategories) {
    const hasSelection = reqCat.traitIds.some(id => selectedTraitIds.includes(id));
    if (!hasSelection) {
      warnings.push({
        type: 'required-category',
        severity: 'error',
        categoryId: reqCat.categoryId,
        message: `${reqCat.categoryName}: Select one`
      });
    }
  }
  
  // Check for traits that require options but don't have one selected
  const traitsNeedingOptions = selectedTraits.filter(t => t.requiresOption && !selectedOptions[t.id]);
  for (const trait of traitsNeedingOptions) {
    warnings.push({
      type: 'missing-option',
      severity: 'error',
      message: `${trait.name}: Select a sub-option`
    });
  }
  
  // Calculate totals (including option points)
  const pointsSpent = selectedTraits.reduce((sum, trait) => {
    if (trait.requiresOption && trait.options) {
      const selectedOptionId = selectedOptions[trait.id];
      if (selectedOptionId) {
        const option = trait.options.find(o => o.id === selectedOptionId);
        return sum + (option?.points || 0);
      }
      return sum; // No points until option selected
    }
    return sum + (trait.points || 0);
  }, 0);
  
  // Count heritage categories (unique categoryIds where type is 'heritage')
  const heritageCategories = new Set(
    selectedTraits
      .filter(t => t.type === 'heritage')
      .map(t => t.categoryId)
  );
  const heritageCount = heritageCategories.size;
  
  // Count culture categories
  const cultureCategories = new Set(
    selectedTraits
      .filter(t => t.type === 'culture')
      .map(t => t.categoryId)
  );
  const cultureCount = cultureCategories.size;

  // Over 16 points
  if (pointsSpent > 16) {
    warnings.push({
      type: 'over-budget',
      severity: 'warning',
      message: `You have spent ${pointsSpent} points (16 recommended)`
    });
  }

  // More than 2 heritage categories
  if (heritageCount > 2) {
    warnings.push({
      type: 'heritage-count',
      severity: 'warning',
      message: `You have traits from ${heritageCount} heritage categories (2 recommended)`
    });
  }

  // No culture traits
  if (cultureCount === 0 && selectedTraits.length > 0) {
    warnings.push({
      type: 'no-culture',
      severity: 'info',
      message: 'Consider selecting at least 1 culture trait'
    });
  }

  // More than 2 culture categories
  if (cultureCount > 2) {
    warnings.push({
      type: 'culture-count',
      severity: 'warning',
      message: `You have traits from ${cultureCount} culture categories (2 recommended)`
    });
  }

  return warnings;
}

// Create context
const CharacterContext = createContext(null);

// Provider component
export function CharacterProvider({ children }) {
  const [state, dispatch] = useReducer(characterReducer, initialState);

  // Computed values - includes points from selected options
  const pointsSpent = useMemo(() => {
    return state.selectedTraits.reduce((sum, trait) => {
      // Base trait points
      let traitPoints = trait.points || 0;
      
      // If trait has a selected option, add option points instead of (or in addition to) base
      if (trait.requiresOption && trait.options) {
        const selectedOptionId = state.selectedOptions[trait.id];
        if (selectedOptionId) {
          const selectedOption = trait.options.find(o => o.id === selectedOptionId);
          if (selectedOption) {
            // For requiresOption traits, option points replace base points
            traitPoints = selectedOption.points || 0;
          }
        }
      }
      
      return sum + traitPoints;
    }, 0);
  }, [state.selectedTraits, state.selectedOptions]);

  const selectedTraitIds = useMemo(() => 
    state.selectedTraits.map(t => t.id),
    [state.selectedTraits]
  );

  // Count unique heritage categories
  const heritageCategories = useMemo(() => {
    const cats = new Set(
      state.selectedTraits
        .filter(t => t.type === 'heritage')
        .map(t => t.categoryId)
    );
    return Array.from(cats);
  }, [state.selectedTraits]);

  // Count unique culture categories
  const cultureCategories = useMemo(() => {
    const cats = new Set(
      state.selectedTraits
        .filter(t => t.type === 'culture')
        .map(t => t.categoryId)
    );
    return Array.from(cats);
  }, [state.selectedTraits]);

  const warnings = useMemo(() => 
    generateWarnings(state.selectedTraits, state.selectedOptions, state.requiredCategories),
    [state.selectedTraits, state.selectedOptions, state.requiredCategories]
  );

  // Get selected size
  const selectedSize = useMemo(() => {
    if (state.selectedTraits.some(t => t.id === 'size-medium')) return 'medium';
    if (state.selectedTraits.some(t => t.id === 'size-small')) return 'small';
    return null;
  }, [state.selectedTraits]);

  // Check if a trait is selected
  const isTraitSelected = useCallback((traitId) => 
    selectedTraitIds.includes(traitId),
    [selectedTraitIds]
  );

  // Check if a trait can be selected (prerequisites met, not excluded)
  const canSelectTrait = useCallback((trait) => {
    // Check excludes - but allow if it's in the same category (radio button behavior)
    if (trait.excludes?.length > 0) {
      const conflicting = trait.excludes.find(id => selectedTraitIds.includes(id));
      if (conflicting) {
        const conflictingTrait = state.selectedTraits.find(t => t.id === conflicting);
        // Allow selection if conflicting trait is in same category (will be replaced)
        const sameCategory = conflictingTrait?.categoryId === trait.categoryId;
        if (!sameCategory) {
          return { 
            canSelect: false, 
            reason: `Conflicts with ${conflictingTrait?.name || conflicting}` 
          };
        }
      }
    }

    // Check requires - show actual trait names
    if (trait.requires?.length > 0) {
      const missing = trait.requires.filter(id => !selectedTraitIds.includes(id));
      if (missing.length > 0) {
        const missingNames = missing.map(id => {
          const t = state.allTraits[id];
          return t?.name || id;
        }).join(', ');
        return { 
          canSelect: false, 
          reason: `Requires ${missingNames}` 
        };
      }
    }

    return { canSelect: true, reason: null };
  }, [selectedTraitIds, state.selectedTraits, state.allTraits]);

  // Actions
  const selectTrait = useCallback((trait) => {
    dispatch({ type: ActionTypes.SELECT_TRAIT, payload: trait });
    
    // If this trait IS a required trait, nothing more to do
    if (state.requiredTraits[trait.id]) {
      return;
    }
    
    // Check if this trait's category has a requiredTrait
    const categoryId = trait.categoryId;
    if (categoryId) {
      // Find if any required trait belongs to this category
      for (const [requiredTraitId, reqInfo] of Object.entries(state.requiredTraits)) {
        if (reqInfo.categoryId === categoryId && !selectedTraitIds.includes(requiredTraitId)) {
          // Auto-select the required trait
          const requiredTrait = state.allTraits[requiredTraitId];
          if (requiredTrait) {
            dispatch({ type: ActionTypes.SELECT_TRAIT, payload: requiredTrait });
          }
          break;
        }
      }
    }
  }, [state.requiredTraits, state.allTraits, selectedTraitIds]);

  const deselectTrait = useCallback((traitId) => {
    dispatch({ type: ActionTypes.DESELECT_TRAIT, payload: traitId });
  }, []);

  // Check if a trait can be deselected (not last in required category, or not required trait with other traits selected)
  const canDeselectTrait = useCallback((trait) => {
    // Check if this trait is a required trait for its category
    const reqTraitInfo = state.requiredTraits[trait.id];
    if (reqTraitInfo) {
      // This is a required trait - check if other traits from this category are selected
      const otherTraitsInCategory = reqTraitInfo.traitIds.filter(id => id !== trait.id);
      const hasOtherSelected = otherTraitsInCategory.some(id => selectedTraitIds.includes(id));
      if (hasOtherSelected) {
        // Can't deselect required trait if other traits from the category are selected
        return {
          canDeselect: false,
          reason: `${reqTraitInfo.categoryName} requires this trait when other traits are selected`
        };
      }
    }
    
    // Find if this trait belongs to a required category
    const reqCat = state.requiredCategories.find(cat => 
      cat.traitIds.includes(trait.id)
    );
    if (reqCat) {
      // Count how many traits from this required category are currently selected
      const selectedInCategory = reqCat.traitIds.filter(id => 
        selectedTraitIds.includes(id)
      );
      // Can't deselect if it's the only one selected in a required category
      if (selectedInCategory.length <= 1) {
        return { 
          canDeselect: false, 
          reason: `${reqCat.categoryName} requires a selection` 
        };
      }
    }
    
    return { canDeselect: true, reason: null };
  }, [selectedTraitIds, state.requiredCategories, state.requiredTraits]);

  const toggleTrait = useCallback((trait) => {
    if (selectedTraitIds.includes(trait.id)) {
      // Check if we can deselect
      const { canDeselect } = canDeselectTrait(trait);
      if (!canDeselect) return;
      dispatch({ type: ActionTypes.DESELECT_TRAIT, payload: trait.id });
    } else {
      selectTrait(trait);
    }
  }, [selectedTraitIds, canDeselectTrait, selectTrait]);

  const setTraitOption = useCallback((traitId, optionId) => {
    dispatch({ 
      type: ActionTypes.SET_TRAIT_OPTION, 
      payload: { traitId, optionId } 
    });
  }, []);

  const loadPrebuilt = useCallback((prebuiltId, traits, options = {}, name = '') => {
    dispatch({ 
      type: ActionTypes.LOAD_PREBUILT, 
      payload: { id: prebuiltId, traits, options, name } 
    });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: ActionTypes.RESET });
  }, []);

  const setAncestryName = useCallback((name) => {
    dispatch({ type: ActionTypes.SET_ANCESTRY_NAME, payload: name });
  }, []);

  const setDefaults = useCallback((defaultTraits) => {
    dispatch({ type: ActionTypes.SET_DEFAULTS, payload: defaultTraits });
  }, []);

  const setAllTraits = useCallback((allTraits) => {
    dispatch({ type: ActionTypes.SET_ALL_TRAITS, payload: allTraits });
  }, []);

  const setRequiredCategories = useCallback((requiredCategories) => {
    dispatch({ type: ActionTypes.SET_REQUIRED_CATEGORIES, payload: requiredCategories });
  }, []);

  const setRequiredTraits = useCallback((requiredTraits) => {
    dispatch({ type: ActionTypes.SET_REQUIRED_TRAITS, payload: requiredTraits });
  }, []);
  
  const setTraitTypes = useCallback((traitTypes) => {
    dispatch({ type: ActionTypes.SET_TRAIT_TYPES, payload: traitTypes });
  }, []);

  // Export character as JSON
  const exportAsJson = useCallback(() => {
    const exportData = {
      traits: state.selectedTraits.map(t => ({
        id: t.id,
        name: t.name,
        type: t.type,
        categoryId: t.categoryId,
        points: t.points,
        selectedOption: state.selectedOptions[t.id] || null
      })),
      summary: {
        pointsSpent,
        heritageCategories,
        cultureCategories,
        selectedSize,
        loadedPrebuilt: state.loadedPrebuilt
      },
      warnings: warnings.map(w => w.message),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  }, [state, pointsSpent, heritageCategories, cultureCategories, selectedSize, warnings]);

  const value = {
    // State
    selectedTraits: state.selectedTraits,
    selectedOptions: state.selectedOptions,
    loadedPrebuilt: state.loadedPrebuilt,
    ancestryName: state.ancestryName,
    
    // Computed
    pointsSpent,
    remainingPoints: 16 - pointsSpent,
    selectedTraitIds,
    heritageCategories,
    cultureCategories,
    heritageCount: heritageCategories.length,
    cultureCount: cultureCategories.length,
    selectedSize,
    warnings,
    allTraits: state.allTraits,
    requiredTraits: state.requiredTraits,
    traitTypes: state.traitTypes,
    
    // Actions
    selectTrait,
    deselectTrait,
    toggleTrait,
    setTraitOption,
    loadPrebuilt,
    setDefaults,
    setAllTraits,
    setRequiredCategories,
    setRequiredTraits,
    setTraitTypes,
    setAncestryName,
    reset,
    
    // Helpers
    isTraitSelected,
    canSelectTrait,
    canDeselectTrait,
    exportAsJson
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

// Hook to use the context
export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
}
