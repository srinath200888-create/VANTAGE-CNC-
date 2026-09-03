import React from 'react';
import { useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { TelemetryChart } from '../components/TelemetryChart';
import {
  Cpu,
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  Flame,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const { machines, alerts } = useMachineStore();
  const machineList = Object.values(machines);

  const totalMachines = machineList.length;
  const runningMachines = machineList.filter((m) => m.status === 'RUNNING').length;
  const warningMachines = machineList.filter((m) => m.healthSeverity === 'WARNING').length;
  const criticalMachines = machineList.filter((m) => m.healthSeverity === 'CRITICAL').length;

  const avgOee = (machineList.reduce((acc, m) => acc + m.oee.overallOee, 0) / totalMachines).toFixed(1);
  const avgAvail = (machineList.reduce((acc, m) => acc + m.oee.availabilityPct, 0) / totalMachines).toFixed(1);
  const totalParts = machineList.reduce((acc, m) => acc + m.oee.actualPartsProduced, 0);
  const totalPower = machineList.reduce((acc, m) => acc + m.telemetry.powerKw, 0).toFixed(1);

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE').slice(0, 4);

  return (
    <div className="space-y-4 font-mono">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div>
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <Cpu className="w-4 h-4" />
            <span>FACTORY COMMAND CENTER // REAL-TIME MACHINE INTELLIGENCE</span>
          </div>
          <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
            Automotive Machining Plant — Chennai
          </h1>
          <p className="text-xs text-industrial-secondary font-sans mt-0.5">
            Fleet condition monitoring, predictive maintenance scoring, and live OEE loss telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => machineStore.setActiveView('factory')}
            className="flex items-center gap-1.5 px-3 py-2 bg-industrial-raised hover:bg-industrial-elevated text-industrial-primary border border-industrial-border rounded text-xs transition-all shadow-industrial-sm"
          >
            <span>FLOOR MAP</span>
            <ArrowRight className="w-3.5 h-3.5 text-industrial-accent" />
          </button>
          <button
            onClick={() => machineStore.setActiveView('machines')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-industrial-accent text-industrial-bg font-bold rounded text-xs transition-all shadow-industrial-sm hover:opacity-90"
          >
            <span>FLEET TABLE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Level Operational KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard label="MACHINES" value={totalMachines} subtext="10 Active Cells" />
        <MetricCard
          label="RUNNING"
          value={runningMachines}
          trendType="positive"
          subtext={`${Math.round((runningMachines / totalMachines) * 100)}% Utilized`}
        />
        <MetricCard
          label="WARNING"
          value={warningMachines}
          trendType="warning"
          subtext="Degradation"
        />
        <MetricCard
          label="CRITICAL"
          value={criticalMachines}
          trendType="negative"
          subtext="Action required"
        />
        <MetricCard label="PLANT OEE" value={`${avgOee}%`} unit="" trend="+1.2%" trendType="positive" />
        <MetricCard label="AVAILABILITY" value={`${avgAvail}%`} trendType="neutral" />
        <MetricCard label="PRODUCED" value={totalParts.toLocaleString()} unit="parts" trendType="positive" />
        <MetricCard label="POWER GRID" value={totalPower} unit="kW" subtext="Fleet Instant" />
      </div>

      {/* Main Grid: Machine Fleet Status + Downtime Pareto + Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Fleet Health Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-industrial-accent" />
                <h2 className="text-sm font-bold text-industrial-primary uppercase tracking-wider">
                  MACHINES HEALTH SNAPSHOT
                </h2>
              </div>
              <button
                onClick={() => machineStore.setActiveView('machines')}
                className="text-xs text-industrial-accent hover:underline flex items-center gap-1"
              >
                <span>View Full Table</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {machineList.map((m) => {
                const isSelected = m.id === machineStore.getState().selectedMachineId;

                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      machineStore.selectMachine(m.id);
                      machineStore.setActiveView('machine-workspace');
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-industrial-accent-soft border-industrial-active shadow-industrial-sm ring-1 ring-industrial-active/40'
                        : 'bg-industrial-raised border-industrial-border hover:bg-industrial-elevated hover:border-industrial-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-industrial-primary">{m.id}</span>
                        <StatusBadge status={m.status} size="sm" />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-industrial-secondary">Health: </span>
                        <span
                          className={`text-xs font-bold ${
                            m.healthScore >= 85
                              ? 'text-industrial-success'
                              : m.healthScore >= 70
                              ? 'text-industrial-warning'
                              : 'text-industrial-critical'
                          }`}
                        >
                          {m.healthScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-industrial-muted font-sans line-clamp-1">{m.name}</div>

                    <div className="mt-2.5 grid grid-cols-4 gap-1.5 pt-2 border-t border-industrial-border text-[11px]">
                      <div>
                        <div className="text-industrial-muted">RPM</div>
                        <div className="font-semibold text-industrial-primary">{m.telemetry.rpm.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-industrial-muted">LOAD</div>
                        <div className="font-semibold text-industrial-primary">{m.telemetry.loadPct}%</div>
                      </div>
                      <div>
                        <div className="text-industrial-muted">TEMP</div>
                        <div className="font-semibold text-industrial-primary">{m.telemetry.tempC}°C</div>
                      </div>
                      <div>
                        <div className="text-industrial-muted">VIB</div>
                        <div className="font-semibold text-industrial-primary">{m.telemetry.vibrationMmS} mm/s</div>
                      </div>
                    </div>

                    {/* Sparkline */}
                    <div className="mt-2 pt-1">
                      <TelemetryChart
                        data={m.telemetryHistory.map((h) => h.vibrationMmS)}
                        height={24}
                        color={m.healthScore >= 85 ? 'var(--success)' : m.healthScore >= 70 ? 'var(--warning)' : 'var(--critical)'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Active Alerts & Downtime Loss */}
        <div className="space-y-4">
          {/* Active Industrial Alerts */}
          <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-industrial-warning" />
                <h2 className="text-sm font-bold text-industrial-primary uppercase tracking-wider">
                  ACTIVE ALERTS ({activeAlerts.length})
                </h2>
              </div>
              <button
                onClick={() => machineStore.setActiveView('alerts')}
                className="text-xs text-industrial-accent hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    machineStore.selectAlert(alert.id);
                    machineStore.selectMachine(alert.machineId);
                    machineStore.setActiveView('alerts');
                  }}
                  className="p-3 bg-industrial-raised border border-industrial-border rounded cursor-pointer hover:border-industrial-active/50 transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-industrial-primary">{alert.machineId}</span>
                    <StatusBadge status={alert.severity} size="sm" />
                  </div>
                  <div className="mt-1 font-semibold text-industrial-primary">{alert.title}</div>
                  <div className="mt-0.5 text-industrial-secondary text-[11px] font-sans line-clamp-2">
                    {alert.description}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-industrial-muted pt-1.5 border-t border-industrial-border">
                    <span>Observed: <strong className="text-industrial-critical">{alert.observedValue}</strong></span>
                    <span>{alert.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plant Downtime Pareto Analysis */}
          <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-industrial-accent" />
                <h2 className="text-sm font-bold text-industrial-primary uppercase tracking-wider">
                  SHIFT DOWNTIME LOSS (PARETO)
                </h2>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { category: 'Spindle Inspection & Chatter Mitigation', duration: 42, pct: 36, color: 'bg-industrial-critical' },
                { category: 'Tool Change & Presetting Indexing', duration: 31, pct: 27, color: 'bg-industrial-warning' },
                { category: 'Material Loading / Billet Clamping', duration: 18, pct: 15, color: 'bg-industrial-accent' },
                { category: 'Operator Quality Gaging & Inspection', duration: 14, pct: 12, color: 'bg-industrial-info' },
                { category: 'Chip Evacuation & Coolant Wash', duration: 12, pct: 10, color: 'bg-industrial-success' }
              ].map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-industrial-secondary">{item.category}</span>
                    <span className="font-bold text-industrial-primary">{item.duration} min</span>
                  </div>
                  <div className="w-full h-1.5 bg-industrial-bg rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
