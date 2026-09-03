import React, { useState } from 'react';
import { useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { Alert } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { WorkOrderModal } from '../components/Modal';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Wrench,
  Flame,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { alerts, selectedAlertId } = useMachineStore();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [isWorkOrderOpen, setIsWorkOrderOpen] = useState(false);

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0];

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    return matchesSeverity && matchesStatus;
  });

  const handleAcknowledge = (alertId: string) => {
    machineStore.acknowledgeAlert(alertId);
  };

  const handleResolve = (alertId: string) => {
    machineStore.resolveAlert(alertId);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header & Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div>
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>INCIDENT MANAGEMENT & ROOT-CAUSE DIAGNOSTICS</span>
          </div>
          <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
            Plant Incidents & Anomaly Center
          </h1>
        </div>

        {/* Severity & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-industrial-bg p-1 rounded border border-industrial-border">
            {['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'ALL'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded transition-all ${
                  filterStatus === st
                    ? 'bg-industrial-accent text-industrial-bg font-bold shadow-industrial-sm'
                    : 'text-industrial-secondary hover:text-industrial-primary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-industrial-bg p-1 rounded border border-industrial-border">
            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-1 rounded transition-all ${
                  filterSeverity === sev
                    ? 'bg-industrial-raised text-industrial-primary font-bold'
                    : 'text-industrial-muted hover:text-industrial-primary'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Column Split: Alert Queue on Left + Full Diagnostic Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 5 Columns: Alert List Cards */}
        <div className="lg:col-span-5 space-y-3">
          {filteredAlerts.map((alert) => {
            const isSelected = selectedAlert && selectedAlert.id === alert.id;

            return (
              <div
                key={alert.id}
                onClick={() => {
                  machineStore.selectAlert(alert.id);
                  machineStore.selectMachine(alert.machineId);
                  machineStore.selectComponent(alert.componentId);
                }}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-industrial-accent-soft border-industrial-active ring-1 ring-industrial-active/40 shadow-industrial-sm'
                    : 'bg-industrial-surface border border-industrial-border hover:bg-industrial-raised hover:border-industrial-border/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-industrial-primary">{alert.machineId}</span>
                    <span className="text-industrial-muted">/</span>
                    <span className="text-xs text-industrial-secondary font-semibold">{alert.componentId.replace('cnc.', '')}</span>
                  </div>
                  <StatusBadge status={alert.severity} size="sm" />
                </div>

                <h3 className="font-bold text-sm text-industrial-primary mt-1.5 font-sans">{alert.title}</h3>
                <p className="text-xs text-industrial-secondary font-sans mt-0.5 line-clamp-2 leading-relaxed">
                  {alert.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-industrial-border flex items-center justify-between text-[11px] text-industrial-muted">
                  <span>
                    Observed: <strong className="text-industrial-critical">{alert.observedValue}</strong>
                  </span>
                  <span>{alert.timestamp}</span>
                </div>
              </div>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="p-8 text-center bg-industrial-surface border border-industrial-border rounded-lg text-industrial-muted text-xs">
              No alerts match the selected criteria.
            </div>
          )}
        </div>

        {/* Right 7 Columns: Explainable Incident Dossier */}
        {selectedAlert && (
          <div className="lg:col-span-7 bg-industrial-surface border border-industrial-border rounded-lg p-5 space-y-4 shadow-industrial-md">
            {/* Dossier Header */}
            <div className="flex items-center justify-between pb-3 border-b border-industrial-border">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedAlert.severity} />
                  <span className="text-xs text-industrial-muted">INCIDENT ID: {selectedAlert.id}</span>
                </div>
                <h2 className="text-lg font-bold text-industrial-primary mt-1 font-sans">{selectedAlert.title}</h2>
                <div className="text-xs text-industrial-secondary mt-0.5">
                  Affected Node: <strong className="text-industrial-primary">{selectedAlert.machineId}</strong> | Assembly:{' '}
                  <strong className="text-industrial-accent">{selectedAlert.componentId}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedAlert.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    className="px-3 py-1.5 bg-industrial-raised hover:bg-industrial-elevated text-industrial-primary border border-industrial-border rounded text-xs font-semibold"
                  >
                    Acknowledge
                  </button>
                )}
                {selectedAlert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleResolve(selectedAlert.id)}
                    className="px-3 py-1.5 bg-industrial-success-soft hover:bg-industrial-success/20 text-industrial-success border border-industrial-success/40 rounded text-xs font-semibold"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>

            {/* Industrial Telemetry Metrics Box */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-industrial-bg rounded border border-industrial-border text-xs">
              <div>
                <span className="text-industrial-muted block text-[10px]">BASELINE VALUE</span>
                <strong className="text-industrial-primary text-sm font-bold">{selectedAlert.baselineValue}</strong>
              </div>
              <div>
                <span className="text-industrial-muted block text-[10px]">OBSERVED VALUE</span>
                <strong className="text-industrial-critical text-sm font-bold">{selectedAlert.observedValue}</strong>
              </div>
              <div>
                <span className="text-industrial-muted block text-[10px]">ENGINEERING UNIT</span>
                <strong className="text-industrial-secondary text-sm font-bold">{selectedAlert.metricUnit}</strong>
              </div>
            </div>

            {/* Incident Root-Cause Structured Breakdown */}
            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 bg-industrial-raised rounded border border-industrial-border">
                <span className="text-[10px] font-mono font-bold text-industrial-accent uppercase tracking-wider block mb-1">
                  1. INCIDENT DESCRIPTION & TELEMETRY
                </span>
                <p className="text-industrial-secondary leading-relaxed">{selectedAlert.description}</p>
              </div>

              <div className="p-3 bg-industrial-raised rounded border border-industrial-border">
                <span className="text-[10px] font-mono font-bold text-industrial-warning uppercase tracking-wider block mb-1">
                  2. POSSIBLE CONTRIBUTING FACTORS
                </span>
                <ul className="list-disc pl-4 space-y-1 text-industrial-secondary">
                  {selectedAlert.possibleContributors.map((cause: string, i: number) => (
                    <li key={i}>{cause}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-industrial-accent-soft rounded border border-industrial-accent/30">
                <span className="text-[10px] font-mono font-bold text-industrial-accent uppercase tracking-wider block mb-1">
                  3. RECOMMENDED CORRECTIVE ACTIONS
                </span>
                <ul className="list-disc pl-4 space-y-1 text-industrial-primary">
                  {selectedAlert.recommendedActions.map((act: string, i: number) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions: Dispatch Work Order / Inspect 3D Twin */}
            <div className="pt-2 border-t border-industrial-border flex items-center justify-between">
              <button
                onClick={() => {
                  machineStore.selectMachine(selectedAlert.machineId);
                  machineStore.selectComponent(selectedAlert.componentId);
                  machineStore.setActiveView('machine-workspace');
                }}
                className="flex items-center gap-1.5 text-xs text-industrial-accent hover:underline font-mono"
              >
                <span>Focus Component in 3D Digital Twin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsWorkOrderOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-industrial-accent text-industrial-bg font-bold rounded text-xs transition-opacity hover:opacity-90 shadow-industrial-sm font-mono"
              >
                <Wrench className="w-3.5 h-3.5" />
                CREATE WORK ORDER
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Work Order Modal */}
      {selectedAlert && (
        <WorkOrderModal
          isOpen={isWorkOrderOpen}
          onClose={() => setIsWorkOrderOpen(false)}
          defaultMachineId={selectedAlert.machineId}
          defaultComponentId={selectedAlert.componentId}
          alertId={selectedAlert.id}
        />
      )}
    </div>
  );
};
