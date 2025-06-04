import { RefObject, useEffect, useRef, useState } from "react";
import cn from "classnames";
import "./resizable-video.scss";

export default function ResizableVideo({
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

  const [position, setPosition] = useState(() => {
    const stored = localStorage.getItem("videoPosition");
    if (stored) {
      try {
        const { left, top } = JSON.parse(stored);
        return { left, top };
      } catch {
        /* ignore */
      }
    }
    return { left: 0, top: 0 };
  });
  const moveStartX = useRef(0);
  const moveStartY = useRef(0);
  const moveStartLeft = useRef(0);
  const moveStartTop = useRef(0);

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

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    startY.current = e.clientY;
    startW.current = size.width;
    startH.current = size.height;

    const onMove = (ev: MouseEvent) => {
      const width = Math.max(160, startW.current + ev.clientX - startX.current);
      const height = Math.max(90, startH.current + ev.clientY - startY.current);
      setSize({ width, height });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startMove = (e: React.MouseEvent) => {
    e.preventDefault();
    moveStartX.current = e.clientX;
    moveStartY.current = e.clientY;
    moveStartLeft.current = position.left;
    moveStartTop.current = position.top;

    const onMove = (ev: MouseEvent) => {
      const left = moveStartLeft.current + ev.clientX - moveStartX.current;
      const top = moveStartTop.current + ev.clientY - moveStartY.current;
      setPosition({ left, top });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className="resizable-video"
      style={{ width: size.width, height: size.height, left: position.left, top: position.top }}
    >
      <video
        ref={videoRef}
        className={cn("stream", { hidden: !stream })}
        autoPlay
        playsInline
      />
      <div className="move-handle" onMouseDown={startMove} />
      <div className="resize-handle" onMouseDown={startDrag} />
    </div>
  );
}
