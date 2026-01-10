import { PointBudget } from '../PointBudget';
import { PrebuiltSelector } from '../PrebuiltSelector';
import { TraitCategory, HeritageGroup, CoreAttributeSection } from '../TraitCategory';
import styles from './Layout.module.css';

const HERITAGE_GROUP_NAMES = {
  planar: 'Planar Ancestries',
  bestial: 'Bestial Ancestries',
  other: 'Other Ancestries'
};

export function Layout({ 
  coreAttributes,
  heritageGroups, 
  cultureCategories, 
  prebuiltAncestries,
  allTraits,
  onShowSummary 
}) {
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
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⚙️</span>
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
              />
            ))}
          </div>
        </section>

        {/* Heritage Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🧬</span>
            Heritage Traits
            <span className={styles.sectionLimit}>(max 2 categories)</span>
          </h2>
          <p className={styles.sectionDesc}>
            Choose traits from up to 2 ancestry categories representing your physical heritage.
          </p>
          <div className={styles.heritageGrid}>
            {heritageGroups && Object.entries(heritageGroups).map(([groupId, categories]) => (
              <HeritageGroup
                key={groupId}
                groupId={groupId}
                groupName={HERITAGE_GROUP_NAMES[groupId] || groupId}
                categories={categories}
              />
            ))}
          </div>
        </section>

        {/* Culture Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📚</span>
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
