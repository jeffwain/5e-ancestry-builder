import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './TraitTooltip.css';

/**
 * Reusable trait tooltip component that shows trait details on hover
 * @param {Object} trait - The trait object with name, description, points, categoryName
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

  // Calculate display cost
  const getDisplayCost = () => {
    if (trait.options && trait.requiresOption) {
      const selectedOptionId = selectedOptions[trait.id];
      if (selectedOptionId) {
        const opt = trait.options.find(o => o.id === selectedOptionId);
        return opt?.points ?? 0;
      }
      // Show range if no option selected
      const costs = trait.options.map(o => o.points || 0);
      const min = Math.min(...costs);
      const max = Math.max(...costs);
      return min === max ? min : `${min}–${max}`;
    }
    return trait.points ?? 0;
  };

  // Get selected option name if applicable
  const getSelectedOptionName = () => {
    if (trait.options && selectedOptions[trait.id]) {
      const opt = trait.options.find(o => o.id === selectedOptions[trait.id]);
      return opt?.name || null;
    }
    return null;
  };

  const displayCost = getDisplayCost();
  const selectedOptionName = getSelectedOptionName();

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
          <div className="tooltip-header">
            <span className="tooltip-name">{trait.name}</span>
            <span className={`pill dark ${displayCost === 0 ? 'free' : ''}`}>
              {displayCost === 0 ? 'Free' : `${displayCost} pt${displayCost !== 1 ? 's' : ''}`}
            </span>
          </div>
          
          {selectedOptionName && (
            <div className="tooltip-option">
              <span className="option-label">Selected:</span> {selectedOptionName}
            </div>
          )}
          
          <div className="tooltip-description">
            <ReactMarkdown>{trait.description}</ReactMarkdown>
          </div>
          
          <div className="tooltip-meta">
            {trait.type && trait.type !== 'core' && (
              <span className={`pill type ${trait.type}`}>
                {trait.categoryName && `${trait.categoryName} `}{trait.type.charAt(0).toUpperCase() + trait.type.slice(1)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
