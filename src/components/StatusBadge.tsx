import React from 'react';
import { MachineOperatingState, HealthSeverity } from '../types';
import { CheckCircle2, AlertTriangle, ShieldAlert, Clock, Wrench, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: MachineOperatingState | HealthSeverity | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClasses = 'bg-industrial-raised text-industrial-secondary border-industrial-border';
  let dotColor = 'bg-industrial-muted';
  let Icon = Circle;

  switch (status) {
    case 'RUNNING':
    case 'HEALTHY':
      colorClasses = 'bg-industrial-success-soft text-industrial-success border-industrial-success/40';
      dotColor = 'bg-industrial-success';
      Icon = CheckCircle2;
      break;
    case 'MONITOR':
    case 'SETUP':
    case 'INFO':
      colorClasses = 'bg-industrial-info-soft text-industrial-info border-industrial-info/40';
      dotColor = 'bg-industrial-info';
      Icon = Clock;
      break;
    case 'IDLE':
      colorClasses = 'bg-industrial-raised text-industrial-secondary border-industrial-border';
      dotColor = 'bg-industrial-muted';
      Icon = Circle;
      break;
    case 'WARNING':
    case 'MAINTENANCE':
      colorClasses = 'bg-industrial-warning-soft text-industrial-warning border-industrial-warning/40';
      dotColor = 'bg-industrial-warning';
      Icon = status === 'MAINTENANCE' ? Wrench : AlertTriangle;
      break;
    case 'CRITICAL':
    case 'FAULT':
      colorClasses = 'bg-industrial-critical-soft text-industrial-critical border-industrial-critical/50 animate-pulse';
      dotColor = 'bg-industrial-critical';
      Icon = ShieldAlert;
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border uppercase tracking-wider ${colorClasses} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {status}
    </span>
  );
};
