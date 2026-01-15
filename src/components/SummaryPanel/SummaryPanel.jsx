import { useCharacter } from '../../contexts/CharacterContext';
import './SummaryPanel.css';

export function SummaryPanel({ isOpen, onClose }) {
  const { 
    selectedTraits, 
    pointsSpent, 
    heritageCount, 
    cultureCount,
    selectedSize,
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

  if (!isOpen) return null;

  return (
    <div className="panel-summary-overlay" onClick={onClose}>
      <div className="panel-summary" onClick={e => e.stopPropagation()}>
        <header className="header">
          <h2 className="title">Character Summary</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="content">
          {loadedPrebuilt && (
            <div className="prebuilt-pill">
              Based on: {loadedPrebuilt}
            </div>
          )}

          <div className="stats">
            <div className="stat">
              <span className="stat-value">{pointsSpent}</span>
              <span className="stat-label">Points</span>
            </div>
            <div className="stat">
              <span className="stat-value">{selectedSize || '—'}</span>
              <span className="stat-label">Size</span>
            </div>
            <div className="stat">
              <span className="stat-value">{heritageCount}</span>
              <span className="stat-label">Heritage</span>
            </div>
            <div className="stat">
              <span className="stat-value">{cultureCount}</span>
              <span className="stat-label">Culture</span>
            </div>
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
                    {coreTraits.map(trait => (
                      <li key={trait.id} className="trait-item">
                        <span className="trait-name">{trait.name}</span>
                        <span className={`trait-cost ${trait.points === 0 ? 'free' : ''}`}>
                          {getPointsLabel(trait.points)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {heritageTraits.length > 0 && (
                <div className="trait-section">
                  <h3 className="section-title">Heritage Traits</h3>
                  <ul className="trait-list">
                    {heritageTraits.map(trait => (
                      <li key={trait.id} className="trait-item">
                        <div className="trait-info">
                          <span className="trait-name">{trait.name}</span>
                          {trait.categoryName && (
                            <span className="trait-category">{trait.categoryName}</span>
                          )}
                        </div>
                        <span className={`trait-cost ${trait.points === 0 ? 'free' : ''}`}>
                          {getPointsLabel(trait.points)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {cultureTraits.length > 0 && (
                <div className="trait-section">
                  <h3 className="section-title">Culture Traits</h3>
                  <ul className="trait-list">
                    {cultureTraits.map(trait => (
                      <li key={trait.id} className="trait-item">
                        <div className="trait-info">
                          <span className="trait-name">{trait.name}</span>
                          {trait.categoryName && (
                            <span className="trait-category">{trait.categoryName}</span>
                          )}
                        </div>
                        <span className={`trait-cost ${trait.points === 0 ? 'free' : ''}`}>
                          {getPointsLabel(trait.points)}
                        </span>
                      </li>
                    ))}
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
