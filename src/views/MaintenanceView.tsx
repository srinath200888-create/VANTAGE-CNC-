import React, { useState } from 'react';
import { useMachineStore } from '../state/useMachineStore';
import { machineStore } from '../state/MachineStateStore';
import { WorkOrder } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { WorkOrderModal } from '../components/Modal';
import { Wrench, Plus, CheckCircle2, Clock, Calendar, User, ShieldCheck } from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const { workOrders } = useMachineStore();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredOrders = workOrders.filter(
    (wo) => filterStatus === 'ALL' || wo.status === filterStatus
  );

  const handleUpdateStatus = (orderId: string, newStatus: WorkOrder['status']) => {
    machineStore.updateWorkOrderStatus(orderId, newStatus);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-industrial-surface border border-industrial-border rounded-lg shadow-industrial-sm">
        <div>
          <div className="flex items-center gap-2 text-industrial-accent text-xs font-bold tracking-wider uppercase">
            <Wrench className="w-4 h-4" />
            <span>MAINTENANCE OPERATIONS & WORK ORDER MANAGEMENT</span>
          </div>
          <h1 className="text-xl font-bold text-industrial-primary tracking-tight mt-1 font-sans">
            Plant Maintenance Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            {['ALL', 'OPEN', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1.5 rounded transition-all ${
                  filterStatus === st
                    ? 'bg-industrial-accent text-industrial-bg font-bold shadow-industrial-sm'
                    : 'bg-industrial-raised text-industrial-secondary hover:text-industrial-primary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-industrial-accent text-industrial-bg font-bold rounded text-xs transition-opacity hover:opacity-90 shadow-industrial-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            NEW WORK ORDER
          </button>
        </div>
      </div>

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((wo) => (
          <div
            key={wo.id}
            className="p-4 bg-industrial-surface border border-industrial-border rounded-lg space-y-3 flex flex-col justify-between shadow-industrial-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-industrial-accent">{wo.id}</span>
                  <span className="text-industrial-muted">|</span>
                  <span className="font-bold text-xs text-industrial-primary">{wo.machineId}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    wo.priority === 'URGENT'
                      ? 'bg-industrial-critical-soft text-industrial-critical border border-industrial-critical/40'
                      : wo.priority === 'HIGH'
                      ? 'bg-industrial-warning-soft text-industrial-warning border border-industrial-warning/40'
                      : 'bg-industrial-bg text-industrial-secondary border border-industrial-border'
                  }`}
                >
                  {wo.priority}
                </span>
              </div>

              <h3 className="font-bold text-sm text-industrial-primary font-sans">{wo.title}</h3>
              <p className="text-xs text-industrial-secondary font-sans leading-relaxed line-clamp-3">
                {wo.taskDescription}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-industrial-border text-[11px] text-industrial-secondary font-sans">
              <div className="flex items-center justify-between">
                <span>Team: <strong className="text-industrial-primary">{wo.assignedTeam}</strong></span>
                <span>Due: <strong className="text-industrial-primary">{wo.dueDate}</strong></span>
              </div>

              <div className="flex items-center justify-between">
                <span>Technician: <strong className="text-industrial-primary">{wo.technicianName}</strong></span>
                <span>Est. Downtime: <strong className="text-industrial-warning">{wo.estimatedDowntimeMin} min</strong></span>
              </div>

              {/* Status Update Actions */}
              <div className="pt-2 border-t border-industrial-border flex items-center justify-between">
                <span
                  className={`font-semibold ${
                    wo.status === 'COMPLETED'
                      ? 'text-industrial-success'
                      : wo.status === 'IN_PROGRESS'
                      ? 'text-industrial-accent'
                      : 'text-industrial-warning'
                  }`}
                >
                  Status: {wo.status}
                </span>

                <div className="flex items-center gap-1.5">
                  {wo.status !== 'IN_PROGRESS' && wo.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleUpdateStatus(wo.id, 'IN_PROGRESS')}
                      className="px-2 py-1 bg-industrial-raised hover:bg-industrial-elevated text-industrial-primary rounded text-[10px]"
                    >
                      Start Task
                    </button>
                  )}

                  {wo.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleUpdateStatus(wo.id, 'COMPLETED')}
                      className="px-2 py-1 bg-industrial-success-soft hover:bg-industrial-success/25 text-industrial-success font-semibold border border-industrial-success/40 rounded text-[10px]"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <WorkOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
