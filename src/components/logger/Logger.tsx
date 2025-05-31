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

import "./logger.scss";

import cn from "classnames";
import { memo, ReactNode, useState } from "react"; // Added useState
import { useLoggerStore } from "../../lib/store-logger";
import CollapsibleContent from "./CollapsibleContent"; // Import CollapsibleContent
// Use Prism version for wider language support if needed, or keep default SyntaxHighlighter
// For this task, let's use the default (hljs) version if specific languages aren't an issue,
// or switch to Prism if more language grammars are needed.
// The prompt used 'okaidia' which is often associated with Prism, but hljs also has themes.
// Let's assume 'okaidia' can be found for 'react-syntax-highlighter/dist/esm/styles/hljs'
// If not, we'll use a common one like 'atomOneDark' or 'atomOneLight'.
// For now, let's try and stick to the existing 'hljs' import path if 'okaidia' is available there.
// A quick check reveals 'okaidia' is indeed an hljs style.
import SyntaxHighlighter from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/hljs"; // Using okaidia as requested

import {
  ClientContentLog as ClientContentLogType,
  StreamingLog,
} from "../../types";
import {
  Content,
  LiveClientToolResponse,
  LiveServerContent,
  LiveServerToolCall,
  LiveServerToolCallCancellation,
  Part,
} from "@google/genai";

const formatTime = (d: Date) => d.toLocaleTimeString().slice(0, -3);

const LogEntry = memo(
  ({
    log,
    MessageComponent,
    logKey, // Added logKey prop
  }: {
    log: StreamingLog;
    MessageComponent: ({ // Updated MessageComponent prop type
      message,
      logKey,
      expandedEntries,
      toggleEntry,
    }: {
      message: StreamingLog["message"];
      logKey: ExpandedEntryKey;
      expandedEntries: Set<ExpandedEntryKey>;
      toggleEntry: (key: ExpandedEntryKey) => void;
    }) => ReactNode;
    logKey: ExpandedEntryKey; // Added logKey prop
  }): JSX.Element => (
    <li
      className={cn(
        `plain-log`,
        `source-${log.type.slice(0, log.type.indexOf("."))}`,
        {
          receive: log.type.includes("receive"),
          send: log.type.includes("send"),
        }
      )}
    >
      <span className="timestamp">{formatTime(log.date)}</span>
      <span className="source">{log.type}</span>
      <span className="message">
        {/* Pass necessary props to MessageComponent */}
        <MessageComponent message={log.message} logKey={logKey} expandedEntries={expandedEntries} toggleEntry={toggleEntry} />
      </span>
      {log.count && <span className="count">{log.count}</span>}
    </li>
  )
);

const PlainTextMessage = ({
  message,
}: {
  message: StreamingLog["message"];
}) => <span>{message as string}</span>;

// Update Message type to include new props for collapsible content
type MessageComponentBaseProps = {
  message: StreamingLog["message"];
  logKey: ExpandedEntryKey;
  expandedEntries: Set<ExpandedEntryKey>;
  toggleEntry: (key: ExpandedEntryKey) => void;
};


const AnyMessage = ({ message, logKey, expandedEntries, toggleEntry }: MessageComponentBaseProps) => {
  let content;
  try {
    content = (typeof message === 'object' || typeof message === 'function') && message !== null
      ? JSON.stringify(message, null, "  ")
      : String(message);
  } catch (e) {
    content = String(message);
  }
  const collapsibleKey = `${logKey}-anymsg`;
  return (
    <CollapsibleContent
      content={content}
      isExpanded={expandedEntries.has(collapsibleKey)}
      onToggle={() => toggleEntry(collapsibleKey)}
    >
      {(displayContent) => (
        <SyntaxHighlighter language="json" style={okaidia} customStyle={{ margin: 0 }}>
          {displayContent}
        </SyntaxHighlighter>
      )}
    </CollapsibleContent>
  );
};

function tryParseCodeExecutionResult(output: string) {
  try {
    const json = JSON.parse(output);
    return JSON.stringify(json, null, "  "); // Pretty print for potential highlighting
  } catch (e) {
    return output; // Return as is if not JSON
  }
}

