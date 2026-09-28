import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useCharacter } from '../contexts/CharacterContext';
import { BuilderSummary } from '../components/BuilderSummary';
import { loadJson } from '../utils/dataCache';
import './OverviewPage.css';

/**
 * Your ancestry: the builder's summary opened out into a page, with the
 * ancestry it came from described above the traits and the next steps below.
 */
export function OverviewPage() {
  const navigate = useNavigate();
  const { loadedPrebuilt } = useCharacter();
  const [source, setSource] = useState(null);

  // A loaded prebuilt is remembered as "<ancestry id>-<archetype id>"; find the
  // ancestry by matching the whole pair, since both ids may contain hyphens.
  useEffect(() => {
    if (!loadedPrebuilt) {
      setSource(null);
      return;
    }
    let active = true;
    loadJson('/data/converted-ancestries.json').then((data) => {
      if (!active) return;
      const ancestries = (data.categories || []).flatMap((category) => [
        ...(category.ancestries || []),
        ...(category.subcategories || []).flatMap((sub) => sub.ancestries || []),
      ]);
      const found = ancestries.find((ancestry) =>
        ['custom', ...(ancestry.archetypes || []).map((archetype) => archetype.id)]
          .some((archetypeId) => `${ancestry.id}-${archetypeId}` === loadedPrebuilt)
      );
      setSource(found || null);
    }).catch(() => {});
    return () => { active = false; };
  }, [loadedPrebuilt]);

  const intro = source && (
    <section className="overview-page-source">
      <h2 className="overview-page-section-title">{source.name}</h2>
      {source.summary && <p className="overview-page-summary">{source.summary}</p>}
      {source.description && (
        <div className="overview-page-description">
          <ReactMarkdown>{source.description}</ReactMarkdown>
        </div>
      )}
    </section>
  );

  const actions = (
    <>
      <Link to="/builder" className="btn btn-secondary">Edit in the builder</Link>
      <button type="button" className="btn btn-primary" onClick={() => navigate('/#step-ability-scores')}>
        Continue to ability scores
      </button>
    </>
  );

  return (
    <div className="overview-page">
      <div className="overview-page-container">
        <BuilderSummary expanded intro={intro} actions={actions} />
      </div>
    </div>
  );
}
