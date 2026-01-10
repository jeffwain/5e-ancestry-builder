import { useCharacter } from '../../contexts/CharacterContext';
import styles from './PointBudget.module.css';

export function PointBudget() {
  const { pointsSpent, remainingPoints, heritageCount, cultureCount, warnings } = useCharacter();
  
  const isOverBudget = pointsSpent > 16;
  const percentage = Math.min((pointsSpent / 16) * 100, 100);

  return (
    <div className={styles.budget}>
      <div className={styles.main}>
        <div className={styles.pointsDisplay}>
          <span className={`${styles.spent} ${isOverBudget ? styles.over : ''}`}>
            {pointsSpent}
          </span>
          <span className={styles.divider}>/</span>
          <span className={styles.total}>16</span>
          <span className={styles.label}>points</span>
        </div>
        
        <div className={styles.progressContainer}>
          <div 
            className={`${styles.progressBar} ${isOverBudget ? styles.over : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className={styles.counts}>
          <div className={styles.count}>
            <span className={styles.countValue}>{heritageCount}</span>
            <span className={styles.countLabel}>Heritage</span>
          </div>
          <div className={styles.count}>
            <span className={styles.countValue}>{cultureCount}</span>
            <span className={styles.countLabel}>Culture</span>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className={styles.warnings}>
          {warnings.map((warning, index) => (
            <div key={index} className={styles.warning}>
              <span className={styles.warningIcon}>⚠</span>
              {warning.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
