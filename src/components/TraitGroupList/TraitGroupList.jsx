import { SummaryTraitCard } from '../SummaryTraitCard';

/**
 * Shared renderer for "groups of traits" in summary surfaces. Previously this
 * markup existed three times: the Ancestries page summary column, the
 * character-creation ancestry summary card, and the AncestryOverview trait
 * lists. Each surface keeps its existing class names (and therefore its
 * existing CSS) via the variant map below — this component only unifies the
 * structure and the SummaryTraitCard wiring.
 *
 * groups: [{ key, title (node), items: [{ key, trait, selectedOptions }] }]
 *
 * variant:
 *  - 'summary'  — compact short-text trait cards (.ancestry-summary-* classes)
 *  - 'overview' — full detail cards (.overview-trait-lists / .trait-section)
 */
const VARIANTS = {
  summary: {
    wrapperClass: null,
    sectionClass: 'ancestry-summary-section',
    titleClass: null,
    listClass: 'ancestry-summary-traits',
    cardProps: { compact: true, showDetails: false, showFooter: false },
  },
  overview: {
    wrapperClass: 'overview-trait-lists',
    sectionClass: 'trait-section',
    titleClass: 'section-title',
    listClass: 'trait-list',
    cardProps: { showFooter: true },
  },
};

export function TraitGroupList({ groups, variant = 'summary' }) {
  const v = VARIANTS[variant] || VARIANTS.summary;

  const sections = groups.map((group) => (
    <div key={group.key} className={v.sectionClass}>
      <h3 className={v.titleClass || undefined}>{group.title}</h3>
      <div className={v.listClass}>
        {group.items.map((item) => (
          <SummaryTraitCard
            key={item.key}
            trait={item.trait}
            selectedOptions={item.selectedOptions}
            {...v.cardProps}
          />
        ))}
      </div>
    </div>
  ));

  return v.wrapperClass ? <div className={v.wrapperClass}>{sections}</div> : sections;
}
