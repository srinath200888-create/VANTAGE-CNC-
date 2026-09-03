import React, { useState } from 'react';
import { useSelectedMachine, useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { CNCComponentId, MachineId } from '../types';
import { ThreeCanvas } from '../twin3d/ThreeCanvas';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { TelemetryChart } from '../components/TelemetryChart';
import { COMPONENT_DEFINITIONS } from '../domain/componentHierarchy';
import { WorkOrderModal } from '../components/Modal';
import {
  Cpu,
  Flame,
  Wrench,
  AlertTriangle,
  Layers,
  Activity,
  Maximize2,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sliders,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';

export const MachineWorkspaceView: React.FC = () => {
  const machine = useSelectedMachine();
  const { selectedComponentId, machines } = useMachineStore();
  const [isWorkOrderOpen, setIsWorkOrderOpen] = useState(false);

  const selectedMeta = selectedComponentId ? COMPONENT_DEFINITIONS[selectedComponentId] : null;
  const selectedHealth = selectedComponentId ? machine.components[selectedComponentId] : null;

  const handleComponentSelect = (compId: CNCComponentId | null) => {
    machineStore.selectComponent(compId);
  };

  const subsystems = [
    { label: 'Spindle Assembly', score: machine.healthSummary.spindle },
    { label: 'Tooling & Holder', score: machine.healthSummary.tooling },
    { label: 'Axes (X/Y/Z Drive)', score: machine.healthSummary.axes },
    { label: 'Thermal Stability', score: machine.healthSummary.thermal },
    { label: 'Electrical & Drive', score: machine.healthSummary.electrical },
    { label: 'Workholding & Table', score: machine.healthSummary.workholding }
  ];

  return (
    <div className="space-y-4 font-mono">
      {/* Machine Header & Quick Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-industrial-primary">{machine.id}</span>
            <span className="text-industrial-muted">|</span>
            <span className="text-xs text-industrial-secondary font-sans font-semibold">{machine.model}</span>
          </div>
          <StatusBadge status={machine.status} size="sm" />
        </div>

        {/* Machine Quick Dropdown Switcher */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-industrial-muted">Switch Node:</span>
            <select
              value={machine.id}
              onChange={(e) => machineStore.selectMachine(e.target.value as MachineId)}
              className="bg-industrial-bg border border-industrial-border rounded px-2.5 py-1 text-industrial-primary focus:outline-none focus:border-industrial-active font-mono"
            >
              {(Object.keys(machines) as MachineId[]).map((id) => (
                <option key={id} value={id}>
                  {id} - {machines[id].model}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => machineStore.setActiveView('digital-twin')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-industrial-raised hover:bg-industrial-elevated text-industrial-primary border border-industrial-border rounded transition-all shadow-industrial-sm"
          >
            <Maximize2 className="w-3.5 h-3.5 text-industrial-accent" />
            FULL 3D WORKSTATION
          </button>
        </div>
      </div>

      {/* Main 2-Column Split View: Hero 3D Digital Twin + Right Intelligence Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Columns: Interactive 3D Digital Twin Viewport */}
        <div className="lg:col-span-7 h-[580px] flex flex-col">
          <ThreeCanvas
            machine={machine}
            selectedComponentId={selectedComponentId}
            onSelectComponent={handleComponentSelect}
            className="flex-1 shadow-industrial-md"
          />
        </div>

        {/* Right 5 Columns: Machine Health Intelligence & Component Inspector */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Top Live Telemetry 4-Pack */}
          <div className="grid grid-cols-2 gap-2.5">
            <MetricCard
              label="SPINDLE SPEED"
              value={machine.telemetry.rpm.toLocaleString()}
              unit="RPM"
              trendType="positive"
            />
            <MetricCard
              label="MOTOR LOAD"
              value={machine.telemetry.loadPct}
              unit="%"
              trendType={machine.telemetry.loadPct > 85 ? 'warning' : 'neutral'}
            />
            <MetricCard
              label="BEARING TEMP"
              value={machine.telemetry.tempC}
              unit="°C"
              trendType={machine.telemetry.tempC > 55 ? 'negative' : 'neutral'}
            />
            <MetricCard
              label="ISO VIBRATION"
              value={machine.telemetry.vibrationMmS.toFixed(2)}
              unit="mm/s"
              trendType={machine.telemetry.vibrationMmS > 3 ? 'negative' : 'positive'}
            />
          </div>

          {/* Machine Health Score & Subsystem Integrity Breakdown */}
          <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-industrial-border">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-industrial-accent" />
                  <span className="text-xs font-bold text-industrial-primary uppercase tracking-wider">
                    SUBSYSTEM INTEGRITY RADAR
                  </span>
                </div>
                <span className="text-xs font-bold text-industrial-primary">
                  OVERALL:{' '}
                  <strong
                    className={
                      machine.healthScore >= 85
                        ? 'text-industrial-success'
                        : machine.healthScore >= 70
                        ? 'text-industrial-warning'
                        : 'text-industrial-critical'
                    }
                  >
                    {machine.healthScore}/100
                  </strong>
                </span>
              </div>

              {/* Subsystem Health Progress Bars */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-xs">
                {subsystems.map((sub) => (
                  <div key={sub.label}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-industrial-secondary uppercase">{sub.label}</span>
                      <span className="font-bold text-industrial-primary">{sub.score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-industrial-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          sub.score >= 85 ? 'bg-industrial-success' : sub.score >= 70 ? 'bg-industrial-warning' : 'bg-industrial-critical'
                        }`}
                        style={{ width: `${sub.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Component Inspection Card */}
            <div className="mt-4 p-3 bg-industrial-bg rounded border border-industrial-border">
              {selectedMeta && selectedHealth ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-industrial-accent font-bold uppercase tracking-wider">
                        {selectedMeta.code} // {selectedMeta.category}
                      </div>
                      <div className="font-bold text-sm text-industrial-primary">{selectedMeta.name}</div>
                    </div>
                    <StatusBadge status={selectedHealth.severity} size="sm" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-industrial-border text-[11px]">
                    <div>
                      <span className="text-industrial-muted block">Health Score</span>
                      <strong className="text-industrial-primary">{selectedHealth.healthScore}%</strong>
                    </div>
                    <div>
                      <span className="text-industrial-muted block">Failure Risk</span>
                      <strong className="text-industrial-warning">{selectedHealth.failureRiskPct}%</strong>
                    </div>
                    <div>
                      <span className="text-industrial-muted block">Operating Hours</span>
                      <strong className="text-industrial-primary">{selectedHealth.operatingHours} hrs</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setIsWorkOrderOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-industrial-accent text-industrial-bg font-bold rounded text-xs transition-opacity hover:opacity-90 shadow-industrial-sm"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      CREATE WORK ORDER
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-industrial-muted text-xs">
                  Click any assembly on the 3D model or select from the list below to inspect engineering diagnostics.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Series Real-Time Telemetry Timeline Strip */}
      <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-industrial-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-industrial-accent" />
            <span className="text-xs font-bold text-industrial-primary uppercase tracking-wider">
              REAL-TIME MULTI-CHANNEL SENSOR TELEMETRY STREAM
            </span>
          </div>
          <span className="text-xs text-industrial-secondary">Sampling Rate: 10 Hz (100 ms)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TelemetryChart
            data={machine.telemetryHistory.map((h) => h.rpm)}
            label="SPINDLE SPEED (RPM)"
            unit="RPM"
            color="var(--chart-primary)"
            height={60}
          />
          <TelemetryChart
            data={machine.telemetryHistory.map((h) => h.loadPct)}
            label="MOTOR TORQUE LOAD (%)"
            unit="%"
            color="var(--warning)"
            threshold={85}
            height={60}
          />
          <TelemetryChart
            data={machine.telemetryHistory.map((h) => h.tempC)}
            label="BEARING TEMPERATURE (°C)"
            unit="°C"
            color="var(--critical)"
            threshold={55}
            height={60}
          />
          <TelemetryChart
            data={machine.telemetryHistory.map((h) => h.vibrationMmS)}
            label="ISO 10816 VIBRATION (mm/s)"
            unit="mm/s"
            color="var(--accent-strong)"
            threshold={4.5}
            height={60}
          />
        </div>
      </div>

      {/* Work Order Modal */}
      <WorkOrderModal
        isOpen={isWorkOrderOpen}
        onClose={() => setIsWorkOrderOpen(false)}
        defaultMachineId={machine.id}
        defaultComponentId={selectedComponentId || 'cnc.spindle'}
      />
    </div>
  );
};
