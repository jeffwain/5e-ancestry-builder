import { useState, useEffect, useRef, useCallback } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { TraitTooltip } from '../TraitTooltip';
import { TraitSection } from '../TraitSection';
import { ViewToggle } from '../ViewToggle';
import { AncestryOverview } from '../AncestryOverview';
import { usePersistentState } from '../../hooks/usePersistentState';
import { STORAGE_KEYS } from '../../utils/storage';
import './Layout.css';

export function Layout({
  sections
}) {
  const {
    pointsSpent,
    selectedTraits,
    selectedOptions,
    allTraits
  } = useCharacter();

  const atBudget = pointsSpent >= 16;
  const isOverBudget = pointsSpent > 16;
  const percentage = Math.min((pointsSpent / 16) * 100, 100);

  // Track scroll state for sticky bar and section headers
  const [isScrolled, setIsScrolled] = useState(false);
  const toolbarRef = useRef(null);
  const stickyOffset = 56; // ~3.5rem - where section headers stick

  // Create refs and signals dynamically for each section
  const sectionRefs = useRef({});
  const [sectionSignals, setSectionSignals] = useState({});

  // Initialize signals for each section based on settings
  useEffect(() => {
    if (sections.length > 0 && Object.keys(sectionSignals).length === 0) {
      const initialSignals = {};
      sections.forEach((section) => {
        // Use expandCategories setting, default to false if not specified
        const shouldExpand = section.settings?.expandCategories ?? false;
        initialSignals[section.id] = { expanded: shouldExpand, version: 0 };
      });
      setSectionSignals(initialSignals);
    }
  }, [sections, sectionSignals]);

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

  // Expand all categories in a section
  const expandAll = (sectionId) => {
    setSectionSignals(prev => ({
      ...prev,
      [sectionId]: {
        expanded: true,
        version: (prev[sectionId]?.version || 0) + 1
      }
    }));
  };

  // Collapse all categories in a section
  const collapseAll = (sectionId) => {
    setSectionSignals(prev => ({
      ...prev,
      [sectionId]: {
        expanded: false,
        version: (prev[sectionId]?.version || 0) + 1
      }
    }));
  };

  // View toggle state (persisted across reloads)
  const [traitsView, setTraitsView] = usePersistentState(STORAGE_KEYS.builderView, 'card');

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
              {selectedTraits.map((trait) => {
                // Check if trait exists in the main database (can be navigated to)
                const isInDatabase = !!allTraits[trait.id];
                const handleClick = isInDatabase 
                  ? () => scrollToTrait(trait.id) 
                  : undefined;
                
                return (
                  <TraitTooltip
                    key={trait.id}
                    trait={trait}
                    selectedOptions={selectedOptions}
                    onClick={handleClick}
                    className="pill-wrapper"
                  >
                    <span className={`pill trait ${!isInDatabase ? 'custom' : ''}`}>
                      {getTraitPillLabel(trait, selectedOptions)}
                    </span>
                  </TraitTooltip>
                );
              })}
              {selectedTraits.length === 0 && (
                <span className="no-pills">None selected</span>
              )}
            </div>

            {/* View toggle (list / grid) */}
            <div className="toolbar-actions">
              <ViewToggle
                isListView={traitsView === 'list'}
                onToggle={toggleTraitsView}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`ancestries-two-col ${traitsView === 'list' ? 'list-view' : 'grid-view'}`}>
        <main className={`main flexcol ${atBudget ? 'at-budget' : ''} ${traitsView}-view`}>
          {/* Dynamically render all sections */}
          {sections.map((section) => {
            // Create or get ref for this section
            if (!sectionRefs.current[section.id]) {
              sectionRefs.current[section.id] = { current: null };
            }

            return (
              <TraitSection
                key={section.id}
                sectionRef={(el) => (sectionRefs.current[section.id].current = el)}
                name={section.name}
                type={section.id}
                description={section.description}
                categories={section.categories}
                settings={section.settings}
                expandSignal={sectionSignals[section.id]}
                expandAll={() => expandAll(section.id)}
                collapseAll={() => collapseAll(section.id)}
                scrollToSectionTop={() => scrollToSectionTop(sectionRefs.current[section.id])}
              />
            );
          })}
        </main>

        {/* Inline preview — replaces the old Summary modal */}
        <aside className="ancestries-summary-col">
          <AncestryOverview showHeader={true} showFooter={true} />
        </aside>
      </div>
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
