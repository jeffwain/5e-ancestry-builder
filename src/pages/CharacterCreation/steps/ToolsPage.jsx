import { Link, useNavigate } from 'react-router-dom';
import '../../CharacterCreationPage.css';

const stepNumber = 7;
const stepTitle = 'Choose a tool proficiency';
const stepPath = '/character/tools';
const stepId = 'step-tools';

export function ToolsStepCard() {
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
            Choose <strong>one tool</strong>—an artisan's tool, vehicle type, gaming set,
            or instrument. Your character gains proficiency in it.
          </p>
        </div>
      </details>
    </section>
  );
}

export function ToolsSummaryCard() {
  return (
    <div className="summary-card card">
      <h4>{stepNumber}. {stepTitle}</h4>
      <p className="summary-placeholder">No selections yet</p>
    </div>
  );
}

export const toolsStep = {
  id: stepId,
  number: stepNumber,
  title: stepTitle,
  path: stepPath,
  StepCard: ToolsStepCard,
  SummaryCard: ToolsSummaryCard,
};

export function ToolsPage() {
  const navigate = useNavigate();

  return (
    <div className="character-creation-page">
      <div className="creation-content">
        <header className="creation-header">
          <h1>Choose a Tool Proficiency</h1>
        </header>

        <ToolsStepCard />

        <div className="ancestry-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Character Creation
          </button>
        </div>
      </div>
    </div>
  );
}
