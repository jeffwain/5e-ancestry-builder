import ReactMarkdown from 'react-markdown';
import { useCharacter } from '../../contexts/CharacterContext';
import './SummaryPanel.css';

export function SummaryPanel({ isOpen, onClose }) {
  const { 
    selectedTraits, 
    selectedOptions,
    pointsSpent, 
    ancestryName, 
    warnings,
    loadedPrebuilt,
    reset,
    exportAsJson 
  } = useCharacter();

  const coreTraits = selectedTraits.filter(t => t.type === 'core');
  const heritageTraits = selectedTraits.filter(t => t.type === 'heritage');
  const cultureTraits = selectedTraits.filter(t => t.type === 'culture');

  const handleExport = () => {
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
    const json = exportAsJson();
    try {
      await navigator.clipboard.writeText(json);
      alert('Copied to clipboard!');
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset? This will clear all selected traits.')) {
      reset();
      onClose();
    }
  };

  const getPointsLabel = (points) => {
    if (points === 0) return 'Free';
    if (points === 1) return '1 pt';
    return `${points} pts`;
  };

  const handleNameChange = (e) => {
    // TODO: updateAncestryName(e.target.value);
  };

  // For traits with options, resolve to display the selected option as the trait
  // Returns { name, description, optionDescription, sourceTrait, points, categoryName } for display
  const getDisplayTrait = (trait) => {
    const hasOptionSelected = (trait.requiresOption || trait.hasOptions) && 
      trait.options && 
      selectedOptions[trait.id];
    
    if (hasOptionSelected) {
      const option = trait.options.find(o => o.id === selectedOptions[trait.id]);
      if (option) {
        return {
          id: trait.id,
          name: option.name,
          description: trait.description,
          optionDescription: option.description || null,
          sourceTrait: trait.name,
          points: option.points ?? 0,
          categoryName: trait.categoryName
        };
      }
    }
    
    // No option selected or not an option trait - return original
    return {
      id: trait.id,
      name: trait.name,
      description: trait.description,
      optionDescription: null,
      sourceTrait: null,
      points: trait.points ?? 0,
      categoryName: trait.categoryName
    };
  };

  if (!isOpen) return null;

  return (
    <div className="panel-summary-overlay" onClick={onClose}>
      <div className="panel-summary" onClick={e => e.stopPropagation()}>
        <header className="header">
          <h2 className="title">Ancestry Overview</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="content">
          <div className="header-cards flexrow">

            <div className="header-card card-points">
              <span className="label">Points</span>
              <span className="value">{pointsSpent} <span className="value-description">of 16</span></span>
            </div>
            <div className="header-card card-name flex1">
              <span className="label">Name</span>
              <input type="text" className="value" value={ancestryName} onChange={handleNameChange} />
            </div>
            {loadedPrebuilt && (
              <div className="header-card card-prebuilt">
                <span className="label">Based on</span>
                <span className="value">{loadedPrebuilt}</span>
              </div>
            )}
          </div>

          {warnings.length > 0 && (
            <div className="warnings">
              {warnings.map((warning, i) => (
                <div key={i} className={`warning ${warning.severity}`}>
                  {warning.severity === 'warning' ? '⚠' : 'ℹ'} {warning.message}
                </div>
              ))}
            </div>
          )}

          {selectedTraits.length === 0 ? (
            <p className="empty">No traits selected yet.</p>
          ) : (
            <div className="trait-lists">
              {coreTraits.length > 0 && (
                <div className="trait-section">
                  <h3 className="section-title">Core Attributes</h3>
                  <ul className="trait-list">
                    {coreTraits.map(trait => {
                      const display = getDisplayTrait(trait);
                      return (
                        <li key={trait.id} className="trait-card">
                          <div className="trait-card-header">
                            <div className="trait-card-info">
                              <span className="trait-card-name">{display.name}</span>
                            </div>
                            <span className={`pill cost ${display.points === 0 ? 'free' : ''}`}>
                              {getPointsLabel(display.points)}
                            </span>
                          </div>
                          <div className="trait-card-description">
                            <ReactMarkdown>{display.description}</ReactMarkdown>
                            {display.optionDescription && (
                              <ReactMarkdown>{display.optionDescription}</ReactMarkdown>
                            )}
                            {display.sourceTrait && (
                              <span className="trait-card-source">From: {display.sourceTrait}</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {heritageTraits.length > 0 && (
                <div className="trait-section">
                  <h3 className="section-title">Heritage Traits</h3>
                  <ul className="trait-list">
                    {heritageTraits.map(trait => {
                      const display = getDisplayTrait(trait);
                      return (
                        <li key={trait.id} className="trait-card">
                          <div className="trait-card-header">
                            <div className="trait-card-info">
                              <span className="trait-card-name">{display.name}</span>
                              {display.sourceTrait ? (
                                <span className="trait-card-source">From: {display.sourceTrait}</span>
                              ) : display.categoryName && (
                                <span className="trait-card-category">{display.categoryName}</span>
                              )}
                            </div>
                            <span className={`pill cost ${display.points === 0 ? 'free' : ''}`}>
                              {getPointsLabel(display.points)}
                            </span>
                          </div>
                          <div className="trait-card-description">
                            <ReactMarkdown>{display.description}</ReactMarkdown>
                          </div>
                          {display.optionDescription && (
                            <div className="trait-card-option-description">
                              <ReactMarkdown>{display.optionDescription}</ReactMarkdown>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {cultureTraits.length > 0 && (
                <div className="trait-section">
                  <h3 className="section-title">Culture Traits</h3>
                  <ul className="trait-list">
                    {cultureTraits.map(trait => {
                      const display = getDisplayTrait(trait);
                      return (
                        <li key={trait.id} className="trait-card">
                          <div className="trait-card-header">
                            <div className="trait-card-info">
                              <span className="trait-card-name">{display.name}</span>
                              {display.sourceTrait ? (
                                <span className="trait-card-source">From: {display.sourceTrait}</span>
                              ) : display.categoryName && (
                                <span className="trait-card-category">{display.categoryName}</span>
                              )}
                            </div>
                            <span className={`pill cost ${display.points === 0 ? 'free' : ''}`}>
                              {getPointsLabel(display.points)}
                            </span>
                          </div>
                          <div className="trait-card-description">
                            <ReactMarkdown>{display.description}</ReactMarkdown>
                          </div>
                          {display.optionDescription && (
                            <div className="trait-card-option-description">
                              <ReactMarkdown>{display.optionDescription}</ReactMarkdown>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="footer">
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
        </footer>
      </div>
    </div>
  );  
}
