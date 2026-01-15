import { useCharacter } from '../../contexts/CharacterContext';
import './PrebuiltSelector.css';

export function PrebuiltSelector({ prebuiltAncestries, allTraits }) {
  const { loadPrebuilt, reset, loadedPrebuilt } = useCharacter();

  const handleSelect = (e) => {
    const ancestryId = e.target.value;
    if (!ancestryId) {
      reset();
      return;
    }

    const ancestry = prebuiltAncestries.find(p => p.id === ancestryId);
    if (!ancestry) return;

    // Resolve trait IDs to full trait objects
    const traits = ancestry.traitIds
      .map(id => allTraits[id])
      .filter(Boolean);

    loadPrebuilt(ancestryId, traits);
  };

  return (
    <div className="selector-prebuilt flexrow">
      <label className="label" htmlFor="prebuilt-select">
        Start from a template
      </label>
      <div className="select-wrapper">
        <select 
          id="prebuilt-select"
          className="select"
          onChange={handleSelect}
          value={loadedPrebuilt || ''}
        >
          <option value="">— Custom (start fresh) —</option>
          {prebuiltAncestries.map(ancestry => (
            <option key={ancestry.id} value={ancestry.id}>
              {ancestry.name}
            </option>
          ))}
        </select>
      </div>
      {loadedPrebuilt && (
        <p className="hint">
          Customize by adding or removing traits below
        </p>
      )}
    </div>
  );
}
