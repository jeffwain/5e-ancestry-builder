import './BuilderFilters.css';

/**
 * The block builder's search box and category jump chips.
 *
 * The two controls do different jobs on purpose: the search narrows the page
 * down to matching traits, while a chip scrolls to that category and leaves the
 * page as it is. Presentational only — the page owns the search term and does
 * the filtering.
 *
 * Props:
 * - search / onSearchChange: the current term
 * - groups: [{ type, typeName, categories: [{ id, name, matches }] }]
 * - onSelectCategory(categoryId): scroll to that block
 * - matchCount / totalCount: traits still showing, out of all of them
 */
export function BuilderFilters({
  search,
  onSearchChange,
  groups = [],
  onSelectCategory,
  matchCount = 0,
  totalCount = 0,
}) {
  const searching = search.trim().length > 0;

  return (
    <div className="builder-filters">
      <div className="builder-filters-search">
        <input
          type="search"
          className="builder-filters-input"
          placeholder="Search traits by name, text, or key…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search traits"
        />
        {searching && (
          <>
            <span className="builder-filters-count">
              {matchCount} of {totalCount}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => onSearchChange('')}
            >
              Clear
            </button>
          </>
        )}
      </div>

      <div className="builder-filters-chips">
        {groups.map((group) => (
          <div key={group.type} className="builder-filters-group">
            <span className="builder-filters-group-label">{group.typeName}</span>
            {group.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`pill type clickable ${group.type} builder-filters-chip`}
                onClick={() => onSelectCategory?.(category.id)}
                disabled={!category.matches}
                // A chip for a category the search emptied has nothing to
                // scroll to, so it dims rather than disappearing — the row
                // would otherwise reshuffle on every keystroke.
                title={category.matches ? `Go to ${category.name}` : `No matches in ${category.name}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
