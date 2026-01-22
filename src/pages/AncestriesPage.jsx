import { useState, useEffect } from 'react';
import { AncestryCard } from '../components/AncestryCard';
import './AncestriesPage.css';

export function AncestriesPage({ 
  allTraits = {},
  onUse,       // Use ancestry+archetype (navigate to preview)
  onCustomize  // Customize in builder
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAncestry, setExpandedAncestry] = useState(null);

  useEffect(() => {
    async function loadAncestries() {
      try {
        const response = await fetch('/data/ancestries.json');
        if (!response.ok) throw new Error('Failed to load ancestries');
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAncestries();
  }, []);

  if (loading) {
    return (
      <div className="ancestries-page">
        <div className="ancestries-content">
          <p className="loading-message">Loading ancestries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ancestries-page">
        <div className="ancestries-content">
          <p className="error-message">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ancestries-page">
      <div className="ancestries-content">
        <header className="ancestries-header">
          <h1>Prebuilt Ancestries</h1>
          <p>
            Browse pre-configured ancestry options. Each ancestry includes shared traits 
            and archetypes (subraces) that provide additional customization.
          </p>
        </header>

        {categories.map((category) => (
          <section key={category.id} className="ancestry-category">
            <div className="category-header">
              <h2>{category.name}</h2>
              {category.description && (
                <p className="category-desc">{category.description}</p>
              )}
            </div>

            <div className="ancestry-grid">
              {category.ancestries.map((ancestry) => (
                <AncestryCard
                  key={ancestry.id}
                  ancestry={ancestry}
                  allTraits={allTraits}
                  isExpanded={expandedAncestry === ancestry.id}
                  onToggle={() => setExpandedAncestry(
                    expandedAncestry === ancestry.id ? null : ancestry.id
                  )}
                  onUse={onUse}
                  onCustomize={onCustomize}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
