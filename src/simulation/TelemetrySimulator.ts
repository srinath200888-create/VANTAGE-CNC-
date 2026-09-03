import { Machine, MachineId, TelemetryPacket, DemoScenarioId } from '../types';
import { MachineHealthEngine } from '../domain/healthEngine';
import { DEMO_SCENARIOS } from './scenarioManager';

export interface TelemetryListener {
  (machines: Record<MachineId, Machine>): void;
}

export class TelemetrySimulator {
  private machines: Record<MachineId, Machine>;
  private listeners: Set<TelemetryListener> = new Set();
  private timerId: any = null;
  private activeScenario: DemoScenarioId = 'normal';
  private tickCount = 0;

  constructor(initialMachines: Record<MachineId, Machine>) {
    this.machines = initialMachines;
  }

  public start(intervalMs = 1000): void {
    if (this.timerId) return;
    this.timerId = setInterval(() => this.tick(), intervalMs);
  }

  public stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    listener(this.machines);
    return () => this.listeners.delete(listener);
  }

  public setScenario(scenarioId: DemoScenarioId): void {
    this.activeScenario = scenarioId;
    this.applyScenarioOverrides();
  }

  public getScenario(): DemoScenarioId {
    return this.activeScenario;
  }

  public getMachines(): Record<MachineId, Machine> {
    return this.machines;
  }

  public setMachineState(machineId: MachineId, state: Machine['status']): void {
    const machine = this.machines[machineId];
    if (!machine) return;

    machine.status = state;
    if (state === 'IDLE' || state === 'MAINTENANCE') {
      machine.telemetry.targetRpm = 0;
      machine.telemetry.loadPct = 0;
    } else if (state === 'RUNNING') {
      machine.telemetry.targetRpm = 10500;
      machine.telemetry.loadPct = 52;
    }
    this.tick();
  }

  public setSpindleTargetRPM(machineId: MachineId, targetRpm: number): void {
    const machine = this.machines[machineId];
    if (!machine) return;
    machine.telemetry.targetRpm = targetRpm;
    if (targetRpm > 0 && machine.status !== 'RUNNING') {
      machine.status = 'RUNNING';
    }
  }

  private tick(): void {
    this.tickCount++;
    const now = Date.now();
    const updatedMachines: Record<MachineId, Machine> = { ...this.machines };

    (Object.keys(updatedMachines) as MachineId[]).forEach((id) => {
      const m = updatedMachines[id];
      const prevTelem = m.telemetry;

      // 1. Spindle RPM dynamics (exponential approach to target)
      let currentRpm = prevTelem.rpm;
      if (currentRpm !== prevTelem.targetRpm) {
        const diff = prevTelem.targetRpm - currentRpm;
        const step = diff * 0.35;
        currentRpm = Math.abs(diff) < 20 ? prevTelem.targetRpm : currentRpm + step;
      }

      // 2. Correlated Jitter & Thermal response
      const jitter = (Math.sin(this.tickCount * 0.2 + id.charCodeAt(4)) * 0.04);
      let loadPct = m.status === 'RUNNING' ? Math.max(10, Math.min(98, prevTelem.loadPct + jitter * 8)) : 0;
      let tempC = prevTelem.tempC;
      let vibrationMmS = prevTelem.vibrationMmS;

      // Deterministic thermal equilibrium (Higher load heats up spindle)
      const targetTemp = m.status === 'RUNNING' ? 32 + (loadPct / 100) * 28 : 26.0;
      tempC += (targetTemp - tempC) * 0.08;

      // Deterministic vibration baseline
      const baseVib = m.status === 'RUNNING' ? 1.2 + (currentRpm / 15000) * 0.8 + (loadPct / 100) * 0.6 : 0.05;
      vibrationMmS += (baseVib - vibrationMmS) * 0.15;

      // Power and Current calculations (P = V * I * pf)
      const powerKw = m.status === 'RUNNING' ? 2.5 + (loadPct / 100) * 16.5 : 0.4;
      const currentA = (powerKw * 1000) / (400 * 1.732 * 0.88);

      // Tool wear progression during cutting
      let toolWearPct = prevTelem.toolWearPct;
      if (m.status === 'RUNNING') {
        toolWearPct = Math.min(100, toolWearPct + 0.02);
      }

      // Axis toolpath motion coordinates
      const posX = m.status === 'RUNNING' ? Math.sin(this.tickCount * 0.3) * 140 : prevTelem.posX;
      const posY = m.status === 'RUNNING' ? Math.cos(this.tickCount * 0.3) * 90 : prevTelem.posY;
      const posZ = m.status === 'RUNNING' ? -25 - Math.abs(Math.sin(this.tickCount * 0.1)) * 30 : 0;

      const newTelemetry: TelemetryPacket = {
        ...prevTelem,
        timestamp: now,
        state: m.status,
        rpm: Math.round(currentRpm),
        loadPct: Math.round(loadPct * 10) / 10,
        tempC: Math.round(tempC * 10) / 10,
        vibrationMmS: Math.round(vibrationMmS * 100) / 100,
        currentA: Math.round(currentA * 10) / 10,
        powerKw: Math.round(powerKw * 10) / 10,
        energyKwh: Math.round((prevTelem.energyKwh + (powerKw * (1 / 3600))) * 100) / 100,
        posX: Math.round(posX * 10) / 10,
        posY: Math.round(posY * 10) / 10,
        posZ: Math.round(posZ * 10) / 10,
        toolWearPct: Math.round(toolWearPct * 10) / 10,
        partsCount: m.oee.actualPartsProduced
      };

      // Apply Health Evaluation
      const { updatedMachine } = MachineHealthEngine.evaluateMachine(m, newTelemetry);

      // Update telemetry history ring buffer (keep last 30 points)
      const hist = [...updatedMachine.telemetryHistory, newTelemetry];
      if (hist.length > 30) hist.shift();
      updatedMachine.telemetryHistory = hist;

      updatedMachines[id] = updatedMachine;
    });

    this.machines = updatedMachines;
    this.notifyListeners();
  }

  private applyScenarioOverrides(): void {
    const scenario = DEMO_SCENARIOS[this.activeScenario];
    if (!scenario) return;

    const targetMachine = this.machines[scenario.targetMachineId];
    if (!targetMachine) return;

    switch (this.activeScenario) {
      case 'toolWear':
        targetMachine.telemetry.toolWearPct = 86.5;
        targetMachine.telemetry.loadPct = 92.0;
        targetMachine.telemetry.vibrationMmS = 3.65;
        break;
      case 'spindleAnomaly':
        targetMachine.telemetry.vibrationMmS = 4.95;
        targetMachine.telemetry.tempC = 63.8;
        targetMachine.telemetry.loadPct = 88.0;
        break;
      case 'motorOverload':
        targetMachine.telemetry.loadPct = 96.0;
        targetMachine.telemetry.currentA = 44.5;
        targetMachine.telemetry.powerKw = 24.2;
        break;
      case 'workpieceSlip':
        targetMachine.telemetry.vibrationMmS = 4.2;
        targetMachine.telemetry.workpieceClamped = false;
        break;
      case 'thermalDrift':
        targetMachine.telemetry.tempC = 68.5;
        break;
      case 'chipJam':
        targetMachine.telemetry.chipAugerRunning = false;
        targetMachine.telemetry.loadPct = 82;
        break;
      case 'coolantStarvation':
        targetMachine.telemetry.coolantFlowLpm = 8.5;
        targetMachine.telemetry.tempC = 59.2;
        break;
      case 'normal':
      default:
        targetMachine.telemetry.vibrationMmS = 1.45;
        targetMachine.telemetry.tempC = 38.5;
        targetMachine.telemetry.loadPct = 48.0;
        targetMachine.telemetry.toolWearPct = 28.0;
        targetMachine.telemetry.workpieceClamped = true;
        targetMachine.telemetry.coolantFlowLpm = 58.0;
        targetMachine.telemetry.chipAugerRunning = true;
        break;
    }
    this.tick();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.machines));
  }
}
