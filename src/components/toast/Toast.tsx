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

import React from 'react';
import './toast.scss';
import cn from 'classnames';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastMessage = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // Duration in ms, if auto-dismissible
};

// Props for the Toast component itself
export type ToastProps = ToastMessage & {
  onClose: (id: string) => void;
};

const Toast: React.FC<ToastProps> = React.memo(({ id, message, type, onClose }) => { // Wrapped with React.memo
  const getIconName = (): string => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info'; // Default icon
    }
  };

  return (
    <div className={cn('toast', `toast-${type}`)} role="alert" aria-live={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}>
      <span className="toast-icon material-symbols-outlined">{getIconName()}</span>
      <p className="toast-message">{message}</p>
      <button
        className="toast-close-button material-symbols-outlined"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        close
      </button>
    </div>
  );
};

export default Toast; // No change to export if already memoized at definition
