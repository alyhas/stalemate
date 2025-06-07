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

import React, { useEffect, useRef } from 'react';
import cn from 'classnames';
import './shortcuts-help.scss';

type ShortcutsHelpProps = {
  isOpen: boolean;
  onClose: () => void;
};

const shortcutsList = [
  { keys: ['⌘', 'Shift', 'L'], description: 'Toggle Light/Dark Theme' },
  { keys: ['⌘', ','], description: 'Open Settings Dialog' },
  { keys: ['⌘', 'B'], description: 'Toggle Sidebar Collapse' },
  { keys: ['⌘', 'D'], description: 'Toggle Microphone Mute (Control Tray)' },
  { keys: ['⌘', 'Enter'], description: 'Send Message (from SidePanel input)' },
  { keys: ['⌘', 'K'], description: 'Focus Log Search (SidePanel)' },
  { keys: ['?'], description: 'Open This Shortcuts Help Screen' },
  { keys: ['Esc'], description: 'Close active dialog (Settings, Help)' },
];
// For Windows/Linux users, display Ctrl instead of Meta/⌘
const isMac = typeof navigator !== 'undefined' ? /Mac|iPod|iPhone|iPad/.test(navigator.platform) : false;
const metaKeyDisplay = isMac ? '⌘' : 'Ctrl';

const shortcuts = shortcutsList.map(s => ({
    ...s,
    keys: s.keys.map(k => k === 'Meta' ? metaKeyDisplay : k)
}));


const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (isOpen && dialogNode) {
      const focusableElementsQuery = 'button, [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const closeButton = dialogNode.querySelector<HTMLElement>('.shortcuts-close-button');

      if (closeButton) {
        closeButton.focus();
      } else {
        // Fallback for non-interactive dialog, make dialog itself focusable
        // dialogNode.setAttribute('tabindex', '-1');
        // dialogNode.focus();
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        } else if (event.key === 'Tab') {
          const focusables = Array.from(dialogNode.querySelectorAll<HTMLElement>(focusableElementsQuery))
                                .filter(el => el.offsetParent !== null && !el.hasAttribute('disabled'));

          if (focusables.length <= 1 && closeButton) { // Only close button is focusable
             if (document.activeElement === closeButton) {
                event.preventDefault(); // Prevent tabbing out if only one element
             }
             return;
          }

          // Simplified trap for now if more elements are added later
          if (focusables.length > 1) {
            const firstFocusableElement = focusables[0];
            const lastFocusableElement = focusables[focusables.length - 1];
            if (event.shiftKey) {
              if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                event.preventDefault();
              }
            } else {
              if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                event.preventDefault();
              }
            }
          }
        }
      };
      dialogNode.addEventListener('keydown', handleKeyDown);
      return () => {
        if (dialogNode) {
            dialogNode.removeEventListener('keydown', handleKeyDown);
        }
      };
    }
  }, [isOpen, onClose]);

  return (
    // Use a React Fragment as settings-dialog-modal-wrapper might not be appropriate here
    // Or, create a more generic ModalWrapper component later.
    // For now, directly rendering backdrop and dialog.
    <>
      {/* The dialog-backdrop and dialog classes are assumed to be styled globally by settings-dialog.scss */}
      {/* Or these styles should be extracted to a common _dialog.scss and imported here too. */}
      <div className={cn("dialog-backdrop", { "active": isOpen })} onClick={onClose}></div>
      <dialog ref={dialogRef} className={cn("dialog", "shortcuts-help-dialog", { "dialog-open": isOpen })} aria-labelledby="shortcuts-help-title" open={isOpen}>
        <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
            <header className="dialog-header">
            <h2 id="shortcuts-help-title" className="dialog-title">Keyboard Shortcuts</h2>
            <button className="shortcuts-close-button material-symbols-outlined" onClick={onClose} aria-label="Close shortcuts help">
                close
            </button>
            </header>
            <div className="dialog-content">
            <ul className="shortcuts-list">
                {shortcuts.map((shortcut, index) => (
                <li key={index} className="shortcut-item">
                    <div className="shortcut-keys">
                    {shortcut.keys.map((key, k_index) => (
                        <kbd key={k_index} className="shortcut-key">{key}</kbd>
                    ))}
                    </div>
                    <span className="shortcut-description">{shortcut.description}</span>
                </li>
                ))}
            </ul>
            </div>
        </div>
      </dialog>
    </>
  );
};

export default ShortcutsHelp;
