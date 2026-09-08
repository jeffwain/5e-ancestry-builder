import { useState, useRef, useEffect, useCallback } from 'react';
import { TraitContent } from '../TraitContent';
import './TraitTooltip.css';

/**
 * Hover popover wrapper for a trait. Owns the trigger + viewport-aware
 * positioning; the popover body is the shared TraitContent (variant "tooltip").
 *
 * @param {Object} trait - The trait object
 * @param {Object} selectedOptions - Map of trait ID -> selected option ID
 * @param {React.ReactNode} children - The trigger element
 * @param {Function} onClick - Optional click handler
 * @param {boolean} pinOnClick - Opt in to click-to-pin: the popover stays open
 *   after the pointer leaves, until it is clicked again, something outside it is
 *   clicked, or Escape is pressed. Off by default so existing callers (TraitCard,
 *   Layout) keep plain hover behaviour and their own click handling.
 * @param {string} className - Additional class names
 */
export function TraitTooltip({
  trait,
  selectedOptions = {},
  children,
  onClick,
  pinOnClick = false,
  className = ''
}) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const isVisible = hovered || pinned;

  // Position tooltip on show
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = triggerRect.bottom + 8;
      let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

      // Keep within viewport horizontally
      if (left < 8) left = 8;
      if (left + tooltipRect.width > viewportWidth - 8) {
        left = viewportWidth - tooltipRect.width - 8;
      }

      // Flip above if not enough room below
      if (top + tooltipRect.height > viewportHeight - 8) {
        top = triggerRect.top - tooltipRect.height - 8;
      }

      setPosition({ top, left });
    }
  }, [isVisible]);

  // While pinned, dismiss on an outside click or Escape.
  useEffect(() => {
    if (!pinned) return undefined;

    const onDocPointerDown = (e) => {
      if (!triggerRef.current?.contains(e.target)) setPinned(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setPinned(false);
    };

    document.addEventListener('mousedown', onDocPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [pinned]);

  const handleClick = useCallback((e) => {
    if (pinOnClick) setPinned(p => !p);
    onClick?.(e);
  }, [pinOnClick, onClick]);

  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);

  return (
    <div
      ref={triggerRef}
      className={`trait-tooltip-trigger ${className}`.trim()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`trait-tooltip${pinned ? ' pinned' : ''}`}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left
          }}
        >
          {pinned && (
            <button
              type="button"
              className="trait-tooltip-close"
              onClick={(e) => { e.stopPropagation(); setPinned(false); }}
              aria-label="Close"
              title="Close"
            >
              &times;
            </button>
          )}
          <TraitContent
            trait={trait}
            selectedOptions={selectedOptions}
            variant="tooltip"
          />
        </div>
      )}
    </div>
  );
}
