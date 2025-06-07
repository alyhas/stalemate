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

// import "./react-select.scss";
import cn from "classnames";
import React, { useEffect, useRef, useState, ChangeEvent, forwardRef, useImperativeHandle } from "react"; // Added forwardRef, useImperativeHandle
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { useLoggerStore } from "../../lib/store-logger";
import Logger, { LoggerFilterType } from "../logger/Logger";
import ControlButton from "../control-button/ControlButton"; // Import ControlButton
import "./side-panel.scss";

const filterOptions = [
  { value: "conversations", label: "Conversations" },
  { value: "tools", label: "Tool Use" },
  { value: "none", label: "All" },
] as const; // Add 'as const' for stricter typing of option.value

export interface SidePanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export interface SidePanelHandle {
  focusSearchInput: () => void;
  triggerSendMessage: () => void;
}

const SidePanel = forwardRef<SidePanelHandle, SidePanelProps>(({ collapsed, onToggleCollapse }, ref) => {
  const { connected, client } = useLiveAPIContext();
  const loggerRef = useRef<HTMLDivElement>(null);
  const loggerLastHeightRef = useRef<number>(-1);
  const { log, logs } = useLoggerStore();

  const [textInput, setTextInput] = useState("");
  const [activeTab, setActiveTab] = useState<LoggerFilterType>('none');
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logSearchInputRef = useRef<HTMLInputElement>(null); // Ref for log search input

  // Auto-expand textarea height
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [textInput]);

  // Expose methods via useImperativeHandle
  useImperativeHandle(ref, () => ({
    focusSearchInput: () => {
      logSearchInputRef.current?.focus();
    },
    triggerSendMessage: () => {
      // Only send if there's text and connected
      if (textInput.trim() && connected) {
        handleSubmit();
      }
    }
  }), [textInput, connected, handleSubmit]); // Add dependencies


  //scroll the log to the bottom when new logs come in
  useEffect(() => {
    if (loggerRef.current) {
      const el = loggerRef.current;
      const scrollHeight = el.scrollHeight;
      if (scrollHeight !== loggerLastHeightRef.current) {
        el.scrollTop = scrollHeight;
        loggerLastHeightRef.current = scrollHeight;
      }
    }
  }, [logs]);

  // listen for log events and store them
  useEffect(() => {
    client.on("log", log);
    return () => {
      client.off("log", log);
    };
  }, [client, log]);

  const handleSubmit = () => {
    client.send([{ text: textInput }]);

    setTextInput("");
    if (inputRef.current) {
      inputRef.current.innerText = "";
    }
  };

  return (
    // Use `!collapsed` for "open" state, and add "collapsed" class for specific styling if needed
    <div className={cn("side-panel", { open: !collapsed, collapsed: collapsed })}>
      <header className="top">
        <h2>Console</h2>
        {/* Use onToggleCollapse and reflect the collapsed prop */}
        <button className="opener" onClick={onToggleCollapse}>
          {collapsed ? (
            <RiSidebarUnfoldLine color="#b4b8bb" />
          ) : (
            <RiSidebarFoldLine color="#b4b8bb" />
          )}
        </button>
      </header>

      {/* Tab Navigation UI */}
      <div className="log-tabs">
        {filterOptions.map(option => (
          <button
            key={option.value}
            className={cn('log-tab-button', { active: activeTab === option.value })}
            onClick={() => setActiveTab(option.value as LoggerFilterType)} // Cast value
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Log Search Toolbar */}
      <div className="log-search-toolbar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="log-search-input"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={logSearchInputRef} // Assign ref to log search input
          />
          {searchTerm && (
            <button
              className="clear-search-button material-symbols-outlined"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              close
            </button>
          )}
        </div>
      </div>

      <section className="indicators">
        {/* Select component removed, this section might be removed or repurposed if only streaming indicator remains */}
        {/* For now, keeping it for the streaming indicator */}
        <div className={cn("streaming-indicator", { connected })}>
          {connected
            ? `🔵${!collapsed ? " Streaming" : ""}` // Reflect !collapsed for "open" text
            : `⏸️${!collapsed ? " Paused" : ""}`}
        </div>
      </section>
      <div className="side-panel-container" ref={loggerRef}>
        <Logger
          filter={activeTab}
          searchTerm={searchTerm} // Pass searchTerm to Logger
        />
      </div>
      <div className={cn("input-container", { disabled: !connected })}>
        <div className="input-content">
          <textarea
            className="input-area"
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }
            }}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTextInput(e.target.value)}
            value={textInput}
            rows={1} // Start with a single row
          ></textarea>
          <span
            className={cn("input-content-placeholder", {
              hidden: textInput.length,
            })}
          >
            Type&nbsp;something...
          </span>
          <ControlButton
            icon="send"
            label="Send message"
            onClick={handleSubmit}
            disabled={!textInput.trim() || !connected} // Disable if no text or not connected
            // active={!!textInput.trim()} // Optional: style when active
          />
        </div>
      </div>
    </div>
  );
});

export default SidePanel; // Keep default export if that's the convention
// If memoization is needed: export default React.memo(SidePanel);
