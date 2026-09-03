import React from 'react';
import { useSelectedMachine, useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { MachineId } from '../types';
import { MetricCard } from '../components/MetricCard';
import { TelemetryChart } from '../components/TelemetryChart';
import { Scissors, AlertTriangle, CheckCircle2, ChevronRight, Activity, Wrench } from 'lucide-react';

export const ToolIntelligenceView: React.FC = () => {
  const machine = useSelectedMachine();
  const { machines } = useMachineStore();
  const toolComp = machine.components['cnc.cuttingTool'];

  const simulatedMagazine = [
    { pocket: 'T01', type: 'Face Mill Ø50', wear: 32, hours: 14.5, lifeLimit: 40, status: 'GOOD' },
    { pocket: 'T02', type: 'End Mill Ø12 TiAlN', wear: machine.telemetry.toolWearPct, hours: 26.2, lifeLimit: 30, status: machine.telemetry.toolWearPct > 80 ? 'CRITICAL' : 'GOOD' },
    { pocket: 'T03', type: 'Ball End Mill Ø8', wear: 18, hours: 8.0, lifeLimit: 35, status: 'GOOD' },
    { pocket: 'T04', type: 'Drill Ø6.8 Carbide', wear: 45, hours: 18.2, lifeLimit: 45, status: 'WARNING' },
    { pocket: 'T05', type: 'Tap M8x1.25 HSS-E', wear: 22, hours: 6.4, lifeLimit: 25, status: 'GOOD' },
    { pocket: 'T06', type: 'Chamfer Mill 45°', wear: 12, hours: 4.1, lifeLimit: 50, status: 'GOOD' },
    { pocket: 'T07', type: 'Reamer Ø8.0 H7', wear: 64, hours: 21.0, lifeLimit: 30, status: 'WARNING' },
    { pocket: 'T08', type: 'Boring Head Ø25-32', wear: 8, hours: 2.5, lifeLimit: 40, status: 'GOOD' }
  ];

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div>
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <Scissors className="w-4 h-4" />
            <span>CUTTING TOOL WEAR & TOOL LIFE INTELLIGENCE // {machine.id}</span>
          </div>
          <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
            Magazine Inventory & VB Flank Wear Tracker
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

      {/* Tool Metrics 4-Pack */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="ACTIVE TOOL" value="T02" subtext="Ø12 TiAlN Endmill" />
        <MetricCard label="FLANK WEAR (VB)" value={`${machine.telemetry.toolWearPct}%`} trendType={machine.telemetry.toolWearPct > 80 ? 'negative' : 'positive'} />
        <MetricCard label="FAILURE RISK" value={`${toolComp.failureRiskPct}%`} trendType="warning" />
        <MetricCard label="HEALTH SCORE" value={`${toolComp.healthScore}/100`} trendType={toolComp.healthScore >= 80 ? 'positive' : 'negative'} />
      </div>

      {/* 24-Pocket Magazine Table */}
      <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-industrial-border">
          <span className="text-xs font-bold text-industrial-primary uppercase tracking-wider">
            24-POCKET ATC CAROUSEL TOOL INVENTORY
          </span>
          <span className="text-xs text-industrial-secondary">Active Pocket: T02</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-industrial-raised text-industrial-muted uppercase text-[11px] border-b border-industrial-border">
                <th className="py-2.5 px-3">Pocket</th>
                <th className="py-2.5 px-3">Tool Description</th>
                <th className="py-2.5 px-3">Cut Hours</th>
                <th className="py-2.5 px-3">Life Limit</th>
                <th className="py-2.5 px-3">Wear %</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-industrial-border">
              {simulatedMagazine.map((t) => (
                <tr key={t.pocket} className={t.pocket === 'T02' ? 'bg-industrial-accent-soft border-l-2 border-industrial-active' : ''}>
                  <td className="py-2.5 px-3 font-bold text-industrial-primary">{t.pocket}</td>
                  <td className="py-2.5 px-3 font-sans text-industrial-secondary">{t.type}</td>
                  <td className="py-2.5 px-3 text-industrial-primary">{t.hours}h</td>
                  <td className="py-2.5 px-3 text-industrial-muted">{t.lifeLimit}h</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 font-semibold text-industrial-primary">{t.wear}%</span>
                      <div className="w-24 h-1.5 bg-industrial-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full ${t.wear > 80 ? 'bg-industrial-critical' : t.wear > 50 ? 'bg-industrial-warning' : 'bg-industrial-success'}`}
                          style={{ width: `${t.wear}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'CRITICAL'
                          ? 'bg-industrial-critical-soft text-industrial-critical border border-industrial-critical/40'
                          : t.status === 'WARNING'
                          ? 'bg-industrial-warning-soft text-industrial-warning border border-industrial-warning/40'
                          : 'bg-industrial-success-soft text-industrial-success border border-industrial-success/40'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
