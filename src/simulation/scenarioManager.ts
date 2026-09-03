import { DemoScenario, DemoScenarioId } from '../types';

export const DEMO_SCENARIOS: Record<DemoScenarioId, DemoScenario> = {
  normal: {
    id: 'normal',
    name: '01. Normal Production Baseline',
    description: 'All 10 CNC machines operating within nominal tolerances. Balanced loads, green status indicators, low vibration.',
    targetMachineId: 'CNC-01',
    affectedComponent: 'cnc.spindle',
    expectedAlertTitle: 'None (Nominal)',
    expectedSeverity: 'INFO'
  },
  toolWear: {
    id: 'toolWear',
    name: '02. Progressive Tool Flank Wear',
    description: 'Cutting tool flank wear increases from 25% to 88%. Spindle torque load gradually rises and cutting harmonics increase.',
    targetMachineId: 'CNC-07',
    affectedComponent: 'cnc.cuttingTool',
    expectedAlertTitle: 'Critical Tool Flank Wear (VB > 0.3mm)',
    expectedSeverity: 'WARNING'
  },
  spindleAnomaly: {
    id: 'spindleAnomaly',
    name: '03. Spindle Bearing Degradation Anomaly',
    description: 'Tri-axial vibration climbs to 4.85 mm/s RMS, accompanied by thermal drift up to 62°C in the front ceramic bearing pack.',
    targetMachineId: 'CNC-03',
    affectedComponent: 'cnc.spindle',
    expectedAlertTitle: 'Critical Spindle Bearing Vibration',
    expectedSeverity: 'CRITICAL'
  },
  motorOverload: {
    id: 'motorOverload',
    name: '04. Spindle Direct-Drive Motor Overload',
    description: 'Motor current spikes to 42A with 94% load during aggressive roughing cut on hardened steel insert.',
    targetMachineId: 'CNC-02',
    affectedComponent: 'cnc.spindleHead',
    expectedAlertTitle: 'Spindle Servo Torque Overload',
    expectedSeverity: 'WARNING'
  },
  workpieceSlip: {
    id: 'workpieceSlip',
    name: '05. Workholding Clamping Pressure Micro-Slip',
    description: 'Hydraulic vise clamping pressure drops from 45 kN to 18 kN, triggering acoustic micro-slip warning on 6061 aluminum billet.',
    targetMachineId: 'CNC-04',
    affectedComponent: 'cnc.fixture',
    expectedAlertTitle: 'Workpiece Clamping Pressure Loss',
    expectedSeverity: 'CRITICAL'
  },
  thermalDrift: {
    id: 'thermalDrift',
    name: '06. Machine Column & Spindle Thermal Growth',
    description: 'Ambient workshop temperature spike causes casting thermal expansion, drifting Z-axis datum by +18 µm.',
    targetMachineId: 'CNC-06',
    affectedComponent: 'cnc.column',
    expectedAlertTitle: 'Structural Thermal Expansion Drift',
    expectedSeverity: 'WARNING'
  },
  chipJam: {
    id: 'chipJam',
    name: '07. Motorized Chip Conveyor Auger Over-Torque',
    description: 'Long stringy steel chips jam the internal discharge screw auger, triggering motor thermal trip threshold.',
    targetMachineId: 'CNC-08',
    affectedComponent: 'cnc.chipConveyor',
    expectedAlertTitle: 'Chip Evacuation Auger Jam',
    expectedSeverity: 'WARNING'
  },
  coolantStarvation: {
    id: 'coolantStarvation',
    name: '08. High-Pressure Coolant Flow Starvation',
    description: 'Coolant manifold filter clogged, reducing flood flow from 65 L/min to 12 L/min during deep pocketing.',
    targetMachineId: 'CNC-01',
    affectedComponent: 'cnc.coolantSystem',
    expectedAlertTitle: 'Coolant Delivery Flow Starvation',
    expectedSeverity: 'CRITICAL'
  }
};
