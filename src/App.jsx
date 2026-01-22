import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CharacterProvider, useCharacter } from './contexts/CharacterContext';
import { useTraitData } from './hooks/useTraitData';
import { TabNavigation } from './components/TabNavigation';
import { Layout } from './components/Layout';
import { SummaryPanel } from './components/SummaryPanel';
import { LandingPage, AncestriesPage, OverviewPage } from './pages';

function AppContent() {
  const {
    sections,
    prebuiltAncestries,
    allTraits,
    defaultTraits,
    requiredCategories,
    requiredTraits,
    loading,
    error
  } = useTraitData();

  const {
    setDefaults,
    setAllTraits,
    setRequiredCategories,
    setRequiredTraits,
    selectedTraits,
    loadPrebuilt
  } = useCharacter();

  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);

  // Determine if user has customized their ancestry (for showing Overview tab)
  const hasCustomAncestry = selectedTraits.length > 0;

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

  // Handle "Use" - load ancestry+archetype traits and navigate to Overview
  const handleUseAncestry = ({ ancestry, archetype, traits, options = {} }) => {
    const prebuiltId = `${ancestry.id}-${archetype.id}`;
    const ancestryName = `${ancestry.name} (${archetype.name})`;
    loadPrebuilt(prebuiltId, traits, options, ancestryName);
    navigate('/overview');
  };

  // Handle "Customize" - load ancestry+archetype traits and navigate to Builder
  const handleCustomizeAncestry = ({ ancestry, archetype, traits, options = {} }) => {
    const prebuiltId = `${ancestry.id}-${archetype.id}`;
    const ancestryName = `${ancestry.name} (${archetype.name})`;
    loadPrebuilt(prebuiltId, traits, options, ancestryName);
    navigate('/builder');
  };

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
    <div className="app">
      <TabNavigation hasCustomAncestry={hasCustomAncestry} />

      <main className="app-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/ancestries"
            element={
              <AncestriesPage
                allTraits={allTraits}
                onUse={handleUseAncestry}
                onCustomize={handleCustomizeAncestry}
              />
            }
          />
          <Route
            path="/builder"
            element={
              <Layout
                sections={sections}
                onShowSummary={() => setShowSummary(true)}
              />
            }
          />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <SummaryPanel
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
      />

      <footer className="app-footer">
        <p>5e Ancestry Builder — Point-buy character ancestry system</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CharacterProvider>
        <AppContent />
      </CharacterProvider>
    </BrowserRouter>
  );
}

export default App;
