import ReactMarkdown from 'react-markdown';
import {
  getTraitDisplay,
  formatPointsLabel,
  compactTraitName,
  compactTraitDescription,
  formatCompactPoints,
  formatBracketCost,
} from '../../utils/traitDisplay';
import './TraitContent.css';

/**
 * The shared inner content of a trait card.
 *
 * The trait surfaces — the builder paragraph (TraitParagraph), the read-only
 * summary card (SummaryTraitCard) and the hover popover (TraitTooltip) — are
 * the *same content* in different wrappers. This renders that content once,
 * with one class system (`.trait-content-*`). Each wrapper keeps its own root
 * class (`.trait-paragraph` / `.summary-trait-card` / `.trait-tooltip`) and
 * "sends styles down" into these inner classes via the cascade — see
 * TraitContent.css.
 *
 * Wrappers pass only context-specific interactive extras:
 *   - metaExtra:   node appended to the meta row (sidebar requirement pills)
 *   - children:    node appended inside the description (builder option radios etc.)
 *   - showFooter:  whether the summary meta row (cost / restriction / category) is shown
 *   - longName:    paragraph variant only — "Trait (Option)" instead of the option alone
 *   - showCost:    paragraph variant only — whether the "[2]" after the name is shown
 *
 * variant: 'paragraph' | 'summary' | 'summary-compact' | 'tooltip'
 */
export function TraitContent({
  trait,
  selectedOptions = {},
  variant = 'summary',
  metaExtra = null,
  children = null,
  showFooter = true,
  longName = false,
  showCost = true,
}) {
  const d = getTraitDisplay(trait, selectedOptions);

  switch (variant) {
    // Runs the whole trait together as one sentence — "Name [2]. Description." —
    // for the block builder, where traits read as prose rather than as cards.
    case 'paragraph': {
      const bracketCost = showCost ? formatBracketCost(d.cost) : null;
      const description = compactTraitDescription(d);
      return (
        <>
          <span className="trait-content-name">
            {longName ? summaryName(d) : compactTraitName(d)}
            {bracketCost && <span className="trait-content-cost"> [{bracketCost}]</span>}.
          </span>
          {description && (
            <span className="trait-content-description">
              <ReactMarkdown>{description}</ReactMarkdown>
            </span>
          )}
          {children}
        </>
      );
    }

    case 'summary-compact': {
      const description = compactTraitDescription(d);
      // The badge row carries the cost when it is shown, so the trailing inline
      // points would only say the same thing twice.
      const points = showFooter ? null : formatCompactPoints(d.cost);
      return (
        <>
          <span className="trait-content-name">{compactTraitName(d)}.</span>
          {(description || points) && (
            <span className="trait-content-description">
              {description && <ReactMarkdown>{description}</ReactMarkdown>}
              {points && <span className="trait-content-points"> {points}</span>}
            </span>
          )}
          {showFooter && (
            <div className="trait-content-meta">
              <CostPill cost={d.cost} variant="summary" />
              {d.categoryName && <span className="pill">{d.categoryName}</span>}
              {d.restriction && <span className="pill restriction">{d.restriction}</span>}
              {metaExtra}
            </div>
          )}
        </>
      );
    }

    case 'tooltip':
      return (
        <>
          <div className="trait-content-header">
            <span className="trait-content-name">
              {d.selectedOption ? d.selectedOption.name : d.baseName}
            </span>
            <CostPill cost={d.cost} variant="dark" />
          </div>
          <div className="trait-content-description">
            {d.description && <ReactMarkdown>{d.description}</ReactMarkdown>}
            {d.optionDescription && <ReactMarkdown>{d.optionDescription}</ReactMarkdown>}
            {!d.selectedOption && d.chooseOne && (
              <p className="trait-content-choose">{d.chooseOne}</p>
            )}
          </div>
          <div className="trait-content-meta">
            {d.type && d.type !== 'core' && (
              <span className={`pill type ${d.type}`}>
                {d.categoryName && `${d.categoryName} `}
                {d.type.charAt(0).toUpperCase() + d.type.slice(1)}
              </span>
            )}
            {d.selectedOption && (
              <span className="pill type from-source">From {d.baseName}</span>
            )}
          </div>
        </>
      );

    case 'summary':
    default:
      return (
        <>
          <div className="trait-content-header">
            <span className="trait-content-name">{summaryName(d)}</span>
            <CostPill cost={d.cost} variant="summary" />
          </div>
          {d.description && (
            <div className="trait-content-description">
              <ReactMarkdown>{d.description}</ReactMarkdown>
            </div>
          )}
          {d.optionDescription && (
            <div className="trait-content-option">
              <ReactMarkdown>{d.optionDescription}</ReactMarkdown>
            </div>
          )}
          {/* No option picked yet — say what the choice is. Once one is chosen
              the option itself is shown and the instruction is just noise. */}
          {!d.selectedOption && d.chooseOne && (
            <p className="trait-content-choose">{d.chooseOne}</p>
          )}
          {showFooter && (d.restriction || d.categoryName || metaExtra) && (
            <div className="trait-content-meta">
              {d.restriction && <span className="pill restriction">{d.restriction}</span>}
              {d.categoryName && <span className="pill">{d.categoryName}</span>}
              {metaExtra}
            </div>
          )}
        </>
      );
  }
}

// Summary views show "Trait (Option)" unless an ancestry override renamed it.
function summaryName(d) {
  if (d.selectedOption && !d.hasNameOverride) {
    return `${d.rawName} (${d.selectedOption.name})`;
  }
  return d.baseName;
}

// Cost pill. Styling lives in components.css / TraitContent.css; `variant` only
// chooses the base pill flavor (plain cost, or dark).
function CostPill({ cost, variant }) {
  const noCost = cost === undefined || cost === null || cost === '';
  const isFree = cost === 0;

  if (noCost) return null;
  const label = formatPointsLabel(cost) || `${cost} pts`;
  const cls = variant === 'dark'
    ? `pill dark ${isFree ? 'free' : ''}`
    : `pill cost ${isFree ? 'free' : ''}`;
  return <span className={cls.trim()}>{label}</span>;
}
