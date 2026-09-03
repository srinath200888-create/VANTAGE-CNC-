import React, { useState } from 'react';
import { useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { Machine, MachineId } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Cpu,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ArrowUpDown,
  Box,
  Wrench,
  Flame,
  Activity
} from 'lucide-react';

export const MachinesListView: React.FC = () => {
  const { machines, selectedMachineId } = useMachineStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const machineList = Object.values(machines);

  const filtered = machineList.filter((m) => {
    const matchesSearch =
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (machineId: MachineId) => {
    machineStore.selectMachine(machineId);
    machineStore.setActiveView('machine-workspace');
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div>
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <Cpu className="w-4 h-4" />
            <span>INDUSTRIAL MACHINE MANAGEMENT // FLEET MONITORING</span>
          </div>
          <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
            Machine Operations Table
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-industrial-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-industrial-bg border border-industrial-border rounded pl-8 pr-3 py-1.5 text-xs text-industrial-primary placeholder-industrial-muted focus:outline-none focus:border-industrial-active"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            {['ALL', 'RUNNING', 'IDLE', 'SETUP', 'MAINTENANCE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded transition-all ${
                  statusFilter === st
                    ? 'bg-industrial-accent text-industrial-bg font-bold shadow-industrial-sm'
                    : 'bg-industrial-raised text-industrial-secondary hover:text-industrial-primary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Serious Industrial Table */}
      <div className="bg-industrial-surface border border-industrial-border rounded-lg overflow-hidden shadow-industrial-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-industrial-raised border-b border-industrial-border text-industrial-muted uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Machine</th>
                <th className="py-3 px-4">Model & Cell</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Spindle RPM</th>
                <th className="py-3 px-4 text-right">Load</th>
                <th className="py-3 px-4 text-right">Temp</th>
                <th className="py-3 px-4 text-right">Vibration</th>
                <th className="py-3 px-4 text-right">OEE</th>
                <th className="py-3 px-4 text-right">Health</th>
                <th className="py-3 px-4 text-right">Runtime</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-border">
              {filtered.map((m) => {
                const isSelected = m.id === selectedMachineId;

                return (
                  <tr
                    key={m.id}
                    onClick={() => handleRowClick(m.id)}
                    className={`cursor-pointer transition-all hover:bg-industrial-raised/80 ${
                      isSelected ? 'bg-industrial-accent-soft border-l-2 border-industrial-active' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-industrial-primary flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          m.status === 'RUNNING'
                            ? 'bg-industrial-success'
                            : m.status === 'FAULT'
                            ? 'bg-industrial-critical'
                            : 'bg-industrial-warning'
                        }`}
                      />
                      {m.id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-industrial-primary">{m.model}</div>
                      <div className="text-[10px] text-industrial-muted font-sans">{m.cell}</div>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={m.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-industrial-accent">
                      {m.telemetry.rpm.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className={m.telemetry.loadPct > 85 ? 'text-industrial-warning font-bold' : 'text-industrial-secondary'}>
                        {m.telemetry.loadPct}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className={m.telemetry.tempC > 55 ? 'text-industrial-critical font-bold' : 'text-industrial-secondary'}>
                        {m.telemetry.tempC}°C
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold ${
                          m.telemetry.vibrationMmS > 4.5
                            ? 'text-industrial-critical'
                            : m.telemetry.vibrationMmS > 2.8
                            ? 'text-industrial-warning'
                            : 'text-industrial-secondary'
                        }`}
                      >
                        {m.telemetry.vibrationMmS.toFixed(2)} mm/s
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-semibold text-industrial-success">
                      {m.oee.overallOee}%
                    </td>

                    <td className="py-3 px-4 text-right font-bold">
                      <span
                        className={
                          m.healthScore >= 85
                            ? 'text-industrial-success'
                            : m.healthScore >= 70
                            ? 'text-industrial-warning'
                            : 'text-industrial-critical'
                        }
                      >
                        {m.healthScore}/100
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-industrial-muted">
                      {m.runtimeHours}h
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          machineStore.selectMachine(m.id);
                          machineStore.setActiveView('machine-workspace');
                        }}
                        className="px-2.5 py-1 bg-industrial-raised hover:bg-industrial-accent hover:text-industrial-bg text-industrial-secondary rounded text-[11px] font-semibold transition-all border border-industrial-border"
                      >
                        DIGITAL TWIN
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
