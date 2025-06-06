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

import {
  memo,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
  forwardRef,
} from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { UseMediaStreamResult } from "../../hooks/use-media-stream-mux";
import { useScreenCapture } from "../../hooks/use-screen-capture";
import { useWebcam } from "../../hooks/use-webcam";
import { AudioRecorder } from "../../lib/audio-recorder";
import AudioVisualizer from "../audio-pulse/AudioVisualizer";
import { useTheme } from "../../contexts/ThemeContext";
import ControlButton from "./ControlButton";
import "./control-tray.scss";
import SettingsDialog from "../settings-dialog/SettingsDialog";
import ShortcutsDialog from "../shortcuts-dialog/ShortcutsDialog";
import useHotkey from "../../hooks/use-hotkey";
import Spinner from "../ui/Spinner";

export type ControlTrayProps = {
  videoRef: RefObject<HTMLVideoElement>;
  children?: ReactNode;
  supportsVideo: boolean;
  onVideoStreamChange?: (stream: MediaStream | null) => void;
  enableEditingSettings?: boolean;
  trayPosition: 'top' | 'bottom';
  onToggleTrayPosition: () => void;
};

type MediaStreamButtonProps = {
  isStreaming: boolean;
  onIcon: string;
  offIcon: string;
  start: () => Promise<any>;
  stop: () => any;
};

/**
 * button used for triggering webcam or screen-capture
 */
const MediaStreamButton = memo(
  forwardRef<HTMLButtonElement, MediaStreamButtonProps>(
    ({ isStreaming, onIcon, offIcon, start, stop }, ref) =>
      isStreaming ? (
        <ControlButton ref={ref} icon={onIcon} label={onIcon} onClick={stop} />
      ) : (
        <ControlButton ref={ref} icon={offIcon} label={offIcon} onClick={start} />
      ),
  ),
);

