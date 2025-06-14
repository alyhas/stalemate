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
import { LayoutSection, useLayout } from "./contexts/LayoutContext";

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
  const { layoutOrder, setLayoutOrder } = useLayout();
  const [dragging, setDragging] = useState<LayoutSection | null>(null);
  const [dragOver, setDragOver] = useState<LayoutSection | null>(null);

  const panelSide: 'left' | 'right' =
    layoutOrder.indexOf('side') < layoutOrder.indexOf('main') ? 'left' : 'right';
  const trayPosition: 'top' | 'bottom' =
    layoutOrder.indexOf('tray') === 0 ? 'top' : 'bottom';

  const togglePanelSide = () => {
    const newOrder = [...layoutOrder];
    const sideIndex = newOrder.indexOf("side");
    const mainIndex = newOrder.indexOf("main");
    newOrder[sideIndex] = "main";
    newOrder[mainIndex] = "side";
    setLayoutOrder(newOrder as LayoutSection[]);
  };

  const toggleTrayPosition = () => {
    const newOrder = [...layoutOrder];
    const trayIndex = newOrder.indexOf("tray");
    newOrder.splice(trayIndex, 1);
    if (trayIndex === 0) {
      newOrder.push("tray");
    } else {
      newOrder.unshift("tray");
    }
    setLayoutOrder(newOrder as LayoutSection[]);
  };

  const handleDragStart = (id: LayoutSection) => (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.dataTransfer.setData("text/plain", id);
    setDragging(id);
  };

  const handleDragOver = (id: LayoutSection) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(id);
  };

  const handleDrop = (id: LayoutSection) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragging;
    setDragging(null);
    setDragOver(null);
    if (!from || from === id) return;
    const current = [...layoutOrder];
    const i1 = current.indexOf(from);
    const i2 = current.indexOf(id);
    if (i1 === -1 || i2 === -1) return;
    current.splice(i1, 1);
    current.splice(i2, 0, from);
    setLayoutOrder(current as LayoutSection[]);
  };

  const gridAreas = () => {
    const [a, b, c] = layoutOrder;
    if (a === "tray") {
      return `"tray tray" "${b} ${c}"`;
    }
    if (c === "tray") {
      return `"${a} ${b}" "tray tray"`;
    }
    // fallback
    return `"${a} ${b}" "${c} ${c}"`;
  };

  return (
    <div className="App">
      <LiveAPIProvider options={apiOptions}>
          <div
            className="streaming-console grid"
            style={{ gridTemplateAreas: gridAreas() }}
          >
          <div
            className={`side-area layout-section col-span-12 md:col-span-4 lg:col-span-3 ${
              dragging === "side" ? "dragging" : ""
            } ${dragOver === "side" ? "drag-over" : ""}`}
              onDragOver={handleDragOver("side")}
              onDrop={handleDrop("side")}
            >
              <div
                className="layout-handle material-symbols-outlined"
                draggable
                onDragStart={handleDragStart("side")}
              >
                drag_handle
              </div>
              <SidePanel side={panelSide} onToggleSide={togglePanelSide} />
            </div>
            <main
              className={`main-area layout-section col-span-12 md:col-span-8 lg:col-span-9 ${
                dragging === "main" ? "dragging" : ""
              } ${dragOver === "main" ? "drag-over" : ""}`}
              onDragOver={handleDragOver("main")}
              onDrop={handleDrop("main")}
            >
              <div
                className="layout-handle material-symbols-outlined"
                draggable
                onDragStart={handleDragStart("main")}
              >
                drag_handle
              </div>
              <div className="main-app-area">
                {/* APP goes here */}
                <ResizableVideo videoRef={videoRef} stream={videoStream} />
              </div>
            </main>
            <div
              className={`tray-area layout-section col-span-12 ${
                dragging === "tray" ? "dragging" : ""
              } ${dragOver === "tray" ? "drag-over" : ""}`}
              onDragOver={handleDragOver("tray")}
              onDrop={handleDrop("tray")}
            >
              <div
                className="layout-handle material-symbols-outlined"
                draggable
                onDragStart={handleDragStart("tray")}
              >
                drag_handle
              </div>
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
