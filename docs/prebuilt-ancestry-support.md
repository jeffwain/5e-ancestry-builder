# Pre-built Ancestry Support Implementation

## Overview

Based on the "Returned" ancestry example, pre-built ancestries have a more complex structure than custom point-buy ancestries. They include:

1. Base traits shared by all forms of the ancestry
2. Multiple form variations with unique traits
3. Traits with specific point costs that would typically exceed the 16-point limit
4. Rich descriptions and flavor text
5. References to spells and other game mechanics

## Data Model

### Pre-built Ancestry Object

```javascript
{
  id: "returned",
  name: "Returned",
  description: "Occasionally souls or spirits may return to Eora for reasons unknown...",
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
      description: "You are a Construct. You don't need to eat, drink, or breathe...",
      cost: 4,
      type: "ancestry"
    },
    {
      id: "vigilant-rest",
      name: "Vigilant Rest",
      description: "When you take a long rest, you can spend at least six hours in an inactive...",
      cost: 2,
      type: "ancestry"
    }
  ],
  forms: [
    {
      id: "ghost-form",
      name: "Ghost Form",
      description: "These Returned generally try to appear as humanoid as possible...",
      traits: [
        {
          id: "telepathy",
          name: "Telepathy",
          description: "You can speak telepathically to any creature within 30 feet of you...",
          cost: 5,
          type: "ancestry"
        },
        // Additional traits...
      ]
    },
    // Additional forms...
  ]
}
```

## Implementation Components

### 1. Pre-built Ancestry Selection Screen

Create a dedicated screen for selecting pre-built ancestries:

```jsx
const PrebuiltAncestrySelection = () => {
  const [selectedAncestry, setSelectedAncestry] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const { prebuiltAncestries, loading, error } = usePrebuiltAncestries();
  
  // Handle ancestry selection
  const handleSelectAncestry = (ancestry) => {
    setSelectedAncestry(ancestry);
    setSelectedForm(null); // Reset form selection
  };
  
  // Handle form selection
  const handleSelectForm = (form) => {
    setSelectedForm(form);
  };
  
  // Handle final confirmation
  const handleConfirm = () => {
    if (!selectedAncestry || !selectedForm) return;
    
    // Combine base traits with form-specific traits
    const allTraits = [
      ...selectedAncestry.baseTraits,
      ...selectedForm.traits
    ];
    
    // Dispatch action to add pre-built ancestry
    dispatch({
      type: 'SET_PREBUILT_ANCESTRY',
      payload: {
        ancestry: selectedAncestry,
        form: selectedForm,
        traits: allTraits,
        isPrebuilt: true
      }
    });
    
    // Navigate to next step
    navigate('/character-builder/next-step');
  };
  
  if (loading) return <div>Loading ancestries...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Select a Pre-built Ancestry</h2>
      
      {/* Ancestry Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {prebuiltAncestries.map(ancestry => (
          <AncestryCard 
            key={ancestry.id}
            ancestry={ancestry}
            isSelected={selectedAncestry?.id === ancestry.id}
            onSelect={() => handleSelectAncestry(ancestry)}
          />
        ))}
      </div>
      
      {/* Form Selection (only shown if an ancestry is selected) */}
      {selectedAncestry && (
        <>
          <h3 className="text-lg font-semibold mb-2">Select a Form</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {selectedAncestry.forms.map(form => (
              <FormCard 
                key={form.id}
                form={form}
                isSelected={selectedForm?.id === form.id}
                onSelect={() => handleSelectForm(form)}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Traits Preview (only shown if both ancestry and form are selected) */}
      {selectedAncestry && selectedForm && (
        <TraitsPreview 
          baseTraits={selectedAncestry.baseTraits}
          formTraits={selectedForm.traits}
        />
      )}
      
      {/* Confirmation Button */}
      <button
        onClick={handleConfirm}
        disabled={!selectedAncestry || !selectedForm}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        Confirm Selection
      </button>
    </div>
  );
};
```

### 2. Pre-built Ancestry and Form Cards

Create UI components to display ancestries and their forms:

```jsx
const AncestryCard = ({ ancestry, isSelected, onSelect }) => {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <h3 className="font-bold text-lg">{ancestry.name}</h3>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
        {ancestry.description}
      </p>
      <div className="mt-2 text-xs text-gray-500">
        {ancestry.forms.length} form{ancestry.forms.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

const FormCard = ({ form, isSelected, onSelect }) => {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <h3 className="font-bold">{form.name}</h3>
      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
        {form.description}
      </p>
      <div className="mt-2 text-xs text-gray-500">
        {form.traits.length} unique trait{form.traits.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
```

### 3. Traits Preview Component

Create a component to preview the traits of a selected ancestry and form:

```jsx
const TraitsPreview = ({ baseTraits, formTraits }) => {
  // Calculate total point cost (for display purposes)
  const totalCost = [...baseTraits, ...formTraits].reduce(
    (sum, trait) => sum + trait.cost, 
    0
  );
  
  return (
    <div className="mt-6 border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Traits Preview</h3>
        <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
          Total Cost: {totalCost} points 
          {totalCost > 16 && " (exceeds normal limit)"}
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Base Traits:</h4>
        <ul className="space-y-2">
          {baseTraits.map(trait => (
            <TraitItem key={trait.id} trait={trait} />
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Form Traits:</h4>
        <ul className="space-y-2">
          {formTraits.map(trait => (
            <TraitItem key={trait.id} trait={trait} />
          ))}
        </ul>
      </div>
    </div>
  );
};

const TraitItem = ({ trait }) => {
  return (
    <li className="border-b pb-2">
      <div className="flex justify-between">
        <span className="font-medium">{trait.name}</span>
        <span className="text-sm text-gray-500">({trait.cost} pts)</span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{trait.description}</p>
    </li>
  );
};
```

