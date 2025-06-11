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
  const [resizing, setResizing] = useState(false);
  const [position, setPosition] = useState<
    "top-left" | "top-right" | "bottom-left" | "bottom-right"
  >(() => {
    const stored = localStorage.getItem("videoPosition");
    return (
      (stored as
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right") || "bottom-right"
    );
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
    localStorage.setItem("videoPosition", position);
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

  const startMove = (e: React.MouseEvent) => {
    e.preventDefault();
    let pos = position;
    let startX = e.clientX;
    let startY = e.clientY;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (dx > 80 && pos.includes("left")) {
        pos = pos.replace("left", "right") as typeof pos;
        setPosition(pos);
        startX = ev.clientX;
      } else if (dx < -80 && pos.includes("right")) {
        pos = pos.replace("right", "left") as typeof pos;
        setPosition(pos);
        startX = ev.clientX;
      }
      if (dy > 80 && pos.includes("top")) {
        pos = pos.replace("top", "bottom") as typeof pos;
        setPosition(pos);
        startY = ev.clientY;
      } else if (dy < -80 && pos.includes("bottom")) {
        pos = pos.replace("bottom", "top") as typeof pos;
        setPosition(pos);
        startY = ev.clientY;
      }
    };
    const stop = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", stop);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", stop);
  };

  const handleMoveKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = position;
    if (e.key === "ArrowLeft" && next.includes("right")) {
      next = next.replace("right", "left") as typeof next;
    } else if (e.key === "ArrowRight" && next.includes("left")) {
      next = next.replace("left", "right") as typeof next;
    } else if (e.key === "ArrowUp" && next.includes("bottom")) {
      next = next.replace("bottom", "top") as typeof next;
    } else if (e.key === "ArrowDown" && next.includes("top")) {
      next = next.replace("top", "bottom") as typeof next;
    } else {
      return;
    }
    e.preventDefault();
    setPosition(next);
  };

  return (
    <div
      className={cn("resizable-video", `position-${position}`, { resizing })}
      style={{ width: size.width, height: size.height }}
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
