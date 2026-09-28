import '../../CharacterCreationPage.css';

/**
 * Generic collapsible step card for the Character Creation page.
 * Each step supplies { id, number, title, Content, Selection?, isComplete? } —
 * see steps/index.js. Selection shows what the player has picked for the step.
 */
export function StepCard({ step, complete }) {
  const { id, number, title, Content, Selection } = step;

  return (
    <section className="creation-step card card-large" id={id}>
      <details open>
        <summary>
          <span className="creation-step-title">{number}. {title}</span>
          {complete && <StepCheck />}
        </summary>
        <div className="step-content">
          {Selection && <Selection />}
          <Content />
        </div>
      </details>
    </section>
  );
}

export function StepCheck() {
  return (
    <svg className="creation-step-check" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Complete">
      <path d="M3 8.5l3.25 3.25L13 5" />
    </svg>
  );
}
