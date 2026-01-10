# Point-Buy System Implementation Details

## System Overview

The character builder implements a point-buy system where users have **16 points** to spend on heritage traits. The system needs to balance flexibility with the constraints defined in the ancestry creation rules.

## Core Components

### 1. Point Tracking

- **Available Points**: Track and display the 16 total heritage points
- **Spent Points**: Calculate and display points already allocated
- **Remaining Points**: Show how many points are still available

### 2. Selection Constraints

- **Ancestry Limit**: Track and enforce a maximum of 2 ancestries
- **Culture Limit**: Track and enforce a maximum of 2 cultures
- **Culture Requirement**: Ensure at least 1 culture trait is selected
- **Unique Traits**: Prevent selection of duplicate uniquely named traits

### 3. Required Traits

Some ancestry types require specific traits to be selected. The system should:
- Identify and mark required traits when an ancestry category is chosen
- Automatically select and allocate points for required traits
- Prevent deselection of required traits while the parent ancestry is selected

## User Interface Components

### 1. Point Counter

```jsx
<PointCounter 
  totalPoints={16}
  usedPoints={calculateUsedPoints(selectedTraits)}
  remainingPoints={16 - calculateUsedPoints(selectedTraits)}
/>
```

- Display prominently at the top of the trait selection interface
- Update dynamically as traits are selected/deselected
- Provide visual feedback (color changes) when approaching or exceeding point limit

### 2. Trait Selection Card

```jsx
<TraitCard
  name="Darkvision (3)"
  description="You can see in dim light within 60 feet of you as if it were bright light..."
  cost={3}
  isSelected={isTraitSelected(trait.id)}
  isRequired={isTraitRequired(trait.id, selectedAncestries)}
  canAfford={remainingPoints >= 3 || isTraitSelected(trait.id)}
  onSelect={() => selectTrait(trait)}
  onDeselect={() => deselectTrait(trait)}
/>
```

- Display trait name with cost in parentheses
- Show detailed description
- Include visual indicator for selected status
- Disable selection if point limit would be exceeded
- Highlight required traits for selected ancestries
- Display warning if a trait can't be selected due to constraints

### 3. Category Counters

```jsx
<CategoryCounter
  type="Ancestry"
  selected={selectedAncestries.length}
  maximum={2}
/>

<CategoryCounter
  type="Culture"
  selected={selectedCultures.length}
  maximum={2}
  minimum={1}
/>
```

- Track and display how many ancestries and cultures have been selected
- Provide visual feedback when approaching or reaching limits
- Show warning if minimum culture requirement not met

## Data Model

### Trait Object

```javascript
{
  id: "darkvision",
  name: "Darkvision",
  description: "You can see in dim light within 60 feet of you as if it were bright light...",
  cost: 3,
  type: "ancestry", // or "culture"
  category: "universal", // or "elemental", "fey", etc.
  subcategory: null, // for specific subcategories
  requires: [], // IDs of required traits
  incompatibleWith: [], // IDs of traits that can't be selected together
  requiredFor: [] // IDs of ancestries that require this trait
}
```

### Character Build Object

```javascript
{
  ancestryTraits: [
    // Array of selected ancestry trait objects
  ],
  cultureTraits: [
    // Array of selected culture trait objects
  ],
  pointsSpent: 14, // Calculated total
  remainingPoints: 2, // Calculated remaining
  // Other character details
}
```

## Key Functions

### 1. Point Calculation

```javascript
function calculateUsedPoints(selectedTraits) {
  return selectedTraits.reduce((total, trait) => total + trait.cost, 0);
}

function canSelectTrait(trait, selectedTraits, remainingPoints) {
  // Check if already selected
  if (selectedTraits.some(t => t.id === trait.id)) return false;
  
  // Check if can afford
  if (trait.cost > remainingPoints) return false;
  
  // Check ancestry/culture limits
  if (trait.type === 'ancestry' && 
      selectedTraits.filter(t => t.type === 'ancestry').length >= 2) return false;
  
  if (trait.type === 'culture' && 
      selectedTraits.filter(t => t.type === 'culture').length >= 2) return false;
  
  // Check incompatibilities
  if (trait.incompatibleWith.some(id => 
      selectedTraits.some(t => t.id === id))) return false;
  
  return true;
}
```

### 2. Required Trait Management

```javascript
function getRequiredTraits(selectedAncestries) {
  const requiredTraitIds = [];
  
  selectedAncestries.forEach(ancestry => {
    // Add any traits that are required for this ancestry
    if (ancestry.requiredTraits && ancestry.requiredTraits.length > 0) {
      requiredTraitIds.push(...ancestry.requiredTraits);
    }
  });
  
  return requiredTraitIds;
}

function validateSelections(selectedTraits) {
  const ancestries = selectedTraits.filter(t => t.type === 'ancestry');
  const cultures = selectedTraits.filter(t => t.type === 'culture');
  const requiredTraits = getRequiredTraits(ancestries);
  
  // Check if all required traits are selected
  const missingRequired = requiredTraits.filter(id => 
    !selectedTraits.some(t => t.id === id));
  
  // Check minimum culture requirement
  const hasCulture = cultures.length > 0;
  
  return {
    valid: missingRequired.length === 0 && hasCulture,
    missingRequired,
    hasCulture
  };
}
```

## Error Handling and User Feedback

### 1. Selection Validation Messages

- "You must select at least one Culture trait"
- "You've reached the maximum of 2 Ancestries"
- "This trait requires 3 points, but you only have 2 remaining"
- "This trait is required for your selected ancestry"
- "You can only select a uniquely named trait once"

### 2. Visual Indicators

- Green highlight for selected traits
- Red highlight for traits that can't be afforded
- Yellow highlight for required traits
- Strikethrough for traits that can't be selected due to incompatibilities

## Handling Pre-generated Ancestries

For pre-generated ancestries that don't follow standard point-buy rules:

1. Create a flag `isPregenerated` on the character build
2. When this flag is set:
   - Bypass point limit validation
   - Allow selection of traits that would normally exceed point limit
   - Still enforce other rules (trait uniqueness, etc.)
3. Provide clear UI indication that point-buy limits are being bypassed

## Edge Cases to Handle

1. **Multiple Required Traits**: If selecting an ancestry would require more points than available
2. **Deselecting a Parent Ancestry**: How to handle traits that were required by a now-deselected ancestry
3. **Trait Dependencies**: Handling traits that require other traits to be selected first
4. **Saving Incomplete Builds**: Allow saving work-in-progress with validation warnings
5. **Loading Pre-existing Builds**: Validate against current rules when loading saved builds
