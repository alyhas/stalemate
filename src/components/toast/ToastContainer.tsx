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

import React, { useContext } from 'react';
import Toast from './Toast'; // Assuming Toast.tsx is in the same directory
import { ToastMessagesContext, ToastFunctionsContext } from '../../contexts/ToastContext'; // Adjust path as needed
import './toast-container.scss';

const ToastContainer: React.FC = () => {
  const toasts = useContext(ToastMessagesContext);
  const toastFunctions = useContext(ToastFunctionsContext);

  // Ensure context is not undefined, though useToast hook handles this for functions.
  // For direct consumption like this, a check might be good if provider isn't guaranteed at root.
  if (!toastFunctions) {
    // This should ideally not happen if ToastContainer is used within ToastProvider
    return null;
  }
  const { removeToast } = toastFunctions;

  if (!toasts || !toasts.length) {
    return null;
  }

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
