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
// Adjust path if ToastMessage/ToastType are in a types file or directly from Toast.tsx
import { ToastMessage, ToastType } from '../components/toast/Toast';

type ToastContextFunctions = {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void; // removeToast is needed by ToastContainer/Toast
};

// Context for functions to add/remove toasts
export const ToastFunctionsContext = createContext<ToastContextFunctions | undefined>(undefined);

// Context for the array of toast messages
export const ToastMessagesContext = createContext<ToastMessage[]>([]);

// Custom hook to conveniently access toast functions
export const useToast = () => {
  const context = useContext(ToastFunctionsContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType, duration: number = 5000) => {
    const id = Math.random().toString(36).substring(2, 9); // Simple unique ID
    setToasts(prevToasts => {
      // Optional: Limit number of toasts displayed at once
      // const newToasts = [...prevToasts, { id, message, type, duration }];
      // return newToasts.slice(-MAX_TOASTS); // Example: Keep only last N toasts
      return [...prevToasts, { id, message, type, duration }];
    });

    if (duration > 0) { // Only set timeout if duration is positive (0 or negative means persistent)
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []); // Empty dependency array for useCallback if removeToast is stable

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastFunctionsContext.Provider value={{ addToast, removeToast }}>
      <ToastMessagesContext.Provider value={toasts}>
        {children}
        {/* ToastContainer will be added to App.tsx or a main layout component */}
      </ToastMessagesContext.Provider>
    </ToastFunctionsContext.Provider>
  );
};
