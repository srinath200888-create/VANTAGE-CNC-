import {
  Machine,
  MachineId,
  CNCComponentId,
  Alert,
  WorkOrder,
  ActiveView,
  DemoScenarioId
} from '../types';
import { createInitialMachines } from '../domain/machineRegistry';
import { TelemetrySimulator } from '../simulation/TelemetrySimulator';
import { EventBus } from './EventBus';

export interface GlobalState {
  machines: Record<MachineId, Machine>;
  selectedMachineId: MachineId;
  selectedComponentId: CNCComponentId | null;
  selectedAlertId: string | null;
  alerts: Alert[];
  workOrders: WorkOrder[];
  activeView: ActiveView;
  isSidebarCollapsed: boolean;
  activeScenario: DemoScenarioId;
}

class Store {
  private state: GlobalState;
  private listeners = new Set<() => void>();
  public simulator: TelemetrySimulator;

  constructor() {
    const initialMachines = createInitialMachines();
    this.simulator = new TelemetrySimulator(initialMachines);

    const initialAlerts: Alert[] = [
      {
        id: 'ALT-1042',
        machineId: 'CNC-03',
        componentId: 'cnc.spindle',
        title: 'Elevated Spindle Bearing Vibration',
        description: 'Vibration signature exceeded machine baseline (4.82 mm/s RMS vs 1.80 mm/s baseline).',
        severity: 'CRITICAL',
        timestamp: '10:18:42',
        baselineValue: '1.80 mm/s',
        observedValue: '4.82 mm/s',
        metricUnit: 'mm/s RMS',
        possibleContributors: ['Front ceramic bearing race micro-spalling', 'Tool holder centrifugal unbalance', 'High cutting chatter'],
        recommendedActions: ['Inspect tool condition', 'Verify cutting depth parameters', 'Schedule spindle bearing acoustic audit during next planned PM window'],
        status: 'ACTIVE'
      },
      {
        id: 'ALT-1039',
        machineId: 'CNC-07',
        componentId: 'cnc.cuttingTool',
        title: 'Critical Tool Flank Wear (VB > 0.3mm)',
        description: 'Cutting tool life exhausted (86% wear). Part dimensional tolerance deviation risk.',
        severity: 'WARNING',
        timestamp: '09:42:15',
        baselineValue: '< 50% wear',
        observedValue: '86% wear',
        metricUnit: '% Life',
        possibleContributors: ['Abrasive billet inclusions', 'High cutting speed in hardened zone', 'Coolant nozzle misdirection'],
        recommendedActions: ['Index to sister tool in magazine', 'Replace carbide insert', 'Measure part Ra surface roughness'],
        status: 'ACTIVE'
      },
      {
        id: 'ALT-1031',
        machineId: 'CNC-09',
        componentId: 'cnc.base',
        title: 'Quarterly Preventive Maintenance Scheduled',
        description: 'Planned 500-hour hydraulic fluid flush and guideway alignment audit.',
        severity: 'INFO',
        timestamp: '08:00:00',
        baselineValue: '500 hrs',
        observedValue: '512 hrs',
        metricUnit: 'Hours',
        possibleContributors: ['Scheduled calendar interval reached'],
        recommendedActions: ['Perform task checklist as per SOP-MNT-04'],
        status: 'ACKNOWLEDGED',
        assignedTo: 'Tech Team Alpha'
      }
    ];

    const initialWorkOrders: WorkOrder[] = [
      {
        id: 'WO-209',
        machineId: 'CNC-03',
        componentId: 'cnc.spindle',
        title: 'Inspect Spindle Vibration & Bearing Condition',
        taskDescription: 'Execute ISO 10816 vibration spectrum FFT audit, inspect front ceramic angular contact bearing race, and verify drawbar clamping force.',
        priority: 'HIGH',
        status: 'OPEN',
        assignedTeam: 'Reliability Engineering Team',
        technicianName: 'P. Nair (Senior Vibration Analyst)',
        dueDate: 'Today (End of Shift 2)',
        estimatedDowntimeMin: 45,
        partsRequired: ['Mas-403 BT40 retention knob gauge', 'PT100 thermal probe', 'Ceramic bearing grease kit'],
        createdAt: '10:20:00',
        alertId: 'ALT-1042'
      },
      {
        id: 'WO-208',
        machineId: 'CNC-07',
        componentId: 'cnc.cuttingTool',
        title: 'Replace Ø16 TiAlN End Mill in Pocket 04',
        taskDescription: 'Remove worn solid carbide cutter from tool holder, install fresh TiAlN 4-flute end mill, set tool length offset on tool presetter.',
        priority: 'MEDIUM',
        status: 'SCHEDULED',
        assignedTeam: 'Tooling & Preset Cell',
        technicianName: 'S. Raman (Tooling Specialist)',
        dueDate: 'Tomorrow 08:00',
        estimatedDowntimeMin: 15,
        partsRequired: ['Ø16.0 mm 4-Flute AlTiN Carbide End Mill (SKU: EM-16-4F-TIALN)'],
        createdAt: '09:45:00',
        alertId: 'ALT-1039'
      },
      {
        id: 'WO-205',
        machineId: 'CNC-09',
        componentId: 'cnc.base',
        title: 'Quarterly Hydraulic Fluid & Way Lube Service',
        taskDescription: 'Replace ISO VG 68 slideway lubricant and flush hydraulic reservoir filters.',
        priority: 'ROUTINE',
        status: 'IN_PROGRESS',
        assignedTeam: 'Plant Maintenance Team Alpha',
        technicianName: 'M. Suresh (Maintenance Tech)',
        dueDate: 'Today 17:00',
        estimatedDowntimeMin: 120,
        partsRequired: ['Mobil Vactra Oil No. 2 (20 Liters)', 'Return line filter cartridge 10µm'],
        createdAt: '08:05:00',
        alertId: 'ALT-1031'
      }
    ];

    this.state = {
      machines: initialMachines,
      selectedMachineId: 'CNC-03',
      selectedComponentId: 'cnc.spindle',
      selectedAlertId: 'ALT-1042',
      alerts: initialAlerts,
      workOrders: initialWorkOrders,
      activeView: 'overview',
      isSidebarCollapsed: false,
      activeScenario: 'spindleAnomaly'
    };

    // Subscribe to simulator telemetry stream
    this.simulator.subscribe((updatedMachines) => {
      this.state.machines = updatedMachines;
      this.emitChange();
      EventBus.emit('TELEMETRY_UPDATED', updatedMachines);
    });

    this.simulator.start(1000);
  }

