import { Link, useNavigate } from 'react-router-dom';
import '../../CharacterCreationPage.css';

const stepNumber = 8;
const stepTitle = 'Choose languages you speak';
const stepPath = '/character/languages';
const stepId = 'step-languages';

export function LanguagesStepCard() {
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
            Your character can speak, read, and write <strong>Common and one other
            language</strong> that you and your DM agree is appropriate for the character
            from the languages available in this campaign.
          </p>
          <p>
            If your character can't speak another language, you gain proficiency with a
            second tool matching your background.
          </p>
        </div>
      </details>
    </section>
  );
}

export function LanguagesSummaryCard() {
  return (
    <div className="summary-card card">
      <h4>{stepNumber}. {stepTitle}</h4>
      <p className="summary-placeholder">No selections yet</p>
    </div>
  );
}

export const languagesStep = {
  id: stepId,
  number: stepNumber,
  title: stepTitle,
  path: stepPath,
  StepCard: LanguagesStepCard,
  SummaryCard: LanguagesSummaryCard,
};

export function LanguagesPage() {
  const navigate = useNavigate();

  return (
    <div className="character-creation-page">
      <div className="creation-content">
        <header className="creation-header">
          <h1>Choose Languages You Speak</h1>
        </header>

        <LanguagesStepCard />

        <div className="ancestry-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Character Creation
          </button>
        </div>
      </div>
    </div>
  );
}
