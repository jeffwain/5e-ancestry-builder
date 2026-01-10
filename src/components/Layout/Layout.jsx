import { useState } from 'react';
import { PointBudget } from '../PointBudget';
import { PrebuiltSelector } from '../PrebuiltSelector';
import { TraitCategory, CoreAttributeSection } from '../TraitCategory';
import styles from './Layout.module.css';

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
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Ancestry Builder</h1>
          <p className={styles.subtitle}>Create your custom 5e ancestry with 16 points</p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <PrebuiltSelector 
          prebuiltAncestries={prebuiltAncestries}
          allTraits={allTraits}
        />
        <button 
          className={`btn btn-primary ${styles.summaryBtn}`}
          onClick={onShowSummary}
        >
          View Summary
        </button>
      </div>

      <aside className={styles.sidebar}>
        <PointBudget />
      </aside>

      <main className={styles.main}>
        {/* Core Attributes Section */}
        <section className={styles.section}>
          <h2 
            className={`${styles.sectionTitle} ${styles.clickable}`}
            onClick={() => toggleSection(coreSignal, setCoreSignal)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(coreSignal, setCoreSignal)}
          >
            Core Attributes
            <span className={`${styles.sectionChevron} ${coreSignal.expanded ? styles.expanded : ''}`}>▼</span>
          </h2>
          <p className={styles.sectionDesc}>
            Choose your size (required), and optionally enhance your speed or darkvision.
          </p>
          <div className={styles.coreGrid}>
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
        <section className={styles.section}>
          <h2 
            className={`${styles.sectionTitle} ${styles.clickable}`}
            onClick={() => toggleSection(heritageSignal, setHeritageSignal)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(heritageSignal, setHeritageSignal)}
          >
            Heritage Traits
            <span className={styles.sectionLimit}>(max 2 categories)</span>
            <span className={`${styles.sectionChevron} ${heritageSignal.expanded ? styles.expanded : ''}`}>▼</span>
          </h2>
          <p className={styles.sectionDesc}>
            Choose traits from up to 2 ancestry categories representing your physical heritage.
          </p>
          <div className={styles.heritageGrid}>
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
        <section className={styles.section}>
          <h2 
            className={`${styles.sectionTitle} ${styles.clickable}`}
            onClick={() => toggleSection(cultureSignal, setCultureSignal)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(cultureSignal, setCultureSignal)}
          >
            Culture Traits
            <span className={styles.sectionLimit}>(min 1, max 2 categories)</span>
            <span className={`${styles.sectionChevron} ${cultureSignal.expanded ? styles.expanded : ''}`}>▼</span>
          </h2>
          <p className={styles.sectionDesc}>
            Choose traits from 1-2 cultures representing your upbringing and training.
          </p>
          <div className={styles.cultureGrid}>
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

      <footer className={styles.footer}>
        <p>5e Ancestry Builder — Point-buy character ancestry system</p>
      </footer>
    </div>
  );
}
