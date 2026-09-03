import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'warning';
  subtext?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendType = 'neutral',
  subtext,
  className = ''
}) => {
  let trendColor = 'text-industrial-muted';
  if (trendType === 'positive') trendColor = 'text-industrial-success';
  if (trendType === 'negative') trendColor = 'text-industrial-critical';
  if (trendType === 'warning') trendColor = 'text-industrial-warning';

  return (
    <div
      className={`p-3.5 bg-industrial-surface border border-industrial-border rounded-lg hover:border-industrial-border/80 transition-all font-mono shadow-industrial-sm ${className}`}
    >
      <div className="flex items-center justify-between text-industrial-muted text-[11px] tracking-wider uppercase font-semibold">
        <span>{label}</span>
        {Icon && <Icon className="w-3.5 h-3.5 text-industrial-muted" />}
      </div>

      <div className="flex items-baseline gap-1.5 mt-1.5">
        <span className="text-2xl font-bold text-industrial-primary tracking-tight">{value}</span>
        {unit && <span className="text-xs text-industrial-secondary font-semibold">{unit}</span>}
      </div>

      {(trend || subtext) && (
        <div className="flex items-center justify-between mt-1 text-[11px]">
          {trend && <span className={`font-semibold ${trendColor}`}>{trend}</span>}
          {subtext && <span className="text-industrial-muted ml-auto">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
