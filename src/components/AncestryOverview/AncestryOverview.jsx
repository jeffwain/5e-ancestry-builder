import { useMemo } from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { SummaryTraitCard } from '../SummaryTraitCard';
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
    reset,
    exportAsJson,
    setAncestryName,
    traitTypes
  } = useCharacter();


  // Group selected traits by their type
  const traitsByType = useMemo(() => {
    const grouped = {};

    selectedTraits.forEach(trait => {
      const typeId = trait.type || 'unknown';
      if (!grouped[typeId]) {
        grouped[typeId] = {
          name: traitTypes[typeId]?.name || "Custom Traits",
          traits: []
        };
      }
      grouped[typeId].traits.push(trait);
    });

    return Object.values(grouped);
  }, [selectedTraits, traitTypes]);

  const handleExport = () => {
    if (onExport) {
      onExport();
      return;
    }
    const json = exportAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ancestry-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
      return;
    }
    const json = exportAsJson();
    try {
      await navigator.clipboard.writeText(json);
      alert('Copied to clipboard!');
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      return;
    }
    if (confirm('Are you sure you want to reset? This will clear all selected traits.')) {
      reset();
    }
  };

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
        <div className="overview-trait-lists">
          {traitsByType.map((typeGroup) => (
            <div key={typeGroup.name} className="trait-section">
              <h3 className="section-title">{typeGroup.name}</h3>
              <div className="trait-list">
                {typeGroup.traits.map(trait => (
                  <SummaryTraitCard
                    key={trait.id}
                    trait={trait}
                    selectedOptions={selectedOptions}
                    showFooter={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
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
