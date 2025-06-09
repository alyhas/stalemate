import {
  useCallback,
  useEffect, // Added useEffect
  useMemo,
  useRef, // Added useRef
  useState,
} from "react";
import "./settings-dialog.scss";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import VoiceSelector from "./VoiceSelector";
import ResponseModalitySelector from "./ResponseModalitySelector";
import { FunctionDeclaration, LiveConnectConfig, Tool } from "@google/genai";

type FunctionDeclarationsTool = Tool & {
  functionDeclarations: FunctionDeclaration[];
};

export interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Changed to a named function expression and wrapped with React.memo
const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
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

  useEffect(() => {
    const dialogNode = dialogRef.current;
    if (isOpen && dialogNode) {
      // Initial focus
      const focusableElementsQuery = 'button, [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const firstFocusable = dialogNode.querySelector<HTMLElement>(focusableElementsQuery);
      if (firstFocusable) {
        firstFocusable.focus();
      }

      // Focus trapping and Escape key listener
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          const focusables = Array.from(dialogNode.querySelectorAll<HTMLElement>(focusableElementsQuery))
                                .filter(el => el.offsetParent !== null && !el.hasAttribute('disabled'));

          if (focusables.length === 0) return;

          const firstFocusableElement = focusables[0];
          const lastFocusableElement = focusables[focusables.length - 1];

          if (event.shiftKey) { // Shift + Tab
            if (document.activeElement === firstFocusableElement) {
              lastFocusableElement.focus();
              event.preventDefault();
            }
          } else { // Tab
            if (document.activeElement === lastFocusableElement) {
              firstFocusableElement.focus();
              event.preventDefault();
            }
          }
        } else if (event.key === 'Escape') {
          onClose();
        }
      };

      dialogNode.addEventListener('keydown', handleKeyDown);
      return () => {
        // Check if dialogNode still exists before removing listener
        // This can happen if the component unmounts before the effect cleanup for some reason
        if (dialogNode) {
            dialogNode.removeEventListener('keydown', handleKeyDown);
        }
      };
    }
  }, [isOpen, onClose]);


  return (
    <div className={cn("settings-dialog-modal-wrapper", { "visible": isOpen })}>
      <div className={cn("dialog-backdrop", { "active": isOpen })} onClick={onClose}></div>
      <dialog ref={dialogRef} className={cn("dialog", { "dialog-open": isOpen })} open={isOpen}>
        <div className={`dialog-container ${connected ? "disabled" : ""}`} onClick={(e) => e.stopPropagation()}>
          <header className="dialog-header">
            <h2>Settings</h2>
            <button className="control-button dialog-internal-close-button material-symbols-outlined" onClick={onClose} aria-label="Close settings">
              close
            </button>
          </header>
          {connected && (
            <div className="connected-indicator">
              <p>
                These settings can only be applied before connecting and will
                override other settings.
              </p>
            </div>
          )}

          {/* Category 1: Response & Voice */}
          <section className="settings-category" id="settings-response-voice">
            <h3 className="settings-category-title">
              <span className="material-symbols-outlined settings-category-icon">record_voice_over</span>
              Response & Voice
            </h3>
            <div className="settings-category-content">
              <ResponseModalitySelector />
              <VoiceSelector />
            </div>
          </section>

          {/* Category 2: Agent Persona Customization */}
          <section className="settings-category" id="settings-agent-persona">
            <h3 className="settings-category-title">
              <span className="material-symbols-outlined settings-category-icon">badge</span>
              Agent Persona Customization
            </h3>
            {/* Added form-grid for potential 2-column layout for label-input pairs */}
            <div className="settings-category-content form-grid">
              <div className="form-field">
                <label htmlFor="product-name">Product Name:</label>
                <input
                  id="product-name"
                  type="text"
                  className="form-control" // Corrected class
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  onBlur={updateSystemInstruction}
                  disabled={connected}
                />
              </div>
              <div className="form-field">
                <label htmlFor="language">Language:</label>
                <input
                  id="language"
                  type="text"
                  className="form-control" // Corrected class
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  onBlur={updateSystemInstruction}
                  disabled={connected}
                />
              </div>
              <div className="form-field">
                <label htmlFor="agent-gender">Agent Gender:</label>
                <div className="gender-input-group"> {/* Wrapper for checkbox and span */}
                  {/* For checkboxes, the structure in inputs.scss is typically:
                      <input type="checkbox" class="form-check-input" id="exampleCheck1">
                      <label class="form-check-label" for="exampleCheck1">Check me out</label>
                      Here, the label is separate. We need to ensure our current structure works
                      or adapt it. inputs.scss has custom styling for the label based on input state.
                      For now, applying .form-check-input. The label text is currently a separate span.
                  */}
                  <input
                    id="agent-gender"
                    type="checkbox"
                    className="form-check-input" // Corrected class
                    checked={isFemale}
                    onChange={(e) => {
                      setIsFemale(e.target.checked);
                      updateSystemInstruction(); // updateSystemInstruction is memoized, so should be okay here
                    }}
                    disabled={connected}
                  />
                  {/* This span might need to become a <label htmlFor="agent-gender"> for inputs.scss styling to fully apply */}
                  <span>{isFemale ? "Female" : "Male"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Category 3: Function Declarations */}
          <section className="settings-category" id="settings-function-declarations">
            <h3 className="settings-category-title">
              <span className="material-symbols-outlined settings-category-icon">integration_instructions</span>
              Function Declarations
            </h3>
            <div className="settings-category-content">
              {/* The existing div.function-declarations and its contents */}
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
                      <input
                        key={`fd-${fd.description}`}
                        className="fd-row-description form-control" // Corrected class
                        type="text"
                        defaultValue={fd.description}
                        onBlur={(e) =>
                          updateFunctionDescription(fd.name!, e.target.value)
                        }
                        disabled={connected} // Ensure this is also disabled when connected
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default React.memo(SettingsDialog);
