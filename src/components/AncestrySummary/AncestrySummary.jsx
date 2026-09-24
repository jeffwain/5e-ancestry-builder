import { resolveTrait } from '../../utils/ancestryResolve';
import { SummaryTraitCard } from '../SummaryTraitCard';
import './AncestrySummary.css';
import './AncestrySummaryBuilder.css';

// Pencil icon for customize button
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14">
    <path fill="currentColor" d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1 0 32c0 8.8 7.2 16 16 16l32 0zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"/>
  </svg>
);

/**
 * Sticky sidebar listing a set of traits under section headings.
 *
 * Two ways to drive it, sharing one look:
 *
 * 1. Ancestry mode (/ancestries) — pass `ancestry` and `archetype` and it
 *    derives the title and the shared/archetype sections.
 * 2. Generic mode (BuilderSummary) — pass `sections` and it renders those
 *    instead, with optional `header`, `footer` and per-trait meta/actions.
 *    Whatever a caller leaves out is simply not rendered.
 *
 * AncestrySummary.css holds the panel and the archetype-heading row;
 * AncestrySummaryBuilder.css the generic header / footer bits.
 *
 * Props (ancestry mode):
 * - ancestry / archetype: the currently expanded + selected objects (may be null)
 * - allTraits: combined trait lookup for resolving trait references
 * - onUse / onCustomize: action buttons, shown once an archetype is selected
 * - onSelectArchetype: pick an archetype from the prompt list
 * - onClearArchetype: drop the selected archetype and show that list again
 *
 * Props (generic mode):
 * - title: heading text
 * - header / footer: nodes above the sections and below them
 * - sections: [{ key, title, traits: [{ key, trait, selectedOptions }] }]
 * - emptyMessage: shown when every section is empty
 * - showTraitMeta: give each trait the cost / category badge row
 * - renderTraitMeta(trait): extra badges appended to that row
 * - renderTraitActions(trait): node pinned to the trait row (the remove button)
 */
export function AncestrySummary({
  ancestry,
  archetype,
  allTraits,
  onUse,
  onCustomize,
  onSelectArchetype,
  onClearArchetype,
  title,
  header = null,
  footer = null,
  sections,
  emptyMessage = 'No traits selected yet.',
  showTraitMeta = false,
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
      metaExtra={renderTraitMeta ? renderTraitMeta(trait) : null}
      actions={renderTraitActions ? renderTraitActions(trait) : null}
    />
  );

  // ── Generic mode ─────────────────────────────────────────────────────────
  if (sections) {
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

  // ── Ancestry mode ────────────────────────────────────────────────────────
  // Empty state — no ancestry selected
  if (!ancestry) {
    return (
      <div className="ancestry-summary empty">
        <p className="ancestry-summary-placeholder">
          Select an ancestry and archetype to see the full summary.
        </p>
      </div>
    );
  }

  // Resolve a trait reference into the row shape traitRow expects.
  const toRow = (raw, idx) => {
    const resolved = resolveTrait(raw, allTraits);
    const selectedOptions = {};
    if (raw.option && raw.id) {
      selectedOptions[raw.id] = raw.option;
    }
    return { key: (resolved.id || 'trait') + '-' + idx, trait: resolved, selectedOptions };
  };

  const sharedTraits = (ancestry.traits || []).filter(Boolean).map(toRow);
  const archetypeTraits = archetype
    ? (archetype.traits || []).filter(Boolean).map(toRow)
    : [];

  const archetypeName = archetype?.name;
  const archetypeIcon = archetype?.icon;
  const heading = archetypeName
    ? `${ancestry.name} (${archetypeName})`
    : ancestry.name;

  return (
    <div className="ancestry-summary">
      <h2 className="ancestry-summary-title">
        {archetypeIcon && <span>{archetypeIcon} </span>}
        {heading}
      </h2>

      {/* Shared Traits */}
      {sharedTraits.length > 0 && (
        <div className="ancestry-summary-section">
          <h3>Shared Traits</h3>
          <div className="ancestry-summary-traits">
            {sharedTraits.map(traitRow)}
          </div>
        </div>
      )}

      {/* Archetype Traits */}
      {archetype && archetypeTraits.length > 0 && (
        <div className="ancestry-summary-section">
          <h3 className="ancestry-summary-archetype-heading">
            <span className="ancestry-summary-archetype-heading-text">
              {archetypeIcon && <span>{archetypeIcon} </span>}
              {archetypeName} Traits
            </span>
            {onClearArchetype && (
              <button
                type="button"
                className="ancestry-summary-clear"
                onClick={onClearArchetype}
                title={`Remove ${archetypeName}`}
                aria-label={`Remove ${archetypeName} archetype`}
              >
                &times;
              </button>
            )}
          </h3>
          {archetype.description && (
            <p className="ancestry-summary-archetype-desc">{archetype.description}</p>
          )}
          <div className="ancestry-summary-traits">
            {archetypeTraits.map(traitRow)}
          </div>
        </div>
      )}

      {/* Action buttons — shown when an archetype is selected */}
      {archetype && (
        <div className="ancestry-summary-actions">
          <button className="btn btn-primary" onClick={onUse}>
            Use this ancestry
          </button>
          <button className="btn btn-secondary" onClick={onCustomize}>
            <PencilIcon />
            Customize ancestry
          </button>
        </div>
      )}

      {/* Prompt to select archetype if ancestry expanded but no archetype chosen */}
      {!archetype && (
        <div className="ancestry-summary-hint">
          <p>Select an archetype for the full list of traits.</p>
          {ancestry.archetypes && ancestry.archetypes.length > 0 && (
            <ul className="ancestry-summary-archetype-list">
              {ancestry.archetypes.map((at) => (
                <li key={at.id}>
                  <button
                    className="ancestry-summary-archetype-btn"
                    onClick={() => onSelectArchetype?.(at.id)}
                  >
                    {at.icon && <span>{at.icon}</span>}
                    {at.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
