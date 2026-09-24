import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCharacter } from '../contexts/CharacterContext';
import { AncestrySummary } from '../components/AncestrySummary';
import { BuilderFilters } from '../components/BuilderFilters';
import { BuilderToolbar } from '../components/BuilderToolbar';
import { TraitBlock } from '../components/TraitBlock';
import { useAncestryActions } from '../hooks/useAncestryActions';
import { groupTraitsByType, POINT_BUDGET } from '../utils/traitDisplay';
import './BuilderTextPage.css';

/**
 * The builder as blocks of prose rather than a grid of cards.
 *
 * Same build as /builder — both read and write the one CharacterContext, so a
 * trait picked here is picked there. What differs is the reading: each trait
 * category is a two-column block, and each trait a sentence you click.
 */
export function BuilderTextPage({ sections = [] }) {
  const {
    selectedTraits,
    selectedOptions,
    pointsSpent,
    ancestryName,
    setAncestryName,
    warnings,
    traitTypes,
    deselectTrait,
    canDeselectTrait,
    allTraits,
  } = useCharacter();

  const { handleExport, handleCopy, handleReset } = useAncestryActions();

  const isOverBudget = pointsSpent > POINT_BUDGET;

  const [search, setSearch] = useState('');
  const toolbarRef = useRef(null);
  const pageRef = useRef(null);
  const term = search.trim().toLowerCase();

  // The sticky sidebar has to clear the sticky toolbar, whose height changes as
  // trait pills and chip rows wrap — so measure it rather than guess.
  useEffect(() => {
    const toolbar = toolbarRef.current;
    const page = pageRef.current;
    if (!toolbar || !page) return;

    const apply = () => {
      page.style.setProperty('--builder-text-toolbar-height', `${toolbar.offsetHeight}px`);
    };
    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);

  // One pass over the data gives the page its blocks, the chip row its enabled
  // state and the search box its count — all from the same match, so they can
  // never disagree about what is showing.
  const { visibleSections, chipGroups, matchCount, totalCount } = useMemo(() => {
    const visible = [];
    const chips = [];
    let matched = 0;
    let total = 0;

    for (const section of sections) {
      const categories = [];
      const sectionChips = [];

      for (const [categoryId, category] of Object.entries(section.categories || {})) {
        const traits = category.traits || [];
        const hits = term ? traits.filter((trait) => traitMatches(trait, term)) : traits;

        total += traits.length;
        matched += hits.length;

        sectionChips.push({ id: categoryId, name: category.name, matches: hits.length > 0 });
        if (hits.length > 0) {
          categories.push([categoryId, { ...category, traits: hits }]);
        }
      }

      if (sectionChips.length > 0) {
        chips.push({ type: section.id, typeName: section.name, categories: sectionChips });
      }
      if (categories.length > 0) {
        visible.push({ ...section, categoryEntries: categories });
      }
    }

    return { visibleSections: visible, chipGroups: chips, matchCount: matched, totalCount: total };
  }, [sections, term]);

  // Chips are navigation, not a filter — they scroll their block under the
  // toolbar and leave the rest of the page alone.
  const scrollToCategory = useCallback((categoryId) => {
    const block = document.querySelector(`[data-category-id="${categoryId}"]`);
    if (!block) return;
    const toolbarHeight = toolbarRef.current?.offsetHeight || 60;
    const blockTop = block.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: blockTop - toolbarHeight - 16, behavior: 'smooth' });
  }, []);

  // The sidebar groups what you have chosen by trait type, the same grouping
  // the card builder's overview uses.
  const summarySections = useMemo(
    () => groupTraitsByType(selectedTraits, traitTypes).map((group) => ({
      key: group.name,
      title: group.name,
      traits: group.traits.map((trait) => ({
        key: trait.id,
        trait,
        selectedOptions,
      })),
    })),
    [selectedTraits, traitTypes, selectedOptions]
  );

  const traitName = (id) => allTraits[id]?.name || id;

  // Both directions of the requirement graph, so the sidebar can say why a
  // trait is there and why it may not be removable.
  const renderTraitMeta = (trait) => {
    const requiredBy = selectedTraits
      .filter((other) => other.id !== trait.id && other.requires?.includes(trait.id))
      .map((other) => other.name);

    return (
      <>
        {trait.requires?.length > 0 && (
          <span className="pill requirement met">
            Requires {trait.requires.map(traitName).join(', ')}
          </span>
        )}
        {requiredBy.length > 0 && (
          <span className="pill requirement met">
            Required by {requiredBy.join(', ')}
          </span>
        )}
      </>
    );
  };

  const renderTraitActions = (trait) => {
    const { canDeselect, reason } = canDeselectTrait(trait);
    if (!canDeselect) return null;
    return (
      <button
        type="button"
        className="summary-trait-action ancestry-summary-clear"
        onClick={() => deselectTrait(trait.id)}
        title={reason || `Remove ${trait.name}`}
        aria-label={`Remove ${trait.name}`}
      >
        &times;
      </button>
    );
  };

  const summaryHeader = (
    <>
      <div className="ancestry-summary-header">
        <div className="ancestry-summary-points">
          <span className="ancestry-summary-field-label">Points</span>
          <span className={`ancestry-summary-points-value${isOverBudget ? ' over' : ''}`}>
            {pointsSpent}
            <span className="ancestry-summary-points-total"> of {POINT_BUDGET}</span>
          </span>
        </div>
        <div className="ancestry-summary-name">
          <label className="ancestry-summary-field-label" htmlFor="builder-text-name">
            Name
          </label>
          <input
            type="text"
            id="builder-text-name"
            className="ancestry-summary-name-input"
            value={ancestryName}
            onChange={(e) => setAncestryName(e.target.value)}
            placeholder="Custom Ancestry"
          />
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="ancestry-summary-warnings">
          {warnings.map((warning, i) => (
            <div key={i} className={`ancestry-summary-warning ${warning.severity}`}>
              {warning.severity === 'warning' ? '⚠' : 'ℹ'} {warning.message}
            </div>
          ))}
        </div>
      )}
    </>
  );

  const summaryFooter = (
    <div className="ancestry-summary-footer">
      <button className="btn btn-secondary" onClick={handleReset}>
        Reset
      </button>
      <div className="ancestry-summary-export">
        <button className="btn btn-secondary" onClick={handleCopy}>
          Copy JSON
        </button>
        <button className="btn btn-primary" onClick={handleExport}>
          Export JSON
        </button>
      </div>
    </div>
  );

  return (
    <div className="builder-text-page" ref={pageRef}>
      <BuilderToolbar
        toolbarRef={toolbarRef}
        below={
          <BuilderFilters
            search={search}
            onSearchChange={setSearch}
            groups={chipGroups}
            onSelectCategory={scrollToCategory}
            matchCount={matchCount}
            totalCount={totalCount}
          />
        }
      />

      <div className="ancestries-page">
        <div className="ancestries-two-col">
          <div className="ancestries-browse">
            {visibleSections.map((section) => (
              <section key={section.id} className="ancestry-category">
                <div className="category-header">
                  <h2>{section.name}</h2>
                  {section.description && (
                    <p className="category-desc">{section.description}</p>
                  )}
                </div>

                {section.categoryEntries.map(([categoryId, category]) => (
                  <TraitBlock
                    key={categoryId}
                    category={category}
                    categoryId={categoryId}
                    type={section.id}
                  />
                ))}
              </section>
            ))}

            {visibleSections.length === 0 && (
              <p className="builder-text-empty">
                No traits match “{search.trim()}”.
              </p>
            )}
          </div>

          <div className="ancestries-summary-col">
            <AncestrySummary
              title={ancestryName || 'Custom Ancestry'}
              header={summaryHeader}
              footer={summaryFooter}
              sections={summarySections}
              emptyMessage="No traits selected yet."
              showTraitMeta
              renderTraitMeta={renderTraitMeta}
              renderTraitActions={renderTraitActions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// A trait matches on its name, its rules text or its key — and on its options,
// which are visible text on this page and are often what you are looking for
// ("ember" lives in an option, not in the trait name).
function traitMatches(trait, term) {
  const parts = [trait.name, trait.description, trait.id, trait.chooseOne];
  for (const option of trait.options || []) {
    parts.push(option.name, option.description, option.id);
  }
  return parts.some((part) => part && String(part).toLowerCase().includes(term));
}
