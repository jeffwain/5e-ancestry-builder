import { useState, useEffect, useRef, useCallback } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { BuilderToolbar } from '../BuilderToolbar';
import { TraitSection } from '../TraitSection';
import { ViewToggle } from '../ViewToggle';
import { AncestryOverview } from '../AncestryOverview';
import { usePersistentState } from '../../hooks/usePersistentState';
import { STORAGE_KEYS } from '../../utils/storage';
import './Layout.css';

export function Layout({
  sections
}) {
  const { pointsSpent } = useCharacter();

  const atBudget = pointsSpent >= 16;

  // Track scroll state for the section headers (the toolbar tracks its own)
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

  return (
    <div className="layout">
      <BuilderToolbar
        toolbarRef={toolbarRef}
        actions={
          <ViewToggle
            isListView={traitsView === 'list'}
            onToggle={toggleTraitsView}
          />
        }
      />

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
