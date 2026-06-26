import { useState, useEffect, useRef } from 'react';

/**
 * Shared collapsible card shell.
 *
 * Reuses the builder card look (.category-trait / .header / .trait-category-content)
 * so every page gets the same accordion styling. Page-specific content is supplied
 * via `children`, which may be a render function receiving the current expanded state.
 *
 * Props:
 * - title:   string (rendered as <h3 class="name">) or a node for full control
 * - meta:    node rendered after the title inside the header (pills, counts, ...)
 * - type:    category color modifier class (e.g. 'culture', 'heritage', 'core-attribute')
 * - className: extra classes for the root (e.g. 'missing-required')
 * - defaultExpanded: initial expanded state (uncontrolled mode)
 * - expandSignal: { expanded, version } - batch expand/collapse trigger from a parent
 * - isOpen / onToggle: optional controlled mode. When isOpen is provided the parent
 *   owns the open state (e.g. "only one open at a time"); onToggle is called on click.
 * - children: node | (expanded: boolean) => node
 */
export function Accordion({
  title,
  meta = null,
  type = '',
  className = '',
  defaultExpanded = false,
  expandSignal,
  isOpen,
  onToggle,
  children,
}) {
  const isControlled = isOpen !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const lastSignalVersion = useRef(expandSignal?.version ?? 0);

  // Respond to parent expand/collapse signal (only when its version changes)
  useEffect(() => {
    if (!isControlled && expandSignal && expandSignal.version !== lastSignalVersion.current) {
      setInternalExpanded(expandSignal.expanded);
      lastSignalVersion.current = expandSignal.version;
    }
  }, [expandSignal, isControlled]);

  const isExpanded = isControlled ? isOpen : internalExpanded;

  const toggle = () => {
    if (onToggle) onToggle();
    if (!isControlled) setInternalExpanded((prev) => !prev);
  };

  const rootClass = [
    'category-trait',
    type,
    !isExpanded && 'collapsed',
    className,
  ].filter(Boolean).join(' ');

  const content = typeof children === 'function' ? children(isExpanded) : children;

  return (
    <div className={rootClass}>
      <button
        className="header"
        type="button"
        onClick={toggle}
        aria-expanded={isExpanded}
      >
        <div className="header-content">
          {typeof title === 'string' ? <h3 className="name">{title}</h3> : title}
          {meta}
        </div>
        <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>
      <div className="trait-category-content">
        {content}
      </div>
    </div>
  );
}
