import { TraitCategory } from '../TraitCategory';
import './TraitSection.css';

export function TraitSection({
  sectionRef,
  name,
  description,
  categories,
  settings = {},
  type = 'unknown',
  expandAll,
  collapseAll,
  expandSignal,
  scrollToSectionTop
}) {
  // Use settings to determine default expanded state and pill visibility
  const defaultExpanded = settings.expandCategories ?? false;
  const showPill = settings.showPill ?? true;

  return (
    <section ref={sectionRef} className={`traits-section ${type}-traits`}>
      <div className="section-header flexrow">
        <h2 className="section-title">{name}</h2>
        <div className="section-header-controls">
          <div className="flexrow flex1">
            <button
              className="btn btn-secondary btn-small"
              onClick={expandAll}
            >
              Expand all
            </button>
            <button
              className="btn btn-secondary btn-small"
              onClick={collapseAll}
            >
              Collapse all
            </button>
          </div>
          <button
            className="btn btn-secondary btn-small"
            onClick={scrollToSectionTop}
          >
            To top
          </button>
        </div>
      </div>
      {description && (
        <p className="section-desc">{description}</p>
      )}
      <div className="traits-grid">
        {categories && Object.entries(categories).map(([catId, category]) => (
          <TraitCategory
            key={catId}
            category={category}
            categoryId={catId}
            type={type}
            expandSignal={expandSignal}
            defaultExpanded={defaultExpanded}
            showPill={showPill}
          />
        ))}
      </div>
    </section>
  );
}