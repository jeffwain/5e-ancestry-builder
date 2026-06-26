import { Link, useNavigate } from 'react-router-dom';
import '../../CharacterCreationPage.css';

const stepNumber = 1;
const stepTitle = 'Think of a character idea';
const stepPath = '/character/idea';
const stepId = 'step-idea';

export function IdeaStepCard() {
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
            Your first step in creating a character is to consider your character's species,
            ancestry, the culture they grew up in, and any exceptional occurrences that may
            have shaped them. As you make choices about your character's features, think up
            a few key characteristics of your character's past.
          </p>
          <ul>
            <li>Where did they spend most of their time?</li>
            <li>What did they do for a living?</li>
            <li>What capabilities and possessions did they acquire?</li>
            <li>What language did they learn from their family, associates, or studies?</li>
            <li>How did their past affect their physical abilities?</li>
          </ul>
        </div>
      </details>
    </section>
  );
}

export function IdeaSummaryCard() {
  return (
    <div className="summary-card card">
      <h4>{stepNumber}. {stepTitle}</h4>
      <p className="summary-placeholder">No selections yet</p>
    </div>
  );
}

export const ideaStep = {
  id: stepId,
  number: stepNumber,
  title: stepTitle,
  path: stepPath,
  StepCard: IdeaStepCard,
  SummaryCard: IdeaSummaryCard,
};

export function IdeaPage() {
  const navigate = useNavigate();

  return (
    <div className="character-creation-page">
      <div className="creation-content">
        <header className="creation-header">
          <h1>Think of a Character Idea</h1>
        </header>

        <IdeaStepCard />

        <div className="ancestry-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Character Creation
          </button>
        </div>
      </div>
    </div>
  );
}
