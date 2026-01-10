// Data model for handling both custom and pre-built ancestries

// Sample pre-built ancestry based on "Returned" example
const samplePrebuiltAncestry = {
  id: "returned",
  name: "Returned",
  description: "Occasionally souls or spirits may return to Eora for reasons unknown. Typically this is for unfinished business, revenge, or due to some curse or obligation their former soul made while living.",
  icon: "👻",
  isCustom: false,
  
  // Traits shared by all archetypes of this ancestry
  baseTraits: [
    {
      id: "medium-or-small-size",
      name: "Medium or Small Size",
      description: "You are a Medium or Small sized creature.",
      cost: 0,
      type: "ancestry"
    },
    {
      id: "constructed-form",
      name: "Constructed Form",
      description: "You are a Construct. You don't need to eat, drink, or breathe, and magic can't put you to sleep. You are immune to disease and have advantage on saving throws against being paralyzed.",
      cost: 4,
      type: "ancestry"
    },
    {
      id: "vigilant-rest",
      name: "Vigilant Rest",
      description: "When you take a long rest, you can spend at least six hours in an inactive, motionless state, rather than sleeping. In this state, you appear inert, but it doesn't render you unconscious, and you can see and hear as normal.",
      cost: 2,
      type: "ancestry"
    }
  ],
  
  // Different archetypes (forms) of the ancestry
  archetypes: [
    {
      id: "ghost-form",
      name: "Ghost Form",
      description: "These Returned generally try to appear as humanoid as possible, often inhabiting a form that can be hidden beneath layers of clothing and armor.",
      icon: "👻",
      traits: [
        {
          id: "telepathy",
          name: "Telepathy",
          description: "You can speak telepathically to any creature within 30 feet of you. The creature understands you only if the two of you share a language. You can speak telepathically in this way to one creature at a time.",
          cost: 5,
          type: "ancestry"
        },
        {
          id: "strange-presence",
          name: "Strange Presence",
          description: "You know the thaumaturgy cantrip.",
          cost: 2,
          type: "ancestry",
          spellRef: "thaumaturgy"
        },
        {
          id: "necrotic-resistance",
          name: "Resistance, Necrotic",
          description: "You are resistant to necrotic damage.",
          cost: 2,
          type: "ancestry"
        },
        {
          id: "traversal",
          name: "Traversal",
          description: "You can move across difficult terrain without expending extra movement if you are using your walking speed and are on the ground or floor.",
          cost: 1,
          type: "ancestry"
        }
      ]
    },
    {
      id: "poltergeist-form",
      name: "Poltergeist Form",
      description: "These Returned generally inhabit the first objects they see, and are characterized by their more chaotic, unnatural forms.",
      icon: "🪄",
      traits: [
        {
          id: "shifting-form",
          name: "Shifting Form",
          description: "When another creature grapples you or starts its turn grappling you, you can choose to use defensive features on your body to damage it. You deal damage equal to 1d4 × your Proficiency Bonus of either piercing or poison damage.",
          cost: 4,
          type: "ancestry"
        },
        {
          id: "strange-magic",
          name: "Strange Magic",
          description: "You know the sword burst, thunderous distortion, or spark of life cantrip. You can also cast this spell-like ability as a bonus action once per short rest using no components.",
          cost: 4,
          type: "ancestry",
          spellRef: ["sword-burst", "thunderous-distortion", "spark-of-life"]
        },
        {
          id: "improviser",
          name: "Improviser",
          description: "You are proficient with improvised weapons, and improvised weapons you use deal 1d6 + Dexterity or Strength modifier damage rather than the damage they normally deal, at the DM's discretion.",
          cost: 1,
          type: "ancestry"
        }
      ]
    },
    {
      id: "wildmorph-form",
      name: "Wildmorph Form",
      description: "These Returned generally inhabit naturally occurring objects such as boulders and stones, trees, or old rusted metal from a battlefield long forgotten.",
      icon: "🌲",
      traits: [
        {
          id: "hardened-form",
          name: "Hardened Form",
          description: "Due to the objects that make up your body, you are ill-suited to wearing armor. Your form provides ample protection, however; it gives you a base AC of 17 (your Dexterity modifier doesn't affect this number). You gain no benefit from wearing armor, but if you are using a shield, you can apply the shield's bonus as normal.",
          cost: 8,
          type: "ancestry"
        },
        {
          id: "strange-presence-enhanced",
          name: "Strange Presence",
          description: "You know the encode thoughts cantrip which acts the primary way that you speak as you don't have any ability to create speech-like sound. You also know the mending cantrip, which you can use on your own form to regain 1d4 + your proficiency bonus hit points. You can use this ability a number of times per day equal to your Proficiency Bonus, regaining all charges after a long rest.",
          cost: 4,
          type: "ancestry",
          spellRef: ["encode-thoughts", "mending"]
        }
      ]
    },
    {
      id: "harrower-form",
      name: "Harrower Form",
      description: "These Returned take over swarms of less sentient species they can easily control, most often insects, forming a hive mind that can act of its own accord.",
      icon: "🐝",
      imageUrl: "harrower-form.jpg",
      traits: [
        {
          id: "cantrip-stinging-insects",
          name: "Cantrip",
          description: "You know the stinging insects cantrip.",
          cost: 2,
          type: "ancestry",
          spellRef: "stinging-insects"
        },
        {
          id: "natural-magic-swarm",
          name: "Natural Magic",
          description: "Starting at 5th level, you can cast the summon swarm spell.",
          cost: 4,
          type: "ancestry",
          spellRef: "summon-swarm"
        },
        {
          id: "natural-armor",
          name: "Natural Armor",
          description: "You can calculate your AC as 13 + your Dexterity modifier. A shield's benefits apply as normal while you use your natural armor.",
          cost: 3,
          type: "ancestry"
        }
      ]
    },
    {
      id: "plasmoid-form",
      name: "Plasmoid Form",
      description: "These Returned inhabit some sort of ooze-like substance on their return, retaining its properties in their manifest form.",
      icon: "🧪",
      traits: [
        {
          id: "constructed-form-ooze",
          name: "Constructed Form",
          description: "You are a Construct and an Ooze. You don't need to eat, drink, or breathe, and magic can't put you to sleep. You are immune to disease and have advantage on saving throws against being paralyzed.",
          cost: 4,
          type: "ancestry"
        },
        {
          id: "shape-self",
          name: "Shape Self",
          description: "As an action, you can reshape your body to give yourself a head, one or two arms, one or two legs, and makeshift hands and feet, or you can revert to a limbless blob. While you have a humanlike shape, you can wear clothing and armor made for a Humanoid of your size.",
          cost: 1,
          type: "ancestry"
        },
        {
          id: "amorphous",
          name: "Amorphous",
          description: "You have advantage on ability checks you make to initiate or escape a grapple.",
          cost: 2,
          type: "ancestry"
        },
        // Additional traits omitted for brevity
      ]
    }
  ]
};

