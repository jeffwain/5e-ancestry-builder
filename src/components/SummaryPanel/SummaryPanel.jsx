import { useCharacter } from '../../contexts/CharacterContext';
import styles from './SummaryPanel.module.css';

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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>Character Summary</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className={styles.content}>
          {loadedPrebuilt && (
            <div className={styles.prebuiltPill}>
              Based on: {loadedPrebuilt}
            </div>
          )}

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{pointsSpent}</span>
              <span className={styles.statLabel}>Points</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{selectedSize || '—'}</span>
              <span className={styles.statLabel}>Size</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{heritageCount}</span>
              <span className={styles.statLabel}>Heritage</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{cultureCount}</span>
              <span className={styles.statLabel}>Culture</span>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className={styles.warnings}>
              {warnings.map((warning, i) => (
                <div key={i} className={`${styles.warning} ${styles[warning.severity]}`}>
                  {warning.severity === 'warning' ? '⚠' : 'ℹ'} {warning.message}
                </div>
              ))}
            </div>
          )}

          {selectedTraits.length === 0 ? (
            <p className={styles.empty}>No traits selected yet.</p>
          ) : (
            <div className={styles.traitLists}>
              {coreTraits.length > 0 && (
                <div className={styles.traitSection}>
                  <h3 className={styles.sectionTitle}>Core Attributes</h3>
                  <ul className={styles.traitList}>
                    {coreTraits.map(trait => (
                      <li key={trait.id} className={styles.traitItem}>
                        <span className={styles.traitName}>{trait.name}</span>
                        <span className={`${styles.traitCost} ${trait.points === 0 ? styles.free : ''}`}>
                          {getPointsLabel(trait.points)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {heritageTraits.length > 0 && (
                <div className={styles.traitSection}>
                  <h3 className={styles.sectionTitle}>Heritage Traits</h3>
                  <ul className={styles.traitList}>
                    {heritageTraits.map(trait => (
                      <li key={trait.id} className={styles.traitItem}>
                        <div className={styles.traitInfo}>
                          <span className={styles.traitName}>{trait.name}</span>
                          {trait.categoryName && (
                            <span className={styles.traitCategory}>{trait.categoryName}</span>
                          )}
                        </div>
                        <span className={`${styles.traitCost} ${trait.points === 0 ? styles.free : ''}`}>
                          {getPointsLabel(trait.points)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {cultureTraits.length > 0 && (
                <div className={styles.traitSection}>
                  <h3 className={styles.sectionTitle}>Culture Traits</h3>
                  <ul className={styles.traitList}>
                    {cultureTraits.map(trait => (
                      <li key={trait.id} className={styles.traitItem}>
                        <div className={styles.traitInfo}>
                          <span className={styles.traitName}>{trait.name}</span>
                          {trait.categoryName && (
                            <span className={styles.traitCategory}>{trait.categoryName}</span>
                          )}
                        </div>
                        <span className={`${styles.traitCost} ${trait.points === 0 ? styles.free : ''}`}>
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

        <footer className={styles.footer}>
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset
          </button>
          <div className={styles.exportBtns}>
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