### 4. Integration with Character Context

Update your character context to handle pre-built ancestries:

```javascript
// In CharacterContext.jsx

const initialState = {
  // ...other properties
  isPrebuilt: false,
  prebuiltAncestry: null,
  prebuiltForm: null,
  // ...
};

function characterReducer(state, action) {
  switch (action.type) {
    // ...existing cases
    
    case 'SET_PREBUILT_ANCESTRY':
      return {
        ...state,
        selectedTraits: action.payload.traits,
        isPrebuilt: true,
        prebuiltAncestry: action.payload.ancestry,
        prebuiltForm: action.payload.form
      };
      
    // ...
  }
}
```

### 5. Modify Point-Buy Validation for Pre-built Ancestries

Update the validation logic to bypass point limits for pre-built ancestries:

```javascript
function validateTraitSelection(trait, character) {
  // If using a pre-built ancestry, bypass point validation
  if (character.isPrebuilt) {
    // Only validate trait uniqueness
    if (character.selectedTraits.some(t => t.id === trait.id)) {
      return { valid: false, reason: 'This trait is already selected' };
    }
    return { valid: true };
  }
  
  // Regular point-buy validation
  const pointsSpent = character.selectedTraits.reduce(
    (sum, t) => sum + t.cost, 
    0
  );
  
  if (pointsSpent + trait.cost > 16) {
    return { 
      valid: false, 
      reason: `Not enough points (${16 - pointsSpent} remaining, ${trait.cost} needed)` 
    };
  }
  
  // Other validation rules...
  
  return { valid: true };
}
```

### 6. Character Sheet Output Modifications

Modify the character sheet output to properly display pre-built ancestry information:

```jsx
const CharacterSheet = ({ character }) => {
  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Character Sheet</h2>
        {character.isPrebuilt && (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded inline-block">
            Pre-built Ancestry: {character.prebuiltAncestry.name} 
            ({character.prebuiltForm.name})
          </div>
        )}
      </div>
      
      {/* Traits Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Traits</h3>
        
        {character.isPrebuilt ? (
          // Display for pre-built ancestry
          <>
            <div className="mb-4">
              <h4 className="font-medium">Base {character.prebuiltAncestry.name} Traits</h4>
              <TraitsList traits={character.prebuiltAncestry.baseTraits} />
            </div>
            
            <div>
              <h4 className="font-medium">{character.prebuiltForm.name} Traits</h4>
              <TraitsList traits={character.prebuiltForm.traits} />
            </div>
          </>
        ) : (
          // Display for custom ancestry
          <>
            <div className="mb-4">
              <h4 className="font-medium">Ancestry Traits</h4>
              <TraitsList 
                traits={character.selectedTraits.filter(t => t.type === 'ancestry')} 
              />
            </div>
            
            <div>
              <h4 className="font-medium">Culture Traits</h4>
              <TraitsList 
                traits={character.selectedTraits.filter(t => t.type === 'culture')} 
              />
            </div>
          </>
        )}
      </div>
      
      {/* Additional character sheet sections */}
    </div>
  );
};
```

## Data Extraction from Notion

To populate the pre-built ancestries from Notion, you'll need to structure your database to support the complex forms:

1. Create a main "Ancestries" database with:
   - Name
   - Description
   - Base traits (as a relation to a Traits database)

2. Create a "Forms" database with:
   - Name
   - Description
   - Parent Ancestry (relation to Ancestries)
   - Form traits (relation to Traits)
   - Form image (optional)

3. Create a "Traits" database with:
   - Name
   - Description
   - Cost
   - Type (ancestry/culture)
   - Category
   - Related spells/abilities

When fetching from the API, you'll need to:

1. Fetch all ancestries
2. For each ancestry, fetch related forms
3. For each ancestry and form, fetch related traits
4. Construct the nested data structure shown in the data model above

## Spell and Ability References

For handling spell and ability references:

1. Create a "Spells" database in Notion
2. Store spell details (name, description, level, etc.)
3. When displaying trait descriptions, parse for spell references and make them interactive (e.g., show spell details on hover or click)

Example of a spell reference component:

```jsx
const SpellReference = ({ spellId }) => {
  const { spells } = useSpells();
  const spell = spells.find(s => s.id === spellId);
  
  if (!spell) return <span className="text-blue-600">{spellId}</span>;
  
  return (
    <span 
      className="text-blue-600 cursor-help underline"
      data-tooltip-id={`spell-${spellId}`}
    >
      {spell.name}
      <Tooltip id={`spell-${spellId}`} className="max-w-sm">
        <div>
          <h4 className="font-bold">{spell.name}</h4>
          <div className="text-xs text-gray-500">
            {spell.level > 0 ? `Level ${spell.level}` : 'Cantrip'}
          </div>
          <p className="mt-1">{spell.description}</p>
        </div>
      </Tooltip>
    </span>
  );
};
```

## Navigation Flow

Here's the recommended navigation flow for including pre-built ancestries:

1. Start with a choice between "Custom Ancestry" or "Pre-built Ancestry"
2. If "Pre-built Ancestry" is chosen:
   a. Show the pre-built ancestry selection screen
   b. After selection, skip the point-buy steps and proceed to the next character creation steps
3. If "Custom Ancestry" is chosen:
   a. Show the standard point-buy interface
   b. Enforce the 16-point limit and ancestry/culture restrictions
