import { useRef, useCallback } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { TraitTooltip } from '../TraitTooltip';
import { POINT_BUDGET } from '../../utils/traitDisplay';
import './BuilderToolbar.css';

/**
 * The builder's sticky toolbar: budget progress, points spent, and the chosen
 * traits as a run of names — each scrolls to (and flashes) its trait.
 *
 * Anything page-specific — the builder's filters — is passed in as `below`,
 * its own row underneath, so it sticks along with the toolbar.
 *
 * `toolbarRef` is optional: pass one when the page needs the toolbar's height
 * to offset its own scrolling.
 */
export function BuilderToolbar({ toolbarRef, below = null }) {
  const { pointsSpent, selectedTraits, selectedOptions, allTraits } = useCharacter();

  const fallbackRef = useRef(null);
  const ref = toolbarRef || fallbackRef;

  const isOverBudget = pointsSpent > POINT_BUDGET;
  const percentage = Math.min((pointsSpent / POINT_BUDGET) * 100, 100);

  // Scroll to trait card when pill is clicked
  const scrollToTrait = useCallback((traitId) => {
    const traitElement = document.querySelector(`[data-trait-id="${traitId}"]`);

    if (traitElement) {
      // Land below both sticky bars: the main navigation and this toolbar.
      const navHeight = document.querySelector('.tab-navigation')?.offsetHeight || 0;
      const toolbarHeight = navHeight + (ref.current?.offsetHeight || 60);
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
    <div ref={ref} className="sticky-toolbar">
      <div className="toolbar-content">
        {/* Progress bar above points */}
        <div className="toolbar-progress">
          <div
            className={`toolbar-progress-bar ${isOverBudget ? 'over' : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="toolbar-row">
          <div className="toolbar-points">
            <span className={`points-spent ${isOverBudget ? 'over' : ''}`}>
              {pointsSpent}
            </span>
            <span className="points-total"> / {POINT_BUDGET} pts</span>
          </div>

          <div className="toolbar-chosen">
            <span className="toolbar-chosen-label">Chosen</span>
            {selectedTraits.length === 0 && (
              <span className="toolbar-chosen-empty">Nothing yet</span>
            )}
            <span className="toolbar-chosen-list">
              {selectedTraits.map((trait) => {
                // Only traits from the builder's own lists have a place to scroll to.
                const isInDatabase = !!allTraits[trait.id];
                return (
                  <TraitTooltip
                    key={trait.id}
                    trait={trait}
                    selectedOptions={selectedOptions}
                    onClick={isInDatabase ? () => scrollToTrait(trait.id) : undefined}
                    className="toolbar-chosen-item"
                  >
                    {isInDatabase ? (
                      <button type="button" className="toolbar-chosen-button">
                        {getTraitPillLabel(trait, selectedOptions)}
                      </button>
                    ) : (
                      <span className="toolbar-chosen-button">
                        {getTraitPillLabel(trait, selectedOptions)}
                      </span>
                    )}
                  </TraitTooltip>
                );
              })}
            </span>
          </div>
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
