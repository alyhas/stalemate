/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useCallback } from 'react';

export type ShortcutAction = () => void;
export interface ShortcutConfig {
  [keyCombination: string]: ShortcutAction;
}

// Helper to generate a consistent key for combinations
const generateKeyCombinationId = (event: KeyboardEvent): string => {
  let id = '';
  // Order of modifiers can matter for consistency if not always the same
  // Alphabetical order: Alt, Ctrl, Meta, Shift
  if (event.altKey) id += 'alt+';
  if (event.ctrlKey) id += 'ctrl+';
  if (event.metaKey) id += 'meta+'; // Command key on Mac, Windows key on Windows
  if (event.shiftKey) id += 'shift+';

  // Add the main key, converting to lowercase for consistency
  // Special keys like 'Enter', 'Escape', 'ArrowUp' should be handled as is (but lowercase)
  // For '?', event.key is typically '?' (with shiftKey true)
  // For '/', event.key is typically '/' (with shiftKey false)
  id += event.key.toLowerCase();
  return id;
};

export const useKeyboardShortcuts = (config: ShortcutConfig, dependencies: any[] = []) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const keyId = generateKeyCombinationId(event);

      const activeElement = document.activeElement;
      const isInputFocused = activeElement &&
        (activeElement.tagName === 'INPUT' ||
         activeElement.tagName === 'TEXTAREA' ||
         (activeElement instanceof HTMLElement && activeElement.isContentEditable));

      if (config[keyId]) {
        // More refined check for when to allow shortcuts in inputs:
        // Allow if Meta or Ctrl key is part of the combo.
        // Allow if the key is not a single character (e.g., "Escape", "Enter").
        // Allow if the key is '?' (often used for help modals).
        const allowInInput = event.metaKey || event.ctrlKey || event.key.length > 1 || event.key === '?';

        if (isInputFocused && !allowInInput) {
          return; // Let the input handle the key press
        }

        // Prevent default browser action for the shortcut if it's handled by the app
        // (e.g., Meta+S for save, Ctrl+F for find)
        // Only do this if the shortcut is actually found and handled.
        event.preventDefault();
        config[keyId]();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, ...dependencies] // Add any external dependencies that config callbacks might use
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]); // handleKeyDown itself changes if config or dependencies change
};