// -------------------
// Custom Ancestry Data Model
// -------------------

// All available traits for the point-buy system
const availableTraits = {
  // Ancestry traits organized by category
  ancestry: {
    // Elemental traits
    elemental: [
      {
        id: "elemental-attunement-air",
        name: "Elemental Attunement (Air)",
        description: "You gain resistance to lightning or thunder damage. If you have darkvision, your darkvision is tinged with wisps of white. You speak primordial (auran).",
        cost: 2,
        type: "ancestry",
        category: "elemental",
        required: true
      },
      // More elemental traits...
    ],
    // More ancestry categories...
  },
  
  // Culture traits organized by category
  culture: {
    // Artisan traits
    artisan: [
      {
        id: "artisans-lore",
        name: "Artisan's Lore",
        description: "Whenever you make an Intelligence (History) check related to the origin or history of an item related to an artisan tool with which you are proficient, you are considered proficient in the History skill and add double your Proficiency Bonus to the check, instead of your normal Proficiency Bonus.",
        cost: 0,
        type: "culture",
        category: "artisan",
        required: true
      },
      // More artisan traits...
    ],
    // More culture categories...
  }
};

// Structure for a custom ancestry build
const customAncestryTemplate = {
  id: "custom",
  name: "Custom Ancestry",
  isCustom: true,
  selectedAncestryTraits: [], // Array of selected ancestry traits
  selectedCultureTraits: [], // Array of selected culture traits
  pointsSpent: 0,
  remainingPoints: 16,
  
  // Method to calculate points
  calculatePoints() {
    const total = [...this.selectedAncestryTraits, ...this.selectedCultureTraits]
      .reduce((sum, trait) => sum + trait.cost, 0);
    
    this.pointsSpent = total;
    this.remainingPoints = 16 - total;
    
    return {
      spent: this.pointsSpent,
      remaining: this.remainingPoints
    };
  },
  
  // Method to validate selection
  validateSelection(trait) {
    // Check point limit
    if (!trait.selected && trait.cost > this.remainingPoints) {
      return {
        valid: false,
        reason: `Not enough points (need ${trait.cost}, have ${this.remainingPoints})`
      };
    }
    
    // Check ancestry limit (max 2)
    if (trait.type === "ancestry" && 
        !trait.selected && 
        this.getSelectedAncestryCategories().length >= 2 &&
        !this.getSelectedAncestryCategories().includes(trait.category)) {
      return {
        valid: false,
        reason: "Maximum of 2 ancestry categories allowed"
      };
    }
    
    // Check culture limit (max 2)
    if (trait.type === "culture" && 
        !trait.selected && 
        this.getSelectedCultureCategories().length >= 2 &&
        !this.getSelectedCultureCategories().includes(trait.category)) {
      return {
        valid: false,
        reason: "Maximum of 2 culture categories allowed"
      };
    }
    
    return { valid: true };
  },
  
  // Helper methods
  getSelectedAncestryCategories() {
    return [...new Set(this.selectedAncestryTraits.map(trait => trait.category))];
  },
  
  getSelectedCultureCategories() {
    return [...new Set(this.selectedCultureTraits.map(trait => trait.category))];
  }
};

