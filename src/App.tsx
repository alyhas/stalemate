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

import { useRef, useState } from "react";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import SidePanel from "./components/side-panel/SidePanel";
import ControlTray from "./components/control-tray/ControlTray";
import { LiveClientOptions } from "./types";
import ResizableVideo from "./components/resizable-video/ResizableVideo";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const apiOptions: LiveClientOptions = {
  apiKey: API_KEY,
};

function App() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [panelSide, setPanelSide] = useState<'left' | 'right'>(() => {
    const stored = localStorage.getItem('panelSide');
    return stored === 'right' ? 'right' : 'left';
  });

  const [trayPosition, setTrayPosition] = useState<'top' | 'bottom'>(() => {
    const stored = localStorage.getItem('trayPosition');
    return stored === 'top' ? 'top' : 'bottom';
  });

  const togglePanelSide = () => {
    setPanelSide((s) => {
      const next = s === 'left' ? 'right' : 'left';
      localStorage.setItem('panelSide', next);
      return next;
    });
  };

  const toggleTrayPosition = () => {
    setTrayPosition((p) => {
      const next = p === 'bottom' ? 'top' : 'bottom';
      localStorage.setItem('trayPosition', next);
      return next;
    });
  };

  return (
    <div className="App">
      <LiveAPIProvider options={apiOptions}>
        <div className={`streaming-console grid ${panelSide}-side tray-${trayPosition}`}>
          <div className="side-area col-span-12 md:col-span-4 lg:col-span-3">
            <SidePanel side={panelSide} onToggleSide={togglePanelSide} />
          </div>
          <main className="main-area col-span-12 md:col-span-8 lg:col-span-9">
            <div className="main-app-area">
              {/* APP goes here */}
              <ResizableVideo videoRef={videoRef} stream={videoStream} />
            </div>
          </main>
          <div className="tray-area col-span-12">
            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={setVideoStream}
              enableEditingSettings={true}
              trayPosition={trayPosition}
              onToggleTrayPosition={toggleTrayPosition}
            >
              {/* put your own buttons here */}
            </ControlTray>
          </div>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
