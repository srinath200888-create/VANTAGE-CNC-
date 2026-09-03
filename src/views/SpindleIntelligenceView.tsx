import React from 'react';
import { useSelectedMachine, useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { MachineId } from '../types';
import { TelemetryChart } from '../components/TelemetryChart';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  Flame,
  Activity,
  Zap,
  RotateCw,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Wrench
} from 'lucide-react';

export const SpindleIntelligenceView: React.FC = () => {
  const machine = useSelectedMachine();
  const { machines } = useMachineStore();
  const spindleComp = machine.components['cnc.spindle'];

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div>
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <Flame className="w-4 h-4" />
            <span>SPINDLE INTELLIGENCE & SENSOR CORRELATION // {machine.id}</span>
          </div>
          <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
            Direct-Drive Cartridge Spindle Health
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

      {/* Spindle Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="SPEED" value={machine.telemetry.rpm.toLocaleString()} unit="RPM" trendType="positive" />
        <MetricCard label="TORQUE LOAD" value={machine.telemetry.loadPct} unit="%" trendType={machine.telemetry.loadPct > 85 ? 'warning' : 'neutral'} />
        <MetricCard label="BEARING TEMP" value={machine.telemetry.tempC} unit="°C" trendType={machine.telemetry.tempC > 55 ? 'negative' : 'neutral'} />
        <MetricCard label="VIBRATION RMS" value={machine.telemetry.vibrationMmS.toFixed(2)} unit="mm/s" trendType={machine.telemetry.vibrationMmS > 3 ? 'negative' : 'positive'} />
        <MetricCard label="DRIVE POWER" value={machine.telemetry.powerKw} unit="kW" />
        <MetricCard label="HEALTH SCORE" value={`${spindleComp.healthScore}/100`} trendType={spindleComp.healthScore >= 80 ? 'positive' : 'warning'} />
      </div>

      {/* Multi-Sensor Correlation Logic Box */}
      <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-industrial-border">
          <div className="flex items-center gap-2 text-xs font-bold text-industrial-primary">
            <Activity className="w-4 h-4 text-industrial-accent" />
            <span>MULTI-SENSOR INDUSTRIAL CORRELATION MATRIX</span>
          </div>
          <StatusBadge status={spindleComp.severity} size="sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-industrial-bg rounded border border-industrial-border">
            <div className="text-industrial-muted font-semibold mb-1">OBSERVED SIGNALS</div>
            <div className="space-y-1 text-industrial-secondary font-sans">
              <div>&bull; Vibration: <strong className="text-industrial-critical">{machine.telemetry.vibrationMmS} mm/s</strong> (ISO Class II Trip: 4.5)</div>
              <div>&bull; Motor Load: <strong className="text-industrial-warning">{machine.telemetry.loadPct}%</strong> (Sustained High)</div>
              <div>&bull; Temperature: <strong className="text-industrial-primary">{machine.telemetry.tempC}°C</strong> (Delta-T: +14.2°C)</div>
            </div>
          </div>

          <div className="p-3 bg-industrial-bg rounded border border-industrial-border">
            <div className="text-industrial-muted font-semibold mb-1">DEDUCTION LOGIC</div>
            <div className="text-industrial-secondary font-sans leading-relaxed">
              Elevated tri-axial vibration coinciding with high sustained load and gradual bearing thermal climb indicates front hybrid ceramic angular contact race degradation or cutting chatter harmonics.
            </div>
          </div>

          <div className="p-3 bg-industrial-bg rounded border border-industrial-border">
            <div className="text-industrial-muted font-semibold mb-1">ACTION PROCEDURE</div>
            <div className="text-industrial-warning font-sans leading-relaxed">
              Verify drawbar Belleville spring stack retention force (&gt;12 kN). Perform vibration FFT spectrum check before next batch roughing cut.
            </div>
          </div>
        </div>
      </div>

      {/* 4 Multi-Channel Historical Telemetry Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
          <TelemetryChart
            data={machine.telemetryHistory.map((h) => h.rpm)}
            label="SPINDLE SPEED OVER TIME (RPM)"
            unit="RPM"
            color="var(--chart-primary)"
            height={90}
          />
        </div>

        <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
          <TelemetryChart
            data={machine.telemetryHistory.map((h) => h.loadPct)}
            label="SPINDLE MOTOR TORQUE LOAD (%)"
            unit="%"
            color="var(--warning)"
            threshold={85}
            height={90}
          />
        </div>

        <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
          <TelemetryChart
            data={machine.telemetryHistory.map((h) => h.tempC)}
            label="HEADSTOCK BEARING TEMPERATURE (°C)"
            unit="°C"
            color="var(--critical)"
            threshold={55}
            height={90}
          />
        </div>

        <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
          <TelemetryChart
            data={machine.telemetryHistory.map((h) => h.vibrationMmS)}
            label="TRI-AXIAL VIBRATION VELOCITY (ISO 10816)"
            unit="mm/s RMS"
            color="var(--accent-strong)"
            threshold={4.5}
            height={90}
          />
        </div>
      </div>
    </div>
  );
};
