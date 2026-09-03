import React from 'react';
import { useSelectedMachine, useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { MachineId } from '../types';
import { MetricCard } from '../components/MetricCard';
import { TelemetryChart } from '../components/TelemetryChart';
import { StatusBadge } from '../components/StatusBadge';
import { Move3d, Activity, Sliders, ShieldCheck } from 'lucide-react';

export const AxisHealthView: React.FC = () => {
  const machine = useSelectedMachine();
  const { machines } = useMachineStore();

  const axes = [
    {
      id: 'cnc.xAxis',
      name: 'X-Axis Table Drive',
      coord: machine.telemetry.posX,
      travel: '1,020 mm',
      ballscrewPitch: '10 mm',
      feedRate: '36 m/min',
      current: '8.4 A',
      vibration: '0.84 mm/s',
      temp: '34.2 °C',
      backlash: '0.003 mm',
      health: machine.components['cnc.xAxis']
    },
    {
      id: 'cnc.yAxis',
      name: 'Y-Axis Saddle Drive',
      coord: machine.telemetry.posY,
      travel: '610 mm',
      ballscrewPitch: '10 mm',
      feedRate: '36 m/min',
      current: '9.1 A',
      vibration: '0.92 mm/s',
      temp: '36.8 °C',
      backlash: '0.004 mm',
      health: machine.components['cnc.yAxis']
    },
    {
      id: 'cnc.zAxis',
      name: 'Z-Axis Headstock Drive',
      coord: machine.telemetry.posZ,
      travel: '610 mm',
      ballscrewPitch: '10 mm',
      feedRate: '30 m/min',
      current: '14.2 A',
      vibration: '1.24 mm/s',
      temp: '41.5 °C',
      backlash: '0.005 mm',
      health: machine.components['cnc.zAxis']
    }
  ];

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div>
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <Move3d className="w-4 h-4" />
            <span>SERVO DRIVE & BALLSCREW MOTION INTELLIGENCE // {machine.id}</span>
          </div>
          <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
            Tri-Axial Kinematic Health & Positioning Integrity
          </h1>
        </div>

        {/* Machine Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-industrial-muted">Select Machine:</span>
          <select
            value={machine.id}
            onChange={(e) => machineStore.selectMachine(e.target.value as MachineId)}
            className="bg-industrial-bg border border-industrial-border rounded px-2.5 py-1 text-industrial-primary"
          >
            {(Object.keys(machines) as MachineId[]).map((id) => (
              <option key={id} value={id}>
                {id} - {machines[id].model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Axes Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {axes.map((ax) => (
          <div
            key={ax.id}
            className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-industrial-border">
              <div>
                <span className="text-[10px] text-industrial-accent font-bold uppercase">{ax.id}</span>
                <h3 className="font-bold text-sm text-industrial-primary">{ax.name}</h3>
              </div>
              <StatusBadge status={ax.health.severity} size="sm" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-industrial-secondary">
                <span>Position Coordinate:</span>
                <strong className="text-industrial-primary font-mono">{ax.coord.toFixed(3)} mm</strong>
              </div>
              <div className="flex justify-between text-industrial-secondary">
                <span>Motor Drive Current:</span>
                <strong className="text-industrial-primary font-mono">{ax.current}</strong>
              </div>
              <div className="flex justify-between text-industrial-secondary">
                <span>Support Bearing Temp:</span>
                <strong className="text-industrial-primary font-mono">{ax.temp}</strong>
              </div>
              <div className="flex justify-between text-industrial-secondary">
                <span>Ballscrew Vibration:</span>
                <strong className="text-industrial-primary font-mono">{ax.vibration}</strong>
              </div>
              <div className="flex justify-between text-industrial-secondary">
                <span>Linear Backlash:</span>
                <strong className="text-industrial-success font-mono">{ax.backlash}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-industrial-border">
              <div className="flex justify-between text-[11px] text-industrial-muted mb-1">
                <span>Axis Health Score</span>
                <span className="font-bold text-industrial-primary">{ax.health.healthScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-industrial-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-industrial-success"
                  style={{ width: `${ax.health.healthScore}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
