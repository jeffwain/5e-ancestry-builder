import { TraitParagraph } from '../TraitParagraph';
import { useCharacter } from '../../contexts/CharacterContext';
import './TraitBlock.css';

/**
 * One trait category as a two-column block of paragraphs.
 *
 * The block builder's unit is the category (Size, Darkvision, Elemental,
 * Artisan, ...), not the trait type — the type is a heading above a run of
 * these. Traits flow down the first column and wrap into the second, so a long
 * category costs height rather than a scroll.
 */
export function TraitBlock({ category, categoryId, type }) {
  const { warnings } = useCharacter();

  // Same warning TraitCategory surfaces: a required category with nothing in it.
  const missingRequired = category.required &&
    warnings.some(w => w.type === 'required-category' && w.categoryId === categoryId);

  // Optional categories get a plain label; the dark pill was built for the old
  // accordion headers and vanished on this page's light background.
  const labelText = category.label || 'Optional';

  const decorateTrait = (trait) => ({
    ...trait,
    type,
    categoryId,
    categoryName: category.name,
  });

  return (
    <section
      className={`trait-block ${type}${missingRequired ? ' missing-required' : ''}`}
      data-category-id={categoryId}
    >
      <header className="trait-block-header">
        <h3 className="trait-block-name">{category.name}</h3>
        {category.required
          ? <span className="pill required">Required</span>
          : <span className="trait-block-label">{labelText}</span>}
      </header>

      {category.description && (
        <p className="trait-block-description">{category.description}</p>
      )}

      <div className="trait-block-columns">
        {category.traits?.map(trait => (
          <TraitParagraph key={trait.id} trait={decorateTrait(trait)} />
        ))}
      </div>
    </section>
  );
}
