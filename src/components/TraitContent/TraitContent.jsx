import ReactMarkdown from 'react-markdown';
import { getTraitDisplay, formatPointsLabel } from '../../utils/traitDisplay';
import './TraitContent.css';

/**
 * The shared inner content of a trait card.
 *
 * The three trait surfaces — the selectable builder card (TraitCard), the
 * read-only summary card (SummaryTraitCard) and the hover popover
 * (TraitTooltip) — are the *same content* in different wrappers. This renders
 * that content once, with one class system (`.trait-content-*`). Each wrapper
 * keeps its own root class (`.card-trait` / `.summary-trait-card` /
 * `.trait-tooltip`) and "sends styles down" into these inner classes via the
 * cascade — see TraitContent.css.
 *
 * Wrappers pass only context-specific interactive extras:
 *   - headerExtra: node in the header between name and cost (builder "Required" pill)
 *   - children:    node appended inside the description (builder option radios etc.)
 *   - showFooter:  whether the summary meta row (restriction / category) is shown
 *
 * variant: 'card' | 'card-compact' | 'summary' | 'summary-compact' | 'tooltip'
 */
export function TraitContent({
  trait,
  selectedOptions = {},
  variant = 'summary',
  headerExtra = null,
  children = null,
  showFooter = true,
}) {
  const d = getTraitDisplay(trait, selectedOptions);
  const bodyText = d.summary || d.description; // summary views prefer the summary

  switch (variant) {
    case 'card':
      return (
        <>
          <div className="trait-content-header">
            <h4 className="trait-content-name flex1">{d.baseName}</h4>
            {headerExtra}
            <CostPill cost={d.cost} variant="card" />
          </div>
          <div className="trait-content-description">
            <ReactMarkdown>{d.description}</ReactMarkdown>
            {children}
          </div>
        </>
      );

    case 'card-compact':
      return (
        <div className="trait-content-header">
          <h4 className="trait-content-name flex1">
            {d.selectedOption ? d.selectedOption.name : d.baseName}
          </h4>
          <CostPill cost={d.cost} variant="card" />
        </div>
      );

    case 'summary-compact':
      return (
        <>
          <span className="trait-content-name">{summaryName(d)}.</span>
          {bodyText && (
            <span className="trait-content-description">
              <ReactMarkdown>{bodyText}</ReactMarkdown>
            </span>
          )}
        </>
      );

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
            <ReactMarkdown>{d.description}</ReactMarkdown>
            {d.optionDescription && <ReactMarkdown>{d.optionDescription}</ReactMarkdown>}
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
          {bodyText && (
            <div className="trait-content-description">
              <ReactMarkdown>{bodyText}</ReactMarkdown>
            </div>
          )}
          {d.optionDescription && (
            <div className="trait-content-option">
              <ReactMarkdown>{d.optionDescription}</ReactMarkdown>
            </div>
          )}
          {showFooter && (d.restriction || d.categoryName) && (
            <div className="trait-content-meta">
              {d.restriction && <span className="pill restriction">{d.restriction}</span>}
              {d.categoryName && <span className="pill">{d.categoryName}</span>}
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
// chooses the base pill flavor (card check-icon fallback, plain cost, or dark).
function CostPill({ cost, variant }) {
  const noCost = cost === undefined || cost === null || cost === '';
  const isFree = cost === 0;

  if (variant === 'card') {
    if (noCost) {
      return (
        <span className="pill pill-icon-only cost">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z" />
          </svg>
        </span>
      );
    }
    return (
      <span className={`pill cost ${isFree ? 'free' : ''}`}>
        {isFree ? 'Free' : (
          <>
            <span className="points">{cost}</span>&nbsp;{cost === 1 ? 'pt' : 'pts'}
          </>
        )}
      </span>
    );
  }

  if (noCost) return null;
  const label = formatPointsLabel(cost) || `${cost} pts`;
  const cls = variant === 'dark'
    ? `pill dark ${isFree ? 'free' : ''}`
    : `pill cost ${isFree ? 'free' : ''}`;
  return <span className={cls.trim()}>{label}</span>;
}
