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

import React, { createContext, useState, useCallback, ReactNode, useContext } from 'react';
import { MenuItem } from '../components/context-menu/ContextMenu'; // Adjust path as needed

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number } | null; // Allow null for initial state or when hidden
  items: MenuItem[];
}

type ContextMenuContextType = ContextMenuState & {
  showContextMenu: (x: number, y: number, items: MenuItem[]) => void;
  hideContextMenu: () => void;
};

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

const initialState: ContextMenuState = {
  isOpen: false,
  position: null,
  items: [],
};

export const ContextMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>(initialState);

  const showContextMenu = useCallback((x: number, y: number, items: MenuItem[]) => {
    const menuWidth = 200; // Approximate menu width, can be dynamic later
    const itemHeight = 35; // Approximate height of a single menu item
    const paddingAndSeparators = 20; // Approximate padding and separator heights
    const menuHeight = items.filter(item => !item.isSeparator).length * itemHeight +
                     items.filter(item => item.isSeparator).length * 10 + // Approx separator height
                     paddingAndSeparators;


    let adjustedX = x;
    let adjustedY = y;

    if (typeof window !== 'undefined') {
        if (x + menuWidth > window.innerWidth) {
            adjustedX = window.innerWidth - menuWidth - 10; // 10px buffer
        }
        if (y + menuHeight > window.innerHeight) {
            adjustedY = window.innerHeight - menuHeight - 10; // 10px buffer
        }
    }
    // Ensure x and y are not negative (e.g. if context menu triggered near top-left edge)
    adjustedX = Math.max(5, adjustedX); // 5px buffer from edge
    adjustedY = Math.max(5, adjustedY);

    setContextMenuState({
      isOpen: true,
      position: { x: adjustedX, y: adjustedY },
      items: items,
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenuState(prevState => ({ ...prevState, isOpen: false, position: null }));
  }, []);

  return (
    <ContextMenuContext.Provider value={{ ...contextMenuState, showContextMenu, hideContextMenu }}>
      {children}
      {/* The actual ContextMenu component will be rendered by a top-level component that consumes this context */}
    </ContextMenuContext.Provider>
  );
};

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (context === undefined) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};
