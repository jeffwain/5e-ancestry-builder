import './TabNavigation.css';

// Tab IDs for view switching
export const TABS = {
  LANDING: 'landing',
  ANCESTRIES: 'ancestries',
  BUILDER: 'builder',
  OVERVIEW: 'overview'
};

export function TabNavigation({ activeTab, onTabChange, hasCustomAncestry = false }) {
  const tabs = [
    { id: TABS.LANDING, label: 'Character Creation' },
    { id: TABS.ANCESTRIES, label: 'Ancestries' },
    { id: TABS.BUILDER, label: 'Custom Ancestries' },
    // Only show Overview tab if user has customized
    ...(hasCustomAncestry ? [{ id: TABS.OVERVIEW, label: 'Ancestry Overview' }] : [])
  ];

  return (
    <nav className="tab-navigation">
      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
