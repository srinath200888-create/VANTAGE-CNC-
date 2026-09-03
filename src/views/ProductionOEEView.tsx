import React from 'react';
import { useSelectedMachine, useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { MachineId } from '../types';
import { MetricCard } from '../components/MetricCard';
import { TelemetryChart } from '../components/TelemetryChart';
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export const ProductionOEEView: React.FC = () => {
  const machine = useSelectedMachine();
  const { machines } = useMachineStore();
  const oee = machine.oee;

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div>
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <TrendingUp className="w-4 h-4" />
            <span>PRODUCTION INTELLIGENCE & OEE LOSS ANALYSIS // {machine.id}</span>
          </div>
          <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
            Overall Equipment Effectiveness (OEE)
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

      {/* Top Level OEE Factor Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="OVERALL OEE" value={`${oee.overallOee}%`} unit="" trend="+0.8% vs prev shift" trendType="positive" />
        <MetricCard label="AVAILABILITY" value={`${oee.availabilityPct}%`} unit="" subtext="Uptime factor" />
        <MetricCard label="PERFORMANCE" value={`${oee.performancePct}%`} unit="" subtext="Feed rate efficiency" />
        <MetricCard label="QUALITY RATE" value={`${oee.qualityPct}%`} unit="" subtext="First pass yield" />
      </div>

      {/* Why OEE Is Low: Loss Category Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Availability Losses */}
        <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg space-y-3 shadow-industrial-sm">
          <div className="flex items-center justify-between pb-2 border-b border-industrial-border">
            <span className="text-xs font-bold text-industrial-accent">AVAILABILITY LOSSES</span>
            <span className="text-xs text-industrial-secondary font-semibold">{oee.availabilityPct}% Uptime</span>
          </div>
          <div className="space-y-2.5 text-xs font-sans">
            {oee.availabilityLossReasons.map((loss, i) => (
              <div key={i} className="p-2.5 bg-industrial-bg rounded border border-industrial-border">
                <div className="flex justify-between font-bold text-industrial-primary">
                  <span>{loss.reason}</span>
                  <span className="text-industrial-warning font-mono">-{loss.lostParts} parts</span>
                </div>
                <div className="flex justify-between text-[11px] text-industrial-muted mt-1 font-mono">
                  <span>Duration: {loss.durationMin} min</span>
                  <span>Impact: {loss.impactPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Losses */}
        <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg space-y-3 shadow-industrial-sm">
          <div className="flex items-center justify-between pb-2 border-b border-industrial-border">
            <span className="text-xs font-bold text-industrial-warning">PERFORMANCE LOSSES</span>
            <span className="text-xs text-industrial-secondary font-semibold">{oee.performancePct}% Speed</span>
          </div>
          <div className="space-y-2.5 text-xs font-sans">
            {oee.performanceLossReasons.map((loss, i) => (
              <div key={i} className="p-2.5 bg-industrial-bg rounded border border-industrial-border">
                <div className="flex justify-between font-bold text-industrial-primary">
                  <span>{loss.reason}</span>
                  <span className="text-industrial-warning font-mono">-{loss.lostParts} parts</span>
                </div>
                <div className="flex justify-between text-[11px] text-industrial-muted mt-1 font-mono">
                  <span>Duration: {loss.durationMin} min</span>
                  <span>Impact: {loss.impactPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Losses */}
        <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg space-y-3 shadow-industrial-sm">
          <div className="flex items-center justify-between pb-2 border-b border-industrial-border">
            <span className="text-xs font-bold text-industrial-critical">QUALITY LOSSES</span>
            <span className="text-xs text-industrial-secondary font-semibold">{oee.qualityPct}% Yield</span>
          </div>
          <div className="space-y-2.5 text-xs font-sans">
            {oee.qualityLossReasons.map((loss, i) => (
              <div key={i} className="p-2.5 bg-industrial-bg rounded border border-industrial-border">
                <div className="flex justify-between font-bold text-industrial-primary">
                  <span>{loss.reason}</span>
                  <span className="text-industrial-critical font-mono">-{loss.lostParts} scrap</span>
                </div>
                <div className="flex justify-between text-[11px] text-industrial-muted mt-1 font-mono">
                  <span>Duration: {loss.durationMin} min</span>
                  <span>Impact: {loss.impactPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Production Output vs Target Shift Bar */}
      <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg space-y-3 shadow-industrial-sm">
        <div className="flex items-center justify-between pb-2 border-b border-industrial-border">
          <div className="flex items-center gap-2 text-xs font-bold text-industrial-primary">
            <Clock className="w-4 h-4 text-industrial-accent" />
            <span>SHIFT PRODUCTION TARGET & SCRAP YIELD</span>
          </div>
          <div className="text-xs text-industrial-secondary">
            Produced: <strong className="text-industrial-success">{oee.actualPartsProduced}</strong> / Target:{' '}
            <strong className="text-industrial-primary">{oee.shiftTargetParts} parts</strong>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-industrial-secondary">
            <span>Shift Target Progress</span>
            <span className="font-bold text-industrial-primary font-mono">
              {Math.round((oee.actualPartsProduced / oee.shiftTargetParts) * 100)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-industrial-bg rounded-full overflow-hidden flex">
            <div
              className="bg-industrial-success h-full"
              style={{ width: `${(oee.actualPartsProduced / oee.shiftTargetParts) * 100}%` }}
            />
            <div
              className="bg-industrial-critical h-full"
              style={{ width: `${(oee.scrapParts / oee.shiftTargetParts) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-industrial-muted pt-1">
            <span>Estimated shift capacity loss: <strong className="text-industrial-warning">{oee.lostPartsCount} parts</strong></span>
            <span>Scrap Parts: <strong className="text-industrial-critical">{oee.scrapParts} units</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
