import { useState, useEffect, useRef, useCallback } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { PrebuiltSelector } from '../PrebuiltSelector';
import { TraitCategory, CoreAttributeSection } from '../TraitCategory';
import { TraitTooltip } from '../TraitTooltip';
import './Layout.css';

export function Layout({ 
  coreSection,
  heritageSection, 
  cultureSection, 
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
  
  // Track scroll state for sticky bar and section headers
  const [isScrolled, setIsScrolled] = useState(false);
  const toolbarRef = useRef(null);
  const coreSectionRef = useRef(null);
  const heritageSectionRef = useRef(null);
  const cultureSectionRef = useRef(null);
  const stickyOffset = 56; // ~3.5rem - where section headers stick
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
      
      // Check if section headers are stuck - query DOM directly for reliability
      const headers = document.querySelectorAll('.layout .section-header');
      headers.forEach((header) => {
        const rect = header.getBoundingClientRect();
        // Header is "stuck" when its top is at or very close to the sticky offset
        const isStuck = rect.top <= stickyOffset + 2;
        header.classList.toggle('stuck', isStuck);
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Expansion signals: { expanded: boolean, version: number }
  const [coreSignal, setCoreSignal] = useState({ expanded: true, version: 0 });
  const [heritageSignal, setHeritageSignal] = useState({ expanded: false, version: 0 });
  const [cultureSignal, setCultureSignal] = useState({ expanded: false, version: 0 });

  // Expand all categories in a section
  const expandAll = (setSignal) => {
    setSignal(prev => ({
      expanded: true,
      version: prev.version + 1
    }));
  };

  // Collapse all categories in a section
  const collapseAll = (setSignal) => {
    setSignal(prev => ({
      expanded: false,
      version: prev.version + 1
    }));
  };

  // View toggle state
  const [traitsView, setTraitsView] = useState('card');

  const toggleTraitsView = () => {
    setTraitsView(prev => prev === 'list' ? 'card' : 'list');
  };

  // Scroll to top of a section
  const scrollToSectionTop = useCallback((sectionRef) => {
    if (sectionRef?.current) {
      const toolbarHeight = toolbarRef.current?.offsetHeight || 60;
      const elementTop = sectionRef.current.getBoundingClientRect().top + window.scrollY;
      
      window.scrollTo({
        top: elementTop - toolbarHeight - 16,
        behavior: 'smooth'
      });
    }
  }, []);

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
              <span className="pills-label">Traits</span>
              {selectedTraits.map((trait) => (
                <TraitTooltip
                  key={trait.id}
                  trait={trait}
                  selectedOptions={selectedOptions}
                  onClick={() => scrollToTrait(trait.id)}
                  className="pill-wrapper"
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
              {/* {warnings.length > 0 && (
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
              )} */}
              <button
                className="btn btn-secondary btn-icon-only btn-toggle toggle-traits-view"
                onClick={toggleTraitsView}
                data-view={traitsView}
                aria-label={traitsView === 'list' ? 'Switch to list view' : 'Switch to card view'}
                title={traitsView === 'list' ? 'Switch to list view' : 'Switch to card view'}
                dangerouslySetInnerHTML={{
                  __html: traitsView === 'list' 
                    ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM160 160L160 224L224 224L224 160L160 160zM480 160L288 160L288 224L480 224L480 160zM160 288L160 352L224 352L224 288L160 288zM480 288L288 288L288 352L480 352L480 288zM160 416L160 480L224 480L224 416L160 416zM480 416L288 416L288 480L480 480L480 416z"/></svg>'
                    : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M480 160L352 160L352 288L480 288L480 160zM544 288L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 288zM160 352L160 480L288 480L288 352L160 352zM288 288L288 160L160 160L160 288L288 288zM352 352L352 480L480 480L480 352L352 352z"/></svg>'
                }}
              />
              <button 
                className="btn btn-primary summary-btn"
                onClick={onShowSummary}
              >
                Summary
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className={`main flexcol ${atBudget ? 'at-budget' : ''} ${traitsView}-view`}>
        {/* Core Attributes Section */}
        <section ref={coreSectionRef} className="traits-section core-attributes">
          <div className="section-header flexrow">
            <h2 className="section-title">{coreSection?.name || 'Core Attributes'}</h2>
            <div className="section-header-controls">
              <div class="flexrow flex1">
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => expandAll(setCoreSignal)}
                >
                  Expand all
                </button>
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => collapseAll(setCoreSignal)}
                >
                  Collapse all
                </button>
              </div>
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => scrollToSectionTop(coreSectionRef)}
              >
                To top
              </button>
            </div>
          </div>
          {coreSection?.description && (
            <p className="section-desc">{coreSection.description}</p>
          )}
          <div className="traits-grid">
            {coreSection?.categories && Object.entries(coreSection.categories).map(([attrId, attr]) => (
              <CoreAttributeSection 
                key={attrId}
                attribute={attr}
                attributeId={attrId}
                expandSignal={coreSignal}
              />
            ))}
          </div>
        </section>

        {/* Heritage Section */}
        <section ref={heritageSectionRef} className="traits-section heritage-traits">
          <div className="section-header flexrow">
            <h2 className="section-title">{heritageSection?.name || 'Heritage Traits'}</h2>
            <div className="section-header-controls">
              <div class="flexrow flex1">
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => expandAll(setHeritageSignal)}
                >
                  Expand all
                </button>
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => collapseAll(setHeritageSignal)}
                >
                  Collapse all
                </button>
              </div>
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => scrollToSectionTop(heritageSectionRef)}
              >
                To top
              </button>
            </div>
          </div>
          {heritageSection?.description && (
            <p className="section-desc">{heritageSection.description}</p>
          )}
          <div className="traits-grid">
            {heritageSection?.categories && Object.entries(heritageSection.categories).map(([catId, category]) => (
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
        <section ref={cultureSectionRef} className="traits-section culture-traits">
          <div className="section-header flexrow">
            <h2 className="section-title">{cultureSection?.name || 'Culture Traits'}</h2>
            <div className="section-header-controls">
              <div class="flexrow flex1">
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => expandAll(setCultureSignal)}
                >
                  Expand all
                </button>
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => collapseAll(setCultureSignal)}
                >
                  Collapse all
                </button>
              </div>
              <button 
                className="btn btn-secondary btn-small"
                onClick={() => scrollToSectionTop(cultureSectionRef)}
              >
                To top
              </button>
            </div>
          </div>
          {cultureSection?.description && (
            <p className="section-desc">{cultureSection.description}</p>
          )}
          <div className="traits-grid">
            {cultureSection?.categories && Object.entries(cultureSection.categories).map(([catId, category]) => (
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
  if (trait.options && selectedOptions[trait.id]) {
    const option = trait.options.find(o => o.id === selectedOptions[trait.id]);
    if (option) {
      return option.name;
    }
  }
  return trait.name;
}
