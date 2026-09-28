import './BuilderFilters.css';

const COST_FILTERS = [
  { value: 'any', label: 'Any cost' },
  { value: '0', label: 'Free' },
  { value: '1', label: '1 pt' },
  { value: '2', label: '2 pts' },
  { value: '3', label: '3 pts' },
  { value: '4+', label: '4+ pts' },
];

/**
 * The builder's quick filters: search, all / affordable / chosen, cost and category.
 *
 * Presentational only — the page owns every value and does the filtering, so
 * the count here always agrees with what the page shows.
 *
 * Props:
 * - search / onSearchChange
 * - show / onShowChange: 'all', 'affordable' (fits the remaining points) or 'chosen'
 * - chosenCount: how many traits are chosen, for the toggle's label
 * - cost / onCostChange: one of COST_FILTERS' values
 * - remainingPoints: shown on the 'affordable' toggle
 * - category / onCategoryChange: a category id, or '' for all of them
 * - groups: [{ type, typeName, categories: [{ id, name }] }]
 * - matchCount / totalCount: traits still showing, out of all of them
 */
export function BuilderFilters({
  search,
  onSearchChange,
  show,
  onShowChange,
  chosenCount = 0,
  cost,
  onCostChange,
  remainingPoints = 0,
  category,
  onCategoryChange,
  groups = [],
  matchCount = 0,
  totalCount = 0,
}) {
  const filtering = search.trim() || show !== 'all' || cost !== 'any' || category;

  const clearAll = () => {
    onSearchChange('');
    onShowChange('all');
    onCostChange('any');
    onCategoryChange('');
  };

  return (
    <div className="builder-filters" role="search">
      <label className="builder-filters-field builder-filters-search">
        <span className="builder-filters-label">Search</span>
        <input
          type="search"
          className="builder-filters-control"
          placeholder="Trait name, option or rules text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>

      <div className="builder-filters-field">
        <span className="builder-filters-label" id="builder-filters-show">Show</span>
        <div className="builder-filters-toggle" role="group" aria-labelledby="builder-filters-show">
          <button type="button" aria-pressed={show === 'all'} onClick={() => onShowChange('all')}>
            All traits
          </button>
          <button type="button" aria-pressed={show === 'affordable'} onClick={() => onShowChange('affordable')}>
            Can afford ({remainingPoints})
          </button>
          <button type="button" aria-pressed={show === 'chosen'} onClick={() => onShowChange('chosen')}>
            Chosen ({chosenCount})
          </button>
        </div>
      </div>

      <label className="builder-filters-field">
        <span className="builder-filters-label">Cost</span>
        <select
          className="builder-filters-control"
          value={cost}
          onChange={(e) => onCostChange(e.target.value)}
        >
          {COST_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="builder-filters-field">
        <span className="builder-filters-label">Category</span>
        <select
          className="builder-filters-control builder-filters-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All categories</option>
          {groups.map((group) => (
            <optgroup key={group.type} label={group.typeName}>
              {group.categories.map((entry) => (
                <option key={entry.id} value={entry.id}>{entry.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      {filtering && (
        <p className="builder-filters-status">
          {matchCount} of {totalCount} traits
          <button type="button" className="builder-filters-clear" onClick={clearAll}>
            Clear filters
          </button>
        </p>
      )}
    </div>
  );
}
