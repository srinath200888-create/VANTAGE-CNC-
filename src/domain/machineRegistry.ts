import { Machine, MachineId, TelemetryPacket } from '../types';
import { createDefaultComponents } from './componentHierarchy';

export function createInitialMachines(): Record<MachineId, Machine> {
  const baseTimestamp = Date.now();

  const machinesConfig: Array<{
    id: MachineId;
    name: string;
    model: string;
    cell: Machine['cell'];
    location: string;
    status: Machine['status'];
    healthScore: number;
    rpm: number;
    loadPct: number;
    tempC: number;
    vibrationMmS: number;
    currentA: number;
    powerKw: number;
    activeProgram: string;
    activeToolId: string;
    operatorName: string;
    runtimeHours: number;
    totalPartsProduced: number;
    lastMaintenanceDaysAgo: number;
    oee: {
      avail: number;
      perf: number;
      qual: number;
      target: number;
      actual: number;
      scrap: number;
    };
  }> = [
    {
      id: 'CNC-01',
      name: 'VMC-1050 High-Speed Machining Cell',
      model: 'VMC-1050 Production Pro',
      cell: 'Engine Block Cell A',
      location: 'Bay A-01 // Chennai Plant',
      status: 'RUNNING',
      healthScore: 95,
      rpm: 10450,
      loadPct: 48,
      tempC: 38.2,
      vibrationMmS: 1.42,
      currentA: 18.5,
      powerKw: 11.2,
      activeProgram: 'O1004_CYLINDER_HEAD_ROUGH.NC',
      activeToolId: 'T-04 (Ø16 EM)',
      operatorName: 'R. Kumar (Tech ID: 409)',
      runtimeHours: 1420,
      totalPartsProduced: 14850,
      lastMaintenanceDaysAgo: 22,
      oee: { avail: 94.5, perf: 92.0, qual: 99.4, target: 450, actual: 418, scrap: 2 }
    },
    {
      id: 'CNC-02',
      name: 'VMC-1050 Cylinder Block Finisher',
      model: 'VMC-1050 Production Pro',
      cell: 'Engine Block Cell A',
      location: 'Bay A-02 // Chennai Plant',
      status: 'RUNNING',
      healthScore: 91,
      rpm: 9800,
      loadPct: 54,
      tempC: 41.5,
      vibrationMmS: 1.68,
      currentA: 20.2,
      powerKw: 12.6,
      activeProgram: 'O1008_CYLINDER_BLOCK_FINISH.NC',
      activeToolId: 'T-02 (Ø50 Face Mill)',
      operatorName: 'M. Suresh (Tech ID: 312)',
      runtimeHours: 1890,
      totalPartsProduced: 18200,
      lastMaintenanceDaysAgo: 16,
      oee: { avail: 92.1, perf: 88.5, qual: 98.9, target: 450, actual: 395, scrap: 4 }
    },
    {
      id: 'CNC-03',
      name: 'VMC-1050 Connecting Rod Mill (High Load)',
      model: 'VMC-1050 Heavy Duty',
      cell: 'Engine Block Cell A',
      location: 'Bay A-03 // Chennai Plant',
      status: 'RUNNING',
      healthScore: 72,
      rpm: 8420,
      loadPct: 87,
      tempC: 61.2,
      vibrationMmS: 4.82,
      currentA: 34.8,
      powerKw: 19.4,
      activeProgram: 'O2014_CONROD_PROFILE_ROUGH.NC',
      activeToolId: 'T-08 (Ø20 Rougher)',
      operatorName: 'A. Patel (Tech ID: 521)',
      runtimeHours: 1286,
      totalPartsProduced: 12400,
      lastMaintenanceDaysAgo: 14,
      oee: { avail: 86.4, perf: 81.2, qual: 97.4, target: 400, actual: 322, scrap: 9 }
    },
    {
      id: 'CNC-04',
      name: 'HMC-800 Dual Pallet Transmission Mill',
      model: 'HMC-800 Horizontal',
      cell: 'Transmission Cell B',
      location: 'Bay B-01 // Chennai Plant',
      status: 'RUNNING',
      healthScore: 88,
      rpm: 7200,
      loadPct: 62,
      tempC: 44.8,
      vibrationMmS: 2.15,
      currentA: 24.1,
      powerKw: 14.8,
      activeProgram: 'O3002_GEARBOX_CASING_OP10.NC',
      activeToolId: 'T-12 (Ø32 Insert Drill)',
      operatorName: 'K. Balaji (Tech ID: 219)',
      runtimeHours: 2450,
      totalPartsProduced: 8900,
      lastMaintenanceDaysAgo: 9,
      oee: { avail: 93.0, perf: 90.1, qual: 99.2, target: 280, actual: 254, scrap: 2 }
    },
    {
      id: 'CNC-05',
      name: 'HMC-800 Differential Carrier Cell',
      model: 'HMC-800 Horizontal',
      cell: 'Transmission Cell B',
      location: 'Bay B-02 // Chennai Plant',
      status: 'IDLE',
      healthScore: 96,
      rpm: 0,
      loadPct: 0,
      tempC: 28.5,
      vibrationMmS: 0.12,
      currentA: 2.4,
      powerKw: 0.8,
      activeProgram: 'O3006_DIFF_CARRIER_OP20.NC (PAUSED)',
      activeToolId: 'T-01 (Probe)',
      operatorName: 'K. Balaji (Tech ID: 219)',
      runtimeHours: 980,
      totalPartsProduced: 4200,
      lastMaintenanceDaysAgo: 31,
      oee: { avail: 78.5, perf: 85.0, qual: 99.5, target: 280, actual: 210, scrap: 1 }
    },
    {
      id: 'CNC-06',
      name: 'VMC-850 Clutch Housing Finisher',
      model: 'VMC-850 High Speed',
      cell: 'Transmission Cell B',
      location: 'Bay B-03 // Chennai Plant',
      status: 'RUNNING',
      healthScore: 84,
      rpm: 11200,
      loadPct: 58,
      tempC: 46.2,
      vibrationMmS: 2.45,
      currentA: 21.6,
      powerKw: 13.5,
      activeProgram: 'O3110_CLUTCH_HOUSING.NC',
      activeToolId: 'T-06 (Chamfer Mill)',
      operatorName: 'S. Nathan (Tech ID: 450)',
      runtimeHours: 3100,
      totalPartsProduced: 28400,
      lastMaintenanceDaysAgo: 5,
      oee: { avail: 89.2, perf: 87.4, qual: 98.6, target: 500, actual: 428, scrap: 6 }
    },
    {
      id: 'CNC-07',
      name: 'VMC-1050 Knuckle Arm Mill (Worn Tool)',
      model: 'VMC-1050 Production Pro',
      cell: 'Chassis Component Cell C',
      location: 'Bay C-01 // Chennai Plant',
      status: 'RUNNING',
      healthScore: 64,
      rpm: 7800,
      loadPct: 91,
      tempC: 56.4,
      vibrationMmS: 5.12,
      currentA: 38.2,
      powerKw: 21.8,
      activeProgram: 'O4001_STEERING_KNUCKLE.NC',
      activeToolId: 'T-04 (Ø16 EM Degraded)',
      operatorName: 'D. Rao (Tech ID: 198)',
      runtimeHours: 2120,
      totalPartsProduced: 11200,
      lastMaintenanceDaysAgo: 19,
      oee: { avail: 82.1, perf: 76.5, qual: 95.8, target: 360, actual: 265, scrap: 11 }
    },
    {
      id: 'CNC-08',
      name: 'VMC-1200 Subframe Machining Center',
      model: 'VMC-1200 Large Bed',
      cell: 'Chassis Component Cell C',
      location: 'Bay C-02 // Chennai Plant',
      status: 'RUNNING',
      healthScore: 92,
      rpm: 6500,
      loadPct: 51,
      tempC: 39.8,
      vibrationMmS: 1.55,
      currentA: 26.4,
      powerKw: 15.2,
      activeProgram: 'O4080_SUBFRAME_MOUNT.NC',
      activeToolId: 'T-15 (Ø63 Face Mill)',
      operatorName: 'D. Rao (Tech ID: 198)',
      runtimeHours: 850,
      totalPartsProduced: 3200,
      lastMaintenanceDaysAgo: 45,
      oee: { avail: 95.2, perf: 93.4, qual: 99.6, target: 200, actual: 191, scrap: 1 }
    },
    {
      id: 'CNC-09',
      name: 'TC-300 Turning Center & Brake Disc Cell',
      model: 'TC-300 Heavy Lathe',
      cell: 'Chassis Component Cell C',
      location: 'Bay C-03 // Chennai Plant',
      status: 'MAINTENANCE',
      healthScore: 52,
      rpm: 0,
      loadPct: 0,
      tempC: 26.0,
      vibrationMmS: 0.05,
      currentA: 0.8,
      powerKw: 0.3,
      activeProgram: 'PM_ROUTINE_QUARTERLY_CHECK',
      activeToolId: 'NONE',
      operatorName: 'Tech Team Alpha (Maint)',
      runtimeHours: 4200,
      totalPartsProduced: 48500,
      lastMaintenanceDaysAgo: 0,
      oee: { avail: 42.0, perf: 60.0, qual: 98.0, target: 600, actual: 240, scrap: 5 }
    },
    {
      id: 'CNC-10',
      name: 'VMC-1050 Control Arm Cell (Setup)',
      model: 'VMC-1050 Production Pro',
      cell: 'Chassis Component Cell C',
      location: 'Bay C-04 // Chennai Plant',
      status: 'SETUP',
      healthScore: 97,
      rpm: 0,
      loadPct: 0,
      tempC: 27.2,
      vibrationMmS: 0.08,
      currentA: 1.5,
      powerKw: 0.6,
      activeProgram: 'FIXTURE_TOUCH_PROBE_CALIBRATION.NC',
      activeToolId: 'T-01 (Renishaw Touch Probe)',
      operatorName: 'V. Raman (Setup Eng)',
      runtimeHours: 410,
      totalPartsProduced: 1200,
      lastMaintenanceDaysAgo: 12,
      oee: { avail: 72.0, perf: 80.0, qual: 99.8, target: 350, actual: 230, scrap: 1 }
    }
  ];

  const machines: Record<MachineId, Machine> = {} as any;

  machinesConfig.forEach((cfg) => {
    const components = createDefaultComponents(cfg.runtimeHours);

    // Apply special states to CNC-03 (spindle anomaly) and CNC-07 (worn tool)
    if (cfg.id === 'CNC-03') {
      components['cnc.spindle'].healthScore = 68;
      components['cnc.spindle'].severity = 'WARNING';
      components['cnc.spindle'].temperature = 61.2;
      components['cnc.spindle'].vibration = 4.82;
      components['cnc.spindle'].loadPct = 87;
      components['cnc.spindle'].detectedConditions = [
        'Elevated tri-axial vibration (4.82 mm/s RMS)',
        'Sustained headstock thermal elevation (61.2°C)',
        'Motor torque load above baseline (87%)'
      ];
      components['cnc.spindle'].recommendations = [
        'Inspect front angular contact bearing race',
        'Verify tool holder dynamic balance',
        'Schedule planned maintenance inspection'
      ];
    } else if (cfg.id === 'CNC-07') {
      components['cnc.cuttingTool'].healthScore = 58;
      components['cnc.cuttingTool'].severity = 'WARNING';
      components['cnc.cuttingTool'].detectedConditions = [
        'Tool flank wear exceeded threshold (VB > 0.28 mm)',
        'Cutting force harmonics elevated'
      ];
      components['cnc.cuttingTool'].recommendations = [
        'Replace Ø16 TiAlN end mill insert',
        'Inspect surface roughness on machined knuckle'
      ];
    }

    const telemetry: TelemetryPacket = {
      timestamp: baseTimestamp,
      machineId: cfg.id,
      state: cfg.status,
      rpm: cfg.rpm,
      targetRpm: cfg.rpm,
      loadPct: cfg.loadPct,
      tempC: cfg.tempC,
      vibrationMmS: cfg.vibrationMmS,
      currentA: cfg.currentA,
      powerKw: cfg.powerKw,
      energyKwh: (cfg.powerKw * 6.5),
      posX: (Math.sin(cfg.runtimeHours) * 120),
      posY: (Math.cos(cfg.runtimeHours) * 80),
      posZ: -35.0,
      coolantFlowLpm: cfg.status === 'RUNNING' ? 58.5 : 0,
      coolantPressureBar: cfg.status === 'RUNNING' ? 18.2 : 0,
      coolantLevelPct: 88,
      workpieceClamped: true,
      doorClosed: cfg.status === 'RUNNING',
      chipAugerRunning: cfg.status === 'RUNNING',
      activeToolId: cfg.activeToolId,
      toolWearPct: cfg.id === 'CNC-07' ? 82 : cfg.id === 'CNC-03' ? 68 : 28,
      cycleTimeSec: 142,
      partsCount: cfg.oee.actual
    };

    // Generate 20 historical telemetry points for sparklines & graphs
    const telemetryHistory: TelemetryPacket[] = [];
    for (let i = 20; i >= 0; i--) {
      const histTime = baseTimestamp - i * 5000;
      const jitter = (Math.random() - 0.5) * 0.1;
      telemetryHistory.push({
        ...telemetry,
        timestamp: histTime,
        rpm: Math.max(0, cfg.rpm + cfg.rpm * jitter * 0.05),
        loadPct: Math.max(0, Math.min(100, cfg.loadPct + cfg.loadPct * jitter)),
        tempC: Math.max(20, cfg.tempC + jitter * 2),
        vibrationMmS: Math.max(0.1, cfg.vibrationMmS + jitter * 0.5),
        powerKw: Math.max(0.2, cfg.powerKw + jitter * 1.5)
      });
    }

    const overallOee = Math.round(((cfg.oee.avail * cfg.oee.perf * cfg.oee.qual) / 10000) * 10) / 10;
    const lostParts = cfg.oee.target - cfg.oee.actual;

    machines[cfg.id] = {
      id: cfg.id,
      name: cfg.name,
      model: cfg.model,
      cell: cfg.cell,
      location: cfg.location,
      status: cfg.status,
      healthScore: cfg.healthScore,
      healthSeverity: cfg.healthScore >= 85 ? 'HEALTHY' : cfg.healthScore >= 70 ? 'MONITOR' : cfg.healthScore >= 50 ? 'WARNING' : 'CRITICAL',
      healthSummary: {
        overallScore: cfg.healthScore,
        spindle: cfg.id === 'CNC-03' ? 68 : 94,
        tooling: cfg.id === 'CNC-07' ? 58 : 92,
        axes: 91,
        thermal: cfg.tempC > 55 ? 72 : 95,
        electrical: cfg.loadPct > 85 ? 78 : 96,
        workholding: 96,
        reasons: cfg.id === 'CNC-03' ? ['Elevated spindle vibration & high load'] : cfg.id === 'CNC-07' ? ['Cutting tool flank wear elevated'] : ['Nominal factory operating baseline']
      },
      telemetry,
      telemetryHistory,
      oee: {
        overallOee,
        availabilityPct: cfg.oee.avail,
        performancePct: cfg.oee.perf,
        qualityPct: cfg.oee.qual,
        shiftTargetParts: cfg.oee.target,
        actualPartsProduced: cfg.oee.actual,
        scrapParts: cfg.oee.scrap,
        lostPartsCount: lostParts,
        availabilityLossReasons: [
          { reason: 'Tool change & setup indexing', durationMin: 18, lostParts: 14, impactPct: 4.5 },
          { reason: 'Spindle vibration visual inspection', durationMin: 12, lostParts: 9, impactPct: 3.1 }
        ],
        performanceLossReasons: [
          { reason: 'Feed rate override reduced for chatter mitigation', durationMin: 24, lostParts: 18, impactPct: 6.2 },
          { reason: 'Chip clearance hesitation', durationMin: 8, lostParts: 6, impactPct: 2.0 }
        ],
        qualityLossReasons: [
          { reason: 'Part bore dimensional tolerance offset', durationMin: 6, lostParts: cfg.oee.scrap, impactPct: 1.5 }
        ]
      },
      activeProgram: cfg.activeProgram,
      activeToolId: cfg.activeToolId,
      operatorName: cfg.operatorName,
      runtimeHours: cfg.runtimeHours,
      totalPartsProduced: cfg.totalPartsProduced,
      lastMaintenanceDaysAgo: cfg.lastMaintenanceDaysAgo,
      components,
      edgeNodeId: `EDGE-GW-${cfg.id}`
    };
  });

  return machines;
}
