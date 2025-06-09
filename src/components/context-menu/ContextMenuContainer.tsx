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
import { useContextMenu } from '../../contexts/ContextMenuContext'; // Adjust path as needed
import ContextMenu from './ContextMenu';
// No specific SCSS needed for this container component itself

const ContextMenuContainer: React.FC = () => {
  const { isOpen, items, position, hideContextMenu } = useContextMenu();
  // menuNodeRef will be forwarded to the actual ContextMenu's main div
  const menuNodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleInteractionOutside = (event: MouseEvent | TouchEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') {
          hideContextMenu();
        }
        return; // Don't process keyboard events further for click/touch outside logic
      }

      // Handle click/touch outside
      if (menuNodeRef.current && !menuNodeRef.current.contains(event.target as Node)) {
        hideContextMenu();
      }
    };

    // Add event listeners
    // Use 'mousedown' and 'touchstart' to catch interaction before a potential click event on a menu item
    document.addEventListener('mousedown', handleInteractionOutside);
    document.addEventListener('touchstart', handleInteractionOutside);
    document.addEventListener('keydown', handleInteractionOutside); // For Escape key

    return () => {
      document.removeEventListener('mousedown', handleInteractionOutside);
      document.removeEventListener('touchstart', handleInteractionOutside);
      document.removeEventListener('keydown', handleInteractionOutside);
    };
  }, [isOpen, hideContextMenu, menuNodeRef]); // menuNodeRef itself is stable

  if (!isOpen || !position || !items || items.length === 0) {
    return null;
  }

  // Pass the ref to ContextMenu component
  return <ContextMenu ref={menuNodeRef} items={items} position={position} onClose={hideContextMenu} />;
};

export default ContextMenuContainer;
