import { TraitContent } from '../TraitContent';
import './SummaryTraitCard.css';

/**
 * Read-only trait card for summary views (SummaryPanel, AncestryOverview,
 * AncestryCard, etc.). A thin wrapper around the shared TraitContent — it only
 * owns the container class; all content/derivation lives in TraitContent.
 *
 * - compact:     use the inline ".simple-trait-card" container
 * - showDetails: full layout (header + description + footer) vs inline name + text
 * - showFooter:  show the restriction / category meta row (full layout only)
 */
export function SummaryTraitCard({
  trait,
  selectedOptions = {},
  compact = false,
  showFooter = true,
  showDetails = true,
  className = ''
}) {
  const rootClass = `${compact ? 'simple-trait-card' : 'summary-trait-card'} ${className}`.trim();

  return (
    <div className={rootClass}>
      <TraitContent
        trait={trait}
        selectedOptions={selectedOptions}
        variant={showDetails ? 'summary' : 'summary-compact'}
        showFooter={showFooter}
      />
    </div>
  );
}
