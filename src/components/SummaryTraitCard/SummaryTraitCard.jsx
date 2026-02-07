import ReactMarkdown from 'react-markdown';
import './SummaryTraitCard.css';

// Helper to transform a raw trait + selectedOptions into display format
// If trait has an option selected:
//   - Default: Shows "TraitName (OptionName)"
//   - Override: If trait.nameOverride is set (from prebuilt ancestry), use that instead
//   - Overrides for description/summary/points from ancestry definition are respected
function getDisplayTrait(trait, selectedOptions = {}) {
  const hasOptionSelected = (trait.requiresOption || trait.hasOptions) &&
    trait.options &&
    selectedOptions[trait.id];

  if (hasOptionSelected) {
    const option = trait.options.find(o => o.id === selectedOptions[trait.id]);
    if (option) {
      // Name priority: nameOverride (ancestry) > "TraitName (OptionName)" format
      const displayName = trait.nameOverride || `${trait.name} (${option.name})`;

      // Description: descriptionOverride (ancestry) > trait description > option description
      const displayDescription = trait.descriptionOverride || trait.description;

      // Summary: summaryOverride (ancestry) > default summary
      const displaySummary = trait.summaryOverride || trait.summary;

      // Points priority: pointsOverride (ancestry) > option points > trait points
      const displayPoints = trait.pointsOverride !== undefined
        ? trait.pointsOverride
        : (option.points ?? trait.points ?? 0);

      // Show option description only if no override description/summary from ancestry
      const showOptionDescription = !trait.descriptionOverride && !trait.summaryOverride && option.description;

      return {
        id: trait.id,
        name: displayName,
        description: displayDescription,
        summary: displaySummary,
        optionDescription: showOptionDescription ? option.description : null,
        sourceTrait: null,
        points: displayPoints,
        categoryName: trait.categoryName,
        restriction: trait.restriction?.label || trait.restriction
      };
    }
  }

  // No option selected or not an option trait - return with overrides applied
  return {
    id: trait.id,
    name: trait.nameOverride || trait.name,
    description: trait.descriptionOverride || trait.description,
    summary: trait.summaryOverride || trait.summary,
    optionDescription: null,
    sourceTrait: null,
    points: trait.pointsOverride !== undefined ? trait.pointsOverride : (trait.points ?? 0),
    categoryName: trait.categoryName,
    restriction: trait.restriction?.label || trait.restriction
  };
}

// Reusable trait card for summary views (SummaryPanel, AncestryCard, etc.)
// Automatically cleans up the trait for display using getDisplayTrait
// Pass the raw trait and optionally selectedOptions for option-based traits
export function SummaryTraitCard({
  trait,
  selectedOptions = {},
  compact = false,
  showFooter = true,
  showDetails = true,
  className = ''
}) {
  // Transform trait for display
  const displayTrait = getDisplayTrait(trait, selectedOptions);

  const {
    name,
    description,
    summary,
    points,
    optionDescription,
    sourceTrait,
    categoryName,
    restriction
  } = displayTrait;

  const getPointsLabel = (pts) => {
    if (pts === 0) return 'Free';
    if (pts === undefined || pts === null) return null;
    if (pts === 1) return '1 pt';
    return `${pts} pts`;
  };

  const pointsLabel = getPointsLabel(points);

  return (
    <div className={`${compact ? 'simple-trait-card' : 'summary-trait-card'} ${className}`}>

      {showDetails === true ? (
        <>
        <div className="summary-trait-header">
          <span className="summary-trait-name">{name}</span>
          {pointsLabel && (
            <span className={`pill cost ${points === 0 ? 'free' : ''}`}>
              {pointsLabel}
            </span>
          )}
        </div>

        {/* Show summary if available, otherwise full description */}
        {(summary || description) && (
          <div className="summary-trait-description">
            <ReactMarkdown>{summary || description}</ReactMarkdown>
          </div>
        )}
        {/* Option description if this is an option-based trait */}
        {optionDescription && (
          <div className="summary-trait-option">
            <ReactMarkdown>{optionDescription}</ReactMarkdown>
          </div>
        )}      
        
        {/* Footer metadata - toggleable */}
        {showFooter && (sourceTrait || categoryName || restriction) && (
          <div className="summary-trait-footer">
            {restriction && (
              <span className="pill restriction">{restriction}</span>
            )}
            {sourceTrait && (
              <span className="summary-trait-source">From: {sourceTrait}</span>
            )}
            {categoryName && !sourceTrait && (
              <span className="pill">{categoryName}</span>
            )}
          </div>
        )}
        </>
      ) : (
        <>
          <span className="summary-trait-name">{name}.</span>
          {(summary || description) && (
            <span className="summary-trait-description">
              <ReactMarkdown>{summary || description}</ReactMarkdown>
            </span>
          )}
        </>
      )}



    </div>
  );
}

