import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCharacter } from '../../contexts/CharacterContext';
import { steps } from './steps';
import { StepCard, StepCheck } from './steps/StepCard';
import '../CharacterCreationPage.css';
import './CharacterCreation.css';

export function CharacterCreation() {
  const { hash } = useLocation();
  const character = useCharacter();

  // Arriving at "/#step-…" from another page (the Overview's "Continue to
  // ability scores") lands on that step; the router doesn't scroll by itself.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  const completeIds = new Set(
    steps.filter((step) => step.isComplete?.(character)).map((step) => step.id)
  );

  return (
    <div className="character-creation-page character-creation-layout">
      <aside className="creation-toc">
        <nav>
          <h3>Steps</h3>
          <ol>
            {steps.map((step) => (
              <li key={step.id}>
                <a href={`#${step.id}`}>
                  <span>{step.title}</span>
                  {completeIds.has(step.id) && <StepCheck />}
                </a>
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
          <StepCard key={step.id} step={step} complete={completeIds.has(step.id)} />
        ))}
      </main>
    </div>
  );
}
