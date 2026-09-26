import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { steps } from './steps';
import { StepCard, StepSummaryCard } from './steps/StepCard';
import '../CharacterCreationPage.css';
import './CharacterCreation.css';

export function CharacterCreation() {
  const { hash } = useLocation();

  // Arriving at "/#step-…" from another page (the Overview's "Continue to
  // ability scores") lands on that step; the router doesn't scroll by itself.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

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
          <StepCard key={step.id} step={step} />
        ))}
      </main>

      <aside className="creation-summary">
        <h3>Character Summary</h3>
        {steps.map((step) => {
          const Summary = step.SummaryCard || StepSummaryCard;
          return <Summary key={step.id} step={step} />;
        })}
      </aside>
    </div>
  );
}
