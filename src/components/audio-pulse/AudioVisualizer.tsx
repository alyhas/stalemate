import React, { useEffect, useRef } from "react";
import "./audio-visualizer.scss";

export type AudioVisualizerProps = {
  analyser?: AnalyserNode;
  active: boolean;
};

export default function AudioVisualizer({ analyser, active }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    let raf: number;

    const draw = () => {
      if (!analyser) return;
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / bufferLength;
      for (let i = 0; i < bufferLength; i++) {
        const value = data[i] / 255;
        const barHeight = value * canvas.height;
        ctx.fillStyle = `hsl(${Math.round(value * 120)},80%,50%)`;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, active]);

  return <canvas ref={canvasRef} className="audio-visualizer" width={80} height={24} />;
}
