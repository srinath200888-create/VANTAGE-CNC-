import React from 'react';
import { useSelectedMachine, useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { ThreeCanvas } from '../twin3d/ThreeCanvas';
import { CNCComponentId, MachineId } from '../types';
import { COMPONENT_DEFINITIONS } from '../domain/componentHierarchy';
import { Box, Layers, Maximize2, ShieldAlert, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export const DigitalTwinView: React.FC = () => {
  const machine = useSelectedMachine();
  const { selectedComponentId, machines } = useMachineStore();

  const handleComponentSelect = (compId: CNCComponentId | null) => {
    machineStore.selectComponent(compId);
  };

  return (
    <div className="h-full flex flex-col space-y-3 font-mono">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <Box className="w-4 h-4" />
            <span>FULLSCREEN 3D CNC DIGITAL TWIN WORKSTATION</span>
          </div>
          <span className="text-industrial-muted">|</span>
          <span className="font-bold text-sm text-industrial-primary">{machine.id}</span>
        </div>

        {/* Machine Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-industrial-muted">Select Target Node:</span>
          <select
            value={machine.id}
            onChange={(e) => machineStore.selectMachine(e.target.value as MachineId)}
            className="bg-industrial-bg border border-industrial-border rounded px-2.5 py-1 text-industrial-primary font-mono"
          >
            {(Object.keys(machines) as MachineId[]).map((id) => (
              <option key={id} value={id}>
                {id} - {machines[id].model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="flex-1 min-h-[600px] w-full relative">
        <ThreeCanvas
          machine={machine}
          selectedComponentId={selectedComponentId}
          onSelectComponent={handleComponentSelect}
          expandedView={true}
          className="shadow-industrial-lg"
        />
      </div>
    </div>
  );
};
