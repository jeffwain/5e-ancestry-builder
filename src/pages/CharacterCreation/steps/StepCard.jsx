import '../../CharacterCreationPage.css';

/**
 * Generic collapsible step card for the Character Creation page.
 * Each step supplies { id, number, title, Content } — see steps/index.jsx.
 */
export function StepCard({ step }) {
  const { id, number, title, Content } = step;

  return (
    <section className="creation-step card card-large" id={id}>
      <details open>
        <summary>
          {number}. {title}
        </summary>
        <div className="step-content">
          <Content />
        </div>
      </details>
    </section>
  );
}

/**
 * Default sidebar summary card. Steps that track real state can provide
 * their own SummaryCard component instead (e.g. the ancestry step).
 */
export function StepSummaryCard({ step }) {
  return (
    <div className="summary-card card">
      <h4>{step.number}. {step.title}</h4>
      <p className="summary-placeholder">No selections yet</p>
    </div>
  );
}
