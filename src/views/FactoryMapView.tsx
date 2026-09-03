import React, { useState } from 'react';
import { useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { Machine, MachineId } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  MapPin,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  Flame,
  AlertTriangle,
  Zap,
  Radio
} from 'lucide-react';

export const FactoryMapView: React.FC = () => {
  const { machines, selectedMachineId } = useMachineStore();
  const [selectedCell, setSelectedCell] = useState<string>('ALL');

  const cells = [
    {
      id: 'Engine Block Cell A',
      label: 'CELL A // ENGINE BLOCK MACHINING',
      machines: ['CNC-01', 'CNC-02', 'CNC-03'] as MachineId[]
    },
    {
      id: 'Transmission Cell B',
      label: 'CELL B // TRANSMISSION CASING & GEARS',
      machines: ['CNC-04', 'CNC-05', 'CNC-06'] as MachineId[]
    },
    {
      id: 'Chassis Component Cell C',
      label: 'CELL C // CHASSIS & SUBFRAME LINE',
      machines: ['CNC-07', 'CNC-08', 'CNC-09', 'CNC-10'] as MachineId[]
    }
  ];

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div>
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <MapPin className="w-4 h-4" />
            <span>INTERACTIVE FACTORY FLOOR-PLAN // CELL ARCHITECTURE</span>
          </div>
          <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
            Plant Machining Cell Layout
          </h1>
        </div>

        {/* Cell Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          {['ALL', 'Engine Block Cell A', 'Transmission Cell B', 'Chassis Component Cell C'].map((cell) => (
            <button
              key={cell}
              onClick={() => setSelectedCell(cell)}
              className={`px-3 py-1.5 rounded transition-all shadow-industrial-sm ${
                selectedCell === cell
                  ? 'bg-industrial-accent text-industrial-bg font-bold'
                  : 'bg-industrial-raised text-industrial-secondary hover:text-industrial-primary'
              }`}
            >
              {cell === 'ALL' ? 'ALL CELLS' : cell.split(' ')[0] + ' ' + cell.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Floor Grid Canvas */}
      <div className="p-6 bg-industrial-bg-secondary border border-industrial-border rounded-lg relative overflow-hidden shadow-industrial-md">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {cells
            .filter((c) => selectedCell === 'ALL' || selectedCell === c.id)
            .map((cell) => (
              <div
                key={cell.id}
                className="p-5 rounded-xl border border-industrial-border bg-industrial-surface/70 backdrop-blur-sm space-y-4 shadow-industrial-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-industrial-border">
                  <span className="font-bold text-xs text-industrial-primary">{cell.label}</span>
                  <span className="text-[10px] text-industrial-secondary font-semibold px-2 py-0.5 bg-industrial-raised border border-industrial-border rounded">
                    {cell.machines.length} NODES
                  </span>
                </div>

                <div className="space-y-3">
                  {cell.machines.map((mId) => {
                    const m = machines[mId];
                    if (!m) return null;
                    const isSelected = selectedMachineId === mId;

                    return (
                      <div
                        key={mId}
                        onClick={() => {
                          machineStore.selectMachine(mId);
                          machineStore.setActiveView('machine-workspace');
                        }}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-industrial-accent-soft border-industrial-active ring-2 ring-industrial-active/40 shadow-industrial-md'
                            : 'bg-industrial-raised border-industrial-border hover:bg-industrial-elevated hover:border-industrial-border/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`block w-2.5 h-2.5 rounded-full ${
                                m.status === 'RUNNING'
                                  ? 'bg-industrial-success animate-pulse'
                                  : m.status === 'FAULT'
                                  ? 'bg-industrial-critical'
                                  : 'bg-industrial-warning'
                              }`}
                            />
                            <div>
                              <div className="font-bold text-sm text-industrial-primary">{m.id}</div>
                              <div className="text-[11px] text-industrial-muted font-sans">{m.model}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <StatusBadge status={m.status} size="sm" />
                            <div className="text-[11px] font-bold text-industrial-secondary mt-1">
                              Health: <span className={m.healthScore >= 85 ? 'text-industrial-success' : 'text-industrial-warning'}>{m.healthScore}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Node Telemetry Snapshot */}
                        <div className="mt-3 grid grid-cols-3 gap-2 p-2 bg-industrial-bg rounded border border-industrial-border text-[11px]">
                          <div>
                            <span className="text-industrial-muted block">RPM</span>
                            <span className="font-semibold text-industrial-primary">{m.telemetry.rpm.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-industrial-muted block">LOAD</span>
                            <span className="font-semibold text-industrial-primary">{m.telemetry.loadPct}%</span>
                          </div>
                          <div>
                            <span className="text-industrial-muted block">VIB</span>
                            <span className={`font-semibold ${m.telemetry.vibrationMmS > 3.0 ? 'text-industrial-critical' : 'text-industrial-primary'}`}>
                              {m.telemetry.vibrationMmS} mm/s
                            </span>
                          </div>
                        </div>

                        {/* Click to inspect */}
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-industrial-accent hover:underline pt-2 border-t border-industrial-border">
                          <span>OPEN MACHINE 3D TWIN</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
