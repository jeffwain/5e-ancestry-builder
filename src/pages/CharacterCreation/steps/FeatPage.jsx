import { Link, useNavigate } from 'react-router-dom';
import '../../CharacterCreationPage.css';

const stepNumber = 9;
const stepTitle = 'Take a starting feat';
const stepPath = '/character/feat';
const stepId = 'step-feat';

export function FeatStepCard() {
  return (
    <section className="creation-step card card-large" id={stepId}>
      <details open>
        <summary>
          <Link to={stepPath} className="step-link">
            {stepNumber}. {stepTitle}
          </Link>
        </summary>
        <div className="step-content">
          <p>
            Whether by divine blessing, dubious bargain, genetic lottery, or good
            old-fashioned hard work, you are a cut above the rest.{' '}
            <strong>Take a starting feat that fits your character.</strong> Pick
            something for flavor that isn't combat based. For example, avoid Great
            Weapon Fighter or similar feats at level 1.
          </p>
        </div>
      </details>
    </section>
  );
}

export function FeatSummaryCard() {
  return (
    <div className="summary-card card">
      <h4>{stepNumber}. {stepTitle}</h4>
      <p className="summary-placeholder">No selections yet</p>
    </div>
  );
}

export const featStep = {
  id: stepId,
  number: stepNumber,
  title: stepTitle,
  path: stepPath,
  StepCard: FeatStepCard,
  SummaryCard: FeatSummaryCard,
};

export function FeatPage() {
  const navigate = useNavigate();

  return (
    <div className="character-creation-page">
      <div className="creation-content">
        <header className="creation-header">
          <h1>Take a Starting Feat</h1>
        </header>

        <FeatStepCard />

        <div className="ancestry-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Character Creation
          </button>
        </div>
      </div>
    </div>
  );
}
