import { Link, useNavigate } from 'react-router-dom';
import '../../CharacterCreationPage.css';

const stepNumber = 6;
const stepTitle = 'Choose skill proficiencies';
const stepPath = '/character/proficiencies';
const stepId = 'step-proficiencies';

export function ProficienciesStepCard() {
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
            Choose two skills that match your <strong>background</strong> or{' '}
            <strong>ancestry</strong>. Your character gains proficiency in them.
          </p>
        </div>
      </details>
    </section>
  );
}

export function ProficienciesSummaryCard() {
  return (
    <div className="summary-card card">
      <h4>{stepNumber}. {stepTitle}</h4>
      <p className="summary-placeholder">No selections yet</p>
    </div>
  );
}

export const proficienciesStep = {
  id: stepId,
  number: stepNumber,
  title: stepTitle,
  path: stepPath,
  StepCard: ProficienciesStepCard,
  SummaryCard: ProficienciesSummaryCard,
};

export function ProficienciesPage() {
  const navigate = useNavigate();

  return (
    <div className="character-creation-page">
      <div className="creation-content">
        <header className="creation-header">
          <h1>Choose Skill Proficiencies</h1>
        </header>

        <ProficienciesStepCard />

        <div className="ancestry-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Character Creation
          </button>
        </div>
      </div>
    </div>
  );
}
