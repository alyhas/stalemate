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

import cn from "classnames";
import { useEffect, useRef, useState } from "react";
import useHotkey from "../../hooks/use-hotkey";
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from "react-icons/ri";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { useLoggerStore } from "../../lib/store-logger";
import Logger, { LoggerFilterType } from "../logger/Logger";
import "./side-panel.scss";

const tabs: { value: LoggerFilterType; label: string }[] = [
  { value: "none", label: "All" },
  { value: "conversations", label: "Conversations" },
  { value: "tools", label: "Tool Use" },
];

export default function SidePanel() {
  const { connected, client } = useLiveAPIContext();
  const [open, setOpen] = useState(() => {
    const stored = localStorage.getItem("sidePanelOpen");
    return stored === null ? true : stored === "true";
  });
  const [width, setWidth] = useState(() => {
    const stored = localStorage.getItem("sidePanelWidth");
    return stored ? parseInt(stored, 10) : 400;
  });
  const startXRef = useRef(0);
  const startWidthRef = useRef(400);
  const loggerRef = useRef<HTMLDivElement>(null);
  const loggerLastHeightRef = useRef<number>(-1);
  const { log, logs, clearLogs } = useLoggerStore();

  const [textInput, setTextInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<LoggerFilterType>("none");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("sidePanelOpen", String(open));
  }, [open]);

  useEffect(() => {
    localStorage.setItem("sidePanelWidth", String(width));
  }, [width]);

  useHotkey("ctrl+b", () => setOpen((o) => !o), [setOpen]);
  useHotkey("ctrl+k", () => searchRef.current?.focus(), [searchRef]);
  useHotkey("ctrl+enter", () => {
    if (textInput.trim()) handleSubmit();
  }, [textInput]);
  useHotkey("ctrl+e", () => inputRef.current?.focus(), [inputRef]);

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

  const startResize = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    function onMove(ev: MouseEvent) {
      const delta = ev.clientX - startXRef.current;
      const newWidth = Math.min(600, Math.max(200, startWidthRef.current + delta));
      setWidth(newWidth);
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className={`side-panel ${open ? "open" : ""}`}
      style={{ width: open ? width : 40 }}
    >
      <header className="top">
        <h2 id="side-panel-title">Console</h2>
        {open ? (
          <button
            className="opener"
            aria-label="Collapse side panel"
            aria-expanded={true}
            aria-controls="side-panel-container"
            onClick={() => setOpen(false)}
          >
            <RiSidebarFoldLine color="#b4b8bb" />
          </button>
        ) : (
          <button
            className="opener"
            aria-label="Expand side panel"
            aria-expanded={false}
            aria-controls="side-panel-container"
            onClick={() => setOpen(true)}
          >
            <RiSidebarUnfoldLine color="#b4b8bb" />
          </button>
        )}
      </header>
      <section className="indicators">
        <nav className="tab-nav" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.value}
              className={cn("tab-button", { active: activeTab === t.value })}
              role="tab"
              aria-selected={activeTab === t.value}
              id={`tab-${t.value}`}
              aria-controls="side-panel-container"
              onClick={() => setActiveTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <input
          type="text"
          className="log-search"
          aria-label="Search logs"
          placeholder="Search logs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          ref={searchRef}
        />
        <div className={cn("streaming-indicator", { connected })}>
          {connected
            ? `🔵${open ? " Streaming" : ""}`
            : `⏸️${open ? " Paused" : ""}`}
        </div>
        <button
          className="clear-button material-symbols-outlined"
          aria-label="Clear logs"
          onClick={clearLogs}
        >
          delete
        </button>
      </section>
      <div
        id="side-panel-container"
        className="side-panel-container"
        ref={loggerRef}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        <Logger filter={activeTab} search={searchQuery} />
      </div>
      <div className={cn("input-container", { disabled: !connected })}>
        <div className="input-content">
          <textarea
            className="input-area"
            ref={inputRef}
            aria-label="Message input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }
            }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${t.scrollHeight}px`;
            }}
            onChange={(e) => setTextInput(e.target.value)}
            value={textInput}
          ></textarea>
          <span
            className={cn("input-content-placeholder", {
              hidden: textInput.length,
            })}
          >
            Type&nbsp;something...
          </span>

          <button
            className="send-button material-symbols-outlined filled"
            aria-label="Send message"
            onClick={handleSubmit}
          >
            send
          </button>
        </div>
      </div>
      {open && <div className="resize-handle" onMouseDown={startResize} />}
    </div>
  );
}
