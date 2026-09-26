import { useEffect, useMemo, useRef, useState } from 'react';
import { useCharacter } from '../contexts/CharacterContext';
import { BuilderFilters } from '../components/BuilderFilters';
import { BuilderSummary } from '../components/BuilderSummary';
import { BuilderToolbar } from '../components/BuilderToolbar';
import { TraitBlock } from '../components/TraitBlock';
import { POINT_BUDGET } from '../utils/traitDisplay';
import './BuilderPage.css';

/**
 * The ancestry builder. Each trait category is a two-column block and each
 * trait a sentence you click; the build itself lives in CharacterContext.
 */
export function BuilderPage({ sections = [] }) {
  const { isTraitSelected, selectedTraits, remainingPoints, pointsSpent, ancestryName } = useCharacter();

  const [search, setSearch] = useState('');
  const [showChosen, setShowChosen] = useState(false);
  const [cost, setCost] = useState('any');
  const [category, setCategory] = useState('');
  const toolbarRef = useRef(null);
  const pageRef = useRef(null);
  const term = search.trim().toLowerCase();

  // The sticky sidebar has to clear the sticky toolbar, whose height changes as
  // the chosen list and filter row wrap — so measure it rather than guess.
  useEffect(() => {
    const toolbar = toolbarRef.current;
    const page = pageRef.current;
    if (!toolbar || !page) return;

    const apply = () => {
      page.style.setProperty('--builder-page-toolbar-height', `${toolbar.offsetHeight}px`);
    };
    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);

  // One pass over the data gives the page its blocks, the category menu its
  // entries and the status line its count — all from the same match, so they
  // can never disagree about what is showing.
  const { visibleSections, categoryGroups, matchCount, totalCount } = useMemo(() => {
    const visible = [];
    const groups = [];
    let matched = 0;
    let total = 0;

    const keep = (trait, categoryId) =>
      (!category || category === categoryId) &&
      (!term || traitMatches(trait, term)) &&
      (!showChosen || isTraitSelected(trait.id)) &&
      // What you already have stays in view under "What I can afford".
      (costMatches(trait, cost, remainingPoints) || (cost === 'affordable' && isTraitSelected(trait.id)));

    for (const section of sections) {
      const categories = [];
      const groupEntries = [];

      for (const [categoryId, entry] of Object.entries(section.categories || {})) {
        const traits = entry.traits || [];
        const hits = traits.filter((trait) => keep(trait, categoryId));

        total += traits.length;
        matched += hits.length;

        groupEntries.push({ id: categoryId, name: entry.name });
        if (hits.length > 0) {
          categories.push([categoryId, { ...entry, traits: hits }]);
        }
      }

      if (groupEntries.length > 0) {
        groups.push({ type: section.id, typeName: section.name, categories: groupEntries });
      }
      if (categories.length > 0) {
        visible.push({ ...section, categoryEntries: categories });
      }
    }

    return { visibleSections: visible, categoryGroups: groups, matchCount: matched, totalCount: total };
  }, [sections, term, category, showChosen, cost, remainingPoints, isTraitSelected]);

  return (
    <div className="builder-page" ref={pageRef}>
      <BuilderToolbar
        toolbarRef={toolbarRef}
        below={
          <BuilderFilters
            search={search}
            onSearchChange={setSearch}
            showChosen={showChosen}
            onShowChosenChange={setShowChosen}
            chosenCount={selectedTraits.length}
            cost={cost}
            onCostChange={setCost}
            remainingPoints={remainingPoints}
            category={category}
            onCategoryChange={setCategory}
            groups={categoryGroups}
            matchCount={matchCount}
            totalCount={totalCount}
          />
        }
      />

      <div className="ancestries-page">
        <div className="ancestries-two-col list-view">
          <div className="ancestries-browse">
            {visibleSections.map((section) => (
              <section key={section.id} className="ancestry-category">
                <div className="category-header">
                  <h2>{section.name}</h2>
                  {section.description && (
                    <p className="category-desc">{section.description}</p>
                  )}
                </div>

                {section.categoryEntries.map(([categoryId, entry]) => (
                  <TraitBlock
                    key={categoryId}
                    category={entry}
                    categoryId={categoryId}
                    type={section.id}
                  />
                ))}
              </section>
            ))}

            {visibleSections.length === 0 && (
              <p className="builder-page-empty">
                No traits match these filters.
              </p>
            )}
          </div>

          <div className="ancestries-summary-col" id="builder-summary">
            <BuilderSummary />
          </div>
        </div>
      </div>

      {/* On a phone the summary stacks below every trait, so a bar keeps the
          build in reach. Hidden on wider screens, where the summary sits beside. */}
      <div className="builder-page-bar">
        <div className="builder-page-bar-text">
          <span className="builder-page-bar-name">{ancestryName || 'Custom Ancestry'}</span>
          <span className="builder-page-bar-points">
            {selectedTraits.length} traits · {pointsSpent} of {POINT_BUDGET} points
          </span>
        </div>
        <a href="#builder-summary" className="btn btn-primary builder-page-bar-button">View build</a>
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

// A trait whose price depends on its option matches if any option does.
function costMatches(trait, cost, remainingPoints) {
  if (cost === 'any') return true;
  const prices = trait.requiresOption && trait.options?.length
    ? trait.options.map((option) => option.points || 0)
    : [trait.points || 0];
  if (cost === 'affordable') return prices.some((price) => price <= remainingPoints);
  if (cost === '4+') return prices.some((price) => price >= 4);
  return prices.some((price) => price === Number(cost));
}
