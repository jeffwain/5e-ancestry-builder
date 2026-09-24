import { useMemo } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { TraitGroupList } from '../TraitGroupList';
import { groupTraitsByType, groupsFromTraitsByType } from '../../utils/traitDisplay';
import { useAncestryActions } from '../../hooks/useAncestryActions';
import './AncestryOverview.css';

// Reusable ancestry overview content - used by both modal and page views
export function AncestryOverview({
  onReset,
  onExport,
  onCopy,
  showHeader = true,
  showFooter = true,
  className = ''
}) {
  const {
    selectedTraits,
    selectedOptions,
    pointsSpent,
    ancestryName,
    warnings,
    loadedPrebuiltName,
    setAncestryName,
    traitTypes
  } = useCharacter();

  const { handleExport, handleCopy, handleReset } = useAncestryActions({
    onReset, onExport, onCopy
  });


  // Group selected traits by their type
  const traitsByType = useMemo(
    () => groupTraitsByType(selectedTraits, traitTypes),
    [selectedTraits, traitTypes]
  );

  const handleNameChange = (e) => {
    if (setAncestryName) {
      setAncestryName(e.target.value);
    }
  };

  const containerClass = ['ancestry-overview card card-large', className].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {showHeader && (
        <div className="overview-header-cards flexrow">
          <div className="header-card card-points">
            <span className="label">Points</span>
            <span className="value">{pointsSpent} <span className="value-description">of 16</span></span>
          </div>
          <div className="header-card card-name flex1">
            <label htmlFor="ancestry-name" className="label">Name</label>
            <input 
              type="text" 
              id="ancestry-name"
              className="value" 
              value={ancestryName} 
              onChange={handleNameChange}
              placeholder="Custom Ancestry"
            />
          </div>
          {loadedPrebuiltName && ancestryName !== loadedPrebuiltName && (
            <div className="header-card card-prebuilt">
              <span className="label">Based on</span>
              <span className="value">{loadedPrebuiltName}</span>
            </div>
          )}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="overview-warnings">
          {warnings.map((warning, i) => (
            <div key={i} className={`warning ${warning.severity}`}>
              {warning.severity === 'warning' ? '⚠' : 'ℹ'} {warning.message}
            </div>
          ))}
        </div>
      )}

      {selectedTraits.length === 0 ? (
        <p className="overview-empty">No traits selected yet.</p>
      ) : (
        <TraitGroupList
          variant="overview"
          groups={groupsFromTraitsByType(traitsByType, selectedOptions)}
        />
      )}

      {showFooter && (
        <div className="overview-footer">
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset
          </button>
          <div className="export-btns">
            <button className="btn btn-secondary" onClick={handleCopy}>
              Copy JSON
            </button>
            <button className="btn btn-primary" onClick={handleExport}>
              Export JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
