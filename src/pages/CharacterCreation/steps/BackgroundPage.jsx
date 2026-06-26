import { Link, useNavigate } from 'react-router-dom';
import '../../CharacterCreationPage.css';

const stepNumber = 3;
const stepTitle = 'Think of a background';
const stepPath = '/character/background';
const stepId = 'step-background';

export function BackgroundStepCard() {
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
            After you have a rough outline in mind, think of what brought your character
            to where they are today? What is a significant job or role in their past that
            shaped their worldview or experiences?
          </p>
          <p>
            Pick a default background for the ability it gives you, or work with your DM
            to create a custom background. You will gain at least one special ability
            through your background. <strong>The skills, tools, and proficiencies given
            by default backgrounds are just guides. Use those as inspiration for your
            choices here.</strong>
          </p>
        </div>
      </details>
    </section>
  );
}

export function BackgroundSummaryCard() {
  return (
    <div className="summary-card card">
      <h4>{stepNumber}. {stepTitle}</h4>
      <p className="summary-placeholder">No selections yet</p>
    </div>
  );
}

export const backgroundStep = {
  id: stepId,
  number: stepNumber,
  title: stepTitle,
  path: stepPath,
  StepCard: BackgroundStepCard,
  SummaryCard: BackgroundSummaryCard,
};

export function BackgroundPage() {
  const navigate = useNavigate();

  return (
    <div className="character-creation-page">
      <div className="creation-content">
        <header className="creation-header">
          <h1>Think of a Background</h1>
        </header>

        <BackgroundStepCard />

        <div className="ancestry-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Character Creation
          </button>
        </div>
      </div>
    </div>
  );
}
