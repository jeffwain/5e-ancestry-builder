import { useMemo } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { AncestrySummary } from '../AncestrySummary';
import { useAncestryActions } from '../../hooks/useAncestryActions';
import { groupTraitsByType, POINT_BUDGET } from '../../utils/traitDisplay';
import './BuilderSummary.css';

/**
 * The build in progress: points, name, warnings, the chosen traits grouped by
 * type, and reset / copy / export. The builder's sidebar.
 *
 * `expanded` is the same summary as a page (the Overview): the name becomes the
 * title, the traits run as one list with their type as a tag, `intro` sits
 * above them and `actions` join the footer.
 */
export function BuilderSummary({ expanded = false, intro = null, actions = null }) {
  const {
    selectedTraits,
    selectedOptions,
    pointsSpent,
    ancestryName,
    setAncestryName,
    loadedPrebuiltName,
    warnings,
    traitTypes,
    deselectTrait,
    canDeselectTrait,
    allTraits,
  } = useCharacter();

  const { handleExport, handleCopy, handleReset } = useAncestryActions();

  const isOverBudget = pointsSpent > POINT_BUDGET;

  const sections = useMemo(() => {
    const groups = groupTraitsByType(selectedTraits, traitTypes).map((group) => ({
      key: group.name,
      title: group.name,
      traits: group.traits.map((trait) => ({
        key: trait.id,
        trait,
        selectedOptions,
      })),
    }));
    // On the page the grouping moves into each trait's tags: one list, same order.
    return expanded
      ? [{ key: 'traits', title: 'Traits', traits: groups.flatMap((group) => group.traits) }]
      : groups;
  }, [selectedTraits, traitTypes, selectedOptions, expanded]);

  const traitName = (id) => allTraits[id]?.name || id;

  // Both directions of the requirement graph, so the summary can say why a
  // trait is there and why it may not be removable.
  const renderTraitMeta = (trait) => {
    const requiredBy = selectedTraits
      .filter((other) => other.id !== trait.id && other.requires?.includes(trait.id))
      .map((other) => other.name);

    // "Core Attributes" → "Core": the tag only has to say which kind.
    const typeLabel = traitTypes[trait.type]?.name?.split(' ')[0];

    return (
      <>
        {expanded && typeLabel && (
          <span className={`pill trait-type-tag ${trait.type}`}>{typeLabel}</span>
        )}
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

  // Once a loaded prebuilt is renamed, the name no longer says where it came from.
  const showBasedOn = loadedPrebuiltName && ancestryName !== loadedPrebuiltName;

  const header = (
    <>
      <div className="ancestry-summary-header">
        {expanded && showBasedOn && (
          <div className="builder-summary-field builder-summary-source">
            <span className="ancestry-summary-field-label">Based on</span>
            <span className="builder-summary-source-name">{loadedPrebuiltName}</span>
          </div>
        )}
        <div className="ancestry-summary-points">
          <span className="ancestry-summary-field-label">Points</span>
          <span className={`ancestry-summary-points-value${isOverBudget ? ' over' : ''}`}>
            {pointsSpent}
            <span className="ancestry-summary-points-total"> of {POINT_BUDGET}</span>
          </span>
        </div>
        <div className="ancestry-summary-name">
          <label className="ancestry-summary-field-label" htmlFor="builder-summary-name">
            Name
          </label>
          <input
            type="text"
            id="builder-summary-name"
            className="ancestry-summary-name-input"
            value={ancestryName}
            onChange={(e) => setAncestryName(e.target.value)}
            placeholder="Custom Ancestry"
          />
        </div>
      </div>

      {showBasedOn && !expanded && (
        <p className="builder-summary-based-on">
          <span className="ancestry-summary-field-label">Based on</span> {loadedPrebuiltName}
        </p>
      )}

      {warnings.length > 0 && (
        <div className="ancestry-summary-warnings">
          {warnings.map((warning, i) => (
            <div key={i} className={`ancestry-summary-warning ${warning.severity}`}>
              {warning.severity === 'warning' ? '⚠' : 'ℹ'} {warning.message}
            </div>
          ))}
        </div>
      )}

      {intro}
    </>
  );

  const footer = (
    <div className="ancestry-summary-footer">
      <button className="btn btn-secondary" onClick={handleReset}>
        Reset
      </button>
      <div className="ancestry-summary-export">
        {expanded && (
          <button className="btn btn-secondary" onClick={() => window.print()}>
            Print
          </button>
        )}
        <button className="btn btn-secondary" onClick={handleCopy}>
          Copy JSON
        </button>
        <button className={`btn ${expanded ? 'btn-secondary' : 'btn-primary'}`} onClick={handleExport}>
          Export JSON
        </button>
      </div>
      {actions && <div className="builder-summary-actions">{actions}</div>}
    </div>
  );

  const summary = (
    <AncestrySummary
      title={expanded ? null : ancestryName || 'Custom Ancestry'}
      header={header}
      footer={footer}
      sections={sections}
      emptyMessage="No traits selected yet."
      showTraitMeta
      renderTraitMeta={renderTraitMeta}
      renderTraitActions={renderTraitActions}
    />
  );

  return expanded ? <div className="builder-summary-expanded">{summary}</div> : summary;
}