// RenderPart needs to accept logKey, expandedEntries, toggleEntry, and partKey (or generate it)
interface RenderPartProps {
  part: Part;
  partKey: ExpandedEntryKey; // Unique key for this part, e.g., `${logKey}-part-${index}`
  expandedEntries: Set<ExpandedEntryKey>;
  toggleEntry: (key: ExpandedEntryKey) => void;
}

const RenderPart = memo(({ part, partKey, expandedEntries, toggleEntry }: RenderPartProps) => {
  if (part.text && part.text.length) {
    // Make text collapsible if it's long, though less common for simple text parts
    // For now, keeping simple text as is unless explicitly needed for highlighting/collapsing
    return <p className="part part-text">{part.text}</p>;
  }
  if (part.executableCode) {
    const codeContent = part.executableCode!.code!;
    const language = part.executableCode!.language!.toLowerCase();
    return (
      return (
        <div className="part part-executableCode">
          <h5>executableCode: {language}</h5>
          <CollapsibleContent
            content={codeContent}
            isExpanded={expandedEntries.has(partKey)}
            onToggle={() => toggleEntry(partKey)}
          >
            {(displayContent) => (
              <SyntaxHighlighter language={language} style={okaidia} customStyle={{ margin: 0 }}>
                {displayContent}
              </SyntaxHighlighter>
            )}
          </CollapsibleContent>
        </div>
      );
  }
  if (part.codeExecutionResult) {
    const outputContent = tryParseCodeExecutionResult(part.codeExecutionResult!.output!);
    return (
      <div className="part part-codeExecutionResult">
        <h5>codeExecutionResult: {part.codeExecutionResult!.outcome}</h5>
        <CollapsibleContent
          content={outputContent}
          isExpanded={expandedEntries.has(partKey)}
          onToggle={() => toggleEntry(partKey)}
        >
          {(displayContent) => (
            <SyntaxHighlighter language="json" style={okaidia} customStyle={{ margin: 0 }}>
              {displayContent}
            </SyntaxHighlighter>
          )}
        </CollapsibleContent>
      </div>
    );
  }
  if (part.inlineData) {
    return (
      <div className="part part-inlinedata">
        <h5>Inline Data: {part.inlineData?.mimeType}</h5>
      </div>
    );
  }
  return <div className="part part-unknown">&nbsp;</div>;
});

const ClientContentLog = memo(({ message }: Message) => {
  const { turns, turnComplete } = message as ClientContentLogType;
  const textParts = turns.filter((part) => !(part.text && part.text === "\n"));
  return (
    <div className="rich-log client-content user">
      <h4 className="roler-user">User</h4>
      <div key={`${logKey}-message-turn`}>
        {textParts.map((part, j) => (
          <RenderPart
            part={part}
            key={`${logKey}-message-part-${j}`}
            partKey={`${logKey}-message-part-${j}`} // Pass unique key for this part
            expandedEntries={expandedEntries}
            toggleEntry={toggleEntry}
          />
        ))}
      </div>
      {!turnComplete ? <span>turnComplete: false</span> : ""}
    </div>
  );
});

const ToolCallLog = memo(({ message, logKey, expandedEntries, toggleEntry }: MessageComponentBaseProps) => {
  const { toolCall } = message as { toolCall: LiveServerToolCall };
  return (
    <div className={cn("rich-log tool-call")}>
      {toolCall.functionCalls?.map((fc, i) => {
        const collapsibleKey = `${logKey}-toolcall-${i}`;
        const content = JSON.stringify(fc, null, "  ");
        return (
          <div key={fc.id} className="part part-functioncall">
            <h5>Function call: {fc.name}</h5>
            <CollapsibleContent
              content={content}
              isExpanded={expandedEntries.has(collapsibleKey)}
              onToggle={() => toggleEntry(collapsibleKey)}
            >
              {(displayContent) => (
                <SyntaxHighlighter language="json" style={okaidia} customStyle={{ margin: 0 }}>
                  {displayContent}
                </SyntaxHighlighter>
              )}
            </CollapsibleContent>
          </div>
        );
      })}
    </div>
  );
});

const ToolCallCancellationLog = ({ message }: MessageComponentBaseProps): JSX.Element => (
  // This content is usually short, maybe doesn't need collapsing.
  <div className={cn("rich-log tool-call-cancellation")}>
    <span>
      {" "}
      ids:{" "}
      {(
        message as { toolCallCancellation: LiveServerToolCallCancellation }
      ).toolCallCancellation.ids?.map((id) => (
        <span className="inline-code" key={`cancel-${id}`}>
          "{id}"
        </span>
      ))}
    </span>
  </div>
);

const ToolResponseLog = memo(
  ({ message, logKey, expandedEntries, toggleEntry }: MessageComponentBaseProps): JSX.Element => (
    <div className={cn("rich-log tool-response")}>
      {(message as LiveClientToolResponse).functionResponses?.map((fr, i) => {
        const collapsibleKey = `${logKey}-toolresp-${i}`;
        const content = JSON.stringify(fr.response, null, "  ");
        return (
          <div key={`tool-response-${fr.id}`} className="part">
            <h5>Function Response: {fr.id}</h5>
            <CollapsibleContent
              content={content}
              isExpanded={expandedEntries.has(collapsibleKey)}
              onToggle={() => toggleEntry(collapsibleKey)}
            >
              {(displayContent) => (
                <SyntaxHighlighter language="json" style={okaidia} customStyle={{ margin: 0 }}>
                  {displayContent}
                </SyntaxHighlighter>
              )}
            </CollapsibleContent>
          </div>
        );
      })}
    </div>
  )
);

const ModelTurnLog = ({ message, logKey, expandedEntries, toggleEntry }: MessageComponentBaseProps): JSX.Element => {
  const serverContent = (message as { serverContent: LiveServerContent })
    .serverContent;
  const { modelTurn } = serverContent as { modelTurn: Content };
  const { parts } = modelTurn;

  return (
    <div className="rich-log model-turn model">
      <h4 className="role-model">Model</h4>
      {parts
        ?.filter((part) => !(part.text && part.text === "\n"))
        .map((part, j) => (
          <RenderPart
            part={part}
            key={`${logKey}-model-turn-part-${j}`}
            partKey={`${logKey}-model-turn-part-${j}`} // Pass unique key
            expandedEntries={expandedEntries}
            toggleEntry={toggleEntry}
          />
        ))}
    </div>
  );
};

const CustomPlainTextLog = (msg: string) => () =>
  <PlainTextMessage message={msg} />;

export type LoggerFilterType = "conversations" | "tools" | "none";

export type LoggerProps = {
  filter: LoggerFilterType;
  searchTerm?: string;
};

// Define a type for the keys used in expandedEntries Set
type ExpandedEntryKey = string;

const filters: Record<LoggerFilterType, (log: StreamingLog) => boolean> = {
  tools: (log: StreamingLog) =>
    typeof log.message === "object" &&
    ("toolCall" in log.message ||
      "functionResponses" in log.message ||
      "toolCallCancellation" in log.message),
  conversations: (log: StreamingLog) =>
    typeof log.message === "object" &&
    (("turns" in log.message && "turnComplete" in log.message) ||
      "serverContent" in log.message),
  none: () => true,
};

const component = (log: StreamingLog) => {
  if (typeof log.message === "string") {
    return PlainTextMessage;
  }
  if ("turns" in log.message && "turnComplete" in log.message) {
    return ClientContentLog;
  }
  if ("toolCall" in log.message) {
    return ToolCallLog;
  }
  if ("toolCallCancellation" in log.message) {
    return ToolCallCancellationLog;
  }
  if ("functionResponses" in log.message) {
    return ToolResponseLog;
  }
  if ("serverContent" in log.message) {
    const { serverContent } = log.message;
    if (serverContent?.interrupted) {
      return CustomPlainTextLog("interrupted");
    }
    if (serverContent?.turnComplete) {
      return CustomPlainTextLog("turnComplete");
    }
    if (serverContent && "modelTurn" in serverContent) {
      return ModelTurnLog;
    }
  }
  return AnyMessage;
};

export default function Logger({ filter = "none" }: LoggerProps) {
  const { logs } = useLoggerStore();
  const [expandedEntries, setExpandedEntries] = useState<Set<ExpandedEntryKey>>(new Set());

  const toggleEntry = (key: ExpandedEntryKey) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const filterFn = filters[filter];
  let logsToDisplay = logs.filter(filterFn);

  if (searchTerm && searchTerm.trim() !== '') {
    const lowerSearchTerm = searchTerm.toLowerCase();
    logsToDisplay = logsToDisplay.filter(logEntry => {
      // Search within various parts of the log entry
      // This is a simplified example; more complex log structures might need deeper inspection

      // 1. Check log.type (source)
      if (logEntry.type && logEntry.type.toLowerCase().includes(lowerSearchTerm)) {
        return true;
      }

      // 2. Check log.message if it's a simple string
      if (logEntry.message && typeof logEntry.message === 'string') {
        return logEntry.message.toLowerCase().includes(lowerSearchTerm);
      }

      // 3. For more complex object messages, try stringifying the whole message
      // This is a generic fallback and might be performance-intensive for very large/frequent logs.
      // A more targeted search within specific fields of object messages would be better if possible.
      if (logEntry.message && typeof logEntry.message === 'object') {
        try {
          const stringifiedMessage = JSON.stringify(logEntry.message);
          if (stringifiedMessage.toLowerCase().includes(lowerSearchTerm)) {
            return true;
          }
        } catch (e) {
          // Ignore stringification errors for this search
        }
      }

      // Add more specific checks based on known structures within logEntry.message
      // e.g., if logEntry.message.turns, logEntry.message.toolCall, etc.
      // For ClientContentLog (has turns with parts):
      if (logEntry.message && (logEntry.message as ClientContentLogType).turns) {
        const clientContent = logEntry.message as ClientContentLogType;
        return clientContent.turns.some(turn =>
          turn.parts?.some(part =>
            (part.text && part.text.toLowerCase().includes(lowerSearchTerm)) ||
            (part.executableCode?.code && part.executableCode.code.toLowerCase().includes(lowerSearchTerm))
            // Add other part types if relevant
          )
        );
      }
      // For ModelTurnLog (has serverContent with modelTurn with parts):
      if (logEntry.message && (logEntry.message as { serverContent: LiveServerContent })?.serverContent?.modelTurn?.parts) {
        const modelContent = (logEntry.message as { serverContent: LiveServerContent }).serverContent.modelTurn;
        return modelContent.parts.some(part =>
          (part.text && part.text.toLowerCase().includes(lowerSearchTerm)) ||
          (part.executableCode?.code && part.executableCode.code.toLowerCase().includes(lowerSearchTerm))
          // Add other part types if relevant
        );
      }
      // For ToolCallLog
      if (logEntry.message && (logEntry.message as { toolCall: LiveServerToolCall })?.toolCall?.functionCalls) {
        const toolCallContent = (logEntry.message as { toolCall: LiveServerToolCall }).toolCall;
        return toolCallContent.functionCalls.some(fc =>
          fc.name.toLowerCase().includes(lowerSearchTerm) ||
          (fc.args && JSON.stringify(fc.args).toLowerCase().includes(lowerSearchTerm))
        );
      }
      // For ToolResponseLog
       if (logEntry.message && (logEntry.message as LiveClientToolResponse)?.functionResponses) {
        const toolResponseContent = (logEntry.message as LiveClientToolResponse);
        return toolResponseContent.functionResponses.some(fr =>
            fr.id.toLowerCase().includes(lowerSearchTerm) ||
            (fr.response && JSON.stringify(fr.response).toLowerCase().includes(lowerSearchTerm))
        );
      }


      return false; // Default: no match
    });
  }

  return (
    <div className="logger panel">
      <div className="panel-body">
        <ul className="logger-list">
          {logsToDisplay.map((log, index) => { // Use logsToDisplay and index for key
            const logEntryKey = `log-${index}`; // Create a base key for the log entry
            return (
              <LogEntry
                MessageComponent={component(log)}
                log={log}
                key={logEntryKey}
                logKey={logEntryKey} // Pass the key to LogEntry
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
}
