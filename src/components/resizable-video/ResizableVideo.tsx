import { RefObject, useEffect, useRef, useState, memo } from "react";
import cn from "classnames";
import "./resizable-video.scss";

export default memo(function ResizableVideo({
  videoRef,
  stream,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
}) {
  const [size, setSize] = useState(() => {
    const stored = localStorage.getItem("videoSize");
    if (stored) {
      try {
        const { width, height } = JSON.parse(stored);
        return { width, height };
      } catch {
        /* ignore */
      }
    }
    return { width: 480, height: 270 };
  });
  const startX = useRef(0);
  const startY = useRef(0);
  const startW = useRef(size.width);
  const startH = useRef(size.height);
  const startTop = useRef(0);
  const startLeft = useRef(0);
  const [resizing, setResizing] = useState(false);
  const [position, setPosition] = useState(() => {
    const stored = localStorage.getItem("videoPosition");
    if (stored) {
      try {
        const { top, left } = JSON.parse(stored);
        return { top, left } as { top: number; left: number };
      } catch {
        return { top: 0, left: 0 };
      }
    }
    return { top: 0, left: 0 };
  });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  useEffect(() => {
    localStorage.setItem("videoSize", JSON.stringify(size));
  }, [size]);

  useEffect(() => {
    localStorage.setItem("videoPosition", JSON.stringify(position));
  }, [position]);

  const adjustSize = (dx: number, dy: number) =>
    setSize(({ width, height }) => ({
      width: Math.max(160, width + dx),
      height: Math.max(90, height + dy),
    }));

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    startY.current = e.clientY;
    startW.current = size.width;
    startH.current = size.height;
    setResizing(true);

    const onMove = (ev: MouseEvent) => {
      const width = Math.max(160, startW.current + ev.clientX - startX.current);
      const height = Math.max(90, startH.current + ev.clientY - startY.current);
      setSize({ width, height });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setResizing(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowRight":
        adjustSize(10, 0);
        break;
      case "ArrowLeft":
        adjustSize(-10, 0);
        break;
      case "ArrowUp":
        adjustSize(0, -10);
        break;
      case "ArrowDown":
        adjustSize(0, 10);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const clamp = (val: number, min: number, max: number) =>
    Math.min(max, Math.max(min, val));

  const startMove = (e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    startY.current = e.clientY;
    startTop.current = position.top;
    startLeft.current = position.left;
    const container = (e.currentTarget.parentElement as HTMLElement).parentElement as HTMLElement;
    const rect = container.getBoundingClientRect();
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX.current;
      const dy = ev.clientY - startY.current;
      const top = clamp(startTop.current + dy, 0, rect.height - size.height);
      const left = clamp(startLeft.current + dx, 0, rect.width - size.width);
      setPosition({ top, left });
    };
    const stop = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stop);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stop);
  };

  const handleMoveKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const container = (e.currentTarget.parentElement as HTMLElement).parentElement as HTMLElement;
    const rect = container.getBoundingClientRect();
    const step = 10;
    let { top, left } = position;
    switch (e.key) {
      case "ArrowLeft":
        left -= step;
        break;
      case "ArrowRight":
        left += step;
        break;
      case "ArrowUp":
        top -= step;
        break;
      case "ArrowDown":
        top += step;
        break;
      default:
        return;
    }
    e.preventDefault();
    setPosition({
      top: clamp(top, 0, rect.height - size.height),
      left: clamp(left, 0, rect.width - size.width),
    });
  };

  return (
    <div
      className={cn("resizable-video", { resizing })}
      style={{
        width: size.width,
        height: size.height,
        top: position.top,
        left: position.left,
      }}
    >
      <video
        ref={videoRef}
        className={cn("stream", { hidden: !stream })}
        autoPlay
        playsInline
      />
      <div
        className="move-handle"
        role="button"
        aria-label="Move video"
        tabIndex={0}
        onMouseDown={startMove}
        onKeyDown={handleMoveKey}
      />
      <div
        className="resize-handle"
        role="slider"
        tabIndex={0}
        aria-label="Resize video"
        aria-valuetext={`${size.width} by ${size.height}`}
        onMouseDown={startDrag}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
});
