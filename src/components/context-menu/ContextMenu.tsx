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

import React, { useEffect, useRef, forwardRef } from 'react'; // Added forwardRef
import './context-menu.scss';
import cn from 'classnames';

export interface MenuItem {
  id?: string; // Optional unique ID for the item
  label: string;
  icon?: string; // Material Symbols icon name
  action?: () => void;
  disabled?: boolean;
  isSeparator?: boolean;
}

export interface ContextMenuProps {
  items: MenuItem[];
  position: { x: number; y: number } | null; // Allow null for hidden
  onClose: () => void;
}

// Changed to use forwardRef to accept a ref from ContextMenuContainer
const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(({ items, position, onClose }, ref) => {
  // Removed local menuRef, will use the forwarded ref if needed for internal logic,
  // but click-outside and escape are now handled by ContextMenuContainer.
  // The useEffects for click-outside and Escape key previously here are removed,
  // as ContextMenuContainer will now manage those global listeners.

  const handleItemClick = (itemAction?: () => void) => {
    if (itemAction) {
      itemAction();
    }
    onClose(); // Always close after action
  };

  if (!position) {
    return null;
  }

  return (
    <div
      ref={ref} // Apply the forwarded ref here
      className="context-menu"
      style={{ top: position.y, left: position.x }}
      role="menu"
      // tabIndex={-1}
    >
      <ul className="context-menu-list">
        {items.map((item, index) => {
          if (item.isSeparator) {
            return <li key={`sep-${index}`} className="context-menu-separator" role="separator"></li>;
          }
          return (
            <li
              key={item.id || item.label || `item-${index}`}
              className={cn('context-menu-item', { disabled: item.disabled })}
              onClick={() => !item.disabled && handleItemClick(item.action)}
              onKeyDown={(e) => {
                if (!item.disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleItemClick(item.action);
                }
              }}
              role="menuitem"
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : 0} // Make non-disabled items focusable
            >
              {item.icon && <span className="context-menu-item-icon material-symbols-outlined">{item.icon}</span>}
              <span className="context-menu-item-label">{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default React.memo(ContextMenu); // Wrap with React.memo
