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
import { useTheme } from '../../contexts/ThemeContext';
import ControlButton from '../control-button/ControlButton';
// import './theme-toggle-button.scss'; // Optional: if specific styles are needed

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const isDarkMode = theme === 'dark';
  const iconName = isDarkMode ? 'light_mode' : 'dark_mode';
  const label = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  return (
    <ControlButton
      icon={iconName}
      label={label}
      onClick={toggleTheme}
      // active={isDarkMode} // Optional: if the button should appear "selected" when dark mode is on
      // className="theme-toggle-button" // Add if specific styling beyond ControlButton is needed
    />
  );
};

export default ThemeToggleButton;
