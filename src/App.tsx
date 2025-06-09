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

import { useRef, useState, ChangeEvent, useEffect, useCallback, useMemo } from "react"; // Added useMemo
import "./App.scss";
import { LiveAPIProvider, useLiveAPIContext } from "./contexts/LiveAPIContext";
import SidePanel, { SidePanelHandle } from "./components/side-panel/SidePanel";
import ControlTray /*, { ControlTrayProps } */ from "./components/control-tray/ControlTray"; // Removed ControlTrayProps as not used in this file
import ControlButton from "./components/control-button/ControlButton";
import cn from "classnames";
import { LiveClientOptions } from "./types";
import { ToastProvider } from "./contexts/ToastContext";
import ToastContainer from "./components/toast/ToastContainer";
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeToggleButton from './components/theme-toggle-button/ThemeToggleButton';
import { useKeyboardShortcuts, ShortcutConfig } from './hooks/useKeyboardShortcuts';
import ShortcutsHelp from './components/shortcuts-help/ShortcutsHelp';
import { ContextMenuProvider } from './contexts/ContextMenuContext'; // Import ContextMenuProvider
import ContextMenuContainer from './components/context-menu/ContextMenuContainer'; // Import ContextMenuContainer

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
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [micMuted, setMicMuted] = useState(false);

  // Sidebar Resize States
  const DEFAULT_SIDEBAR_WIDTH = 280;
  const MIN_SIDEBAR_WIDTH = 220;
  const MAX_SIDEBAR_WIDTH = 500;
  const COLLAPSED_SIDEBAR_WIDTH = 80; // Matches SCSS collapsed width

  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('sidebarWidth');
      if (savedWidth) {
        const numWidth = parseInt(savedWidth, 10);
        return Math.max(MIN_SIDEBAR_WIDTH, Math.min(numWidth, MAX_SIDEBAR_WIDTH));
      }
    }
    return DEFAULT_SIDEBAR_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  const initialMouseXRef = useRef<number>(0);
  const initialSidebarWidthRef = useRef<number>(0);

  const { connected } = useLiveAPIContext();
  const { toggleTheme } = useTheme();
  const sidePanelRef = useRef<SidePanelHandle>(null);

  // Memoized callbacks for props
  const handleToggleSidebar = useCallback(() => setSidebarCollapsed(prev => !prev), []);
  const handleToggleSettings = useCallback(() => setSettingsOpen(prev => !prev), []);
  const handleCloseSettings = useCallback(() => setSettingsOpen(false), []);
  const handleToggleMicMute = useCallback(() => setMicMuted(prev => !prev), []);
  const handleToggleShortcutsHelp = useCallback(() => setShortcutsHelpOpen(prev => !prev), []);
  const handleCloseShortcutsHelp = useCallback(() => setShortcutsHelpOpen(false), []); // setShortcutsHelpOpen is stable

  const shortcutsConfig: ShortcutConfig = useMemo(() => ({
    'meta+shift+l': toggleTheme, // From useTheme, assumed stable
    'meta+,': handleToggleSettings,
    'meta+b': handleToggleSidebar,
    'meta+d': handleToggleMicMute,
    'meta+enter': () => sidePanelRef.current?.triggerSendMessage(),
    'meta+k': () => sidePanelRef.current?.focusSearchInput(),
    'shift+?': handleToggleShortcutsHelp,
  }), [
    toggleTheme,
    handleToggleSettings,
    handleToggleSidebar,
    handleToggleMicMute,
    handleToggleShortcutsHelp
    // sidePanelRef is stable, its .current property changes do not trigger re-memoization here.
    // The functions calling sidePanelRef.current methods are created within this useMemo.
  ]);

  // The dependencies for useKeyboardShortcuts hook itself.
  // Since shortcutsConfig is now memoized, this will re-run less often.
  // The actions inside shortcutsConfig are already memoized or stable.
  useKeyboardShortcuts(shortcutsConfig, [shortcutsConfig]); // Now only depends on the memoized config object

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsResizing(true);
    initialMouseXRef.current = event.clientX;
    initialSidebarWidthRef.current = sidebarWidth;

    const handle = document.getElementById('sidebar-resize-handle');
    if (handle) {
      handle.classList.add('is-resizing');
    }
  }, [sidebarWidth]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const deltaX = event.clientX - initialMouseXRef.current;
    let newWidth = initialSidebarWidthRef.current + deltaX;
    newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(newWidth, MAX_SIDEBAR_WIDTH));
    setSidebarWidth(newWidth);
  }, [setSidebarWidth]); // MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH are constants

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarWidth', sidebarWidth.toString());
    }
    const handle = document.getElementById('sidebar-resize-handle');
    if (handle) {
      handle.classList.remove('is-resizing');
    }
  }, [sidebarWidth]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const togglePipMode = async () => {
    if (!videoRef.current) return;

    if (document.pictureInPictureEnabled) {
      if (!document.pictureInPictureElement) {
        try {
          await videoRef.current.requestPictureInPicture();
          // setIsPipMode(true); // State will be updated by event listener
        } catch (error) {
          console.error("Error entering PiP mode:", error);
        }
      } else {
        try {
          await document.exitPictureInPicture();
          // setIsPipMode(false); // State will be updated by event listener
        } catch (error) {
          console.error("Error exiting PiP mode:", error);
        }
      }
    } else {
      console.warn("Picture-in-Picture is not enabled in this browser.");
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !document.pictureInPictureEnabled) return; // Also check if PiP is enabled

    const handleEnterPip = () => setIsPipMode(true);
    const handleLeavePip = () => setIsPipMode(false);

    videoElement.addEventListener('enterpictureinpicture', handleEnterPip);
    videoElement.addEventListener('leavepictureinpicture', handleLeavePip);

    // Initial check in case PiP was already active when component mounted or page reloaded
    if (document.pictureInPictureElement === videoElement) {
      setIsPipMode(true);
    } else {
      setIsPipMode(false);
    }

    return () => {
      videoElement.removeEventListener('enterpictureinpicture', handleEnterPip);
      videoElement.removeEventListener('leavepictureinpicture', handleLeavePip);
    };
  }, []); // videoRef.current is not a reactive dependency for the effect setup itself.
            // The effect runs once to attach/detach listeners. Content of ref can change without re-running effect.

  return (
    <ThemeProvider>
      <ToastProvider>
        <ContextMenuProvider> {/* ContextMenuProvider wraps the main app div */}
          <div className={cn("app", { "sidebar-collapsed": sidebarCollapsed })}>
            <LiveAPIProvider options={apiOptions}>
              <header className="app-header">
                <div className="container">
                <div className="header-brand">
                  <h1>Logo</h1>
                </div>
                <div className="header-actions">
                  <div className={cn("connection-status-indicator", { "connected": connected, "disconnected": !connected })}>
                    <span className="material-symbols-outlined connection-status-icon">
                      {connected ? "wifi" : "wifi_off"}
                    </span>
                    <span className="connection-status-text">
                      {connected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                  <ThemeToggleButton />
              </div>
            </div>
            </header>

        <div className="app-container container-fluid">
          <div className="row"> {/* This row is display: flex */}
            <aside
              className="app-sidebar"
              style={
                sidebarCollapsed
                  ? { flex: `0 0 ${COLLAPSED_SIDEBAR_WIDTH}px` }
                  : { flex: `0 0 ${sidebarWidth}px` }
              }
            >
              <SidePanel
                ref={sidePanelRef}
                collapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleSidebar} // Use memoized handler
              />
            </aside>

            <div
              className="resize-handle-col"
              id="sidebar-resize-handle"
              onMouseDown={handleMouseDown}
            ></div>

            <main className="main-content"> {/* Removed col-* classes */}
              <div className="workspace">
                <div className="primary-content">
                  <h2>Primary Content Area</h2>
                  <p>Other application content will go here.</p>
                  {/* TODO: Implement ShortcutsHelp modal triggered by shortcutsHelpOpen state */}
                  {shortcutsHelpOpen && (
                    <div className="modal-placeholder"> {/* Replace with actual modal */}
                      <h3>Keyboard Shortcuts</h3>
                      <p>Meta+Shift+L: Toggle Theme</p>
                      <p>Meta+,: Toggle Settings</p>
                      <p>Meta+B: Toggle Sidebar</p>
                      <p>Meta+D: Toggle Mic (TODO)</p>
                      <p>Meta+Enter: Send Message (TODO)</p>
                      <p>Meta+K: Focus Log Search (TODO)</p>
                      <p>?: Toggle Shortcuts Help</p>
                      <button onClick={() => setShortcutsHelpOpen(false)}>Close</button>
                    </div>
                  )}
                </div>
                <div className={cn("media-container", {
                  "picture-in-picture": isPipMode
                })}>
                  <video
                    className={cn("video-stream", {
                      hidden: !videoRef.current || !videoStream,
                    })}
                    ref={videoRef}
                    autoPlay
                    playsInline
                  />
                  <div className="media-controls">
                    {typeof document !== 'undefined' && document.pictureInPictureEnabled && videoStream && (
                      <ControlButton
                        icon={isPipMode ? "fullscreen_exit" : "picture_in_picture_alt"}
                        label={isPipMode ? "Exit Picture-in-Picture" : "Enter Picture-in-Picture"}
                        onClick={togglePipMode}
                        active={isPipMode}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Pass settings state and toggle function to ControlTray */}
              <ControlTray
                videoRef={videoRef}
                supportsVideo={true}
                onVideoStreamChange={setVideoStream}
                enableEditingSettings={true}
                settingsOpen={settingsOpen}
                toggleSettings={handleToggleSettings} // Use memoized handler
                muted={micMuted}
                onToggleMute={handleToggleMicMute} // Use memoized handler
              >
            </main>
          </div>
        </div>
      </LiveAPIProvider>
      <ToastContainer />
      <ShortcutsHelp isOpen={shortcutsHelpOpen} onClose={handleCloseShortcutsHelp} /> {/* Use memoized handler */}
      <ContextMenuContainer />
    </div>
  </ToastProvider>
  );
}

export default App;
