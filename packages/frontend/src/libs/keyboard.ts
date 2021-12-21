import React from 'react';

const withKeyboardShortcut = (callbacks?: Partial<{ submit: () => void; cancel: () => void }>) => {
  return (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (callbacks?.submit && !e.shiftKey && e.key == 'Enter') {
      e.preventDefault();
      callbacks.submit();
      return;
    }

    if (callbacks?.cancel && e.key === 'Escape') {
      e.preventDefault();
      callbacks.cancel();
      return;
    }
  };
};

export { withKeyboardShortcut };
