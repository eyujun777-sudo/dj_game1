import React, { useEffect, useRef } from 'react';
import { LightningTarget } from '../types/game';

interface LightningCanvasProps {
  targets: LightningTarget[];
  onComplete?: () => void;
  width: number;
  height: number;
}

export const LightningCanvas: React.FC<LightningCanvasProps> = ({
  targets,
  onComplete,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (targets.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const maxFrames = 22; // ~350ms duration
    let animationId: number;

    const drawBranch = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      displace: number,
      iteration: number
    ) => {
      if (iteration === 0) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return;
      }

      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displace;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displace;

      drawBranch(x1, y1, midX, midY, displace / 1.8, iteration - 1);
      drawBranch(midX, midY, x2, y2, displace / 1.8, iteration - 1);

      // Random sub-branch
      if (Math.random() < 0.28 && iteration > 1) {
        const subEndX = midX + (Math.random() - 0.5) * 60;
        const subEndY = midY + (Math.random() - 0.5) * 60;
        drawBranch(midX, midY, subEndX, subEndY, displace / 2.5, iteration - 1);
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      targets.forEach((target) => {
        // Outer intense glow
        ctx.shadowBlur = 18;
        ctx.shadowColor = target.color || '#38bdf8';
        ctx.lineWidth = 4 + Math.random() * 2;
        ctx.strokeStyle = '#38bdf8';
        drawBranch(target.startX, target.startY, target.endX, target.endY, 70, 5);

        // Core white-hot lightning
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        drawBranch(target.startX, target.startY, target.endX, target.endY, 60, 5);

        // Zap impact spark at target
        ctx.beginPath();
        ctx.arc(target.endX, target.endY, 14 + Math.random() * 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(target.startX, target.startY, 20 + Math.random() * 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232, 121, 249, 0.7)';
        ctx.fill();
      });

      frame++;
      if (frame < maxFrames) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [targets, width, height, onComplete]);

  if (targets.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-40"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};
