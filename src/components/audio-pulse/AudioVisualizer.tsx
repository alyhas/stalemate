import React, { useEffect, useRef } from "react";
import "./audio-visualizer.scss";

export type AudioVisualizerProps = {
  analyser?: AnalyserNode;
  active: boolean;
  mode?: "bars" | "wave" | "circle";
};

export default function AudioVisualizer({ analyser, active, mode = "bars" }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    const waveform = new Uint8Array(analyser.fftSize);
    let raf: number;

    const draw = () => {
      if (!analyser) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (mode === "bars") {
        analyser.getByteFrequencyData(data);
        const barWidth = canvas.width / bufferLength;
        for (let i = 0; i < bufferLength; i++) {
          const value = data[i] / 255;
          const barHeight = value * canvas.height;
          ctx.fillStyle = `hsl(${Math.round(value * 120)},80%,50%)`;
          ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
        }
      } else if (mode === "wave") {
        analyser.getByteTimeDomainData(waveform);
        ctx.beginPath();
        const sliceWidth = canvas.width / waveform.length;
        let x = 0;
        for (let i = 0; i < waveform.length; i++) {
          const v = waveform[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.strokeStyle = "#4caf50";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // circle mode
        analyser.getByteFrequencyData(data);
        const radius = Math.min(canvas.width, canvas.height) / 2 - 2;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        for (let i = 0; i < bufferLength; i++) {
          const value = data[i] / 255;
          const angle = (i / bufferLength) * Math.PI * 2;
          const lineLength = value * radius;
          ctx.strokeStyle = `hsl(${Math.round(value * 120)},80%,50%)`;
          ctx.beginPath();
          ctx.moveTo(radius * Math.cos(angle), radius * Math.sin(angle));
          ctx.lineTo((radius + lineLength) * Math.cos(angle), (radius + lineLength) * Math.sin(angle));
          ctx.stroke();
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, active, mode]);

  const width = mode === "circle" ? 40 : 80;
  const height = mode === "circle" ? 40 : 24;
  return (
    <canvas
      ref={canvasRef}
      className="audio-visualizer"
      width={width}
      height={height}
      style={{ width, height }}
    />
  );
}
