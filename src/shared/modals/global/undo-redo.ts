export function setupGlobalUndoRedo(undo: () => void, redo: () => void): void {
    window.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z';
        const isRedo =
          (e.ctrlKey || e.metaKey) &&
          (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'));
  
        if (!isUndo && !isRedo) return;
  
        // Always prevent default to block native undo behavior
        e.preventDefault();
  
        const isEditable =
          e.target instanceof HTMLElement &&
          e.target.matches('input, textarea, [contenteditable="true"]');
  
        // Only run global undo/redo when not editing an input
        if (!isEditable) {
          if (isUndo) undo();
          else redo();
        }
      },
      { capture: true }
    );
  }
  