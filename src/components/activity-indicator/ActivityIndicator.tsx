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
import './activity-indicator.scss'; // Component-specific SCSS file
import cn from 'classnames';

type ActivityIndicatorProps = {
  type?: 'typing'; // For future expansion if other types are needed
  className?: string; // For additional custom classes on the container
  text?: string; // Optional text to display next to or below spinner
};

const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({ type = 'typing', className, text }) => {
  if (type === 'typing') {
    const containerClass = cn("activity-indicator-container", className);
    const accessibilityLabel = text ? `${text} - Processing...` : "Processing...";

    return (
      <div className={containerClass}>
        <div className="typing-indicator" role="status" aria-label={accessibilityLabel}>
          {/* Dots are created purely by CSS on these spans */}
          <span></span>
          <span></span>
          <span></span>
        </div>
        {text && <span className="activity-text">{text}</span>}
      </div>
    );
  }

  // Potentially other types of indicators in the future
  // if (type === 'spinner') {
  //   return <div className={cn("loader-spinner", className)} role="status" aria-live="polite"> ... </div>;
  // }

  return null; // Default to null if type is not recognized or not provided in a different way
};

export default ActivityIndicator;
