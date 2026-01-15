import { useCharacter } from '../../contexts/CharacterContext';
import './PointBudget.css';

export function PointBudget() {
  const { pointsSpent, remainingPoints, heritageCount, cultureCount, warnings } = useCharacter();
  
  const isOverBudget = pointsSpent > 16;
  const percentage = Math.min((pointsSpent / 16) * 100, 100);

  return (
    <div className="budget">
      <div className="main">
        <div className="points-display">
          <span className={`spent ${isOverBudget ? 'over' : ''}`}>
            {pointsSpent}
          </span>
          <span className="divider">/</span>
          <span className="total">16</span>
          <span className="label">points</span>
        </div>
        
        <div className="progress-container">
          <div 
            className={`progress-bar ${isOverBudget ? 'over' : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="counts">
          <div className="count">
            <span className="count-value">{heritageCount}</span>
            <span className="count-label">Heritage</span>
          </div>
          <div className="count">
            <span className="count-value">{cultureCount}</span>
            <span className="count-label">Culture</span>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="warnings">
          {warnings.map((warning, index) => (
            <div key={index} className="warning">
              <span className="warning-icon">⚠</span>
              {warning.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
