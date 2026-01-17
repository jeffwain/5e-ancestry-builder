import { useState, useEffect, useRef, useCallback } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { PrebuiltSelector } from '../PrebuiltSelector';
import { TraitCategory, CoreAttributeSection } from '../TraitCategory';
import { TraitTooltip } from '../TraitTooltip';
import './Layout.css';

export function Layout({ 
  coreAttributes,
  heritageCategories, 
  cultureCategories, 
  prebuiltAncestries,
  allTraits,
  onShowSummary 
}) {
  const { 
    pointsSpent, 
    selectedTraits, 
    selectedOptions,
    warnings 
  } = useCharacter();
  
  const atBudget = pointsSpent >= 16;
  const isOverBudget = pointsSpent > 16;
  const percentage = Math.min((pointsSpent / 16) * 100, 100);
  
  // Track scroll state for sticky bar
  const [isScrolled, setIsScrolled] = useState(false);
  const toolbarRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Expansion signals: { expanded: boolean, version: number }
  const [coreSignal, setCoreSignal] = useState({ expanded: true, version: 0 });
  const [heritageSignal, setHeritageSignal] = useState({ expanded: true, version: 0 });
  const [cultureSignal, setCultureSignal] = useState({ expanded: true, version: 0 });

  const toggleSection = (signal, setSignal) => {
    setSignal({
      expanded: !signal.expanded,
      version: signal.version + 1
    });
  };

  // Scroll to trait card when pill is clicked
  const scrollToTrait = useCallback((traitId) => {
    const traitElement = document.querySelector(`[data-trait-id="${traitId}"]`);
    if (traitElement) {
      // Get toolbar height for offset
      const toolbarHeight = toolbarRef.current?.offsetHeight || 60;
      const elementTop = traitElement.getBoundingClientRect().top + window.scrollY;
      
      window.scrollTo({
        top: elementTop - toolbarHeight - 16,
        behavior: 'smooth'
      });
      
      // Add a brief highlight effect
      traitElement.classList.add('highlight-flash');
      setTimeout(() => {
        traitElement.classList.remove('highlight-flash');
      }, 1500);
    }
  }, []);

  return (
    <div className="layout">
      <header className="header flexrow">
        <div className="header-content flex1">
          <h1 className="title">Custom Ancestry Builder</h1>
        </div>
        <div className="header-actions flexrow flexshrink">
          <PrebuiltSelector 
            prebuiltAncestries={prebuiltAncestries}
            allTraits={allTraits}
          />
        </div>
      </header>
      
      {/* Sticky Toolbar */}
      <div 
        ref={toolbarRef}
        className={`sticky-toolbar ${isScrolled ? 'scrolled' : ''}`}
      >
        <div className="toolbar-content">
          {/* Progress bar above points */}
          <div className="toolbar-progress">
            <div 
              className={`toolbar-progress-bar ${isOverBudget ? 'over' : ''}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          
          <div className="toolbar-row">
            {/* Points Display */}
            <div className="toolbar-points">
              <span className={`points-spent ${isOverBudget ? 'over' : ''}`}>
                {pointsSpent}
              </span>
              <span className="points-divider">/</span>
              <span className="points-total">16</span>
              <span className="points-label">pts</span>
            </div>

            {/* Selected Trait Pills - Individual traits with tooltips */}
            <div className="toolbar-pills">
              <span className="pills-label">Selected Traits</span>
              {selectedTraits.map((trait) => (
                <TraitTooltip
                  key={trait.id}
                  trait={trait}
                  selectedOptions={selectedOptions}
                  onClick={() => scrollToTrait(trait.id)}
                  className="trait-pill-wrapper"
                >
                  <span className="pill trait">
                    {getTraitPillLabel(trait, selectedOptions)}
                  </span>
                </TraitTooltip>
              ))}
              {selectedTraits.length === 0 && (
                <span className="no-pills">None selected</span>
              )}
            </div>

            {/* Warning Icon + Summary Button */}
            <div className="toolbar-actions">
              {warnings.length > 0 && (
                <div className="warning-indicator">
                  <span className="warning-icon">⚠</span>
                  <div className="warning-tooltip">
                    {warnings.map((warning, index) => (
                      <div key={index} className="warning-item">
                        {warning.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button 
                className="btn btn-primary summary-btn"
                onClick={onShowSummary}
              >
                View Summary
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className={`main flexcol ${atBudget ? 'at-budget' : ''}`}>
        {/* Core Attributes Section */}
        <section className="section">
          <h2 
            className="section-title clickable"
            onClick={() => toggleSection(coreSignal, setCoreSignal)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(coreSignal, setCoreSignal)}
          >
            Core Attributes
            <span className={`section-chevron ${coreSignal.expanded ? 'expanded' : ''}`}>▼</span>
          </h2>
          <p className="section-desc">
            Choose your size (required), and optionally enhance your speed or darkvision.
          </p>
          <div className="core-grid">
            {coreAttributes && Object.entries(coreAttributes).map(([attrId, attr]) => (
              <CoreAttributeSection 
                key={attrId}
                attribute={attr}
                attributeId={attrId}
                expandSignal={coreSignal}
              />
            ))}
          </div>
        </section>

        {/* Heritage Section - flat like culture */}
        <section className="section">
          <h2 
            className="section-title clickable"
            onClick={() => toggleSection(heritageSignal, setHeritageSignal)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(heritageSignal, setHeritageSignal)}
          >
            Heritage Traits
            <span className="section-limit">(max 2 categories)</span>
            <span className={`section-chevron ${heritageSignal.expanded ? 'expanded' : ''}`}>▼</span>
          </h2>
          <p className="section-desc">
            Choose traits from up to 2 ancestry categories representing your physical heritage.
          </p>
          <div className="heritage-grid">
            {heritageCategories && Object.entries(heritageCategories).map(([catId, category]) => (
              <TraitCategory
                key={catId}
                category={category}
                categoryId={catId}
                type="heritage"
                expandSignal={heritageSignal}
              />
            ))}
          </div>
        </section>

        {/* Culture Section */}
        <section className="section">
          <h2 
            className="section-title clickable"
            onClick={() => toggleSection(cultureSignal, setCultureSignal)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(cultureSignal, setCultureSignal)}
          >
            Culture Traits
            <span className="section-limit">(min 1, max 2 categories)</span>
            <span className={`section-chevron ${cultureSignal.expanded ? 'expanded' : ''}`}>▼</span>
          </h2>
          <p className="section-desc">
            Choose traits from 1-2 cultures representing your upbringing and training.
          </p>
          <div className="culture-grid">
            {cultureCategories && Object.entries(cultureCategories).map(([catId, category]) => (
              <TraitCategory
                key={catId}
                category={category}
                categoryId={catId}
                type="culture"
                expandSignal={cultureSignal}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>5e Ancestry Builder — Point-buy character ancestry system</p>
      </footer>
    </div>
  );
}

// Get the display label for a trait pill
function getTraitPillLabel(trait, selectedOptions) {
  // For traits with options, show the selected option name if selected
  if (trait.requiresOption && trait.options && selectedOptions[trait.id]) {
    const option = trait.options.find(o => o.id === selectedOptions[trait.id]);
    if (option) {
      return option.name;
    }
  }
  return trait.name;
}
