// Grid (card) layout icon — shown so the user can switch TO grid view
const GRID_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M480 160L352 160L352 288L480 288L480 160zM544 288L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 288zM160 352L160 480L288 480L288 352L160 352zM288 288L288 160L160 160L160 288L288 288zM352 352L352 480L480 480L480 352L352 352z"/></svg>';

// List layout icon — shown so the user can switch TO list view
const LIST_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M96 160C96 124.7 124.7 96 160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM160 160L160 224L224 224L224 160L160 160zM480 160L288 160L288 224L480 224L480 160zM160 288L160 352L224 352L224 288L160 288zM480 288L288 288L288 352L480 352L480 288zM160 416L160 480L224 480L224 416L160 416zM480 416L288 416L288 480L480 480L480 416z"/></svg>';

/**
 * Shared list/grid view toggle button.
 * The icon shows the view that will be switched TO (mirrors the original builder toolbar).
 *
 * Props:
 * - isListView: boolean — true when the current view is the single-column list
 * - onToggle:   () => void
 */
export function ViewToggle({ isListView, onToggle }) {
  return (
    <button
      type="button"
      className="btn btn-secondary btn-icon-only btn-toggle toggle-traits-view"
      onClick={onToggle}
      data-view={isListView ? 'list' : 'card'}
      aria-label={isListView ? 'Switch to grid view' : 'Switch to list view'}
      title={isListView ? 'Switch to grid view' : 'Switch to list view'}
      dangerouslySetInnerHTML={{ __html: isListView ? GRID_ICON : LIST_ICON }}
    />
  );
}
