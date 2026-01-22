import { useNavigate } from 'react-router-dom';
import { AncestryOverview } from '../components/AncestryOverview';
import './OverviewPage.css';

export function OverviewPage() {
  const navigate = useNavigate();

  const handleEditAncestry = () => {
    navigate('/builder');
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
