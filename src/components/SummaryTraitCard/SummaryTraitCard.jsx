import ReactMarkdown from 'react-markdown';
import './SummaryTraitCard.css';

// Reusable trait card for summary views (SummaryPanel, AncestryCard, etc.)
// Shows trait name, cost, description, and optionally footer metadata
export function SummaryTraitCard({ 
  trait, 
  showFooter = true,
  className = ''
}) {
  const {
    name,
    description,
    summary,
    points,
    optionDescription,
    sourceTrait,
    categoryName,
    restriction
  } = trait;

  const getPointsLabel = (pts) => {
    if (pts === 0) return 'Free';
    if (pts === undefined || pts === null) return null;
    if (pts === 1) return '1 pt';
    return `${pts} pts`;
  };

  const pointsLabel = getPointsLabel(points);

  return (
    <div className={`summary-trait-card ${className}`}>
      <div className="summary-trait-header">
        <span className="summary-trait-name">{name}</span>
        {pointsLabel && (
          <span className={`pill cost ${points === 0 ? 'free' : ''}`}>
            {pointsLabel}
          </span>
        )}
      </div>

      {/* Show summary if available, otherwise full description */}
      <div className="summary-trait-description">
        <ReactMarkdown>{summary || description}</ReactMarkdown>
      </div>

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
            <span className="summary-trait-category">{categoryName}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Helper to transform a raw trait + selectedOptions into display format
// If trait has an option selected:
//   - Default: Shows "TraitName (OptionName)"
//   - Override: If trait.nameOverride is set (from prebuilt ancestry), use that instead
//   - Overrides for description/summary/points from ancestry definition are respected
export function getDisplayTrait(trait, selectedOptions = {}) {
  console.log('getDisplayTrait called:', {
    traitId: trait?.id,
    traitName: trait?.name,
    requiresOption: trait?.requiresOption,
    hasOptions: trait?.hasOptions,
    hasOptionsArray: !!trait?.options,
    selectedOptionId: selectedOptions?.[trait?.id],
    allSelectedOptions: selectedOptions
  });

  const hasOptionSelected = (trait.requiresOption || trait.hasOptions) &&
    trait.options &&
    selectedOptions[trait.id];
  console.log('hasOptionSelected:', hasOptionSelected);

  if (hasOptionSelected) {
    const option = trait.options.find(o => o.id === selectedOptions[trait.id]);
    if (option) {
      // Name priority: nameOverride (ancestry) > "TraitName (OptionName)" format
      const displayName = trait.nameOverride || `${trait.name} (${option.name})`;
      window.console.log('displayName', displayName);

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
        sourceTrait: null, // Don't show source since name already includes context
        points: displayPoints,
        categoryName: trait.categoryName,
        restriction: trait.restriction?.label || trait.restriction
      };
    }
  }

  // No option selected or not an option trait - return original
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
