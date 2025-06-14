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
import {
  memo,
  ReactNode,
  useState,
  forwardRef,
  useRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  ComponentPropsWithoutRef,
} from "react";
import { VariableSizeList as List } from "react-window";
import { useLoggerStore } from "../../lib/store-logger";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 as dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import ContextMenu from "./ContextMenu";
import { useToast } from "../../contexts/ToastContext";
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
  forwardRef(
    (
      {
        log,
        MessageComponent,
        onContextMenu,
        style,
      }: {
        log: StreamingLog;
        MessageComponent: ({
          message,
        }: {
          message: StreamingLog["message"];
        }) => ReactNode;
        onContextMenu: (e: React.MouseEvent, log: StreamingLog) => void;
        style?: React.CSSProperties;
      },
      ref: React.ForwardedRef<HTMLLIElement>
    ): JSX.Element => {
      const isObject = typeof log.message === "object";
      return (
        <li
          ref={ref}
          style={style}
          className={cn(
            `plain-log`,
            `source-${log.type.slice(0, log.type.indexOf("."))}`,
            {
              receive: log.type.includes("receive"),
              send: log.type.includes("send"),
            }
          )}
          onContextMenu={(e) => onContextMenu(e, log)}
        >
          <span className="timestamp">{formatTime(log.date)}</span>
          <span className="source">{log.type}</span>
          {isObject ? (
            <details className="message-details">
              <summary>details</summary>
              <MessageComponent message={log.message} />
            </details>
          ) : (
            <span className="message">
              <MessageComponent message={log.message} />
            </span>
          )}
          {log.count && <span className="count">{log.count}</span>}
        </li>
      );
    }
  )
);

const PlainTextMessage = ({
  message,
}: {
  message: StreamingLog["message"];
}) => <span>{message as string}</span>;

type Message = { message: StreamingLog["message"] };

const AnyMessage = ({ message }: Message) => (
  <pre>{JSON.stringify(message, null, "  ")}</pre>
);

function tryParseCodeExecutionResult(output: string) {
  try {
    const json = JSON.parse(output);
    return JSON.stringify(json, null, "  ");
  } catch (e) {
    return output;
  }
}

const RenderPart = memo(({ part }: { part: Part }) => {
  if (part.text && part.text.length) {
    return <p className="part part-text">{part.text}</p>;
  }
  if (part.executableCode) {
    return (
      <div className="part part-executableCode">
        <h5>executableCode: {part.executableCode.language}</h5>
        <SyntaxHighlighter
          language={part.executableCode!.language!.toLowerCase()}
          style={dark}
        >
          {part.executableCode!.code!}
        </SyntaxHighlighter>
      </div>
    );
  }
  if (part.codeExecutionResult) {
    return (
      <div className="part part-codeExecutionResult">
        <h5>codeExecutionResult: {part.codeExecutionResult!.outcome}</h5>
        <SyntaxHighlighter language="json" style={dark}>
          {tryParseCodeExecutionResult(part.codeExecutionResult!.output!)}
        </SyntaxHighlighter>
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
      <div key={`message-turn`}>
        {textParts.map((part, j) => (
          <RenderPart part={part} key={`message-part-${j}`} />
        ))}
      </div>
      {!turnComplete ? <span>turnComplete: false</span> : ""}
    </div>
  );
});

const ToolCallLog = memo(({ message }: Message) => {
  const { toolCall } = message as { toolCall: LiveServerToolCall };
  return (
    <div className={cn("rich-log tool-call")}>
      {toolCall.functionCalls?.map((fc, i) => (
        <div key={fc.id} className="part part-functioncall">
          <h5>Function call: {fc.name}</h5>
          <SyntaxHighlighter language="json" style={dark}>
            {JSON.stringify(fc, null, "  ")}
          </SyntaxHighlighter>
        </div>
      ))}
    </div>
  );
});

const ToolCallCancellationLog = ({ message }: Message): JSX.Element => (
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
  ({ message }: Message): JSX.Element => (
    <div className={cn("rich-log tool-response")}>
      {(message as LiveClientToolResponse).functionResponses?.map((fc) => (
        <div key={`tool-response-${fc.id}`} className="part">
          <h5>Function Response: {fc.id}</h5>
          <SyntaxHighlighter language="json" style={dark}>
            {JSON.stringify(fc.response, null, "  ")}
          </SyntaxHighlighter>
        </div>
      ))}
    </div>
  )
);

const ModelTurnLog = ({ message }: Message): JSX.Element => {
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
          <RenderPart part={part} key={`model-turn-part-${j}`} />
        ))}
    </div>
  );
};

const CustomPlainTextLog = (msg: string) => () =>
  <PlainTextMessage message={msg} />;

export type LoggerFilterType = "conversations" | "tools" | "none";

export type LoggerProps = {
  filter: LoggerFilterType;
  search?: string;
};

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

export default function Logger({ filter = "none", search = "" }: LoggerProps) {
  const { logs } = useLoggerStore();
  const { showToast } = useToast();

  const [menu, setMenu] = useState<
    | { x: number; y: number; text: string }
    | null
  >(null);

  const filterFn = filters[filter];
  const searchLower = search.toLowerCase();

  const filteredLogs = useMemo(() => {
    return logs
      .filter(filterFn)
      .filter((log) => {
        if (!searchLower) return true;
        const msgStr =
          typeof log.message === "string"
            ? log.message
            : JSON.stringify(log.message);
        return (
          log.type.toLowerCase().includes(searchLower) ||
          msgStr.toLowerCase().includes(searchLower)
        );
      });
  }, [logs, filterFn, searchLower]);

  const onContextMenu = (log: StreamingLog) => (e: React.MouseEvent) => {
    e.preventDefault();
    const text =
      typeof log.message === "string"
        ? log.message
        : JSON.stringify(log.message, null, "  ");
    setMenu({ x: e.clientX, y: e.clientY, text });
  };

  const listRef = useRef<List>(null);
  const sizeMap = useRef<Record<number, number>>({});
  const setSize = useCallback((index: number, size: number) => {
    if (sizeMap.current[index] !== size) {
      sizeMap.current[index] = size;
      listRef.current?.resetAfterIndex(index);
    }
  }, []);
  const getSize = useCallback(
    (index: number) => sizeMap.current[index] ?? 50,
    []
  );

  const Outer = forwardRef<HTMLUListElement, ComponentPropsWithoutRef<"ul">>(
    (props, ref) => (
      <ul
        {...props}
        ref={ref}
        role="log"
        aria-live="polite"
        aria-label="Logs"
      />
    )
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const log = filteredLogs[index];
    const rowRef = useCallback(
      (el: HTMLLIElement | null) => {
        if (el) setSize(index, el.getBoundingClientRect().height);
      },
      [index]
    );
    return (
      <LogEntry
        style={style}
        ref={rowRef}
        log={log}
        MessageComponent={component(log)}
        onContextMenu={onContextMenu(log)}
      />
    );
  };

  return (
    <div className="logger" ref={containerRef}>
      {height > 0 && (
        <List
          height={height}
          itemCount={filteredLogs.length}
          itemSize={getSize}
          width="100%"
          outerElementType={Outer}
          className="logger-list"
          overscanCount={10}
          ref={listRef}
        >
          {Row}
        </List>
      )}
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={[
            {
              label: "Copy message",
              onClick: () => {
                navigator.clipboard.writeText(menu.text);
                showToast("Copied");
              },
            },
          ]}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
