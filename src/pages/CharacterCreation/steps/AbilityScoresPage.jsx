import { Link, useNavigate } from 'react-router-dom';
import '../../CharacterCreationPage.css';

const stepNumber = 5;
const stepTitle = 'Determine your ability scores';
const stepPath = '/character/ability-scores';
const stepId = 'step-ability-scores';

export function AbilityScoresStepCard() {
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
            Using the <strong>Point Buy</strong> system, determine your base ability scores.
          </p>
          <p>
            <strong>When determining your ability scores, increase one of those scores by
            2 and increase a different score by 1. Or, increase three different scores by
            1.</strong> You follow this rule regardless of the method you use to determine
            the scores, such as rolling or point buy.
          </p>
          <p>
            Your class's "Quick Build" section offers suggestions on which scores to
            increase. You're free to follow those suggestions or to ignore them.
            Whichever scores you decide to increase, <em>none of the scores can be
            raised above 20</em>.
          </p>
        </div>
      </details>
    </section>
  );
}

export function AbilityScoresSummaryCard() {
  return (
    <div className="summary-card card">
      <h4>{stepNumber}. {stepTitle}</h4>
      <p className="summary-placeholder">No selections yet</p>
    </div>
  );
}

export const abilityScoresStep = {
  id: stepId,
  number: stepNumber,
  title: stepTitle,
  path: stepPath,
  StepCard: AbilityScoresStepCard,
  SummaryCard: AbilityScoresSummaryCard,
};

export function AbilityScoresPage() {
  const navigate = useNavigate();

  return (
    <div className="character-creation-page">
      <div className="creation-content">
        <header className="creation-header">
          <h1>Determine Your Ability Scores</h1>
        </header>

        <AbilityScoresStepCard />

        <div className="ancestry-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Character Creation
          </button>
        </div>
      </div>
    </div>
  );
}