  public getState(): GlobalState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitChange(): void {
    this.listeners.forEach((listener) => listener());
  }

  public setActiveView(view: ActiveView): void {
    this.state.activeView = view;
    this.emitChange();
    EventBus.emit('VIEW_CHANGED', view);
  }

  public selectMachine(machineId: MachineId): void {
    this.state.selectedMachineId = machineId;
    this.emitChange();
    EventBus.emit('MACHINE_SELECTED', machineId);
  }

  public selectComponent(componentId: CNCComponentId | null): void {
    this.state.selectedComponentId = componentId;
    this.emitChange();
    EventBus.emit('COMPONENT_SELECTED', componentId);
  }

  public selectAlert(alertId: string | null): void {
    this.state.selectedAlertId = alertId;
    this.emitChange();
    EventBus.emit('ALERT_SELECTED', alertId);
  }

  public toggleSidebar(): void {
    this.state.isSidebarCollapsed = !this.state.isSidebarCollapsed;
    this.emitChange();
  }

  public setScenario(scenarioId: DemoScenarioId): void {
    this.state.activeScenario = scenarioId;
    this.simulator.setScenario(scenarioId);
    this.emitChange();
    EventBus.emit('SCENARIO_CHANGED', scenarioId);
  }

  public acknowledgeAlert(alertId: string, assignedTo = 'Current Operator'): void {
    this.state.alerts = this.state.alerts.map((a) =>
      a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', assignedTo } : a
    );
    this.emitChange();
    EventBus.emit('ALERT_ACKNOWLEDGED', alertId);
  }

  public resolveAlert(alertId: string): void {
    this.state.alerts = this.state.alerts.map((a) =>
      a.id === alertId ? { ...a, status: 'RESOLVED' } : a
    );
    this.emitChange();
    EventBus.emit('ALERT_RESOLVED', alertId);
  }

  public createWorkOrder(order: Omit<WorkOrder, 'id' | 'createdAt' | 'status'>): WorkOrder {
    const newOrder: WorkOrder = {
      ...order,
      id: `WO-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toLocaleTimeString(),
      status: 'OPEN'
    };
    this.state.workOrders = [newOrder, ...this.state.workOrders];

    // If linked to an alert, update alert workOrderId
    if (order.alertId) {
      this.state.alerts = this.state.alerts.map((a) =>
        a.id === order.alertId ? { ...a, workOrderId: newOrder.id, status: 'IN_PROGRESS' } : a
      );
    }

    this.emitChange();
    EventBus.emit('WORK_ORDER_CREATED', newOrder);
    return newOrder;
  }

  public updateWorkOrderStatus(orderId: string, status: WorkOrder['status']): void {
    this.state.workOrders = this.state.workOrders.map((wo) =>
      wo.id === orderId
        ? {
            ...wo,
            status,
            completedAt: status === 'COMPLETED' ? new Date().toLocaleTimeString() : wo.completedAt
          }
        : wo
    );
    this.emitChange();
    EventBus.emit('WORK_ORDER_UPDATED', { orderId, status });
  }
}

export const machineStore = new Store();
