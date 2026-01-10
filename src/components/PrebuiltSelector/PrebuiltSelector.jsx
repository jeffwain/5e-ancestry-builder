import { useCharacter } from '../../contexts/CharacterContext';
import styles from './PrebuiltSelector.module.css';

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
    <div className={styles.selector}>
      <label className={styles.label} htmlFor="prebuilt-select">
        Start from a template
      </label>
      <div className={styles.selectWrapper}>
        <select 
          id="prebuilt-select"
          className={styles.select}
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
        <p className={styles.hint}>
          Customize by adding or removing traits below
        </p>
      )}
    </div>
  );
}
