import React from 'react';
import { useMachineStore } from '../state/useMachineStore';
import { StatusBadge } from '../components/StatusBadge';
import { Radio, Cpu, Network, CheckCircle2, RefreshCw, Activity, Terminal } from 'lucide-react';

export const EdgeNodesView: React.FC = () => {
  const { machines } = useMachineStore();
  const machineList = Object.values(machines);

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div>
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <Radio className="w-4 h-4" />
            <span>INDUSTRIAL IOT EDGE GATEWAYS & TELEMETRY INGESTION</span>
          </div>
          <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
            Hardware Edge Nodes & MQTT/OPC-UA Ingestion
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-industrial-success-soft border border-industrial-success/40 text-industrial-success rounded font-semibold shadow-industrial-sm">
            <span className="w-2 h-2 rounded-full bg-industrial-success animate-pulse" />
            10 / 10 NODES CONNECTED
          </span>
        </div>
      </div>

      {/* Hardware Connection Architecture Banner */}
      <div className="p-4 bg-industrial-bg border border-industrial-border rounded-lg text-xs space-y-2 shadow-industrial-sm">
        <span className="text-[10px] text-industrial-accent font-bold uppercase tracking-wider block">
          PHYSICAL-TO-DIGITAL ARCHITECTURE
        </span>
        <div className="flex flex-wrap items-center gap-2 text-industrial-secondary font-mono text-[11px]">
          <span className="px-2 py-1 bg-industrial-surface border border-industrial-border rounded">Physical CNC Machine</span>
          <span>&rarr;</span>
          <span className="px-2 py-1 bg-industrial-surface border border-industrial-border rounded">Sensors & PLC</span>
          <span>&rarr;</span>
          <span className="px-2 py-1 bg-industrial-accent-soft border border-industrial-accent/50 text-industrial-accent rounded font-bold">Edge Gateway Node (ESP32 / Pi)</span>
          <span>&rarr;</span>
          <span className="px-2 py-1 bg-industrial-surface border border-industrial-border rounded">MQTT / OPC-UA</span>
          <span>&rarr;</span>
          <span className="px-2 py-1 bg-industrial-raised border border-industrial-border text-industrial-primary rounded font-bold">3D Digital Twin Platform</span>
        </div>
      </div>

      {/* Edge Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machineList.map((m) => (
          <div
            key={m.edgeNodeId}
            className="p-4 bg-industrial-surface border border-industrial-border rounded-lg space-y-3 shadow-industrial-sm"
          >
            <div className="flex items-center justify-between pb-2 border-b border-industrial-border">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-industrial-success" />
                <span className="font-bold text-xs text-industrial-primary">{m.edgeNodeId}</span>
              </div>
              <span className="px-2 py-0.5 bg-industrial-success-soft text-industrial-success border border-industrial-success/40 rounded text-[10px] font-bold">
                ONLINE
              </span>
            </div>

            <div className="text-xs space-y-1.5 font-sans">
              <div className="flex justify-between text-industrial-secondary">
                <span>Bound Machine:</span>
                <strong className="text-industrial-accent font-mono">{m.id} ({m.model})</strong>
              </div>
              <div className="flex justify-between text-industrial-secondary">
                <span>Protocol:</span>
                <strong className="text-industrial-primary font-mono">OPC-UA / MQTT TCP</strong>
              </div>
              <div className="flex justify-between text-industrial-secondary">
                <span>Ingestion Rate:</span>
                <strong className="text-industrial-primary font-mono">10 Hz (100 ms)</strong>
              </div>
              <div className="flex justify-between text-industrial-secondary">
                <span>Network Latency:</span>
                <strong className="text-industrial-success font-mono">12 ms</strong>
              </div>
              <div className="flex justify-between text-industrial-secondary">
                <span>Packet Reliability:</span>
                <strong className="text-industrial-success font-mono">99.98%</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-industrial-border text-[10px] text-industrial-muted font-mono">
              Channels: Tri-axial Accel (X/Y/Z), CT-Clamp (A), PT100 (Temp), Optical Encoder (RPM)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
