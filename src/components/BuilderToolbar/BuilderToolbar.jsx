import { useState, useEffect, useRef, useCallback } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { TraitTooltip } from '../TraitTooltip';
import './BuilderToolbar.css';

/**
 * The builder's sticky toolbar: budget progress, points spent, and a pill per
 * selected trait that scrolls to (and flashes) that trait in the page.
 *
 * Shared by both builder views. Anything view-specific — the card/list toggle
 * on /builder, the search and category chips on /builder-text — is passed in as
 * `actions` (at the end of the main row) or `below` (its own row underneath,
 * which means it sticks along with the toolbar).
 *
 * `toolbarRef` is optional: pass one when the page needs the toolbar's height
 * to offset its own scrolling.
 */
export function BuilderToolbar({ toolbarRef, actions = null, below = null }) {
  const { pointsSpent, selectedTraits, selectedOptions, allTraits } = useCharacter();

  const fallbackRef = useRef(null);
  const ref = toolbarRef || fallbackRef;

  const isOverBudget = pointsSpent > 16;
  const percentage = Math.min((pointsSpent / 16) * 100, 100);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to trait card when pill is clicked
  const scrollToTrait = useCallback((traitId) => {
    const traitElement = document.querySelector(`[data-trait-id="${traitId}"]`);

    if (traitElement) {
      // Get toolbar height for offset
      const toolbarHeight = ref.current?.offsetHeight || 60;
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
  }, [ref]);

  return (
    <div
      ref={ref}
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

          {actions && <div className="toolbar-actions">{actions}</div>}
        </div>

        {below}
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
