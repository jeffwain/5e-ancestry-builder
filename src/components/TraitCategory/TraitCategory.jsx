import { TraitCard } from '../TraitCard';
import { Accordion } from '../Accordion';
import { useCharacter } from '../../contexts/CharacterContext';
import './TraitCategory.css';

export function TraitCategory({
  category,
  categoryId,
  type,
  showPill = true,
  expandSignal, // { expanded: boolean, version: number } - triggers batch expand/collapse
  defaultExpanded = false // Allow setting default expanded state (e.g., for core attributes)
}) {
  const { selectedTraitIds, selectedSize, warnings } = useCharacter();

  // Get selected traits from this category
  const selectedTraits = category.traits?.filter(t => selectedTraitIds.includes(t.id)) || [];
  const hasSelectedTraits = selectedTraits.length > 0;

  // Check if this category has a required warning (nothing selected from required category)
  const hasRequiredWarning = category.required &&
    warnings.some(w => w.type === 'required-category' && w.categoryId === categoryId);

  // For sizeTraits category, filter traits based on selected size
  const isSizeTraitsCategory = categoryId === 'sizeTraits';
  const shouldShowCompact = (trait) => {
    // Only apply compact logic to sizeTraits category when a size is selected
    if (isSizeTraitsCategory && selectedSize && trait.requires?.length) {
      const sizeReq = trait.requires.find(r => r.startsWith('size-'));
      return sizeReq && sizeReq !== `size-${selectedSize}`;
    }
    return false;
  };

  // Use category.label if available (e.g. "Planar Ancestry"), otherwise fall back to type
  const pillText = category.label || type;

  const decorateTrait = (trait) => ({
    ...trait,
    type: type,
    categoryId: categoryId,
    categoryName: category.name
  });

  const meta = (
    <>
      {category.required && (
        <span className="pill required">Required</span>
      )}
      {showPill && pillText && !category.required && (
        <span className={`pill type on-dark ${type}`}>
          {pillText}
        </span>
      )}
    </>
  );

  return (
    <Accordion
      type={type}
      className={hasRequiredWarning ? 'missing-required' : ''}
      title={<h3 className="name">{category.name}</h3>}
      meta={meta}
      defaultExpanded={defaultExpanded}
      expandSignal={expandSignal}
    >
      {(isExpanded) => (
        <>
          {category.description && isExpanded && (
            <p className="description">{category.description}</p>
          )}

          {/* Show selected traits when collapsed */}
          {!isExpanded && hasSelectedTraits && (
            <div className="selected-traits">
              {selectedTraits.map(trait => (
                <TraitCard key={trait.id} trait={decorateTrait(trait)} compact />
              ))}
            </div>
          )}

          {/* Show empty state when collapsed with no selections (for required categories) */}
          {!isExpanded && !hasSelectedTraits && category.required && (
            <div className="empty-state">No traits selected.</div>
          )}

          {/* Show all traits when expanded */}
          {isExpanded && (
            <div className="trait-list">
              {category.traits?.map(trait => (
                <TraitCard
                  key={trait.id}
                  trait={decorateTrait(trait)}
                  compact={shouldShowCompact(trait)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Accordion>
  );
}
