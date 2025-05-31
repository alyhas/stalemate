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
import cn from "classnames";
import { LiveClientOptions } from "./types";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // State for sidebar

  // Placeholder for connection status - replace with actual logic
  const isConnected = true; // Example status

  return (
    <div className={cn("app", { "sidebar-collapsed": sidebarCollapsed })}> {/* Apply sidebar-collapsed class */}
      <LiveAPIProvider options={apiOptions}>
        <header className="app-header">
          <div className="container"> {/* Using fixed-width container for header content */}
            <div className="header-brand">
              {/* Placeholder for Logo - replace with actual <img> or SVG */}
              <h1>Logo</h1> {/* Changed from <strong> to <h1> */}
            </div>
            <div className="header-actions">
              {/* Placeholder for Connection Status */}
              <span>{isConnected ? "Connected" : "Disconnected"}</span>
              {/* Add other header actions here if needed */}
            </div>
          </div>
        </header>

        {/* Changed from "streaming-console" to "app-container" and added "container-fluid" for full width */}
        <div className="app-container container-fluid">
          <div className="row">
            {/* SidePanel wrapped in an aside and grid column, now responsive */}
            <aside className="app-sidebar col-12 col-md-3">
              <SidePanel
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </aside>

            {/* Main content area wrapped in main and grid column, now responsive */}
            <main className="main-content col-12 col-md-9">
              {/* Changed from "main-app-area" to "workspace" */}
              <div className="workspace">
                {/* Added primary-content div for general app content */}
                <div className="primary-content">
                  <h2>Primary Content Area</h2>
                  <p>Other application content will go here.</p>
                  {/* TODO: Replace with actual application content components */}
                </div>
                <div className="media-container">
                  <video
                    className={cn("video-stream", { // Changed class from "stream"
                      hidden: !videoRef.current || !videoStream,
                    })}
                    ref={videoRef}
                    autoPlay
                    playsInline
                  />
                  <div className="media-controls">
                    {/* Placeholder for media controls (e.g., custom play/pause, timeline) */}
                  </div>
                </div>
              </div>

              <ControlTray
                videoRef={videoRef}
                supportsVideo={true}
                onVideoStreamChange={setVideoStream}
                enableEditingSettings={true}
              >
                {/* put your own buttons here */}
              </ControlTray>
            </main>
          </div>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
