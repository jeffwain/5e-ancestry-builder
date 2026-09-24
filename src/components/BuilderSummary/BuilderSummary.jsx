import { useMemo } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { AncestrySummary } from '../AncestrySummary';
import { useAncestryActions } from '../../hooks/useAncestryActions';
import { groupTraitsByType, POINT_BUDGET } from '../../utils/traitDisplay';
import './BuilderSummary.css';

/**
 * The build in progress: points, name, warnings, the chosen traits grouped by
 * type, and reset / copy / export. The builder's sidebar and the Overview page.
 */
export function BuilderSummary() {
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

  const sections = useMemo(
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

  // Both directions of the requirement graph, so the summary can say why a
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

  // Once a loaded prebuilt is renamed, the name no longer says where it came from.
  const showBasedOn = loadedPrebuiltName && ancestryName !== loadedPrebuiltName;

  const header = (
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

      {showBasedOn && (
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
    </>
  );

  const footer = (
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
    <AncestrySummary
      title={ancestryName || 'Custom Ancestry'}
      header={header}
      footer={footer}
      sections={sections}
      emptyMessage="No traits selected yet."
      showTraitMeta
      renderTraitMeta={renderTraitMeta}
      renderTraitActions={renderTraitActions}
    />
  );
}
