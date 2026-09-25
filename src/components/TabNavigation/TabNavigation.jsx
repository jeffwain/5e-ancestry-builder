import { useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCharacter } from '../../contexts/CharacterContext';
import { POINT_BUDGET } from '../../utils/traitDisplay';
import './TabNavigation.css';

// Player pages lead; the DM's own tools sit behind a menu at the far end.
const PLAYER_LINKS = [
  { path: '/', label: 'Create a Character' },
  { path: '/ancestries', label: 'Ancestries' },
  { path: '/builder', label: 'Builder' },
];

const TOOL_LINKS = [
  { path: '/editor', label: 'Editor' },
  { path: '/audit', label: 'Audit' },
];

export function TabNavigation() {
  const { ancestryName, pointsSpent, selectedTraits } = useCharacter();
  const toolsRef = useRef(null);

  // The build rides along in the bar once there is one, and opens its page.
  const hasBuild = selectedTraits.length > 0;

  return (
    <nav className="tab-navigation" aria-label="Main">
      <Link to="/" className="tab-navigation-brand">Ancestry Builder</Link>

      <div className="tab-list">
        {PLAYER_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}
            end={link.path === '/'}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {hasBuild && (
        <NavLink
          to="/overview"
          className={({ isActive }) => `tab-navigation-build${isActive ? ' active' : ''}`}
        >
          <span className="tab-navigation-build-name">{ancestryName || 'Custom Ancestry'}</span>
          <span className="tab-navigation-build-points">{pointsSpent} / {POINT_BUDGET}</span>
        </NavLink>
      )}

      <button
        type="button"
        className="tab-navigation-tools-toggle"
        popoverTarget="tab-navigation-tools"
        aria-label="DM tools"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="4" cy="10" r="1.2" />
          <circle cx="10" cy="10" r="1.2" />
          <circle cx="16" cy="10" r="1.2" />
        </svg>
      </button>
      <div id="tab-navigation-tools" className="tab-navigation-tools" popover="auto" ref={toolsRef}>
        <span className="tab-navigation-tools-label">DM tools</span>
        {TOOL_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `tab-navigation-tools-link${isActive ? ' active' : ''}`}
            onClick={() => toolsRef.current?.hidePopover()}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
