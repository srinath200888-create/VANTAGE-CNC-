import React from 'react';
import { useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { DEMO_SCENARIOS } from '../simulation/scenarioManager';
import { DemoScenarioId } from '../types';
import { Sparkles, X, CheckCircle2, AlertTriangle, Flame, ShieldAlert, Cpu } from 'lucide-react';

interface DemoControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoControlPanel: React.FC<DemoControlPanelProps> = ({ isOpen, onClose }) => {
  const { activeScenario, selectedMachineId } = useMachineStore();

  if (!isOpen) return null;

  const scenarios = Object.values(DEMO_SCENARIOS);

  const handleSelect = (scenarioId: DemoScenarioId) => {
    const sc = DEMO_SCENARIOS[scenarioId];
    machineStore.setScenario(scenarioId);
    machineStore.selectMachine(sc.targetMachineId);
    machineStore.selectComponent(sc.affectedComponent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn font-mono">
      <div className="w-full max-w-2xl bg-industrial-surface border border-industrial-border rounded-xl shadow-industrial-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-industrial-raised border-b border-industrial-border">
          <div className="flex items-center gap-2 text-industrial-accent font-bold text-sm">
            <Sparkles className="w-4 h-4 text-industrial-accent" />
            <span>INDUSTRIAL AI & TELEMETRY DEMO ENGINE</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-industrial-muted hover:text-industrial-primary hover:bg-industrial-elevated rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <div className="p-4 bg-industrial-bg border-b border-industrial-border text-xs text-industrial-secondary">
          Select an industrial operational scenario below to simulate live correlated telemetry drift,
          explainable health degradation, ISO 10816 vibration trips, automated alert creation, and 3D Digital Twin highlights.
        </div>

        {/* Scenario List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2.5 scrollbar-thin">
          {scenarios.map((sc) => {
            const isActive = activeScenario === sc.id;

            return (
              <div
                key={sc.id}
                onClick={() => handleSelect(sc.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-industrial-accent-soft border-industrial-active text-industrial-primary shadow-industrial-sm ring-1 ring-industrial-active/40'
                    : 'bg-industrial-raised border-industrial-border text-industrial-secondary hover:bg-industrial-elevated hover:border-industrial-border/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        sc.expectedSeverity === 'CRITICAL'
                          ? 'bg-industrial-critical'
                          : sc.expectedSeverity === 'WARNING'
                          ? 'bg-industrial-warning'
                          : 'bg-industrial-success'
                      }`}
                    />
                    <span className={isActive ? 'text-industrial-accent' : 'text-industrial-primary'}>{sc.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 bg-industrial-bg border border-industrial-border rounded text-industrial-muted">
                      Target: <strong className="text-industrial-primary">{sc.targetMachineId}</strong>
                    </span>
                    {isActive && (
                      <span className="px-2 py-0.5 bg-industrial-accent-soft text-industrial-accent border border-industrial-accent/40 rounded font-semibold text-[10px]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-1.5 text-xs text-industrial-secondary leading-relaxed font-sans">{sc.description}</p>

                <div className="mt-2 flex items-center gap-4 text-[11px] text-industrial-muted border-t border-industrial-border pt-2">
                  <span>Affected Component: <strong className="text-industrial-accent">{sc.affectedComponent}</strong></span>
                  <span>Alert Trigger: <strong className="text-industrial-warning">{sc.expectedAlertTitle}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-industrial-raised border-t border-industrial-border flex justify-between items-center text-xs">
          <span className="text-industrial-muted">
            Selected Machine: <strong className="text-industrial-accent">{selectedMachineId}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-industrial-accent text-industrial-bg font-bold rounded hover:opacity-90 transition-opacity shadow-industrial-sm"
          >
            Apply & Inspect Twin
          </button>
        </div>
      </div>
    </div>
  );
};