function ControlTray({
  videoRef,
  children,
  onVideoStreamChange = () => {},
  supportsVideo,
  enableEditingSettings,
  trayPosition,
  onToggleTrayPosition,
}: ControlTrayProps) {
  const videoStreams = [useWebcam(), useScreenCapture()];
  const [activeVideoStream, setActiveVideoStream] =
    useState<MediaStream | null>(null);
  const [webcam, screenCapture] = videoStreams;
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const connectButtonRef = useRef<HTMLButtonElement>(null);
  const [visualizerMode, setVisualizerMode] = useState<"bars" | "wave">(() => {
    const stored = localStorage.getItem("visualizerMode");
    return stored === "wave" ? "wave" : "bars";
  });
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  type TrayButtonId =
    | "mic"
    | "viz"
    | "screen"
    | "camera"
    | "pip"
    | "theme"
    | "move"
    | "help";

  const defaultButtonOrder: TrayButtonId[] = [
    "mic",
    "viz",
    "screen",
    "camera",
    "pip",
    "theme",
    "move",
    "help",
  ];

  const [buttonOrder, setButtonOrder] = useState<TrayButtonId[]>(() => {
    const stored = localStorage.getItem("controlTrayOrder");
    if (stored) {
      try {
        const arr = JSON.parse(stored) as TrayButtonId[];
        if (Array.isArray(arr)) return arr;
      } catch {
        /* ignore */
      }
    }
    return defaultButtonOrder;
  });

  useEffect(() => {
    localStorage.setItem("controlTrayOrder", JSON.stringify(buttonOrder));
  }, [buttonOrder]);

  const dragButton = useRef<TrayButtonId | null>(null);
  const onDragStart = (id: TrayButtonId) => () => {
    dragButton.current = id;
  };
  const onDropButton = (id: TrayButtonId) => () => {
    if (!dragButton.current || dragButton.current === id) return;
    setButtonOrder((order) => {
      const from = order.indexOf(dragButton.current!);
      const to = order.indexOf(id);
      if (from === -1 || to === -1) return order;
      const newOrder = [...order];
      newOrder.splice(to, 0, newOrder.splice(from, 1)[0]);
      return newOrder;
    });
    dragButton.current = null;
  };
  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  const handleButtonKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const total = buttonRefs.current.filter(Boolean).length;
    let nextIndex = index;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % total;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + total) % total;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = total - 1;
    } else {
      return;
    }
    e.preventDefault();
    buttonRefs.current[nextIndex]?.focus();
  };

  const { theme, toggleTheme } = useTheme();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  useHotkey("ctrl+/", () => setShortcutsOpen(true), []);
  useHotkey("ctrl+shift+l", toggleTheme, [toggleTheme]);
  useHotkey("ctrl+shift+t", onToggleTrayPosition, [onToggleTrayPosition]);
  useHotkey("ctrl+shift+m", () => setMuted((m) => !m), [setMuted]);
  useHotkey(
    "ctrl+shift+w",
    () => (webcam.isStreaming ? changeStreams()() : changeStreams(webcam)()),
    [webcam.isStreaming]
  );
  useHotkey(
    "ctrl+shift+s",
    () =>
      screenCapture.isStreaming
        ? changeStreams()()
        : changeStreams(screenCapture)(),
    [screenCapture.isStreaming]
  );
  useHotkey("ctrl+shift+p", togglePictureInPicture, [togglePictureInPicture]);
  useHotkey(
    "ctrl+shift+c",
    () => (connected ? disconnect() : connect()),
    [connected, connect, disconnect]
  );
  const [pipActive, setPipActive] = useState(false);

  useEffect(() => {
    localStorage.setItem("visualizerMode", visualizerMode);
  }, [visualizerMode]);

  const { client, connected, connecting, connect, disconnect, volume } =
    useLiveAPIContext();

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--volume",
      `${Math.max(5, Math.min(inVolume * 200, 8))}px`
    );
  }, [inVolume]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: "audio/pcm;rate=16000",
          data: base64,
        },
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on("data", onData).on("volume", setInVolume).start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off("data", onData).off("volume", setInVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLeave = () => setPipActive(false);
    video.addEventListener("leavepictureinpicture", onLeave);
    return () => video.removeEventListener("leavepictureinpicture", onLeave);
  }, [videoRef]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = activeVideoStream;
    }

    let timeoutId = -1;

    function sendVideoFrame() {
      const video = videoRef.current;
      const canvas = renderCanvasRef.current;

      if (!video || !canvas) {
        return;
      }

      const ctx = canvas.getContext("2d")!;
      canvas.width = video.videoWidth * 0.25;
      canvas.height = video.videoHeight * 0.25;
      if (canvas.width + canvas.height > 0) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 1.0);
        const data = base64.slice(base64.indexOf(",") + 1, Infinity);
        client.sendRealtimeInput([{ mimeType: "image/jpeg", data }]);
      }
      if (connected) {
        timeoutId = window.setTimeout(sendVideoFrame, 1000 / 0.5);
      }
    }
    if (connected && activeVideoStream !== null) {
      requestAnimationFrame(sendVideoFrame);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [connected, activeVideoStream, client, videoRef]);

  //handler for swapping from one video-stream to the next
  const changeStreams = (next?: UseMediaStreamResult) => async () => {
    if (next) {
      const mediaStream = await next.start();
      setActiveVideoStream(mediaStream);
      onVideoStreamChange(mediaStream);
    } else {
      setActiveVideoStream(null);
      onVideoStreamChange(null);
    }

    videoStreams.filter((msr) => msr !== next).forEach((msr) => msr.stop());
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (pipActive) {
      await document.exitPictureInPicture?.();
      setPipActive(false);
    } else {
      try {
        await video.requestPictureInPicture();
        setPipActive(true);
      } catch (_) {}
    }
  };

  const statusLabel = connecting
    ? "Connecting"
    : connected
    ? "Connected"
    : "Disconnected";

  const orderedIds = buttonOrder.filter(
    (id) => supportsVideo || !["screen", "camera", "pip"].includes(id),
  );
  const connectIndex = orderedIds.length;

  const renderButton = (id: TrayButtonId, index: number) => {
    const commonProps = {
      ref: (el: HTMLButtonElement | null) => (buttonRefs.current[index] = el),
      onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) =>
        handleButtonKeyDown(e, index),
      draggable: true,
      onDragStart: onDragStart(id),
      onDragOver: allowDrop,
      onDrop: onDropButton(id),
    } as const;

    switch (id) {
      case "mic":
        return (
          <>
            <ControlButton
              {...commonProps}
              key="mic"
              icon={muted ? "mic_off" : "mic"}
              label={muted ? "Unmute microphone" : "Mute microphone"}
              className="mic-button"
              onClick={() => setMuted(!muted)}
              active={!muted}
            />
            <div key="vizdisplay" className="action-button no-action outlined">
              <AudioVisualizer
                analyser={audioRecorder.analyser}
                active={connected && !muted}
                mode={visualizerMode}
              />
            </div>
          </>
        );
      case "viz":
        return (
          <ControlButton
            {...commonProps}
            key="viz"
            icon={visualizerMode === "bars" ? "equalizer" : "show_chart"}
            label="Toggle visualizer mode"
            onClick={() =>
              setVisualizerMode((m) => (m === "bars" ? "wave" : "bars"))
            }
          />
        );
      case "screen":
        return supportsVideo ? (
          <MediaStreamButton
            {...commonProps}
            key="screen"
            isStreaming={screenCapture.isStreaming}
            start={changeStreams(screenCapture)}
            stop={changeStreams()}
            onIcon="cancel_presentation"
            offIcon="present_to_all"
          />
        ) : null;
      case "camera":
        return supportsVideo ? (
          <MediaStreamButton
            {...commonProps}
            key="camera"
            isStreaming={webcam.isStreaming}
            start={changeStreams(webcam)}
            stop={changeStreams()}
            onIcon="videocam_off"
            offIcon="videocam"
          />
        ) : null;
      case "pip":
        return supportsVideo ? (
          <ControlButton
            {...commonProps}
            key="pip"
            icon="picture_in_picture_alt"
            label="Toggle picture in picture"
            onClick={togglePictureInPicture}
            active={pipActive}
          />
        ) : null;
      case "theme":
        return (
          <ControlButton
            {...commonProps}
            key="theme"
            icon={theme === "dark" ? "light_mode" : "dark_mode"}
            label="Toggle theme"
            onClick={toggleTheme}
          />
        );
      case "move":
        return (
          <ControlButton
            {...commonProps}
            key="move"
            icon={trayPosition === "bottom" ? "arrow_upward" : "arrow_downward"}
            label="Move controls"
            onClick={onToggleTrayPosition}
          />
        );
      case "help":
        return (
          <ControlButton
            {...commonProps}
            key="help"
            icon="help"
            label="Keyboard shortcuts"
            onClick={() => setShortcutsOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="control-tray">
      <canvas style={{ display: "none" }} ref={renderCanvasRef} />
      <nav
        className={cn("actions-nav", { disabled: !connected })}
        role="toolbar"
        aria-orientation="horizontal"
        aria-label="Controls"
      >
        {orderedIds.map((id, i) => (
          <React.Fragment key={id}>{renderButton(id, i)}</React.Fragment>
        ))}
        {children}
      </nav>

      <div
        className={cn("connection-container", { connected })}
        role="status"
        aria-live="polite"
        aria-label={statusLabel}
      >
        <div className="connection-button-container">
          <ControlButton
            ref={(el) => {
              connectButtonRef.current = el;
              buttonRefs.current[connectIndex] = el;
            }}
            onKeyDown={(e) => handleButtonKeyDown(e, connectIndex)}
            icon={connected ? "pause" : "play_arrow"}
            label={connected ? "Disconnect" : "Connect"}
            className={cn("connect-toggle", { connected })}
            onClick={connected ? disconnect : connect}
            active={connected}
          />
          {connecting && !connected && <Spinner size={18} label="Connecting" />}
        </div>
        <div className="status-led" aria-hidden="true" />
        <span className="text-indicator">Streaming</span>
      </div>
      {enableEditingSettings ? <SettingsDialog /> : ""}
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </section>
  );
}

export default memo(ControlTray);
