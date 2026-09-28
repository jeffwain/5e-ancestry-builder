import { useCallback } from 'react';
import { useCharacter } from '../contexts/CharacterContext';

/**
 * The builder summary's reset / copy / export actions.
 *
 * Each is overridable, so a caller that wants its own confirmation or download
 * behaviour passes a handler in and the default is skipped.
 */
export function useAncestryActions({ onReset, onExport, onCopy } = {}) {
  const { exportAsJson, reset } = useCharacter();

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
      return;
    }
    const json = exportAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ancestry-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [onExport, exportAsJson]);

  const handleCopy = useCallback(async () => {
    if (onCopy) {
      onCopy();
      return;
    }
    const json = exportAsJson();
    try {
      await navigator.clipboard.writeText(json);
      alert('Copied to clipboard!');
    } catch {
      alert('Failed to copy to clipboard');
    }
  }, [onCopy, exportAsJson]);

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
      return;
    }
    if (confirm('Are you sure you want to reset? This will clear all selected traits.')) {
      reset();
    }
  }, [onReset, reset]);

  return { handleExport, handleCopy, handleReset };
}
