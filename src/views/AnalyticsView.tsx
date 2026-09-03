import React, { useState } from 'react';
import { useMachineStore } from '../state/useMachineStore';
import { TelemetryChart } from '../components/TelemetryChart';
import { MetricCard } from '../components/MetricCard';
import { BarChart3, Zap, Activity, Clock, TrendingUp, Calendar } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { machines } = useMachineStore();
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D' | '90D'>('7D');

  const machineList = Object.values(machines);
  const totalPower = machineList.reduce((acc, m) => acc + m.telemetry.powerKw, 0).toFixed(1);
  const totalEnergy = machineList.reduce((acc, m) => acc + m.telemetry.energyKwh, 0).toFixed(1);
  const avgEnergyPerPart = (parseFloat(totalEnergy) / 12840).toFixed(2);

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div>
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <BarChart3 className="w-4 h-4" />
            <span>ENGINEERING ANALYTICS & ENERGY INTELLIGENCE</span>
          </div>
          <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
            Fleet Reliability & Energy Analytics
          </h1>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 text-xs">
          {(['24H', '7D', '30D', '90D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded transition-all ${
                timeRange === r
                  ? 'bg-industrial-accent text-industrial-bg font-bold shadow-industrial-sm'
                  : 'bg-industrial-raised text-industrial-secondary hover:text-industrial-primary'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Energy & Operational KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="TOTAL POWER GRID" value={totalPower} unit="kW" subtext="Fleet instantaneous" />
        <MetricCard label="DAILY CONSUMPTION" value={totalEnergy} unit="kWh" subtext="All 10 CNC cells" />
        <MetricCard label="ENERGY PER PART" value={avgEnergyPerPart} unit="kWh / part" trendType="positive" />
        <MetricCard label="MEAN TIME TO REPAIR" value="48.5" unit="min" subtext="Reliability index" />
      </div>

      {/* Analytics Trend Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg space-y-2 shadow-industrial-sm">
          <div className="flex items-center justify-between pb-1 border-b border-industrial-border">
            <span className="text-xs font-bold text-industrial-primary">FLEET VIBRATION DEGRADATION TREND</span>
            <span className="text-xs text-industrial-accent">{timeRange} WINDOW</span>
          </div>
          <TelemetryChart
            data={[1.2, 1.4, 1.5, 1.8, 2.1, 2.6, 2.9, 3.4, 3.8, 4.2]}
            label="PEAK ISO 10816 VIBRATION (mm/s)"
            unit="mm/s"
            color="var(--critical)"
            threshold={4.5}
            height={90}
          />
        </div>

        <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg space-y-2 shadow-industrial-sm">
          <div className="flex items-center justify-between pb-1 border-b border-industrial-border">
            <span className="text-xs font-bold text-industrial-primary">SPECIFIC ENERGY CONSUMPTION (kWh/part)</span>
            <span className="text-xs text-industrial-success">{timeRange} WINDOW</span>
          </div>
          <TelemetryChart
            data={[0.92, 0.88, 0.86, 0.84, 0.82, 0.79, 0.77, 0.76, 0.75, 0.74]}
            label="ENERGY PER PRODUCED PART"
            unit="kWh"
            color="var(--success)"
            height={90}
          />
        </div>

        <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg space-y-2 shadow-industrial-sm">
          <div className="flex items-center justify-between pb-1 border-b border-industrial-border">
            <span className="text-xs font-bold text-industrial-primary">PLANT OEE HISTORICAL TREND (%)</span>
            <span className="text-xs text-industrial-accent">{timeRange} WINDOW</span>
          </div>
          <TelemetryChart
            data={[78.4, 79.2, 80.5, 81.1, 80.8, 81.9, 82.4, 83.1, 82.9, 83.6]}
            label="OVERALL EQUIPMENT EFFECTIVENESS"
            unit="%"
            color="var(--chart-primary)"
            height={90}
          />
        </div>

        <div className="p-4 bg-industrial-surface border border-industrial-border rounded-lg space-y-2 shadow-industrial-sm">
          <div className="flex items-center justify-between pb-1 border-b border-industrial-border">
            <span className="text-xs font-bold text-industrial-primary">PLANNED VS UNPLANNED DOWNTIME (HRS)</span>
            <span className="text-xs text-industrial-warning">{timeRange} WINDOW</span>
          </div>
          <TelemetryChart
            data={[14.2, 12.8, 11.5, 9.8, 8.4, 7.9, 6.8, 5.9, 5.2, 4.8]}
            label="UNPLANNED DOWNTIME HOURS"
            unit="h"
            color="var(--warning)"
            height={90}
          />
        </div>
      </div>
    </div>
  );
};
