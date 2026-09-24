import { NavLink } from 'react-router-dom';
import './TabNavigation.css';

export function TabNavigation({ hasCustomAncestry = false }) {
  const tabs = [
    { path: '/', label: 'Character Creation' },
    { path: '/customancestry', label: 'Create an Ancestry' },
    { path: '/ancestries', label: 'Ancestries' },
    { path: '/ancestries-text', label: 'Ancestry List' },
    { path: '/builder', label: 'Ancestry Builder' },
    { path: '/builder-text', label: 'Builder List' },
    { path: '/editor', label: 'Editor' },
    { path: '/audit', label: 'Audit' },
    // Only show Overview tab if user has customized
    ...(hasCustomAncestry ? [{ path: '/overview', label: 'Ancestry Overview' }] : [])
  ];

  return (
    <nav className="tab-navigation">
      <div className="tab-list">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
            end={tab.path === '/'}
            role="tab"
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
