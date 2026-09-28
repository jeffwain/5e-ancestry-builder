import { SummaryTraitCard } from '../SummaryTraitCard';
import './AncestrySummary.css';
import './AncestrySummaryBuilder.css';

/**
 * Sticky sidebar panel listing a set of traits under section headings.
 * BuilderSummary drives it for the builder and the result page.
 *
 * Props:
 * - title: heading text
 * - header / footer: nodes above the sections and below them
 * - sections: [{ key, title, traits: [{ key, trait, selectedOptions }] }]
 * - emptyMessage: shown when every section is empty
 * - showTraitMeta: give each trait the cost / category badge row
 * - paragraph: write each trait as the builder's paragraph instead
 * - renderTraitMeta(trait): extra badges appended to that row
 * - renderTraitActions(trait): node pinned to the trait row (the remove button)
 */
export function AncestrySummary({
  title,
  header = null,
  footer = null,
  sections = [],
  emptyMessage = 'No traits selected yet.',
  showTraitMeta = false,
  paragraph = false,
  renderTraitMeta,
  renderTraitActions,
}) {
  const traitRow = ({ key, trait, selectedOptions = {} }) => (
    <SummaryTraitCard
      key={key}
      trait={trait}
      selectedOptions={selectedOptions}
      showFooter={showTraitMeta}
      showDetails={false}
      compact={true}
      paragraph={paragraph}
      metaExtra={renderTraitMeta ? renderTraitMeta(trait) : null}
      actions={renderTraitActions ? renderTraitActions(trait) : null}
    />
  );

  const filled = sections.filter((section) => section.traits?.length > 0);

  return (
    <div className="ancestry-summary">
      {title && <h2 className="ancestry-summary-title">{title}</h2>}
      {header}

      {filled.length > 0 ? (
        filled.map((section) => (
          <div key={section.key} className="ancestry-summary-section">
            <h3>{section.title}</h3>
            <div className="ancestry-summary-traits">
              {section.traits.map(traitRow)}
            </div>
          </div>
        ))
      ) : (
        <p className="ancestry-summary-placeholder">{emptyMessage}</p>
      )}

      {footer}
    </div>
  );
}
