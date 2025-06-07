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

import { useRef, useState, ChangeEvent, useEffect } from "react";
import "./App.scss";
import { LiveAPIProvider, useLiveAPIContext } from "./contexts/LiveAPIContext"; // Import useLiveAPIContext
import SidePanel from "./components/side-panel/SidePanel";
import ControlTray, { ControlTrayProps } from "./components/control-tray/ControlTray"; // Import ControlTrayProps
import ControlButton from "./components/control-button/ControlButton";
import cn from "classnames";
import { LiveClientOptions } from "./types";
import { ToastProvider } from "./contexts/ToastContext";
import ToastContainer from "./components/toast/ToastContainer";
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeToggleButton from './components/theme-toggle-button/ThemeToggleButton';
import { useKeyboardShortcuts, ShortcutConfig } from './hooks/useKeyboardShortcuts';
import ShortcutsHelp from './components/shortcuts-help/ShortcutsHelp'; // Import ShortcutsHelp

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
  const [settingsOpen, setSettingsOpen] = useState(false); // State for Settings Dialog
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false); // State for Shortcuts Help Dialog

  // Placeholder for connection status - replace with actual logic
  // const isConnected = true; // This should come from useLiveAPIContext
  const { connected } /*, connect, disconnect */ = useLiveAPIContext(); // Get connected state

  const { toggleTheme } = useTheme(); // Get toggleTheme for shortcut

  // Placeholder functions for shortcuts until state is fully lifted/managed
  const handleToggleMic = () => console.log('Shortcut: Toggle Mic (TODO: implement in ControlTray or lift state)');
  const handleSendMessage = () => console.log('Shortcut: Send Message (TODO: implement in SidePanel or lift state)');
  const handleFocusLogSearch = () => {
    // This would ideally focus the input in SidePanel
    console.log('Shortcut: Focus Log Search (TODO: implement focus management)');
    const searchInput = document.querySelector('.log-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  const shortcutsConfig: ShortcutConfig = {
    'meta+shift+l': toggleTheme,
    'meta+,': () => setSettingsOpen(prev => !prev),
    'meta+b': () => setSidebarCollapsed(prev => !prev),
    'meta+d': handleToggleMic,
    'meta+enter': handleSendMessage,
    'meta+k': handleFocusLogSearch,
    '?': () => setShortcutsHelpOpen(prev => !prev),
    // For '?' key, ensure generateKeyCombinationId handles it as '?' or 'shift+/'
    // Current hook should register '?' directly if shift is not pressed, or 'shift+/' if shift is pressed
    // The prompt used '?' which means event.key === '?' (usually Shift + /)
    // The hook's generateKeyCombinationId uses event.key.toLowerCase(). If shift is pressed, it adds 'shift+'.
    // So, 'shift+/' is the key for '?' if event.key is '/'. If event.key is '?', then 'shift+?' is the id.
    // Let's assume the hook correctly identifies '?' with Shift+/ as '?' or 'shift+/'.
    // The current hook will create 'shift+/' if user types '?' (Shift + /).
    // So, the key should be 'shift+/'. Let's adjust for clarity.
    // Actually, event.key for '?' is just '?', and shiftKey is true.
    // So, the keyId would be 'shift+?'. Let's use that.
    'shift+?': () => setShortcutsHelpOpen(prev => !prev),
  };

  // Pass relevant state setters to the dependencies if actions directly use them
  // For now, toggleTheme, setSettingsOpen, setSidebarCollapsed are stable setters or direct calls.
  useKeyboardShortcuts(shortcutsConfig, [toggleTheme]);


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
    <ThemeProvider> {/* ThemeProvider is now the outermost provider */}
      <ToastProvider>
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
          <div className="row">
            <aside className="app-sidebar col-12 col-md-3">
              <SidePanel
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
              />
            </aside>

            <main className="main-content col-12 col-md-9">
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
                enableEditingSettings={true} // This prop might now be redundant if button is in ControlTray
                settingsOpen={settingsOpen}
                toggleSettings={() => setSettingsOpen(prev => !prev)}
              >
            </main>
          </div>
        </div>
      </LiveAPIProvider>
      <ToastContainer />
      <ShortcutsHelp isOpen={shortcutsHelpOpen} onClose={() => setShortcutsHelpOpen(false)} /> {/* Add ShortcutsHelp */}
    </div>
  </ToastProvider>
  );
}

export default App;
