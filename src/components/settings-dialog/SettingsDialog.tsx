import cn from "classnames";
import {
  memo,
  useCallback,
  useMemo,
  useState,
  useRef,
} from "react";
import { useLoggerStore } from "../../lib/store-logger";
import "./settings-dialog.scss";
import Panel from "../ui/Panel";
import Button from "../ui/Button";
import Input from "../ui/Input";
import useFocusTrap from "../../hooks/use-focus-trap";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import VoiceSelector from "./VoiceSelector";
import ResponseModalitySelector from "./ResponseModalitySelector";
import { FunctionDeclaration, LiveConnectConfig, Tool } from "@google/genai";

type FunctionDeclarationsTool = Tool & {
  functionDeclarations: FunctionDeclaration[];
};

function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { config, setConfig, connected } = useLiveAPIContext();
  const functionDeclarations: FunctionDeclaration[] = useMemo(() => {
    if (!Array.isArray(config.tools)) {
      return [];
    }
    return (config.tools as Tool[])
      .filter((t: Tool): t is FunctionDeclarationsTool =>
        Array.isArray((t as any).functionDeclarations)
      )
      .map((t) => t.functionDeclarations)
      .filter((fc) => !!fc)
      .flat();
  }, [config]);

  const [productName, setProductName] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [isFemale, setIsFemale] = useState<boolean>(true);
  const { maxLogs, setMaxLogs } = useLoggerStore((s) => ({
    maxLogs: s.maxLogs,
    setMaxLogs: s.setMaxLogs,
  }));

  const updateSystemInstruction = useCallback(() => {
    const genderText = isFemale ? "Female" : "Male";
    const newInstruction = `
You are a ${genderText} TikTok Live Selling Affiliate speaking in ${language}. Your role is to actively promote and sell ${productName}.
`;
    setConfig({ ...config, systemInstruction: newInstruction });
  }, [config, setConfig, productName, language, isFemale]);

  const updateFunctionDescription = useCallback(
    (editedFdName: string, newDescription: string) => {
      const newConfig: LiveConnectConfig = {
        ...config,
        tools:
          config.tools?.map((tool) => {
            const fdTool = tool as FunctionDeclarationsTool;
            if (!Array.isArray(fdTool.functionDeclarations)) {
              return tool;
            }
            return {
              ...tool,
              functionDeclarations: fdTool.functionDeclarations.map((fd) =>
                fd.name === editedFdName
                  ? { ...fd, description: newDescription }
                  : fd
              ),
            };
          }) || [],
      };
      setConfig(newConfig);
    },
    [config, setConfig]
  );
  useFocusTrap(dialogRef, open);

  return (
    <div className="settings-dialog">
      <Button
        variant="icon"
        icon="settings"
        onClick={() => setOpen(!open)}
        aria-label="Open settings"
      />
      <dialog
        ref={dialogRef}
        className={cn("dialog", { open })}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <Panel
          className={`dialog-container ${connected ? "disabled" : ""}`}
          hoverable
          animated
        >
          {connected && (
            <div className="connected-indicator">
              <p>
                These settings can only be applied before connecting and will
                override other settings.
              </p>
            </div>
          )}
          <div className="mode-selectors">
            <ResponseModalitySelector />
            <VoiceSelector />
          </div>

          <div className="custom-instructions">
            <label htmlFor="product-name">Product Name:</label>
            <Input
              id="product-name"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              onBlur={updateSystemInstruction}
              disabled={connected}
              block
            />
            <label htmlFor="language">Language:</label>
            <Input
              id="language"
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              onBlur={updateSystemInstruction}
              disabled={connected}
              block
            />
            <label htmlFor="agent-gender">Agent Gender:</label>
            <input
              id="agent-gender"
              type="checkbox"
              checked={isFemale}
              onChange={(e) => {
                setIsFemale(e.target.checked);
                updateSystemInstruction();
              }}
              disabled={connected}
            />
            <span>{isFemale ? "Female" : "Male"}</span>
          </div>
          <div className="log-settings">
            <label htmlFor="max-logs">Max log entries:</label>
            <Input
              id="max-logs"
              type="number"
              min="50"
              max="1000"
              value={maxLogs}
              onChange={(e) => setMaxLogs(parseInt(e.target.value, 10))}
            />
          </div>
          <h4>Function declarations</h4>
          <div className="function-declarations">
            <div className="fd-rows">
              {functionDeclarations.map((fd, fdKey) => (
                <div className="fd-row" key={`function-${fdKey}`}>
                  <span className="fd-row-name">{fd.name}</span>
                  <span className="fd-row-args">
                    {Object.keys(fd.parameters?.properties || {}).map(
                      (item, k) => (
                        <span key={k}>{item}</span>
                      )
                    )}
                  </span>
                  <Input
                    key={`fd-${fd.description}`}
                    className="fd-row-description"
                    type="text"
                    defaultValue={fd.description}
                    onBlur={(e) =>
                      updateFunctionDescription(fd.name!, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </dialog>
    </div>
  );
}

export default memo(SettingsDialog);
