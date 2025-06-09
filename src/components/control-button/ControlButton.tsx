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
import cn from 'classnames';
// Import SCSS file - will be created next
// import './control-button.scss';

export interface ControlButtonProps {
  icon: string;
  active?: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean; // Added disabled as it's a common button prop
  className?: string;
}

const ControlButton: React.FC<ControlButtonProps> = React.memo((props) => { // Wrapped with React.memo
  return (
    <button
      className={cn(
        'control-button', // Base class for styling
        { active: props.active },
        props.className // Allow additional classes to be passed
      )}
      onClick={props.onClick}
      aria-label={props.label}
      data-tooltip={props.label} // For potential tooltip implementation
      disabled={props.disabled}
    >
      <span className="control-button-icon material-symbols-outlined filled">
        {props.icon}
      </span>
      {props.active && <div className="status-indicator" />}
    </button>
  );
};

export default ControlButton; // No change to export if already memoized at definition
