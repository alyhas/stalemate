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

import "./audio-pulse.scss";
import React from "react";
import { useEffect, useRef } from "react";
import c from "classnames";

const lineCount = 5; // Changed to 5 lines

export type AudioPulseProps = {
  active: boolean;
  volume: number;
  hover?: boolean;
};

export default function AudioPulse({ active, volume, hover }: AudioPulseProps) {
  const lines = useRef<HTMLDivElement[]>([]);
  const pulseContainerRef = useRef<HTMLDivElement>(null); // Added ref for the container

  useEffect(() => {
    let timeout: number | null = null;
    const update = () => {
      lines.current.forEach((line, i) => {
        let scaleFactor = 0;
        switch (i) {
          case 0: // Outermost left
          case 4: // Outermost right
            scaleFactor = 100;
            break;
          case 1: // Inner left
          case 3: // Inner right
            scaleFactor = 250;
            break;
          case 2: // Center
            scaleFactor = 400;
            break;
        }
        // Using existing minHeight (4) and maxHeight (24) from the original component's logic
        line.style.height = `${Math.min(
          24, // Max height
          4 + volume * scaleFactor, // Min height + scaled volume
        )}px`;
      });

      // Update container classes based on volume
      if (pulseContainerRef.current) {
        const lowThreshold = 0.02;  // Adjusted from 0.05 to make medium/high more reactive
        const mediumThreshold = 0.04; // Adjusted from 0.1

        // Remove previous classes
        pulseContainerRef.current.classList.remove('volume-low', 'volume-medium', 'volume-high');

        if (active) { // Only apply color changes if active
          if (volume >= mediumThreshold) {
            pulseContainerRef.current.classList.add('volume-high');
          } else if (volume >= lowThreshold) {
            pulseContainerRef.current.classList.add('volume-medium');
          } else {
            // Apply 'volume-low' only if volume is not zero, to distinguish from inactive low
            if (volume > 0) {
              pulseContainerRef.current.classList.add('volume-low');
            }
          }
        }
      }
      timeout = window.setTimeout(update, 100);
    };

    update();

    return () => clearTimeout((timeout as number)!);
  }, [volume]);

  return (
    <div className={c("audioPulse", { active, hover })} ref={pulseContainerRef}> {/* Assigned ref */}
      {Array(lineCount)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            ref={(el) => (lines.current[i] = el!)}
            style={{ animationDelay: `${i * 133}ms` }}
          />
        ))}
    </div>
  );
}
