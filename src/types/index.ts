export type MachineId =
  | 'CNC-01'
  | 'CNC-02'
  | 'CNC-03'
  | 'CNC-04'
  | 'CNC-05'
  | 'CNC-06'
  | 'CNC-07'
  | 'CNC-08'
  | 'CNC-09'
  | 'CNC-10';

export type MachineOperatingState = 'RUNNING' | 'IDLE' | 'SETUP' | 'MAINTENANCE' | 'FAULT';

export type HealthSeverity = 'HEALTHY' | 'MONITOR' | 'WARNING' | 'CRITICAL';

export type CNCComponentId =
  | 'cnc.base'
  | 'cnc.column'
  | 'cnc.frame'
  | 'cnc.leftDoor'
  | 'cnc.rightDoor'
  | 'cnc.yAxis'
  | 'cnc.xAxis'
  | 'cnc.worktable'
  | 'cnc.fixture'
  | 'cnc.zAxis'
  | 'cnc.spindleHead'
  | 'cnc.spindle'
  | 'cnc.toolHolder'
  | 'cnc.cuttingTool'
  | 'cnc.atcMagazine'
  | 'cnc.atcArm'
  | 'cnc.controlPanel'
  | 'cnc.cabinet'
  | 'cnc.coolantSystem'
  | 'cnc.chipConveyor';

export interface ComponentHealth {
  id: CNCComponentId;
  name: string;
  code: string;
  category: 'Structural' | 'Motion & Drives' | 'Tooling & Spindle' | 'Tool Changer (ATC)' | 'Enclosure & Safety' | 'Control System' | 'Auxiliary';
  healthScore: number; // 0 - 100
  severity: HealthSeverity;
  temperature: number; // °C
  vibration: number; // mm/s RMS
  loadPct: number; // %
  operatingHours: number;
  failureRiskPct: number;
  detectedConditions: string[];
  recommendations: string[];
  lastInspectedDaysAgo: number;
  specifications: Record<string, string>;
}

export interface TelemetryPacket {
  timestamp: number;
  machineId: MachineId;
  state: MachineOperatingState;
  rpm: number;
  targetRpm: number;
  loadPct: number;
  tempC: number;
  vibrationMmS: number;
  currentA: number;
  powerKw: number;
  energyKwh: number;
  posX: number;
  posY: number;
  posZ: number;
  coolantFlowLpm: number;
  coolantPressureBar: number;
  coolantLevelPct: number;
  workpieceClamped: boolean;
  doorClosed: boolean;
  chipAugerRunning: boolean;
  activeToolId: string;
  toolWearPct: number;
  cycleTimeSec: number;
  partsCount: number;
}

export interface MachineHealthSummary {
  overallScore: number;
  spindle: number;
  tooling: number;
  axes: number;
  thermal: number;
  electrical: number;
  workholding: number;
  reasons: string[];
}

export interface Alert {
  id: string;
  machineId: MachineId;
  componentId: CNCComponentId;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  baselineValue: string;
  observedValue: string;
  metricUnit: string;
  possibleContributors: string[];
  recommendedActions: string[];
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';
  assignedTo?: string;
  workOrderId?: string;
}

export interface WorkOrder {
  id: string;
  machineId: MachineId;
  componentId: CNCComponentId;
  title: string;
  taskDescription: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'ROUTINE';
  status: 'OPEN' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTeam: string;
  technicianName: string;
  dueDate: string;
  estimatedDowntimeMin: number;
  partsRequired: string[];
  createdAt: string;
  completedAt?: string;
  alertId?: string;
}

export interface LossReason {
  reason: string;
  durationMin: number;
  lostParts: number;
  impactPct: number;
}

export interface OEEData {
  overallOee: number;
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
  shiftTargetParts: number;
  actualPartsProduced: number;
  scrapParts: number;
  lostPartsCount: number;
  availabilityLossReasons: LossReason[];
  performanceLossReasons: LossReason[];
  qualityLossReasons: LossReason[];
}

export interface Machine {
  id: MachineId;
  name: string;
  model: string;
  cell: 'Engine Block Cell A' | 'Transmission Cell B' | 'Chassis Component Cell C';
  location: string;
  status: MachineOperatingState;
  healthScore: number;
  healthSeverity: HealthSeverity;
  healthSummary: MachineHealthSummary;
  telemetry: TelemetryPacket;
  telemetryHistory: TelemetryPacket[];
  oee: OEEData;
  activeProgram: string;
  activeToolId: string;
  operatorName: string;
  runtimeHours: number;
  totalPartsProduced: number;
  lastMaintenanceDaysAgo: number;
  components: Record<CNCComponentId, ComponentHealth>;
  edgeNodeId: string;
}

export type DemoScenarioId =
  | 'normal'
  | 'toolWear'
  | 'spindleAnomaly'
  | 'motorOverload'
  | 'workpieceSlip'
  | 'thermalDrift'
  | 'chipJam'
  | 'coolantStarvation';

export interface DemoScenario {
  id: DemoScenarioId;
  name: string;
  description: string;
  targetMachineId: MachineId;
  affectedComponent: CNCComponentId;
  expectedAlertTitle: string;
  expectedSeverity: 'CRITICAL' | 'WARNING' | 'INFO';
}

export type CameraPreset = 'iso' | 'front' | 'side' | 'top' | 'chamber' | 'spindle' | 'internal' | 'atc' | 'exploded';

export type ActiveView =
  | 'overview'
  | 'factory'
  | 'machines'
  | 'machine-workspace'
  | 'digital-twin'
  | 'spindle'
  | 'tooling'
  | 'axes'
  | 'alerts'
  | 'incident-detail'
  | 'maintenance'
  | 'production'
  | 'analytics'
  | 'edge'
  | 'settings';
