import { useState } from 'react';
import { PointBudget } from '../PointBudget';
import { PrebuiltSelector } from '../PrebuiltSelector';
import { TraitCategory, CoreAttributeSection } from '../TraitCategory';
import './Layout.css';

export function Layout({ 
  coreAttributes,
  heritageCategories, 
  cultureCategories, 
  prebuiltAncestries,
  allTraits,
  onShowSummary 
}) {
  // Expansion signals: { expanded: boolean, version: number }
  // Version increments on each click, children respond to version changes
  const [coreSignal, setCoreSignal] = useState({ expanded: true, version: 0 });
  const [heritageSignal, setHeritageSignal] = useState({ expanded: true, version: 0 });
  const [cultureSignal, setCultureSignal] = useState({ expanded: true, version: 0 });

  const toggleSection = (signal, setSignal) => {
    setSignal({
      expanded: !signal.expanded,
      version: signal.version + 1
    });
  };

  return (
    <div className="layout">
      <header className="header flexrow">
        <div className="header-content  flex1">
          <h1 className="title">Custom Ancestry Builder</h1>
        </div>
        <div class="header-actions flexrow flexshrink">
          <PrebuiltSelector 
            prebuiltAncestries={prebuiltAncestries}
            allTraits={allTraits}
          />
          <button 
            className="btn btn-primary summary-btn"
            onClick={onShowSummary}
          >
            View Summary
          </button>
        </div>
      </header>
      <div className="toolbar">
      </div>

      <aside className="sidebar">
        <PointBudget />
      </aside>

      <main className="main">
        {/* Core Attributes Section */}
        <section className="section">
          <h2 
            className="section-title clickable"
            onClick={() => toggleSection(coreSignal, setCoreSignal)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(coreSignal, setCoreSignal)}
          >
            Core Attributes
            <span className={`section-chevron ${coreSignal.expanded ? 'expanded' : ''}`}>▼</span>
          </h2>
          <p className="section-desc">
            Choose your size (required), and optionally enhance your speed or darkvision.
          </p>
          <div className="core-grid">
            {coreAttributes && Object.entries(coreAttributes).map(([attrId, attr]) => (
              <CoreAttributeSection 
                key={attrId}
                attribute={attr}
                attributeId={attrId}
                expandSignal={coreSignal}
              />
            ))}
          </div>
        </section>

        {/* Heritage Section - flat like culture */}
        <section className="section">
          <h2 
            className="section-title clickable"
            onClick={() => toggleSection(heritageSignal, setHeritageSignal)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(heritageSignal, setHeritageSignal)}
          >
            Heritage Traits
            <span className="section-limit">(max 2 categories)</span>
            <span className={`section-chevron ${heritageSignal.expanded ? 'expanded' : ''}`}>▼</span>
          </h2>
          <p className="section-desc">
            Choose traits from up to 2 ancestry categories representing your physical heritage.
          </p>
          <div className="heritage-grid">
            {heritageCategories && Object.entries(heritageCategories).map(([catId, category]) => (
              <TraitCategory
                key={catId}
                category={category}
                categoryId={catId}
                type="heritage"
                expandSignal={heritageSignal}
              />
            ))}
          </div>
        </section>

        {/* Culture Section */}
        <section className="section">
          <h2 
            className="section-title clickable"
            onClick={() => toggleSection(cultureSignal, setCultureSignal)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(cultureSignal, setCultureSignal)}
          >
            Culture Traits
            <span className="section-limit">(min 1, max 2 categories)</span>
            <span className={`section-chevron ${cultureSignal.expanded ? 'expanded' : ''}`}>▼</span>
          </h2>
          <p className="section-desc">
            Choose traits from 1-2 cultures representing your upbringing and training.
          </p>
          <div className="culture-grid">
            {cultureCategories && Object.entries(cultureCategories).map(([catId, category]) => (
              <TraitCategory
                key={catId}
                category={category}
                categoryId={catId}
                type="culture"
                expandSignal={cultureSignal}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>5e Ancestry Builder — Point-buy character ancestry system</p>
      </footer>
    </div>
  );
}
