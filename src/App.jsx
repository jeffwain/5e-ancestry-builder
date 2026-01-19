import { useState, useEffect } from 'react';
import { CharacterProvider, useCharacter } from './contexts/CharacterContext';
import { useTraitData } from './hooks/useTraitData';
import { Layout } from './components/Layout';
import { SummaryPanel } from './components/SummaryPanel';

function AppContent() {
  const { 
    coreSection,
    heritageSection, 
    cultureSection, 
    prebuiltAncestries,
    allTraits,
    defaultTraits,
    requiredCategories,
    requiredTraits,
    loading, 
    error 
  } = useTraitData();
  
  const { setDefaults, setAllTraits, setRequiredCategories, setRequiredTraits, selectedTraits } = useCharacter();
  const [showSummary, setShowSummary] = useState(false);

  // Set all traits and required categories when data loads
  useEffect(() => {
    if (allTraits && Object.keys(allTraits).length > 0) {
      setAllTraits(allTraits);
    }
  }, [allTraits, setAllTraits]);

  useEffect(() => {
    if (requiredCategories?.length > 0) {
      setRequiredCategories(requiredCategories);
    }
  }, [requiredCategories, setRequiredCategories]);

  useEffect(() => {
    if (requiredTraits && Object.keys(requiredTraits).length > 0) {
      setRequiredTraits(requiredTraits);
    }
  }, [requiredTraits, setRequiredTraits]);

  // Auto-select default traits when data loads
  useEffect(() => {
    if (defaultTraits?.length > 0 && selectedTraits.length === 0) {
      setDefaults(defaultTraits);
    }
  }, [defaultTraits, setDefaults, selectedTraits.length]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-xl)',
        color: 'var(--color-ink-600)'
      }}>
        Loading ancestry data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: 'var(--space-8)',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
          Error Loading Data
        </h2>
        <p style={{ color: 'var(--color-ink-600)' }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <Layout 
        coreSection={coreSection}
        heritageSection={heritageSection}
        cultureSection={cultureSection}
        prebuiltAncestries={prebuiltAncestries}
        allTraits={allTraits}
        onShowSummary={() => setShowSummary(true)}
      />
      <SummaryPanel 
        isOpen={showSummary} 
        onClose={() => setShowSummary(false)} 
      />
    </>
  );
}

function App() {
  return (
    <CharacterProvider>
      <AppContent />
    </CharacterProvider>
  );
}

export default App;
