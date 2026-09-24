import { TraitContent } from '../TraitContent';
import './SummaryTraitCard.css';
import './SummaryTraitCardMeta.css';

/**
 * Read-only trait card for summary views (SummaryPanel, AncestryOverview,
 * AncestryCard, etc.). A thin wrapper around the shared TraitContent — it only
 * owns the container class; all content/derivation lives in TraitContent.
 *
 * - compact:     use the inline ".simple-trait-card" container
 * - showDetails: full layout (header + description + footer) vs inline name + text
 * - showFooter:  show the badge row (cost / category / restriction) beneath the
 *                description. Off for the plain ancestry lists, on for the
 *                builder sidebar, which needs the cost visible per trait.
 * - metaExtra:   extra nodes for that badge row (e.g. requirement pills)
 * - actions:     node pinned to the row's top-right (e.g. a remove button)
 */
export function SummaryTraitCard({
  trait,
  selectedOptions = {},
  compact = false,
  showFooter = true,
  showDetails = true,
  metaExtra = null,
  actions = null,
  className = ''
}) {
  const rootClass = [
    compact ? 'simple-trait-card' : 'summary-trait-card',
    showFooter && 'has-meta',
    actions && 'has-actions',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <TraitContent
        trait={trait}
        selectedOptions={selectedOptions}
        variant={showDetails ? 'summary' : 'summary-compact'}
        showFooter={showFooter}
        metaExtra={metaExtra}
      />
      {actions}
    </div>
  );
}
