# Trait System Implementation Plan

## Data Model Changes

### New Trait Structure
```json
{
  "id": "darkvision-60",
  "name": "Darkvision (60 ft.)",
  "description": "...",
  "points": 3,
  "requires": [],           // Trait IDs that must be selected first
  "excludes": [],           // Trait IDs that can't be selected if this is
  "requiredIf": null,       // Category ID - if any trait from this category is selected, this trait is required
  "sizeRequirement": null,  // "medium" | "small" | null
  "armorRestriction": null  // "no-medium-heavy" | null
}
```

### Category Structure
```json
{
  "coreAttributes": {
    "size": { ... },      // Must pick exactly one
    "speed": { ... },     // Base 30, can modify
    "darkvision": { ... } // Optional, mutually exclusive
  },
  "heritage": {
    "planar": {
      "elemental": { ... },
      "fey": { ... },
      "planetouched": { ... },
      "shadowborn": { ... }
    },
    "bestial": {
      "aquatic": { ... },
      "flying": { ... },
      "mammalian": { ... },
      "reptilian": { ... }
    },
    "other": {
      "construct": { ... },
      "draconic": { ... },
      "psionic": { ... },
      "stout": { ... }
    }
  },
  "culture": {
    "artisan": { ... },
    "friendly": { ... },
    "mage": { ... },
    "skirmisher": { ... },
    "streetwise": { ... },
    "survivalist": { ... },
    "theocratic": { ... },
    "warrior": { ... },
    "waterborne": { ... }
  }
}
```

## Prerequisite Rules

### Required Traits (auto-select when category chosen)
| Category | Required Trait |
|----------|----------------|
| Elemental | Elemental Attunement (pick element type) |
| Planetouched | Planar Attunement (pick celestial/fiend) |
| Draconic | Draconic Ancestry (pick damage type) |

### Trait Dependencies
| Trait | Requires |
|-------|----------|
| Fey Step Improvement | Fey Step |
| Hunter's Senses | Keen Smell |
| Greater Fey Magic | Fey Magic |
| Greater Shadow Magic | Shadow Magic |
| Greater Planar Magic | Planar Magic |

### Mutually Exclusive Traits
| Group | Traits |
|-------|--------|
| Size | Medium, Small |
| Speed Boost | Quick, Speedy |
| Darkvision | Darkvision 60ft, Superior Darkvision 120ft |
| Sturdy | Relentless, Toughness, Durable |
| Flight | Glide, Limited Flight, Wings |

### Size-Specific Traits
| Size | Available Traits |
|------|------------------|
| Medium | Powerful Build, Stout Build, Reach |
| Small | Fury of the Small, Nimble, Small Stealth |

### Armor Restrictions
| Trait | Restriction |
|-------|-------------|
| Swim Speed | No medium/heavy armor |
| Wings | No medium/heavy armor |
| Flight | No medium/heavy armor |

## UI Changes

### TraitCard States
1. **Available** - Can select (normal)
2. **Selected** - Currently selected (highlighted)
3. **Disabled** - Prerequisites not met (grayed out, tooltip explains why)
4. **Required** - Auto-selected when parent category chosen (can't deselect)
5. **Excluded** - Can't select due to conflicting trait (grayed out)

### Category Headers
- Show required trait indicator
- Show which categories count toward heritage/culture limits
- Collapse/expand functionality

### Core Attributes Section
- Size selector (radio buttons - Medium/Small)
- Speed display with modifier buttons
- Darkvision toggle with level options

## Validation Warnings

Keep as soft warnings (not blockers):
- Over 16 points
- More than 2 heritage categories
- No culture traits selected
- More than 2 culture categories

New warnings:
- Required trait not selected for category
- Size-specific trait selected without matching size

## Implementation Order

1. **Data Model** - Create comprehensive traits.json with all rules
2. **Context Logic** - Add prerequisite checking, exclusion logic
3. **UI Updates** - TraitCard disabled states, tooltips
4. **Core Attributes** - Special UI section for size/speed/darkvision
5. **Category Reorganization** - Nest heritage sub-categories properly

## Sample Traits Data

### Size Traits
```json
{
  "id": "size-medium",
  "name": "Medium Size",
  "description": "You are a Medium sized creature.",
  "points": 0,
  "category": "size",
  "excludes": ["size-small"]
},
{
  "id": "powerful-build",
  "name": "Powerful Build",
  "description": "You count as one size larger for carrying capacity.",
  "points": 1,
  "category": "size",
  "sizeRequirement": "medium"
}
```

### Prerequisite Example
```json
{
  "id": "fey-step",
  "name": "Fey Step",
  "description": "Teleport up to 30 feet as a bonus action.",
  "points": 6,
  "category": "fey"
},
{
  "id": "fey-step-improvement",
  "name": "Fey Step Improvement",
  "description": "Add seasonal effect to Fey Step.",
  "points": 2,
  "category": "fey",
  "requires": ["fey-step"]
}
```

### Required Trait Example
```json
{
  "id": "elemental-attunement",
  "name": "Elemental Attunement",
  "description": "Choose your elemental type.",
  "points": 2,
  "category": "elemental",
  "requiredIf": "elemental",
  "options": ["air", "earth", "fire", "nature", "water"]
}
```
