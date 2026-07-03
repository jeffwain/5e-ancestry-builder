import { useState, useRef, useEffect } from 'react';
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
 * @param {string} className - Additional class names
 */
export function TraitTooltip({
  trait,
  selectedOptions = {},
  children,
  onClick,
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

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

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  return (
    <div
      ref={triggerRef}
      className={`trait-tooltip-trigger ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className="trait-tooltip"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left
          }}
        >
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
