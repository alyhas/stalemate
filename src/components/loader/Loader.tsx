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
import './loader.scss'; // Component-specific SCSS file
import cn from 'classnames';

type LoaderProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string; // For additional custom classes
  text?: string; // Optional text to display next to or below spinner
  inline?: boolean; // If true, use loader-container for inline display with text
};

const Loader: React.FC<LoaderProps> = ({ size = 'md', className, text, inline = false }) => {
  const loaderClass = cn(
    'loader-spinner', // Base class from src/styles/components/loader.scss
    {
      'loader-spinner-sm': size === 'sm',
      'loader-spinner-lg': size === 'lg',
      // 'md' is the default .loader-spinner size, no specific class needed unless it differs
    },
    className
  );

  const accessibilitySpan = <span className="visually-hidden">Loading...</span>;

  if (text) {
    // If inline is true, wrap in loader-container for inline-flex display
    // Otherwise, assume text might be below or styled differently by parent.
    // For simplicity, always use loader-container if text is present.
    return (
      <div className={cn("loader-container", { "loader-container-inline": inline })}>
        <div className={loaderClass} role="status" aria-live="polite">
          {accessibilitySpan}
        </div>
        <span className="loader-text">{text}</span>
      </div>
    );
  }

  return (
    <div className={loaderClass} role="status" aria-live="polite">
      {accessibilitySpan}
    </div>
  );
};

export default Loader;
