import React, { useState } from 'react';
import { machineStore } from '../state/MachineStateStore';
import { MachineId, CNCComponentId } from '../types';
import { COMPONENT_DEFINITIONS } from '../domain/componentHierarchy';
import { Wrench, X, CheckCircle2 } from 'lucide-react';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMachineId?: MachineId;
  defaultComponentId?: CNCComponentId;
  alertId?: string;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  isOpen,
  onClose,
  defaultMachineId = 'CNC-03',
  defaultComponentId = 'cnc.spindle',
  alertId
}) => {
  const [machineId, setMachineId] = useState<MachineId>(defaultMachineId);
  const [componentId, setComponentId] = useState<CNCComponentId>(defaultComponentId);
  const [title, setTitle] = useState('Execute Spindle Bearing Acoustic & Vibration Audit');
  const [taskDescription, setTaskDescription] = useState(
    'Inspect front angular contact ceramic bearing pack, measure ISO 10816 vibration spectrum, and verify drawbar retention force.'
  );
  const [priority, setPriority] = useState<'URGENT' | 'HIGH' | 'MEDIUM' | 'ROUTINE'>('HIGH');
  const [assignedTeam, setAssignedTeam] = useState('Reliability Engineering Team');
  const [technicianName, setTechnicianName] = useState('P. Nair (Vibration Analyst)');
  const [dueDate, setDueDate] = useState('Today (End of Shift 2)');
  const [estimatedDowntimeMin, setEstimatedDowntimeMin] = useState(45);
  const [partsRequired, setPartsRequired] = useState('BT40 retention gauge, PT100 probe, bearing grease kit');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    machineStore.createWorkOrder({
      machineId,
      componentId,
      title,
      taskDescription,
      priority,
      assignedTeam,
      technicianName,
      dueDate,
      estimatedDowntimeMin,
      partsRequired: partsRequired.split(',').map((p) => p.trim()),
      alertId
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn font-mono text-xs">
      <div className="w-full max-w-lg bg-industrial-surface border border-industrial-border rounded-xl shadow-industrial-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-industrial-raised border-b border-industrial-border">
          <div className="flex items-center gap-2 text-industrial-accent font-bold text-sm">
            <Wrench className="w-4 h-4" />
            <span>CREATE MAINTENANCE WORK ORDER</span>
          </div>
          <button onClick={onClose} className="p-1 text-industrial-muted hover:text-industrial-primary rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-industrial-muted mb-1">Target CNC Machine</label>
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value as MachineId)}
                className="w-full bg-industrial-bg border border-industrial-border rounded px-2.5 py-1.5 text-industrial-primary focus:outline-none focus:border-industrial-active"
              >
                {[
                  'CNC-01',
                  'CNC-02',
                  'CNC-03',
                  'CNC-04',
                  'CNC-05',
                  'CNC-06',
                  'CNC-07',
                  'CNC-08',
                  'CNC-09',
                  'CNC-10'
                ].map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-industrial-muted mb-1">Component Assembly</label>
              <select
                value={componentId}
                onChange={(e) => setComponentId(e.target.value as CNCComponentId)}
                className="w-full bg-industrial-bg border border-industrial-border rounded px-2.5 py-1.5 text-industrial-primary focus:outline-none focus:border-industrial-active"
              >
                {(Object.keys(COMPONENT_DEFINITIONS) as CNCComponentId[]).map((id) => (
                  <option key={id} value={id}>
                    {COMPONENT_DEFINITIONS[id].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-industrial-muted mb-1">Work Order Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-industrial-bg border border-industrial-border rounded px-2.5 py-1.5 text-industrial-primary focus:outline-none focus:border-industrial-active"
              required
            />
          </div>

          <div>
            <label className="block text-industrial-muted mb-1">Task Procedure & Instructions</label>
            <textarea
              rows={3}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full bg-industrial-bg border border-industrial-border rounded px-2.5 py-1.5 text-industrial-primary focus:outline-none focus:border-industrial-active"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-industrial-muted mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-industrial-bg border border-industrial-border rounded px-2.5 py-1.5 text-industrial-primary"
              >
                <option value="URGENT">URGENT</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="ROUTINE">ROUTINE</option>
              </select>
            </div>

            <div>
              <label className="block text-industrial-muted mb-1">Due Schedule</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-industrial-bg border border-industrial-border rounded px-2.5 py-1.5 text-industrial-primary"
              />
            </div>

            <div>
              <label className="block text-industrial-muted mb-1">Est. Downtime (min)</label>
              <input
                type="number"
                value={estimatedDowntimeMin}
                onChange={(e) => setEstimatedDowntimeMin(parseInt(e.target.value) || 0)}
                className="w-full bg-industrial-bg border border-industrial-border rounded px-2.5 py-1.5 text-industrial-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-industrial-muted mb-1">Assigned Team</label>
              <input
                type="text"
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value)}
                className="w-full bg-industrial-bg border border-industrial-border rounded px-2.5 py-1.5 text-industrial-primary"
              />
            </div>

            <div>
              <label className="block text-industrial-muted mb-1">Lead Specialist</label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full bg-industrial-bg border border-industrial-border rounded px-2.5 py-1.5 text-industrial-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-industrial-muted mb-1">Parts & Tooling Required (comma separated)</label>
            <input
              type="text"
              value={partsRequired}
              onChange={(e) => setPartsRequired(e.target.value)}
              className="w-full bg-industrial-bg border border-industrial-border rounded px-2.5 py-1.5 text-industrial-primary"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-industrial-raised hover:bg-industrial-elevated text-industrial-secondary rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-industrial-accent text-industrial-bg font-bold rounded hover:opacity-90 transition-opacity shadow-industrial-sm"
            >
              Dispatch Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
