import React, { useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { ThemeDefinition } from '../theme/types';

export interface TelemetryPoint {
  timestamp: number;
  value: number;
}

interface TelemetryChartProps {
  data: number[] | TelemetryPoint[];
  color?: string;
  height?: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  threshold?: number;
}

function resolveChartColor(color: string | undefined, themeDef: ThemeDefinition): string {
  if (!color) return themeDef.colors.chartPrimary;

  if (color.startsWith('var(')) {
    const varName = color.replace(/var\(--|\)/g, '').trim();
    switch (varName) {
      case 'success':
        return themeDef.colors.success;
      case 'warning':
        return themeDef.colors.warning;
      case 'critical':
        return themeDef.colors.critical;
      case 'accent':
      case 'chart-primary':
        return themeDef.colors.chartPrimary;
      case 'accent-strong':
        return themeDef.colors.accentStrong;
      case 'info':
        return themeDef.colors.info;
      default:
        return themeDef.colors.chartPrimary;
    }
  }

  return color;
}

function hexToRgba(color: string, alpha: number): string {
  if (color.startsWith('rgba') || color.startsWith('rgb')) {
    return color;
  }
  if (color.startsWith('#')) {
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return color;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  data,
  color,
  height = 64,
  min,
  max,
  label,
  unit,
  threshold
}) => {
  const { themeDef } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeColor = resolveChartColor(color, themeDef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const values: number[] = data.map((d) => (typeof d === 'number' ? d : d.value));
    if (values.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 200;
    const h = height;

    canvas.width = width * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, h);

    const minVal = min !== undefined ? min : Math.min(...values) * 0.95;
    const maxVal = max !== undefined ? max : Math.max(...values, threshold || 0) * 1.05;
    const range = maxVal - minVal || 1;

    // Threshold Line
    if (threshold !== undefined) {
      const threshY = h - ((threshold - minVal) / range) * (h - 12) - 6;
      ctx.beginPath();
      ctx.strokeStyle = hexToRgba(themeDef.colors.critical, 0.6);
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.moveTo(0, threshY);
      ctx.lineTo(width, threshY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Gradient Fill
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, hexToRgba(activeColor, 0.35));
    gradient.addColorStop(1, hexToRgba(activeColor, 0.0));

    ctx.beginPath();
    const step = width / (values.length - 1 || 1);

    values.forEach((val, i) => {
      const x = i * step;
      const y = h - ((val - minVal) / range) * (h - 12) - 6;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    // Stroke
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 1.75;
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(width, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw active dot at the last point
    const lastX = width;
    const lastY = h - ((values[values.length - 1] - minVal) / range) * (h - 12) - 6;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = activeColor;
    ctx.fill();
  }, [data, activeColor, height, min, max, threshold, themeDef]);

  const latestVal: number =
    data.length > 0
      ? typeof data[data.length - 1] === 'number'
        ? (data[data.length - 1] as number)
        : (data[data.length - 1] as TelemetryPoint).value
      : 0;

  return (
    <div className="w-full">
      {(label || unit) && (
        <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-industrial-muted">
          <span>{label}</span>
          <span className="font-semibold text-industrial-primary">
            {latestVal.toFixed(1)} {unit}
          </span>
        </div>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', height }} className="block" />
    </div>
  );
};
