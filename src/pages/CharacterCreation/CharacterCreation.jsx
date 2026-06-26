import {
  ideaStep,
  classStep,
  backgroundStep,
  ancestryStep,
  abilityScoresStep,
  proficienciesStep,
  toolsStep,
  languagesStep,
  featStep,
} from './steps';
import '../CharacterCreationPage.css';
import './CharacterCreation.css';

const steps = [
  ideaStep,
  classStep,
  backgroundStep,
  ancestryStep,
  abilityScoresStep,
  proficienciesStep,
  toolsStep,
  languagesStep,
  featStep,
];

export function CharacterCreation() {
  return (
    <div className="character-creation-page character-creation-layout">
      <aside className="creation-toc">
        <nav>
          <h3>Steps</h3>
          <ol>
            {steps.map((step) => (
              <li key={step.id}>
                <a href={`#${step.id}`}>{step.title}</a>
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      <main className="creation-main">
        <header className="creation-header">
          <h1>Creating a Character</h1>
        </header>
        {steps.map((step) => (
          <step.StepCard key={step.id} />
        ))}
      </main>

      <aside className="creation-summary">
        <h3>Character Summary</h3>
        {steps.map((step) => (
          <step.SummaryCard key={step.id} />
        ))}
      </aside>
    </div>
  );
}
