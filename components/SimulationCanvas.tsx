
import React, { useRef, useEffect } from 'react';
import { Uav, UavStatus } from '../types';

interface SimulationCanvasProps {
  uavs: Uav[];
  width: number;
  height: number;
}

const UAV_RADIUS = 8;
const SAFE_RADIUS = 40;

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ uavs, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'rgb(17 24 39)'; // bg-gray-900
    ctx.fillRect(0, 0, width, height);
    
    // Set origin to center
    ctx.save();
    ctx.translate(width / 2, height / 2);

    // Draw preset paths
    uavs.forEach(uav => {
      ctx.beginPath();
      ctx.moveTo(uav.presetPath.start.x, uav.presetPath.start.y);
      ctx.lineTo(uav.presetPath.end.x, uav.presetPath.end.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw end point
      ctx.beginPath();
      ctx.arc(uav.presetPath.end.x, uav.presetPath.end.y, UAV_RADIUS / 2, 0, 2 * Math.PI);
      ctx.fillStyle = uav.color;
      ctx.fill();
    });

    // Draw UAV history trails
    uavs.forEach(uav => {
      if (uav.history.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(uav.history[0].x, uav.history[0].y);
      for (let i = 1; i < uav.history.length; i++) {
        const opacity = i / uav.history.length;
        ctx.strokeStyle = `${uav.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.lineTo(uav.history[i].x, uav.history[i].y);
      }
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw UAVs
    uavs.forEach(uav => {
      if (uav.status === UavStatus.Finished) return;
      
      // Draw safe radius if avoiding
      if (uav.status === UavStatus.Avoiding) {
        ctx.beginPath();
        ctx.arc(uav.position.x, uav.position.y, SAFE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = `${uav.color}20`; // low opacity
        ctx.fill();
      }

      // Draw UAV body
      ctx.beginPath();
      ctx.arc(uav.position.x, uav.position.y, UAV_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = uav.color;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Draw velocity vector
      ctx.beginPath();
      ctx.moveTo(uav.position.x, uav.position.y);
      ctx.lineTo(uav.position.x + uav.velocity.x * 10, uav.position.y + uav.velocity.y * 10);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.restore();
  }, [uavs, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="rounded-lg shadow-lg bg-gray-800" />;
};

export default SimulationCanvas;
