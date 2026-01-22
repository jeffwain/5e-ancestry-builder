import { AncestryOverview } from '../components/AncestryOverview';
import { TABS } from '../components/TabNavigation';
import './OverviewPage.css';

export function OverviewPage({ onNavigate }) {
  const handleEditAncestry = () => {
    onNavigate(TABS.BUILDER);
  };

  return (
    <div className="overview-page">
      <div className="overview-page-container">
        <header className="overview-page-header">
          <h1 className="overview-page-title">Ancestry Overview</h1>
          <button className="btn btn-secondary" onClick={handleEditAncestry}>
            Edit in Builder
          </button>
        </header>
        
        <AncestryOverview 
          showHeader={true}
          showFooter={true}
        />
      </div>
    </div>
  );
}
