import { useCharacter } from '../../contexts/CharacterContext';
import { AncestryOverview } from '../AncestryOverview';
import './SummaryPanel.css';

export function SummaryPanel({ isOpen, onClose }) {
  const { reset, exportAsJson } = useCharacter();

  if (!isOpen) return null;

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
          <AncestryOverview 
            showHeader={true}
            showFooter={false}
          />
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
