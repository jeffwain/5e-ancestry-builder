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
  // Section-level expansion state (undefined = let children manage their own state)
  const [coreExpanded, setCoreExpanded] = useState(undefined);
  const [heritageExpanded, setHeritageExpanded] = useState(undefined);
  const [cultureExpanded, setCultureExpanded] = useState(undefined);

  const toggleSection = (setter, currentValue) => {
    // If undefined (mixed state), collapse all. Otherwise toggle.
    setter(currentValue === undefined ? false : !currentValue);
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
            onClick={() => toggleSection(setCoreExpanded, coreExpanded)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(setCoreExpanded, coreExpanded)}
          >
            Core Attributes
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
                forceExpanded={coreExpanded}
              />
            ))}
          </div>
        </section>

        {/* Heritage Section - flat like culture */}
        <section className={styles.section}>
          <h2 
            className={`${styles.sectionTitle} ${styles.clickable}`}
            onClick={() => toggleSection(setHeritageExpanded, heritageExpanded)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(setHeritageExpanded, heritageExpanded)}
          >
            Heritage Traits
            <span className={styles.sectionLimit}>(max 2 categories)</span>
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
                forceExpanded={heritageExpanded}
              />
            ))}
          </div>
        </section>

        {/* Culture Section */}
        <section className={styles.section}>
          <h2 
            className={`${styles.sectionTitle} ${styles.clickable}`}
            onClick={() => toggleSection(setCultureExpanded, cultureExpanded)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleSection(setCultureExpanded, cultureExpanded)}
          >
            Culture Traits
            <span className={styles.sectionLimit}>(min 1, max 2 categories)</span>
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
                forceExpanded={cultureExpanded}
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