// -------------------
// Character Context Reducer
// -------------------

// Initial character state
const initialCharacterState = {
  isPrebuilt: false,
  prebuiltAncestry: null,
  prebuiltArchetype: null,
  customAncestry: { ...customAncestryTemplate }, // Deep copy
  selectedTraits: []
};

// Reducer function for character state management
function characterReducer(state, action) {
  switch (action.type) {
    case 'RESET_CHARACTER':
      return {
        ...initialCharacterState,
        customAncestry: { ...customAncestryTemplate } // Fresh copy
      };
      
    case 'SET_PREBUILT_ANCESTRY':
      return {
        ...state,
        isPrebuilt: true,
        prebuiltAncestry: action.payload.ancestry,
        prebuiltArchetype: action.payload.archetype,
        selectedTraits: action.payload.traits
      };
      
    case 'ADD_TRAIT':
      if (state.isPrebuilt) {
        // For prebuilt ancestries, simply add the trait
        return {
          ...state,
          selectedTraits: [...state.selectedTraits, action.payload]
        };
      } else {
        // For custom ancestries, add trait and update point calculations
        const trait = action.payload;
        let updatedCustomAncestry = { ...state.customAncestry };
        
        if (trait.type === 'ancestry') {
          updatedCustomAncestry.selectedAncestryTraits = [
            ...updatedCustomAncestry.selectedAncestryTraits,
            trait
          ];
        } else {
          updatedCustomAncestry.selectedCultureTraits = [
            ...updatedCustomAncestry.selectedCultureTraits,
            trait
          ];
        }
        
        // Recalculate points
        updatedCustomAncestry.calculatePoints();
        
        return {
          ...state,
          customAncestry: updatedCustomAncestry,
          selectedTraits: [
            ...updatedCustomAncestry.selectedAncestryTraits,
            ...updatedCustomAncestry.selectedCultureTraits
          ]
        };
      }
      
    case 'REMOVE_TRAIT':
      if (state.isPrebuilt) {
        // For prebuilt ancestries, simply remove the trait
        return {
          ...state,
          selectedTraits: state.selectedTraits.filter(
            trait => trait.id !== action.payload
          )
        };
      } else {
        // For custom ancestries, remove trait and update point calculations
        const traitId = action.payload;
        let updatedCustomAncestry = { ...state.customAncestry };
        
        updatedCustomAncestry.selectedAncestryTraits = 
          updatedCustomAncestry.selectedAncestryTraits.filter(
            trait => trait.id !== traitId
          );
        
        updatedCustomAncestry.selectedCultureTraits = 
          updatedCustomAncestry.selectedCultureTraits.filter(
            trait => trait.id !== traitId
          );
        
        // Recalculate points
        updatedCustomAncestry.calculatePoints();
        
        return {
          ...state,
          customAncestry: updatedCustomAncestry,
          selectedTraits: [
            ...updatedCustomAncestry.selectedAncestryTraits,
            ...updatedCustomAncestry.selectedCultureTraits
          ]
        };
      }
      
    default:
      return state;
  }
}

// Export the data models for use in the application
export {
  samplePrebuiltAncestry,
  availableTraits,
  customAncestryTemplate,
  initialCharacterState,
  characterReducer
};