import React, { useState, useEffect } from 'react';
import { useCharacterContext } from '../contexts/CharacterContext';
import { useNotionData } from '../hooks/useNotionData';

const AncestrySelectionScreen = ({ onNavigate }) => {
  const { character, dispatch } = useCharacterContext();
  const { ancestries, loading, error } = useNotionData();
  const [selectedAncestry, setSelectedAncestry] = useState(null);
  const [selectedArchetype, setSelectedArchetype] = useState(null);

  // Group ancestries by type for easier rendering
  const prebuiltAncestries = ancestries?.filter(a => !a.isCustom) || [];
  
  const handleStartCustom = () => {
    dispatch({ type: 'RESET_CHARACTER' });
    onNavigate('/character-builder/custom');
  };
  
  const handleSelectAncestry = (ancestry) => {
    setSelectedAncestry(ancestry);
    setSelectedArchetype(null);
  };
  
  const handleSelectArchetype = (archetype) => {
    setSelectedArchetype(archetype);
  };
  
  const handleConfirmSelection = () => {
    if (selectedAncestry && selectedArchetype) {
      // Combine base traits with archetype-specific traits
      const allTraits = [
        ...selectedAncestry.baseTraits,
        ...selectedArchetype.traits
      ];
      
      // Set the prebuilt ancestry in the character state
      dispatch({
        type: 'SET_PREBUILT_ANCESTRY',
        payload: {
          ancestry: selectedAncestry,
          archetype: selectedArchetype,
          traits: allTraits,
          isPrebuilt: true
        }
      });
      
      // Navigate to next step in character creation
      onNavigate('/character-builder/next-step');
    }
  };
  
  if (loading) return <div className="p-4 text-center">Loading ancestry options...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Ancestry</h1>
      
      {/* Custom Ancestry Option */}
      <div className="flex justify-center mb-8">
        <div 
          className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg text-center cursor-pointer hover:bg-blue-100 transition max-w-md w-full"
          onClick={handleStartCustom}
        >
          <div className="text-5xl mb-4">🔧</div>
          <h2 className="text-2xl font-bold mb-2">Build Custom Ancestry</h2>
          <p className="text-gray-600">
            Create your own unique ancestry using the point-buy system
            with 16 points to spend on traits.
          </p>
        </div>
      </div>
      
      {/* Divider */}
      <div className="text-center mb-8">
        <div className="inline-block border-b-2 border-gray-300 w-32"></div>
        <span className="mx-4 text-gray-500 font-semibold">OR SELECT A PRE-BUILT ANCESTRY</span>
        <div className="inline-block border-b-2 border-gray-300 w-32"></div>
      </div>
      
      {/* Pre-built Ancestries */}
      <div className="grid grid-cols-1 gap-8">
        {prebuiltAncestries.map(ancestry => (
          <div key={ancestry.id} className="border rounded-lg overflow-hidden shadow-sm">
            {/* Ancestry Header */}
            <div 
              className={`p-4 cursor-pointer transition ${
                selectedAncestry?.id === ancestry.id 
                  ? 'bg-indigo-50 border-l-4 border-l-indigo-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelectAncestry(ancestry)}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 w-16 h-16 mr-4 bg-gray-200 rounded-lg flex items-center justify-center">
                  {ancestry.icon || '🧬'}
                </div>
                <div className="flex-grow">
                  <h2 className="text-xl font-bold">{ancestry.name}</h2>
                  <p className="text-gray-600 mt-1">{ancestry.description}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <span className={`transform transition ${selectedAncestry?.id === ancestry.id ? 'rotate-90' : ''}`}>
                    ▶
                  </span>
                </div>
              </div>
            </div>
            
            {/* Expanded Ancestry Details */}
            {selectedAncestry?.id === ancestry.id && (
              <div className="bg-gray-50 p-4 border-t">
                {/* Base Traits */}
                <h3 className="font-semibold mb-3">Base Traits:</h3>
                <div className="mb-4 pl-4 border-l-2 border-gray-200">
                  {ancestry.baseTraits.map(trait => (
                    <div key={trait.id} className="mb-2">
                      <div className="font-medium">
                        {trait.name} <span className="text-sm text-gray-500">({trait.cost})</span>
                      </div>
                      <p className="text-sm text-gray-600">{trait.description}</p>
                    </div>
                  ))}
                </div>
                
                {/* Archetypes Selection */}
                <h3 className="font-semibold mb-3">Select an Archetype:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ancestry.archetypes.map(archetype => (
                    <div 
                      key={archetype.id}
                      className={`border rounded-lg p-3 cursor-pointer ${
                        selectedArchetype?.id === archetype.id 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleSelectArchetype(archetype)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 mr-3 bg-gray-200 rounded-full flex items-center justify-center">
                          {archetype.icon || '🔄'}
                        </div>
                        <div>
                          <h4 className="font-medium">{archetype.name}</h4>
                          <p className="text-xs text-gray-500">
                            {archetype.traits.length} unique traits
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Selected Archetype Details */}
                {selectedArchetype && (
                  <div className="mt-6 p-4 bg-white rounded-lg border">
                    <h3 className="font-semibold mb-3">{selectedArchetype.name} Traits:</h3>
                    <p className="text-sm text-gray-600 italic mb-3">{selectedArchetype.description}</p>
                    
                    <div className="pl-4 border-l-2 border-gray-200">
                      {selectedArchetype.traits.map(trait => (
                        <div key={trait.id} className="mb-4">
                          <div className="font-medium">
                            {trait.name} <span className="text-sm text-gray-500">({trait.cost})</span>
                          </div>
                          <p className="text-sm text-gray-600">{trait.description}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Confirmation Button */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleConfirmSelection}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Select {selectedAncestry.name} ({selectedArchetype.name})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AncestrySelectionScreen;